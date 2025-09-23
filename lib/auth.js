import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getAuthUser(request) {
  try {
    // Ambil token dari cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil user data dari database
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    }).from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];

  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

export function withAuth(handler, allowedRoles = []) {
  return async (request, context) => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Attach user to request
    request.user = user;
    
    return handler(request, context);
  };
}