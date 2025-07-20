import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/database';

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
    
    // Integrate with our database system
    const userService = new UserService();
    
    // Check if user exists by email
    let user = userService.findUserByEmail(userData.email);
    
    if (!user) {
      // Create new user with Google data
      try {
        const userId = await userService.createUser(
          userData.email,
          '', // No password for OAuth users
          userData.name || userData.email.split('@')[0],
          undefined // No API key initially
        );
        
        user = userService.findUserByEmail(userData.email);
        console.log('Created new user via Google OAuth:', userData.email);
      } catch (error) {
        console.error('Failed to create user via Google OAuth:', error);
        return NextResponse.redirect(new URL('/auth/signin?error=user_creation_failed', request.url));
      }
    }

    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin?error=user_not_found', request.url));
    }

    // Create a secure session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Store user data in cookie (in production, use secure session management)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Store user data in cookie
    response.cookies.set('user_data', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      openrouter_api_key: user.openrouter_api_key,
      provider: 'google',
      sessionToken: sessionToken
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