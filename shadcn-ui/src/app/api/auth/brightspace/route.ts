import { NextRequest, NextResponse } from 'next/server';

const BRIGHTSPACE_CLIENT_ID = process.env.BRIGHTSPACE_CLIENT_ID;
const BRIGHTSPACE_REDIRECT_URI = process.env.BRIGHTSPACE_REDIRECT_URI || 'http://localhost:3000/api/auth/brightspace/callback';
const BRIGHTSPACE_AUTH_URL = process.env.BRIGHTSPACE_AUTH_URL || 'https://your-institution.brightspace.com/d2l/auth/api/token';

export async function GET(request: NextRequest) {
  try {
    if (!BRIGHTSPACE_CLIENT_ID) {
      return NextResponse.json({ error: 'Brightspace OAuth not configured' }, { status: 500 });
    }

    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session/cookie for verification later
    const response = NextResponse.redirect(
      `${BRIGHTSPACE_AUTH_URL}?` +
      `client_id=${BRIGHTSPACE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(BRIGHTSPACE_REDIRECT_URI)}&` +
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
    console.error('Brightspace OAuth error:', error);
    return NextResponse.json({ error: 'OAuth initialization failed' }, { status: 500 });
  }
} 