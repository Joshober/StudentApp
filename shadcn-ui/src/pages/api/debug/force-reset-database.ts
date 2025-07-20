import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/database';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Force resetting database...');
    
    // Close the current database connection
    const currentDb = getDatabase();
    currentDb.close();
    
    // Delete the database file
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Deleted existing database file');
    }
    
    // Create a new database and apply migrations
    const newDb = new Database(dbPath);
    
    // Apply migrations manually
    const migrations = [
      {
        version: 1,
        name: 'Initial schema',
        up: (db: Database) => {
          // Users table
          db.exec(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              name TEXT NOT NULL,
              role TEXT DEFAULT 'student',
              openrouter_api_key TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Token usage tracking table
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

          // Resources table
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
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Events table
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
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Event registrations table
          db.exec(`
            CREATE TABLE IF NOT EXISTS event_registrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              event_id INTEGER,
              registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
              FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
              UNIQUE(user_id, event_id)
            )
          `);

          // Create indexes for better performance
          db.exec(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
            CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at);
            CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course);
            CREATE INDEX IF NOT EXISTS idx_resources_level ON resources(level);
            CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
            CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
          `);
        }
      },
      {
        version: 2,
        name: 'Add user sessions table',
        up: (db: Database) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS user_sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              session_token TEXT UNIQUE NOT NULL,
              expires_at DATETIME NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
          `);
          
          db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
            CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
          `);
        }
      },
      {
        version: 3,
        name: 'Add user preferences table',
        up: (db: Database) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS user_preferences (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER UNIQUE NOT NULL,
              theme TEXT DEFAULT 'light',
              language TEXT DEFAULT 'en',
              notifications_enabled BOOLEAN DEFAULT 1,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
          `);
        }
      }
    ];

    // Create migrations table
    newDb.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Apply all migrations
    for (const migration of migrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      migration.up(newDb);
      
      newDb.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name
      );
    }

    // Create a test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    newDb.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run('test@example.com', hashedPassword, 'Test User', 'student');

    newDb.close();
    
    console.log('Database force reset completed successfully');
    
    return res.status(200).json({
      message: 'Database force reset successfully',
      details: 'Database file recreated with all migrations applied and test user created',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
  } catch (error) {
    console.error('Database force reset error:', error);
    return res.status(500).json({ 
      error: 'Failed to force reset database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 