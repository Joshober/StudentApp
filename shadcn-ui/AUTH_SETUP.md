# Authentication Setup Guide

This guide will help you set up the authentication system with Google OAuth 2.0 and Brightspace OAuth integration.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Brightspace OAuth Configuration
BRIGHTSPACE_CLIENT_ID=your_brightspace_client_id_here
BRIGHTSPACE_CLIENT_SECRET=your_brightspace_client_secret_here
BRIGHTSPACE_REDIRECT_URI=http://localhost:3000/api/auth/brightspace/callback
BRIGHTSPACE_AUTH_URL=https://your-institution.brightspace.com/d2l/auth/api/token
BRIGHTSPACE_TOKEN_URL=https://your-institution.brightspace.com/d2l/auth/token
BRIGHTSPACE_API_URL=https://your-institution.brightspace.com

# JWT Secret (for session management)
JWT_SECRET=your_jwt_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env.local` file

## Brightspace OAuth Setup

1. Contact your Brightspace administrator to set up OAuth 2.0
2. Configure the following settings in Brightspace:
   - Client ID and Secret
   - Redirect URI: `http://localhost:3000/api/auth/brightspace/callback`
   - Required scopes: `openid email profile`
3. Update the Brightspace URLs in your `.env.local` file to match your institution's domain

## Features

### Authentication Pages
- **Sign In**: `/auth/signin` - Email/password and OAuth options
- **Register**: `/auth/register` - Account creation with validation
- **OAuth Integration**: Google and Brightspace OAuth 2.0 flows

### Security Features
- State parameter validation for OAuth flows
- Secure cookie management
- CSRF protection
- Input validation and sanitization

### User Experience
- Responsive design with mobile support
- Loading states and error handling
- Smooth animations with Framer Motion
- Accessible form controls

## API Routes

- `GET /api/auth/google` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Handles Google OAuth callback
- `GET /api/auth/brightspace` - Initiates Brightspace OAuth flow
- `GET /api/auth/brightspace/callback` - Handles Brightspace OAuth callback
- `POST /api/auth/logout` - Logs out user and clears session

## Usage

1. Users can sign in with email/password or OAuth providers
2. OAuth users are automatically registered if they don't have an account
3. User sessions are managed through secure cookies
4. The navigation bar shows different options based on authentication status

## Development Notes

- The current implementation uses mock authentication for email/password
- OAuth flows are fully implemented but require proper configuration
- In production, implement proper database storage and session management
- Add rate limiting and additional security measures for production use 