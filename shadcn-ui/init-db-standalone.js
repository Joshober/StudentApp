#!/usr/bin/env node

// Standalone database initialization script
const path = require('path');
const fs = require('fs');

console.log('🚀 Initializing EduLearn Database (Standalone)...\n');

// Check if database file exists
const dbPath = path.join(__dirname, 'edulearn.db');
const dbExists = fs.existsSync(dbPath);

if (dbExists) {
  console.log('🗑️ Removing existing database...');
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ Existing database removed');
  } catch (error) {
    console.error('❌ Failed to remove existing database:', error.message);
  }
}

console.log('🔄 Creating new database...');

try {
  // Import and initialize database directly
  const Database = require('better-sqlite3');
  
  // Create database
  const db = new Database(dbPath);
  
  // Set pragmas for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  
  console.log('📋 Creating database schema...');
  
  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      openrouter_api_key TEXT,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create token usage table
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tokens_used INTEGER NOT NULL,
      model TEXT NOT NULL,
      request_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  
  // Create resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
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
      submitter_email TEXT,
      submitter_name TEXT,
      is_approved BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
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
      submitter_email TEXT,
      submitter_name TEXT,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
    CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course);
    CREATE INDEX IF NOT EXISTS idx_resources_level ON resources(level);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `);
  
  console.log('🌱 Seeding database with sample data...');
  
  // Insert sample resources
  const sampleResources = [
    {
      title: 'React Fundamentals',
      description: 'Learn the basics of React including components, props, state, and hooks.',
      level: 'beginner',
      course: 'programming',
      tags: JSON.stringify(['react', 'javascript', 'frontend', 'web-development']),
      type: 'course',
      duration: '8 hours',
      author: 'React Team',
      rating: 4.8,
      thumbnail: '/api/placeholder/300/200',
      link: 'https://react.dev/learn'
    },
    {
      title: 'Advanced TypeScript Patterns',
      description: 'Master advanced TypeScript patterns including generics, decorators, and utility types.',
      level: 'advanced',
      course: 'programming',
      tags: JSON.stringify(['typescript', 'javascript', 'advanced', 'patterns']),
      type: 'tutorial',
      duration: '6 hours',
      author: 'TypeScript Team',
      rating: 4.9,
      thumbnail: '/api/placeholder/300/200',
      link: 'https://www.typescriptlang.org/docs/'
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Comprehensive guide to modern UI/UX design principles and best practices.',
      level: 'intermediate',
      course: 'design',
      tags: JSON.stringify(['ui', 'ux', 'design', 'user-experience']),
      type: 'course',
      duration: '10 hours',
      author: 'Design Academy',
      rating: 4.7,
      thumbnail: '/api/placeholder/300/200',
      link: 'https://www.interaction-design.org/'
    }
  ];
  
  const insertStmt = db.prepare(`
    INSERT INTO resources (
      title, description, level, course, tags, type, duration, 
      author, rating, thumbnail, link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const resource of sampleResources) {
    insertStmt.run(
      resource.title,
      resource.description,
      resource.level,
      resource.course,
      resource.tags,
      resource.type,
      resource.duration,
      resource.author,
      resource.rating,
      resource.thumbnail,
      resource.link
    );
  }
  
  // Record migration
  db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(1, 'Initial schema and seed data');
  
  db.close();
  
  console.log('✅ Database initialized successfully!');
  console.log('📚 Sample resources have been added to the database.');
  console.log('🌐 You can now start the development server with: npm run dev');
  
} catch (error) {
  console.error('❌ Failed to initialize database:', error.message);
  process.exit(1);
}