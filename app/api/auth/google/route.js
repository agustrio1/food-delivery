import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';
import { eq, or, count } from 'drizzle-orm';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      );
    }

    // Verifikasi token Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified) {
      return NextResponse.json(
        { error: 'Google email not verified' },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada (berdasarkan email atau google_id)
    let user = await db.select().from(users).where(
      or(
        eq(users.email, email),
        eq(users.google_id, googleId)
      )
    ).limit(1);

    let foundUser;

    if (user.length === 0) {
      // User baru - buat akun
      const userCount = await db.select({ count: count() }).from(users);
      const isFirstUser = userCount[0].count === 0;

      const newUser = await db.insert(users).values({
        id: ulid(),
        name,
        email,
        role: isFirstUser ? 'admin' : 'customer',
        login_type: 'google',
        google_id: googleId,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }).returning();

      foundUser = newUser[0];
    } else {
      foundUser = user[0];
      
      // Update google_id jika belum ada dan update login_type
      if (!foundUser.google_id || foundUser.login_type !== 'google') {
        await db.update(users)
          .set({ 
            google_id: googleId, 
            login_type: 'google',
            email_verified_at: foundUser.email_verified_at || new Date(),
            updated_at: new Date()
          })
          .where(eq(users.id, foundUser.id));
        
        foundUser.google_id = googleId;
        foundUser.login_type = 'google';
      }
    }

    // Buat JWT token
    const token = jwt.sign(
      { 
        userId: foundUser.id, 
        email: foundUser.email, 
        role: foundUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Simpan session
    const sessionId = ulid();
    await db.insert(sessions).values({
      id: sessionId,
      user_id: foundUser.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      payload: JSON.stringify({ token, google: true }),
      last_activity: Math.floor(Date.now() / 1000)
    });

    // Set cookie
    const response = NextResponse.json({
      message: 'Google login successful',
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 500 }
    );
  }
}