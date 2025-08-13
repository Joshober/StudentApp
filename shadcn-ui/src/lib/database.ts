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
      submitter_email TEXT,
      submitter_name TEXT,
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
      submitter_email TEXT,
      submitter_name TEXT,
      is_approved INTEGER DEFAULT 1,
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
      
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      `);
    }
  },
  {
    version: 4,
    name: 'Add submitter fields to resources table',
    up: (db: Database) => {
      // Add submitter_email and submitter_name columns to resources table
      db.exec(`
        ALTER TABLE resources ADD COLUMN submitter_email TEXT;
      `);
      
      db.exec(`
        ALTER TABLE resources ADD COLUMN submitter_name TEXT;
      `);
    }
  },
  {
    version: 5,
    name: 'Add approval status to resources table',
    up: (db: Database) => {
      // Add approval status column to resources table
      db.exec(`
        ALTER TABLE resources ADD COLUMN is_approved BOOLEAN DEFAULT 1;
      `);
      
      // Add admin role to users table
      db.exec(`
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;
      `);
    }
  },
  {
    version: 6,
    name: 'Add events table with approval system',
    up: (db: Database) => {
      // Create events table with approval system
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
      
      // Create indexes for events table
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
        CREATE INDEX IF NOT EXISTS idx_events_is_approved ON events(is_approved);
      `);
    }
  },
  {
    version: 7,
    name: 'Add additional fields to events and update event registrations',
    up: (db: Database) => {
      // Add additional fields to events table
      db.exec(`
        ALTER TABLE events ADD COLUMN contact_email TEXT;
      `);
      
      db.exec(`
        ALTER TABLE events ADD COLUMN contact_phone TEXT;
      `);
      
      db.exec(`
        ALTER TABLE events ADD COLUMN website TEXT;
      `);
      
      db.exec(`
        ALTER TABLE events ADD COLUMN additional_info TEXT;
      `);
      
      // Update event_registrations table to use user_email instead of user_id
      db.exec(`
        CREATE TABLE IF NOT EXISTS event_registrations_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          user_email TEXT NOT NULL,
          registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
          UNIQUE(event_id, user_email)
        )
      `);
      
      // Copy data from old table if it exists
      db.exec(`
        INSERT INTO event_registrations_new (event_id, user_email, registered_at)
        SELECT er.event_id, u.email, er.registered_at
        FROM event_registrations er
        JOIN users u ON er.user_id = u.id
      `);
      
      // Drop old table and rename new one
      db.exec(`DROP TABLE IF EXISTS event_registrations`);
      db.exec(`ALTER TABLE event_registrations_new RENAME TO event_registrations`);
      
      // Create index for event registrations
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_user_email ON event_registrations(user_email);
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

export const seedDatabase = () => {
  const db = getDatabase();
  
  try {
    // Check if resources table is empty
    const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get() as { count: number };
    
    if (resourceCount.count === 0) {
      console.log('🌱 Seeding database with sample resources...');
      
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
          link: 'https://react.dev/learn',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
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
          link: 'https://www.typescriptlang.org/docs/',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
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
          link: 'https://www.interaction-design.org/',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Data Science with Python',
          description: 'Introduction to data science using Python, pandas, numpy, and matplotlib.',
          level: 'beginner',
          course: 'data-science',
          tags: JSON.stringify(['python', 'data-science', 'pandas', 'numpy']),
          type: 'course',
          duration: '12 hours',
          author: 'Data Science Institute',
          rating: 4.6,
          thumbnail: '/api/placeholder/300/200',
          link: 'https://www.datacamp.com/courses/intro-to-python-for-data-science',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Digital Marketing Strategy',
          description: 'Learn modern digital marketing strategies including SEO, social media, and content marketing.',
          level: 'intermediate',
          course: 'marketing',
          tags: JSON.stringify(['marketing', 'seo', 'social-media', 'content']),
          type: 'course',
          duration: '8 hours',
          author: 'Marketing Pro',
          rating: 4.5,
          thumbnail: '/api/placeholder/300/200',
          link: 'https://www.coursera.org/learn/digital-marketing',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Business Analytics Tools',
          description: 'Essential tools and techniques for business analytics and data-driven decision making.',
          level: 'intermediate',
          course: 'business',
          tags: JSON.stringify(['analytics', 'business', 'excel', 'power-bi']),
          type: 'tool',
          duration: '6 hours',
          author: 'Business Analytics Pro',
          rating: 4.4,
          thumbnail: '/api/placeholder/300/200',
          link: 'https://www.tableau.com/learn/training',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
          level: 'intermediate',
          course: 'programming',
          tags: JSON.stringify(['nodejs', 'express', 'mongodb', 'backend']),
          type: 'tutorial',
          duration: '10 hours',
          author: 'Node.js Community',
          rating: 4.8,
          thumbnail: '/api/placeholder/300/200',
          link: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Machine Learning Fundamentals',
          description: 'Introduction to machine learning algorithms and their applications.',
          level: 'advanced',
          course: 'data-science',
          tags: JSON.stringify(['machine-learning', 'ai', 'python', 'scikit-learn']),
          type: 'course',
          duration: '15 hours',
          author: 'ML Academy',
          rating: 4.9,
          thumbnail: '/api/placeholder/300/200',
          link: 'https://www.coursera.org/learn/machine-learning',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        }
      ];

              const insertStmt = db.prepare(`
          INSERT INTO resources (
            title, description, level, course, tags, type, duration, 
            author, rating, thumbnail, link, submitter_email, submitter_name, is_approved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

      // Insert resources
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
            resource.link,
            resource.submitter_email,
            resource.submitter_name,
            resource.is_approved
          );
        }
      console.log(`✅ Seeded database with ${sampleResources.length} sample resources`);
    } else {
      console.log('📊 Database already contains resources, skipping seed');
    }

    // Check if events table is empty
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
    
    if (eventCount.count === 0) {
      console.log('🌱 Seeding database with sample events...');
      
      const sampleEvents = [
        {
          title: 'AI Workshop: Introduction to Machine Learning',
          description: 'Join us for a hands-on workshop where you\'ll learn the fundamentals of machine learning and build your first AI model.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          time: '14:00',
          location: 'Computer Science Building, Room 101',
          type: 'workshop',
          capacity: 30,
          registered: 15,
          tags: JSON.stringify(['ai', 'machine-learning', 'python', 'workshop']),
          speaker: 'Dr. Sarah Johnson',
          image: '/api/placeholder/400/250',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Web Development Networking Event',
          description: 'Connect with fellow developers, share experiences, and learn about the latest trends in web development.',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
          time: '18:00',
          location: 'Student Center, Conference Room A',
          type: 'networking',
          capacity: 50,
          registered: 28,
          tags: JSON.stringify(['networking', 'web-development', 'career']),
          speaker: 'Tech Innovation Club',
          image: '/api/placeholder/400/250',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Data Science Seminar: Big Data Analytics',
          description: 'Explore the world of big data analytics and learn how to process and analyze large datasets effectively.',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
          time: '16:00',
          location: 'Engineering Building, Auditorium',
          type: 'seminar',
          capacity: 100,
          registered: 45,
          tags: JSON.stringify(['data-science', 'big-data', 'analytics']),
          speaker: 'Prof. Michael Chen',
          image: '/api/placeholder/400/250',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Cybersecurity Webinar: Protecting Your Digital Life',
          description: 'Learn essential cybersecurity practices to protect your personal and professional digital assets.',
          date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 days from now
          time: '19:00',
          location: 'Online (Zoom)',
          type: 'webinar',
          capacity: 200,
          registered: 120,
          tags: JSON.stringify(['cybersecurity', 'online-safety', 'webinar']),
          speaker: 'Security Expert Lisa Rodriguez',
          image: '/api/placeholder/400/250',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        },
        {
          title: 'Mobile App Development Workshop',
          description: 'Build your first mobile app using React Native. No prior experience required!',
          date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days from now
          time: '13:00',
          location: 'Innovation Lab, Room 205',
          type: 'workshop',
          capacity: 25,
          registered: 18,
          tags: JSON.stringify(['mobile-development', 'react-native', 'workshop']),
          speaker: 'Mobile Developer Alex Thompson',
          image: '/api/placeholder/400/250',
          submitter_email: 'admin@example.com',
          submitter_name: 'Admin',
          is_approved: 1
        }
      ];

      const insertEventStmt = db.prepare(`
        INSERT INTO events (
          title, description, date, time, location, type, capacity, registered,
          tags, speaker, image, submitter_email, submitter_name, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Insert events
      for (const event of sampleEvents) {
        insertEventStmt.run(
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
          event.image,
          event.submitter_email,
          event.submitter_name,
          event.is_approved
        );
      }
      console.log(`✅ Seeded database with ${sampleEvents.length} sample events`);
    } else {
      console.log('📊 Database already contains events, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// User Service Class for better OOP design
export class UserService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
  }

  async createUser(email: string, password: string, name: string, openrouterApiKey?: string, isAdmin?: boolean): Promise<number> {
    try {
  const hashedPassword = await bcrypt.hash(password, 10);
  
      const stmt = this.database.prepare(`
    INSERT INTO users (email, password, name, openrouter_api_key, is_admin)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword, name, openrouterApiKey || null, isAdmin ? 1 : 0);
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

  isUserAdmin(userId: number): boolean {
    try {
      const stmt = this.database.prepare('SELECT is_admin FROM users WHERE id = ?');
      const result = stmt.get(userId) as any;
      return result?.is_admin === 1;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  isUserAdminByEmail(email: string): boolean {
    try {
      const stmt = this.database.prepare('SELECT is_admin FROM users WHERE email = ?');
      const result = stmt.get(email) as any;
      return result?.is_admin === 1;
    } catch (error) {
      console.error('Error checking admin status by email:', error);
      return false;
    }
  }

  updateUserAdminStatus(userId: number, isAdmin: boolean): boolean {
    try {
      const stmt = this.database.prepare('UPDATE users SET is_admin = ? WHERE id = ?');
      const result = stmt.run(isAdmin ? 1 : 0, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user admin status:', error);
      return false;
    }
  }
}

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
      console.error('Failed to record token usage:', error);
      return false;
    }
  }

  getUserTokenUsage(userId: number): any[] {
    try {
      const stmt = this.database.prepare(`
      SELECT 
          model,
        SUM(tokens_used) as total_tokens,
          COUNT(*) as request_count,
          MAX(created_at) as last_used
      FROM token_usage 
      WHERE user_id = ? 
        GROUP BY model
        ORDER BY total_tokens DESC
    `);
    return stmt.all(userId);
  } catch (error) {
      console.error('Failed to get user token usage:', error);
    return [];
    }
  }

  getUserTotalTokenUsage(userId: number): number {
  try {
      const stmt = this.database.prepare(`
        SELECT SUM(tokens_used) as total
      FROM token_usage 
      WHERE user_id = ?
    `);
      const result = stmt.get(userId);
      return result?.total || 0;
  } catch (error) {
      console.error('Failed to get user total token usage:', error);
    return 0;
    }
  }

  hasTokensRemaining(userId: number, limit: number = 10000): boolean {
    const used = this.getUserTotalTokenUsage(userId);
    return used < limit;
  }

  getRemainingTokens(userId: number, limit: number = 10000): number {
    const used = this.getUserTotalTokenUsage(userId);
    return Math.max(0, limit - used);
  }

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
      console.error('Failed to get token usage stats:', error);
      return {};
    }
  }
}

export class ModelService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
    this.ensureModelsTable();
  }

  private ensureModelsTable() {
    try {
      // Check if models table exists
      const tableExists = this.database.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='models'
      `).get();
      
      if (!tableExists) {
        console.log('📋 Creating models table on demand...');
        
        // Create models table
        this.database.exec(`
          CREATE TABLE IF NOT EXISTS models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            context_length INTEGER DEFAULT 0,
            pricing_prompt TEXT DEFAULT '0',
            pricing_completion TEXT DEFAULT '0',
            architecture_modality TEXT DEFAULT 'text',
            architecture_tokenizer TEXT DEFAULT 'unknown',
            top_provider_is_moderated BOOLEAN DEFAULT 0,
            tags TEXT,
            status TEXT DEFAULT 'active',
            deprecated BOOLEAN DEFAULT 0,
            is_free BOOLEAN DEFAULT 1,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create indexes
        this.database.exec(`
          CREATE INDEX IF NOT EXISTS idx_models_is_free ON models(is_free);
          CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
          CREATE INDEX IF NOT EXISTS idx_models_last_updated ON models(last_updated);
        `);
        
        console.log('✅ Models table created successfully');
      }
    } catch (error) {
      console.error('❌ Failed to ensure models table:', error);
    }
  }

  // Get all free models
  getFreeModels(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM models 
        WHERE is_free = 1 AND status = 'active' AND deprecated = 0
        ORDER BY name ASC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Failed to get free models:', error);
      return [];
    }
  }

  // Get all paid models
  getPaidModels(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM models 
        WHERE is_free = 0 AND status = 'active' AND deprecated = 0
        ORDER BY name ASC
        LIMIT 20
      `);
      return stmt.all();
  } catch (error) {
      console.error('Failed to get paid models:', error);
      return [];
    }
  }

  // Get all models (free and paid)
  getAllModels(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM models 
        WHERE status = 'active' AND deprecated = 0
        ORDER BY is_free DESC, name ASC
      `);
      return stmt.all();
  } catch (error) {
      console.error('Failed to get all models:', error);
      return [];
    }
  }

  // Get model by ID
  getModelById(id: string): any {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM models WHERE id = ?
      `);
      return stmt.get(id);
  } catch (error) {
      console.error('Failed to get model by ID:', error);
    return null;
    }
  }

  // Search models
  searchModels(query: string): any[] {
    try {
      const searchTerm = `%${query}%`;
      const stmt = this.database.prepare(`
        SELECT * FROM models 
        WHERE status = 'active' AND deprecated = 0
        AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)
        ORDER BY is_free DESC, name ASC
      `);
      return stmt.all(searchTerm, searchTerm, searchTerm);
    } catch (error) {
      console.error('Failed to search models:', error);
      return [];
    }
  }

  // Update or insert model
  upsertModel(model: any): boolean {
    try {
      const stmt = this.database.prepare(`
        INSERT OR REPLACE INTO models (
          id, name, description, context_length, pricing_prompt, pricing_completion,
          architecture_modality, architecture_tokenizer, top_provider_is_moderated,
          tags, status, deprecated, is_free, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const isFree = model.pricing?.prompt === '0' && model.pricing?.completion === '0';
      const tags = Array.isArray(model.tags) ? model.tags.join(',') : '';
      
      stmt.run(
        model.id,
        model.name,
        model.description || '',
        model.context_length || 0,
        model.pricing?.prompt || '0',
        model.pricing?.completion || '0',
        model.architecture?.modality || 'text',
        model.architecture?.tokenizer || 'unknown',
        model.top_provider?.is_moderated || false,
        tags,
        model.status || 'active',
        model.deprecated || false,
        isFree
      );
      return true;
    } catch (error) {
      console.error('Failed to upsert model:', error);
      return false;
    }
  }

  // Remove deprecated models
  removeDeprecatedModels(): number {
    try {
      const stmt = this.database.prepare(`
        DELETE FROM models WHERE deprecated = 1 OR status != 'active'
      `);
      const result = stmt.run();
      return result.changes;
    } catch (error) {
      console.error('Failed to remove deprecated models:', error);
      return 0;
    }
  }

  // Get sync statistics
  getSyncStats(): any {
    try {
      const stmt = this.database.prepare(`
        SELECT 
          COUNT(*) as total_models,
          SUM(CASE WHEN is_free = 1 THEN 1 ELSE 0 END) as free_models,
          SUM(CASE WHEN is_free = 0 THEN 1 ELSE 0 END) as paid_models,
          MAX(last_updated) as last_sync
        FROM models
        WHERE status = 'active' AND deprecated = 0
      `);
      return stmt.get();
    } catch (error) {
      console.error('Failed to get sync stats:', error);
      return {};
    }
  }
}

export class ModelSyncService {
  private database: Database;
  private modelService: ModelService;

  constructor() {
    this.database = getDatabase();
    this.modelService = new ModelService();
    this.ensureSyncLogTable();
  }

  private ensureSyncLogTable() {
    try {
      // Check if model_sync_log table exists
      const tableExists = this.database.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='model_sync_log'
      `).get();
      
      if (!tableExists) {
        console.log('📋 Creating model_sync_log table on demand...');
        
        this.database.exec(`
          CREATE TABLE IF NOT EXISTS model_sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sync_type TEXT NOT NULL CHECK(sync_type IN ('full', 'incremental')),
            models_fetched INTEGER DEFAULT 0,
            models_updated INTEGER DEFAULT 0,
            models_added INTEGER DEFAULT 0,
            models_removed INTEGER DEFAULT 0,
            sync_duration_ms INTEGER DEFAULT 0,
            success BOOLEAN DEFAULT 1,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        this.database.exec(`
          CREATE INDEX IF NOT EXISTS idx_model_sync_log_created_at ON model_sync_log(created_at);
          CREATE INDEX IF NOT EXISTS idx_model_sync_log_success ON model_sync_log(success);
        `);
        
        console.log('✅ Model sync log table created successfully');
      }
    } catch (error) {
      console.error('❌ Failed to ensure sync log table:', error);
    }
  }

  // Log sync operation
  private logSync(syncData: {
    syncType: 'full' | 'incremental';
    modelsFetched: number;
    modelsUpdated: number;
    modelsAdded: number;
    modelsRemoved: number;
    syncDurationMs: number;
    success: boolean;
    errorMessage?: string;
  }): void {
    try {
      const stmt = this.database.prepare(`
        INSERT INTO model_sync_log (
          sync_type, models_fetched, models_updated, models_added, 
          models_removed, sync_duration_ms, success, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        syncData.syncType,
        syncData.modelsFetched,
        syncData.modelsUpdated,
        syncData.modelsAdded,
        syncData.modelsRemoved,
        syncData.syncDurationMs,
        syncData.success,
        syncData.errorMessage
      );
    } catch (error) {
      console.error('Failed to log sync operation:', error);
    }
  }

  // Sync models from OpenRouter
  async syncModelsFromOpenRouter(): Promise<boolean> {
    const startTime = Date.now();
    let modelsFetched = 0;
    let modelsUpdated = 0;
    let modelsAdded = 0;
    let modelsRemoved = 0;
    let success = false;
    let errorMessage = '';

    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      // Fetch models from OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ai-homework-tutor.com',
          'X-Title': 'AI Homework Tutor',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenRouter');
      }

      modelsFetched = data.data.length;
      const existingModels = new Set(this.modelService.getAllModels().map(m => m.id));
      const newModels = new Set();

      // Process each model
      for (const model of data.data) {
        if (this.isValidModel(model)) {
          const wasNew = !existingModels.has(model.id);
          if (this.modelService.upsertModel(model)) {
            if (wasNew) {
              modelsAdded++;
            } else {
              modelsUpdated++;
            }
            newModels.add(model.id);
          }
        }
      }

      // Remove models that are no longer available
      modelsRemoved = this.modelService.removeDeprecatedModels();

      success = true;
      console.log(`Model sync completed: ${modelsFetched} fetched, ${modelsAdded} added, ${modelsUpdated} updated, ${modelsRemoved} removed`);

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Model sync failed:', error);
    }

    const syncDuration = Date.now() - startTime;

    // Log the sync operation
    this.logSync({
      syncType: 'full',
      modelsFetched,
      modelsUpdated,
      modelsAdded,
      modelsRemoved,
      syncDurationMs: syncDuration,
      success,
      errorMessage
    });

    return success;
  }

  // Check if model is valid for storage
  private isValidModel(model: any): boolean {
    return (
      model.id &&
      model.name &&
      typeof model.id === 'string' &&
      typeof model.name === 'string' &&
      model.status === 'active' &&
      !model.deprecated
    );
  }

  // Get recent sync logs
  getRecentSyncLogs(limit: number = 10): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM model_sync_log 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      return stmt.all(limit);
    } catch (error) {
      console.error('Failed to get recent sync logs:', error);
      return [];
    }
  }

  // Get sync health status
  getSyncHealth(): any {
    try {
      const stmt = this.database.prepare(`
        SELECT 
          COUNT(*) as total_syncs,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_syncs,
          MAX(created_at) as last_sync_attempt,
          AVG(sync_duration_ms) as avg_sync_duration,
          COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as syncs_last_24h
        FROM model_sync_log
      `);
      return stmt.get();
    } catch (error) {
      console.error('Failed to get sync health:', error);
      return {};
    }
  }
}

export class ResourceService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
  }

  getAllResources(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM resources 
        ORDER BY rating DESC, created_at DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  }

  getResourcesByFilter(filters: {
    type?: string;
    level?: string;
    course?: string;
    search?: string;
    userEmail?: string;
    isAdmin?: boolean;
    includePending?: boolean;
  }): any[] {
    try {
      let query = 'SELECT * FROM resources WHERE 1=1';
      const params: any[] = [];

      // Filter by approval status
      if (!filters.isAdmin && !filters.includePending) {
        // Regular users only see approved resources
        query += ' AND is_approved = 1';
      } else if (filters.isAdmin && !filters.includePending) {
        // Admins see approved resources by default
        query += ' AND is_approved = 1';
      } else if (filters.includePending) {
        // Show pending resources for admins or resource owners
        if (filters.isAdmin) {
          // Admins see all pending resources
          query += ' AND is_approved = 0';
        } else if (filters.userEmail) {
          // Users see their own pending resources
          query += ' AND is_approved = 0 AND submitter_email = ?';
          params.push(filters.userEmail);
        }
      }

      if (filters.type && filters.type !== 'all') {
        query += ' AND type = ?';
        params.push(filters.type);
      }

      if (filters.level && filters.level !== 'all') {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.course && filters.course !== 'all') {
        query += ' AND course = ?';
        params.push(filters.course);
      }

      if (filters.search) {
        query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY is_approved ASC, rating DESC, created_at DESC';

      const stmt = this.database.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error('Error fetching filtered resources:', error);
      return [];
    }
  }

  addResource(resource: {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    course: string;
    tags: string[];
    type: 'video' | 'article' | 'tutorial' | 'course' | 'tool';
    duration?: string;
    author: string;
    rating?: number;
    thumbnail?: string;
    link: string;
    submitter_email?: string;
    submitter_name?: string;
    is_approved?: boolean;
  }): boolean {
    try {
      const stmt = this.database.prepare(`
        INSERT INTO resources (title, description, level, course, tags, type, duration, author, rating, thumbnail, link, submitter_email, submitter_name, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        resource.title,
        resource.description,
        resource.level,
        resource.course,
        JSON.stringify(resource.tags),
        resource.type,
        resource.duration || '',
        resource.author,
        resource.rating || 0,
        resource.thumbnail || '/api/placeholder/300/200',
        resource.link,
        resource.submitter_email || '',
        resource.submitter_name || '',
        resource.is_approved !== undefined ? (resource.is_approved ? 1 : 0) : 1
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error adding resource:', error);
      return false;
    }
  }

  getResourceById(id: number): any {
    try {
      const stmt = this.database.prepare('SELECT * FROM resources WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('Error fetching resource by ID:', error);
      return null;
    }
  }

  updateResourceRating(id: number, rating: number): boolean {
    try {
      const stmt = this.database.prepare('UPDATE resources SET rating = ? WHERE id = ?');
      const result = stmt.run(rating, id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating resource rating:', error);
      return false;
    }
  }

  updateResource(id: number, resource: {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    course: string;
    tags: string[];
    type: 'video' | 'article' | 'tutorial' | 'course' | 'tool';
    duration?: string;
    author: string;
    link: string;
  }): boolean {
    try {
      const stmt = this.database.prepare(`
        UPDATE resources 
        SET title = ?, description = ?, level = ?, course = ?, tags = ?, 
            type = ?, duration = ?, author = ?, link = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        resource.title,
        resource.description,
        resource.level,
        resource.course,
        JSON.stringify(resource.tags),
        resource.type,
        resource.duration || '',
        resource.author,
        resource.link,
        id
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error updating resource:', error);
      return false;
    }
  }

  deleteResource(id: number): boolean {
    try {
      const stmt = this.database.prepare('DELETE FROM resources WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting resource:', error);
      return false;
    }
  }

  getResourceStats(): any {
    try {
      const stats = this.database.prepare(`
        SELECT 
          COUNT(*) as total_resources,
          AVG(rating) as avg_rating,
          COUNT(CASE WHEN level = 'beginner' THEN 1 END) as beginner_count,
          COUNT(CASE WHEN level = 'intermediate' THEN 1 END) as intermediate_count,
          COUNT(CASE WHEN level = 'advanced' THEN 1 END) as advanced_count,
          COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_count,
          COUNT(CASE WHEN is_approved = 0 THEN 1 END) as pending_count
        FROM resources
      `).get();

      return stats;
    } catch (error) {
      console.error('Error fetching resource stats:', error);
      return {};
    }
  }

  approveResource(id: number): boolean {
    try {
      const stmt = this.database.prepare('UPDATE resources SET is_approved = 1 WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error approving resource:', error);
      return false;
    }
  }

  rejectResource(id: number): boolean {
    try {
      const stmt = this.database.prepare('DELETE FROM resources WHERE id = ? AND is_approved = 0');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error rejecting resource:', error);
      return false;
    }
  }

  getPendingResources(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM resources 
        WHERE is_approved = 0 
        ORDER BY created_at DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error fetching pending resources:', error);
      return [];
    }
  }

  getPendingResourcesByUser(userEmail: string): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM resources 
        WHERE is_approved = 0 AND submitter_email = ?
        ORDER BY created_at DESC
      `);
      return stmt.all(userEmail);
    } catch (error) {
      console.error('Error fetching pending resources by user:', error);
      return [];
    }
  }
}

export class EventService {
  private database: Database;

  constructor() {
    this.database = getDatabase();
  }

  getAllEvents(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT * FROM events 
        ORDER BY date ASC, time ASC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting all events:', error);
      return [];
    }
  }

  getApprovedEvents(filters: {
    type?: string;
    userEmail?: string;
    isAdmin?: boolean;
    limit?: number;
  }): any[] {
    try {
      let query = `
        SELECT e.*, u.name as submitter_name
        FROM events e
        LEFT JOIN users u ON e.submitter_email = u.email
        WHERE e.is_approved = 1
      `;
      
      const params: any[] = [];
      
      if (filters.type && filters.type !== 'all') {
        query += ` AND e.type = ?`;
        params.push(filters.type);
      }
      
      query += ` ORDER BY e.date ASC, e.time ASC`;
      
      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
      }
      
      const stmt = this.database.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error('Error getting approved events:', error);
      return [];
    }
  }

  addEvent(event: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'workshop' | 'seminar' | 'networking' | 'webinar';
    capacity: number;
    tags: string[];
    speaker?: string;
    image?: string;
    submitter_email?: string;
    submitter_name?: string;
    is_approved?: boolean;
  }): boolean {
    try {
      const stmt = this.database.prepare(`
        INSERT INTO events (
          title, description, date, time, location, type, 
          capacity, tags, speaker, image, submitter_email, 
          submitter_name, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        event.title,
        event.description,
        event.date,
        event.time,
        event.location,
        event.type,
        event.capacity,
        JSON.stringify(event.tags),
        event.speaker || null,
        event.image || null,
        event.submitter_email || null,
        event.submitter_name || null,
        event.is_approved ? 1 : 0
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  }

  getEventById(id: string): any {
    try {
      const stmt = this.database.prepare(`
        SELECT e.*, u.name as submitter_name
        FROM events e
        LEFT JOIN users u ON e.submitter_email = u.email
        WHERE e.id = ?
      `);
      return stmt.get(id);
    } catch (error) {
      console.error('Error getting event by id:', error);
      return null;
    }
  }



  deleteEvent(id: string): boolean {
    try {
      const stmt = this.database.prepare(`
        DELETE FROM events WHERE id = ?
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  approveEvent(id: string): boolean {
    try {
      const stmt = this.database.prepare(`
        UPDATE events SET is_approved = 1 WHERE id = ?
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error approving event:', error);
      return false;
    }
  }

  rejectEvent(id: string): boolean {
    try {
      const stmt = this.database.prepare(`
        DELETE FROM events WHERE id = ?
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error rejecting event:', error);
      return false;
    }
  }

  getPendingEvents(): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT e.*, u.name as submitter_name
        FROM events e
        LEFT JOIN users u ON e.submitter_email = u.email
        WHERE e.is_approved IS NULL OR e.is_approved = 0
        ORDER BY e.created_at DESC
      `);
      
      return stmt.all();
    } catch (error) {
      console.error('Error getting pending events:', error);
      return [];
    }
  }

  getPendingEventsByUser(userEmail: string): any[] {
    try {
      const stmt = this.database.prepare(`
        SELECT e.*, u.name as submitter_name
        FROM events e
        LEFT JOIN users u ON e.submitter_email = u.email
        WHERE (e.is_approved IS NULL OR e.is_approved = 0)
        AND (e.submitter_email = ? OR EXISTS (
          SELECT 1 FROM users WHERE email = ? AND is_admin = 1
        ))
        ORDER BY e.created_at DESC
      `);
      
      return stmt.all(userEmail, userEmail);
    } catch (error) {
      console.error('Error getting pending events by user:', error);
      return [];
    }
  }

  isUserRegisteredForEvent(eventId: string, userEmail: string): boolean {
    try {
      const stmt = this.database.prepare(`
        SELECT COUNT(*) as count FROM event_registrations 
        WHERE event_id = ? AND user_email = ?
      `);
      const result = stmt.get(eventId, userEmail);
      return result.count > 0;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  registerUserForEvent(eventId: string, userEmail: string): boolean {
    try {
      // First check if user is already registered
      if (this.isUserRegisteredForEvent(eventId, userEmail)) {
        return false;
      }

      // Check if event is full
      const event = this.getEventById(eventId);
      if (!event || event.registered >= event.capacity) {
        return false;
      }

      // Register the user
      const stmt = this.database.prepare(`
        INSERT INTO event_registrations (event_id, user_email, registered_at)
        VALUES (?, ?, datetime('now'))
      `);
      
      const result = stmt.run(eventId, userEmail);
      
      if (result.changes > 0) {
        // Update the event's registered count
        const updateStmt = this.database.prepare(`
          UPDATE events SET registered = registered + 1 WHERE id = ?
        `);
        updateStmt.run(eventId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering user for event:', error);
      return false;
    }
  }

  updateEvent(id: string, event: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'workshop' | 'seminar' | 'networking' | 'webinar';
    capacity: number;
    tags: string[];
    speaker?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    additional_info?: string;
  }): any {
    try {
      const stmt = this.database.prepare(`
        UPDATE events SET
          title = ?, description = ?, date = ?, time = ?, 
          location = ?, type = ?, capacity = ?, tags = ?, speaker = ?,
          contact_email = ?, contact_phone = ?, website = ?, additional_info = ?
        WHERE id = ?
      `);
      
      const result = stmt.run(
        event.title,
        event.description,
        event.date,
        event.time,
        event.location,
        event.type,
        event.capacity,
        JSON.stringify(event.tags),
        event.speaker || null,
        event.contact_email || null,
        event.contact_phone || null,
        event.website || null,
        event.additional_info || null,
        id
      );
      
      if (result.changes > 0) {
        return this.getEventById(id);
      }
      return null;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }
}

