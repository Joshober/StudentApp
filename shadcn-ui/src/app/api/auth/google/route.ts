import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session/cookie for verification later
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${state}`
    );

    // Set state in cookie for verification
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'OAuth initialization failed' }, { status: 500 });
  }
} 