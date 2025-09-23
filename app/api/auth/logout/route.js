import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    // Ambil token dari cookie
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      try {
        // Decode token untuk mendapatkan user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Hapus semua session untuk user ini
        await db.delete(sessions).where(eq(sessions.user_id, decoded.userId));
        
      } catch (jwtError) {
        // Token tidak valid, tapi tetap lanjutkan logout
        console.log('Invalid token during logout:', jwtError.message);
      }
    }

    // Hapus cookie
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Tetap hapus cookie meski ada error
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  }
}