# Database Setup Guide

This application uses **SQLite** with `better-sqlite3` as the database engine. The database is file-based and automatically initialized when the application starts.

## 🗄️ Database Features

### ✅ **Production-Ready Database**
- **SQLite with better-sqlite3**: Fast, reliable, and production-ready
- **Automatic Migrations**: Schema changes are handled automatically
- **WAL Mode**: Better concurrency and performance
- **Indexes**: Optimized queries with proper indexing
- **Foreign Keys**: Data integrity with cascade deletes
- **Health Checks**: Database connectivity monitoring

### 🔧 **Database Configuration**
- **Path**: `edulearn.db` (configurable via `DATABASE_PATH` env var)
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **64MB Cache**: Optimized memory usage
- **256MB Memory Mapping**: Fast data access
- **Incremental Vacuum**: Automatic space reclamation

## 🚀 **Quick Start**

### 1. **Automatic Initialization**
The database is automatically initialized when the app starts:
```bash
npm run dev
```

### 2. **Manual Initialization**
If you need to manually initialize the database:
```bash
curl -X POST http://localhost:3000/api/init-database
```

### 3. **Health Check**
Check database status:
```bash
curl http://localhost:3000/api/health
```

## 📊 **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  openrouter_api_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Token Usage Table**
```sql
CREATE TABLE token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tokens_used INTEGER NOT NULL,
  model TEXT NOT NULL,
  request_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### **Resources Table**
```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced')),
  course TEXT NOT NULL CHECK(course IN ('programming', 'design', 'business', 'data-science', 'marketing')),
  tags TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('video', 'article', 'tutorial', 'course', 'tool')),
  duration TEXT,
  author TEXT NOT NULL,
  rating REAL DEFAULT 0,
  thumbnail TEXT,
  link TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Events Table**
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('workshop', 'seminar', 'networking', 'webinar')),
  capacity INTEGER NOT NULL,
  registered INTEGER DEFAULT 0,
  tags TEXT NOT NULL,
  speaker TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **User Sessions Table**
```sql
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### **User Preferences Table**
```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🔄 **Migration System**

The database uses an automatic migration system:

### **Migration 1: Initial Schema**
- Creates all base tables
- Sets up indexes for performance
- Establishes foreign key relationships

### **Migration 2: User Sessions**
- Adds session management table
- Enables secure user authentication

### **Migration 3: User Preferences**
- Adds user preferences table
- Supports theme and language settings

## 🛠️ **Service Classes**

### **UserService**
```typescript
const userService = new UserService();

// Create user
const userId = await userService.createUser(email, password, name);

// Find user
const user = userService.findUserByEmail(email);

// Update API key
userService.updateUserApiKey(userId, apiKey);

// Get user preferences
const prefs = userService.getUserPreferences(userId);
```

### **TokenService**
```typescript
const tokenService = new TokenService();

// Record token usage
tokenService.recordTokenUsage(userId, tokens, model, type);

// Check limits
const hasTokens = tokenService.hasTokensRemaining(userId);

// Get usage stats
const stats = tokenService.getTokenUsageStats();
```

## 📈 **Performance Optimizations**

### **Indexes**
- `idx_users_email`: Fast user lookups
- `idx_token_usage_user_id`: Quick token queries
- `idx_token_usage_created_at`: Date-based filtering
- `idx_resources_course`: Course filtering
- `idx_resources_level`: Level filtering
- `idx_events_date`: Event date sorting
- `idx_user_sessions_token`: Session validation

### **Pragma Settings**
- **WAL Mode**: Better concurrency
- **64MB Cache**: Optimized memory usage
- **Memory Temp Store**: Fast temporary operations
- **256MB Memory Mapping**: Fast data access
- **Incremental Vacuum**: Automatic cleanup

## 🔍 **Monitoring & Debugging**

### **Health Check Endpoint**
```bash
GET /api/health
```
Returns database status, table counts, and system info.

### **Database Info**
```bash
GET /api/debug/users
```
Lists all users in the database.

### **Test User Creation**
```bash
POST /api/debug/ensure-user
```
Creates a test user for development.

## 🚨 **Troubleshooting**

### **Database Connection Issues**
1. Check file permissions for database directory
2. Ensure `DATABASE_PATH` environment variable is set correctly
3. Verify SQLite is properly installed

### **Migration Errors**
1. Check console logs for migration details
2. Manually run `/api/init-database` endpoint
3. Verify database file is not corrupted

### **Performance Issues**
1. Check if indexes are created properly
2. Monitor memory usage with `/api/health`
3. Consider database backup and restore

## 🔒 **Security Considerations**

### **Data Protection**
- Passwords are hashed with bcrypt
- API keys are stored securely
- Foreign key constraints prevent orphaned data
- Cascade deletes maintain data integrity

### **Access Control**
- User sessions with expiration
- Role-based access control
- Secure API key validation
- Rate limiting on API endpoints

## 📦 **Backup & Recovery**

### **Automatic Backup**
```typescript
import { backupDatabase } from '@/lib/database';

backupDatabase('./backup/edulearn-backup.db');
```

### **Manual Backup**
```bash
cp edulearn.db edulearn-backup-$(date +%Y%m%d).db
```

## 🎯 **Production Deployment**

### **Environment Variables**
```bash
DATABASE_PATH=/path/to/production/database.db
JWT_SECRET=your-secure-jwt-secret
OPENROUTER_API_KEY=your-openrouter-key
```

### **Database Maintenance**
- Regular backups
- Monitor disk space
- Check database health periodically
- Update indexes as needed

## 📚 **API Endpoints**

### **Database Management**
- `POST /api/init-database`: Initialize database
- `GET /api/health`: Health check
- `POST /api/debug/ensure-user`: Create test user

### **User Management**
- `POST /api/auth/signin`: User sign in
- `POST /api/auth/signup`: User registration
- `POST /api/user/update-api-key`: Update API key
- `GET /api/user/token-usage`: Get token usage

### **AI Integration**
- `POST /api/openrouter`: AI chat completions
- `GET /api/openrouter/models`: List available models

This database setup provides a robust, scalable foundation for the application with proper error handling, performance optimizations, and security measures. 