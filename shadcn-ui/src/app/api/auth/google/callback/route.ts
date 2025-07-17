import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_denied', request.url));
    }

    // Verify state parameter
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_state', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin?error=no_code', request.url));
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_not_configured', request.url));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth/signin?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user information from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/auth/signin?error=user_info_failed', request.url));
    }

    const userData = await userResponse.json();
    
    // In a real app, you would:
    // 1. Check if user exists in your database
    // 2. Create user if they don't exist
    // 3. Create a session/token
    // 4. Redirect to dashboard

    // For now, we'll redirect to the homepage with user data
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Store user data in cookie (in production, use secure session management)
    response.cookies.set('user_data', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      provider: 'google'
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Clear the OAuth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', request.url));
  }
} 