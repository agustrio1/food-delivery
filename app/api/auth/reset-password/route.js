import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db/client';
import { users, password_resets } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    // Validasi input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Cari token reset yang valid
    const resetRecord = await db.select({
      id: password_resets.id,
      user_id: password_resets.user_id,
      expires_at: password_resets.expires_at,
      used: password_resets.used
    })
    .from(password_resets)
    .where(
      and(
        eq(password_resets.token, token),
        eq(password_resets.used, false),
        gt(password_resets.expires_at, new Date())
      )
    )
    .limit(1);

    if (resetRecord.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const reset = resetRecord[0];

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password user
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updated_at: new Date()
      })
      .where(eq(users.id, reset.user_id));

    // Mark token sebagai used
    await db.update(password_resets)
      .set({ used: true })
      .where(eq(password_resets.id, reset.id));

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}