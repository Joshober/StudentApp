# Setup Guide

## Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and configure the following variables:

   ```env
   # Database Configuration
   DATABASE_PATH=edulearn.db

   # JWT Secret (REQUIRED - Change this in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # AI Provider API Keys (Optional - can be set by users in the app)
   OPENAI_API_KEY=
   ANTHROPIC_API_KEY=
   OPENROUTER_API_KEY=

   # App Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Security Improvements Made

### 1. Environment Variables
- ✅ Moved sensitive configuration to `.env` file
- ✅ Added `.env` to `.gitignore` to prevent accidental commits
- ✅ Created `env.example` as a template
- ✅ Added database files to `.gitignore`

### 2. API Key Security
- ✅ API keys can now be set via environment variables
- ✅ Fallback to user-provided keys in the app
- ✅ Better error messages for missing API keys
- ✅ Visual indicators when environment variables are available

### 3. Configuration Validation
- ✅ Added configuration validation utility
- ✅ Proper error handling for missing environment variables
- ✅ Security headers in middleware
- ✅ Database path configurable via environment

### 4. Database Security
- ✅ Database file path now configurable
- ✅ Database files excluded from version control
- ✅ Proper initialization with error handling

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Initialize the application:
   ```bash
   # Visit this URL in your browser to initialize the database
   http://localhost:3000/api/init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **"JWT_SECRET is not set"**
   - Solution: Set a secure JWT_SECRET in your `.env` file

2. **"Database initialization failed"**
   - Solution: Make sure the DATABASE_PATH is writable
   - Check file permissions in the project directory

3. **"API key is required"**
   - Solution: Either set the API key in environment variables or provide it in the app settings

4. **TypeScript errors**
   - Solution: Run `npm run build` to check for type errors
   - Make sure all dependencies are installed

### Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use HTTPS URLs for `NEXT_PUBLIC_APP_URL`
3. Generate a secure JWT_SECRET (use a password generator)
4. Set up proper database backups
5. Configure your AI provider API keys

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Regularly rotate API keys
- Monitor API usage to prevent abuse
- Consider rate limiting for production deployments 