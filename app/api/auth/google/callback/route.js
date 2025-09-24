import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';
import { eq, or, count } from 'drizzle-orm';

const getBaseUrl = (request) => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;
  }
  
// untuk development
  const host = request.headers.get('host');
  if (host && host.includes('localhost')) {
    return `http://${host}`;
  }
  
  return 'http://localhost:3000';
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const baseUrl = getBaseUrl(request);

    /* console.log('=== OAuth Callback Debug ===');
    console.log('Base URL:', baseUrl);
    console.log('Request URL:', request.url);
    console.log('Code:', code ? `${code.substring(0, 10)}...` : 'No code');
    console.log('Error:', error); */

    if (error) {
      // console.error('OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/login?error=access_denied`);
    }

    if (!code) {
      // console.error('No authorization code received');
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
    }

    // Pastikan redirect URI sama dengan yang digunakan saat auth
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    // console.log('Using redirect URI:', redirectUri);

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_not_verified`);
    }

    // Check if user exists
    let user = await db.select().from(users).where(
      or(
        eq(users.email, email),
        eq(users.google_id, googleId)
      )
    ).limit(1);

    let foundUser;

    if (user.length === 0) {
      // Create new user
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
      
      // Update google_id if needed
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

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: foundUser.id, 
        email: foundUser.email, 
        role: foundUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save session
    const sessionId = ulid();
    await db.insert(sessions).values({
      id: sessionId,
      user_id: foundUser.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      payload: JSON.stringify({ token, google: true }),
      last_activity: Math.floor(Date.now() / 1000)
    });

    // Create response and set cookie
    const response = NextResponse.redirect(`${baseUrl}/`);
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    // Log detail error untuk debugging
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.response) {
      console.error('Error response:', error.response.data || error.response);
    }
    
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_error&details=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
}