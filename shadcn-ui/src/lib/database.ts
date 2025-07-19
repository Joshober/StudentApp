import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { config } from './config';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

// Database configuration
const DB_CONFIG = {
  path: config.database.path,
  verbose: process.env.NODE_ENV === 'development',
  fileMustExist: false,
  timeout: 5000,
  readonly: false,
  memory: false,
  // Enable WAL mode for better concurrency
  pragma: {
    journal_mode: 'WAL',
    synchronous: 'NORMAL',
    cache_size: -64000, // 64MB cache
    temp_store: 'MEMORY',
    mmap_size: 268435456, // 256MB
    page_size: 4096,
    auto_vacuum: 'INCREMENTAL'
  }
};

const getDatabase = () => {
  if (!db) {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(DB_CONFIG.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new Database(DB_CONFIG.path, {
        verbose: DB_CONFIG.verbose ? console.log : undefined,
        fileMustExist: DB_CONFIG.fileMustExist,
        timeout: DB_CONFIG.timeout,
        readonly: DB_CONFIG.readonly
      });

      // Apply pragma settings for better performance
      Object.entries(DB_CONFIG.pragma).forEach(([key, value]) => {
        (db as any).pragma(`${key} = ${value}`);
      });

      console.log(`Database connected: ${DB_CONFIG.path}`);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error(`Database connection failed: ${error}`);
    }
  }
  return db;
};

export { getDatabase };

// Database migration system
interface Migration {
  version: number;
  name: string;
  up: (db: Database) => void;
  down?: (db: Database) => void;
}

const migrations: Migration[] = [
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

// Migration table to track applied migrations
const createMigrationsTable = (db: Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Get current database version
const getCurrentVersion = (db: Database): number => {
  try {
    const result = db.prepare('SELECT MAX(version) as version FROM migrations').get() as any;
    return result?.version || 0;
  } catch (error) {
    return 0;
  }
};

// Apply migrations
const applyMigrations = (db: Database) => {
  createMigrationsTable(db);
  const currentVersion = getCurrentVersion(db);
  
  console.log(`Current database version: ${currentVersion}`);
  
  const pendingMigrations = migrations.filter(m => m.version > currentVersion);
  
  if (pendingMigrations.length === 0) {
    console.log('Database is up to date');
    return;
  }
  
  console.log(`Applying ${pendingMigrations.length} migrations...`);
  
  db.transaction(() => {
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      migration.up(db);
      
      db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name
      );
    }
  });
  console.log('All migrations applied successfully');
};

