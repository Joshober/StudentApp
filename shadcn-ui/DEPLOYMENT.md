# Deployment Guide

This guide covers deploying the EduLearn application using Docker for local development and Vercel for production.

## 🐳 Docker Setup

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Local Development with Docker

1. **Start the development environment:**
   ```bash
   npm run docker:dev
   ```
   This will start:
   - PostgreSQL database (port 5432)
   - Redis cache (port 6379)
   - pgAdmin for database management (port 5050)

2. **Access the services:**
   - Application: http://localhost:3000
   - pgAdmin: http://localhost:5050 (admin@edulearn.com / admin123)

3. **Stop the development environment:**
   ```bash
   npm run docker:dev:down
   ```

### Production Docker Setup

1. **Build and start production containers:**
   ```bash
   npm run docker:prod
   ```

2. **Stop production containers:**
   ```bash
   npm run docker:prod:down
   ```

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (e.g., Neon, Supabase, Railway)
- Redis instance (e.g., Upstash, Redis Cloud)

### Step 1: Set up Database

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Set as `DATABASE_URL` in Vercel

### Step 2: Set up Redis

#### Option A: Upstash (Recommended)
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the connection string
4. Set as `REDIS_URL` in Vercel

#### Option B: Redis Cloud
1. Go to [redis.com](https://redis.com)
2. Create a new database
3. Copy the connection string
4. Set as `REDIS_URL` in Vercel

### Step 3: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add REDIS_URL
   vercel env add JWT_SECRET
   vercel env add OPENROUTER_API_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

### Step 4: Initialize Database

After deployment, initialize the database:

```bash
# Get your deployment URL
vercel ls

# Initialize database (replace with your actual URL)
curl -X POST https://your-app.vercel.app/api/init-database
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `REDIS_URL` | Redis connection string | `redis://user:pass@host:port` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics ID | `G-XXXXXXXXXX` |
| `NODE_ENV` | Environment | `production` |

## 📊 Database Schema

The application automatically creates the following tables:

- `users` - User accounts and authentication
- `token_usage` - AI token usage tracking
- `resources` - Educational resources
- `events` - Learning events and workshops
- `event_registrations` - Event registrations
- `user_sessions` - User session management
- `user_preferences` - User preferences
- `models` - AI model information
- `model_sync_log` - Model sync tracking
- `migrations` - Database migration history

## 🔍 Health Checks

### Database Health
```bash
curl https://your-app.vercel.app/api/health
```

### Application Status
```bash
curl https://your-app.vercel.app/api/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure database is accessible from Vercel
   - Verify SSL settings

2. **Redis Connection Failed**
   - Check `REDIS_URL` format
   - Ensure Redis instance is accessible
   - Verify authentication credentials

3. **Build Failures**
   - Check for missing environment variables
   - Verify Node.js version compatibility
   - Check for TypeScript errors

4. **Runtime Errors**
   - Check Vercel function logs
   - Verify database migrations ran successfully
   - Check API key configurations

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View function logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy with debug info
vercel --debug
```

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit secrets to version control
   - Use Vercel's environment variable management
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access

3. **API Keys**
   - Store API keys securely
   - Use environment variables
   - Monitor API usage

## 📈 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor function performance
- Track user interactions

### Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for errors

### Application Monitoring
- Monitor API response times
- Track error rates
- Set up uptime monitoring

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Deploy to Vercel
vercel --prod
```

### Database Migrations
- Migrations run automatically on startup
- Check migration logs in Vercel function logs
- Monitor for migration errors

### Backup Strategy
- Enable automated database backups
- Test restore procedures
- Store backups securely

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Vercel documentation
3. Check application logs
4. Contact the development team
