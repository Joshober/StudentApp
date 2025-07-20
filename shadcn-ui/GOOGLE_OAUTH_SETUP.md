# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the Tech Innovation Club application.

## 🚀 Quick Setup

### 1. **Create Google OAuth Credentials**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth Consent Screen:**
   - App name: "Tech Innovation Club"
   - User support email: Your email
   - Developer contact information: Your email

5. **Set Authorized Redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback
   ```

### 2. **Get Your Credentials**

After creating the OAuth client, you'll get:
- **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

### 3. **Add to Environment Variables**

Create or update your `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Other required variables
OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_jwt_secret
DATABASE_PATH=edulearn.db
```

### 4. **Test the Setup**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to the sign-in page:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Click "Continue with Google"**
   - You should be redirected to Google's OAuth page
   - After authorization, you'll be redirected back to the dashboard

## 🔧 Troubleshooting

### **Common Issues:**

1. **"OAuth not configured" error:**
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
   - Restart your development server

2. **"Invalid redirect URI" error:**
   - Make sure the redirect URI in Google Console matches exactly
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`

3. **"User creation failed" error:**
   - Check that the database is properly initialized
   - Run: `curl -X POST http://localhost:3000/api/init-database`

4. **"Token exchange failed" error:**
   - Verify your Client Secret is correct
   - Check that the Google+ API is enabled

### **Debug Steps:**

1. **Check environment variables:**
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. **Test OAuth flow manually:**
   ```
   http://localhost:3000/api/auth/google
   ```

3. **Check browser console** for any JavaScript errors

4. **Check server logs** for backend errors

## 🛡️ Security Considerations

### **Production Setup:**

1. **Use HTTPS in production**
2. **Set secure cookies**
3. **Use environment-specific redirect URIs**
4. **Implement proper session management**
5. **Add rate limiting**

### **Environment Variables:**

```bash
# Development
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Production
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

## 📋 Features

### **What Google OAuth Provides:**

- ✅ **Email verification** (Google verifies the email)
- ✅ **Profile information** (name, picture)
- ✅ **Secure authentication** (no passwords to manage)
- ✅ **One-click sign-in** (convenient for users)
- ✅ **Database integration** (creates/updates users)

### **User Flow:**

1. **User clicks "Continue with Google"**
2. **Redirected to Google OAuth**
3. **User authorizes the application**
4. **Google redirects back with authorization code**
5. **Server exchanges code for access token**
6. **Server gets user info from Google**
7. **User created/updated in database**
8. **User redirected to dashboard**

## 🎯 Next Steps

After setting up Google OAuth:

1. **Test the sign-in flow**
2. **Add your OpenRouter API key** in the profile
3. **Try the AI assistant features**
4. **Set up production environment**

The Google OAuth integration is now fully functional and integrated with your database system! 🎉 