// Initialize database with migrations
export const initializeDatabase = () => {
  try {
    const database = getDatabase();
    applyMigrations(database);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = () => {
  try {
    const database = getDatabase();
    const result = database.prepare('SELECT 1 as health').get() as any;
    return result?.health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database backup function
export const backupDatabase = (backupPath: string) => {
  try {
    const database = getDatabase();
    const backup = new Database(backupPath);
    
    (database as any).backup(backup)
      .then(() => {
        console.log(`Database backed up to: ${backupPath}`);
        backup.close();
      })
      .catch((error: any) => {
        console.error('Backup failed:', error);
        backup.close();
      });
  } catch (error) {
    console.error('Backup failed:', error);
  }
};

// Seed data with better error handling
export const seedDatabase = () => {
  try {
    const database = getDatabase();
    
    // Check if data already exists
    const existingResources = database.prepare('SELECT COUNT(*) as count FROM resources').get() as any;
    if (existingResources.count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    const resourcesData = [
      {
        title: 'React Fundamentals for Beginners',
        description: 'Learn the basics of React including components, props, and state management.',
        level: 'beginner',
        course: 'programming',
        tags: JSON.stringify(['React', 'JavaScript', 'Frontend']),
        type: 'course',
        duration: '4 hours',
        author: 'John Doe',
        rating: 4.8,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      },
      {
        title: 'Advanced TypeScript Patterns',
        description: 'Master advanced TypeScript patterns and best practices for enterprise applications.',
        level: 'advanced',
        course: 'programming',
        tags: JSON.stringify(['TypeScript', 'Patterns', 'Enterprise']),
        type: 'tutorial',
        duration: '2 hours',
        author: 'Jane Smith',
        rating: 4.9,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Essential design principles for creating user-friendly interfaces.',
        level: 'intermediate',
        course: 'design',
        tags: JSON.stringify(['UI/UX', 'Design', 'Principles']),
        type: 'article',
        duration: '1 hour',
        author: 'Mike Johnson',
        rating: 4.7,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      },
      {
        title: 'Business Strategy Fundamentals',
        description: 'Learn the core concepts of business strategy and competitive analysis.',
        level: 'beginner',
        course: 'business',
        tags: JSON.stringify(['Strategy', 'Business', 'Analysis']),
        type: 'course',
        duration: '6 hours',
        author: 'Sarah Wilson',
        rating: 4.6,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      },
      {
        title: 'Data Science with Python',
        description: 'Complete guide to data science using Python, pandas, and machine learning.',
        level: 'intermediate',
        course: 'data-science',
        tags: JSON.stringify(['Python', 'Data Science', 'ML']),
        type: 'course',
        duration: '8 hours',
        author: 'David Lee',
        rating: 4.8,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      },
      {
        title: 'Digital Marketing Essentials',
        description: 'Master the fundamentals of digital marketing and social media strategy.',
        level: 'beginner',
        course: 'marketing',
        tags: JSON.stringify(['Marketing', 'Digital', 'Social Media']),
        type: 'tutorial',
        duration: '3 hours',
        author: 'Emily Chen',
        rating: 4.5,
        thumbnail: '/api/placeholder/300/200',
        link: '#'
      }
    ];

    const eventsData = [
      {
        title: 'React Advanced Patterns Workshop',
        description: 'Deep dive into advanced React patterns including compound components, render props, and custom hooks.',
        date: '2025-07-20',
        time: '14:00',
        location: 'Tech Hub, Room 201',
        type: 'workshop',
        capacity: 30,
        registered: 22,
        tags: JSON.stringify(['React', 'Advanced', 'Workshop']),
        speaker: 'Dr. Sarah Johnson',
        image: '/api/placeholder/400/250'
      },
      {
        title: 'AI in Education Seminar',
        description: 'Exploring the future of AI in education and how it can enhance learning experiences.',
        date: '2025-07-25',
        time: '10:00',
        location: 'Main Auditorium',
        type: 'seminar',
        capacity: 100,
        registered: 78,
        tags: JSON.stringify(['AI', 'Education', 'Future']),
        speaker: 'Prof. Michael Chen',
        image: '/api/placeholder/400/250'
      },
      {
        title: 'Student Networking Event',
        description: 'Connect with fellow students, alumni, and industry professionals in a relaxed networking environment.',
        date: '2025-08-01',
        time: '18:00',
        location: 'Student Center',
        type: 'networking',
        capacity: 50,
        registered: 35,
        tags: JSON.stringify(['Networking', 'Students', 'Alumni']),
        speaker: 'Career Services Team',
        image: '/api/placeholder/400/250'
      },
      {
        title: 'Web Development Best Practices',
        description: 'Learn modern web development best practices, performance optimization, and security considerations.',
        date: '2025-08-05',
        time: '15:30',
        location: 'Online Webinar',
        type: 'webinar',
        capacity: 200,
        registered: 156,
        tags: JSON.stringify(['Web Development', 'Best Practices', 'Performance']),
        speaker: 'Alex Rodriguez',
        image: '/api/placeholder/400/250'
      }
    ];

    // Insert resources
    const insertResource = database.prepare(`
      INSERT INTO resources (title, description, level, course, tags, type, duration, author, rating, thumbnail, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    resourcesData.forEach(resource => {
      insertResource.run(
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
    });

    // Insert events
    const insertEvent = database.prepare(`
      INSERT INTO events (title, description, date, time, location, type, capacity, registered, tags, speaker, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    eventsData.forEach(event => {
      insertEvent.run(
        event.title,
        event.description,
        event.date,
        event.time,
        event.location,
        event.type,
        event.capacity,
        event.registered,
        event.tags,
        event.speaker,
        event.image
      );
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};

// User Service Class for better OOP design
export class UserService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
  }

  async createUser(email: string, password: string, name: string, openrouterApiKey?: string): Promise<number> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = this.database.prepare(`
        INSERT INTO users (email, password, name, openrouter_api_key)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(email, hashedPassword, name, openrouterApiKey || null);
      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  findUserByEmail(email: string): any {
    try {
      const stmt = this.database.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email);
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  findUserById(id: number): any {
    try {
      const stmt = this.database.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  updateUserApiKey(userId: number, apiKey: string): boolean {
    try {
      // First try with updated_at column
      const stmt = this.database.prepare('UPDATE users SET openrouter_api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(apiKey, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user API key with updated_at:', error);
      
      // If that fails, try without updated_at column
      try {
        const stmt = this.database.prepare('UPDATE users SET openrouter_api_key = ? WHERE id = ?');
        const result = stmt.run(apiKey, userId);
        return result.changes > 0;
      } catch (fallbackError) {
        console.error('Error updating user API key (fallback):', fallbackError);
        return false;
      }
    }
  }

  getUserApiKey(userId: number): string | null {
    try {
      const stmt = this.database.prepare('SELECT openrouter_api_key FROM users WHERE id = ?');
      const result = stmt.get(userId) as any;
      return result?.openrouter_api_key || null;
    } catch (error) {
      console.error('Error getting user API key:', error);
      return null;
    }
  }

  // Create a test user if none exist
  async ensureTestUser(): Promise<any> {
    try {
      const testEmail = 'test@example.com';
      let user = this.findUserByEmail(testEmail);
      
      if (!user) {
        console.log('Creating test user...');
        const userId = await this.createUser(
          testEmail, 
          'password123', 
          'Test User'
        );
        user = this.findUserById(userId);
        console.log('Test user created with ID:', userId);
      }
      
      return user;
    } catch (error) {
      console.error('Error ensuring test user:', error);
      return null;
    }
  }

  // Get all users (for admin purposes)
  getAllUsers(): any[] {
    try {
      const stmt = this.database.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Update user preferences
  updateUserPreferences(userId: number, preferences: any): boolean {
    try {
      const stmt = this.database.prepare(`
        INSERT OR REPLACE INTO user_preferences (user_id, theme, language, notifications_enabled, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      const result = stmt.run(
        userId,
        preferences.theme || 'light',
        preferences.language || 'en',
        preferences.notifications_enabled ? 1 : 0
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  // Get user preferences
  getUserPreferences(userId: number): any {
    try {
      const stmt = this.database.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
      return stmt.get(userId);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
}

// Token Service Class
export class TokenService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
  }

  recordTokenUsage(userId: number, tokensUsed: number, model: string, requestType: string): boolean {
    try {
      const stmt = this.database.prepare(`
        INSERT INTO token_usage (user_id, tokens_used, model, request_type)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(userId, tokensUsed, model, requestType);
      return true;
    } catch (error) {
      console.error('Error recording token usage:', error);
      return false;
    }
  }

  getUserTokenUsage(userId: number): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT 
          SUM(tokens_used) as total_tokens,
          COUNT(*) as total_requests,
          model,
          DATE(created_at) as date
        FROM token_usage 
        WHERE user_id = ? 
        GROUP BY model, DATE(created_at)
        ORDER BY date DESC
      `);
      return stmt.all(userId);
    } catch (error) {
      console.error('Error getting user token usage:', error);
      return [];
    }
  }

  getUserTotalTokenUsage(userId: number): number {
    try {
      const stmt = this.database.prepare(`
        SELECT SUM(tokens_used) as total_tokens
        FROM token_usage 
        WHERE user_id = ?
      `);
      const result = stmt.get(userId) as any;
      return result?.total_tokens || 0;
    } catch (error) {
      console.error('Error getting user total token usage:', error);
      return 0;
    }
  }

  hasTokensRemaining(userId: number, limit: number = 10000): boolean {
    try {
      const totalUsed = this.getUserTotalTokenUsage(userId);
      return totalUsed < limit;
    } catch (error) {
      console.error('Error checking if user has tokens remaining:', error);
      return true; // Default to allowing if there's an error
    }
  }

  getRemainingTokens(userId: number, limit: number = 10000): number {
    try {
      const totalUsed = this.getUserTotalTokenUsage(userId);
      return Math.max(0, limit - totalUsed);
    } catch (error) {
      console.error('Error getting remaining tokens:', error);
      return limit; // Default to full limit if there's an error
    }
  }

  // Get token usage statistics for admin
  getTokenUsageStats(): any {
    try {
      const stmt = this.database.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as active_users,
          SUM(tokens_used) as total_tokens,
          COUNT(*) as total_requests,
          AVG(tokens_used) as avg_tokens_per_request
        FROM token_usage 
        WHERE created_at >= datetime('now', '-30 days')
      `);
      return stmt.get();
    } catch (error) {
      console.error('Error getting token usage stats:', error);
      return null;
    }
  }
}

