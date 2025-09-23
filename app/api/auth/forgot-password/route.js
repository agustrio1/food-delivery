import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ulid } from 'ulid';
import { db } from '@/db/client';
import { users, password_resets } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// Konfigurasi email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Cek apakah email terdaftar
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      // Jangan beri tahu bahwa email tidak ditemukan (security)
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent'
      });
    }

    const foundUser = user[0];

    // Cek apakah user login dengan email (bukan Google)
    if (foundUser.login_type !== 'email') {
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Berlaku 1 jam

    // Hapus token reset lama yang masih aktif
    await db.delete(password_resets).where(
      and(
        eq(password_resets.user_id, foundUser.id),
        eq(password_resets.used, false)
      )
    );

    // Simpan token reset baru
    await db.insert(password_resets).values({
      id: ulid(),
      user_id: foundUser.id,
      token: resetToken,
      expires_at: expiresAt,
      used: false,
      created_at: new Date()
    });

    // Kirim email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Tetap return success untuk keamanan
    }

    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}