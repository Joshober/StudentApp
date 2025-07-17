import { NextRequest, NextResponse } from 'next/server';

const BRIGHTSPACE_CLIENT_ID = process.env.BRIGHTSPACE_CLIENT_ID;
const BRIGHTSPACE_CLIENT_SECRET = process.env.BRIGHTSPACE_CLIENT_SECRET;
const BRIGHTSPACE_REDIRECT_URI = process.env.BRIGHTSPACE_REDIRECT_URI || 'http://localhost:3000/api/auth/brightspace/callback';
const BRIGHTSPACE_TOKEN_URL = process.env.BRIGHTSPACE_TOKEN_URL || 'https://your-institution.brightspace.com/d2l/auth/token';

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

    if (!BRIGHTSPACE_CLIENT_ID || !BRIGHTSPACE_CLIENT_SECRET) {
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_not_configured', request.url));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(BRIGHTSPACE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: BRIGHTSPACE_CLIENT_ID,
        client_secret: BRIGHTSPACE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: BRIGHTSPACE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth/signin?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user information from Brightspace
    // Note: The actual endpoint will depend on your Brightspace configuration
    const userResponse = await fetch(`${process.env.BRIGHTSPACE_API_URL}/d2l/api/lp/1.0/users/whoami`, {
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
      id: userData.UserId,
      email: userData.Email,
      name: `${userData.FirstName} ${userData.LastName}`,
      firstName: userData.FirstName,
      lastName: userData.LastName,
      provider: 'brightspace'
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
    console.error('Brightspace OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', request.url));
  }
} 