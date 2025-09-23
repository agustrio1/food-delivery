import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Cek apakah email sudah terdaftar
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Cek apakah ini user pertama (akan dijadikan admin)
    const userCount = await db.select({ count: count() }).from(users);
    const isFirstUser = userCount[0].count === 0;

    // Buat user baru
    const newUser = await db.insert(users).values({
      id: ulid(),
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'admin' : 'customer',
      login_type: 'email',
      created_at: new Date(),
      updated_at: new Date()
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: newUser[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}