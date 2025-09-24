import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  console.log('=== /api/auth/me called ===');
  
  try {
    // Debug cookies
    const cookies = request.cookies.getAll();
    console.log('All cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const user = await getAuthUser(request);
    console.log('getAuthUser result:', user);

    if (!user) {
      console.log('No user found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User found, returning user data');
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}