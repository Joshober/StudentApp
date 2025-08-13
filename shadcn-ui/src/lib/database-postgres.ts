import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import { config } from './config';

let pool: Pool | null = null;

// Database configuration
const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.database.url,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
};

export const getDatabase = () => {
  return getPool();
};

// Database migration system
interface Migration {
  version: number;
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down?: (client: PoolClient) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'Initial schema',
    up: async (client: PoolClient) => {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'student',
          openrouter_api_key TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Token usage tracking table
      await client.query(`
        CREATE TABLE IF NOT EXISTS token_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          tokens_used INTEGER NOT NULL,
          model VARCHAR(255) NOT NULL,
          request_type VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Resources table
      await client.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT NOT NULL,
          level VARCHAR(50) NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced')),
          course VARCHAR(100) NOT NULL CHECK(course IN ('programming', 'design', 'business', 'data-science', 'marketing')),
          tags TEXT NOT NULL,
          type VARCHAR(50) NOT NULL CHECK(type IN ('video', 'article', 'tutorial', 'course', 'tool')),
          duration VARCHAR(100),
          author VARCHAR(255) NOT NULL,
          rating DECIMAL(3,2) DEFAULT 0,
          thumbnail TEXT,
          link TEXT NOT NULL,
          submitter_email VARCHAR(255),
          submitter_name VARCHAR(255),
          is_approved BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          location VARCHAR(500) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK(type IN ('workshop', 'seminar', 'networking', 'webinar')),
          capacity INTEGER NOT NULL,
          registered INTEGER DEFAULT 0,
          tags TEXT NOT NULL,
          speaker VARCHAR(255),
          image TEXT,
          submitter_email VARCHAR(255),
          submitter_name VARCHAR(255),
          is_approved BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Event registrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, event_id)
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
        CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at);
        CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course);
        CREATE INDEX IF NOT EXISTS idx_resources_level ON resources(level);
        CREATE INDEX IF NOT EXISTS idx_resources_is_approved ON resources(is_approved);
        CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
      `);
    }
  },
  {
    version: 2,
    name: 'Add user sessions table',
    up: async (client: PoolClient) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
      `);
    }
  },
  {
    version: 3,
    name: 'Add user preferences table',
    up: async (client: PoolClient) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          theme VARCHAR(50) DEFAULT 'light',
          language VARCHAR(10) DEFAULT 'en',
          notifications_enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      `);
    }
  }
];

// Migration table to track applied migrations
const createMigrationsTable = async (client: PoolClient) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      version INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Get current database version
const getCurrentVersion = async (client: PoolClient): Promise<number> => {
  try {
    const result = await client.query('SELECT MAX(version) as version FROM migrations');
    return result.rows[0]?.version || 0;
  } catch (error) {
    return 0;
  }
};

// Apply migrations
const applyMigrations = async (client: PoolClient) => {
  await createMigrationsTable(client);
  const currentVersion = await getCurrentVersion(client);
  
  console.log(`Current database version: ${currentVersion}`);
  
  const pendingMigrations = migrations.filter(m => m.version > currentVersion);
  
  if (pendingMigrations.length === 0) {
    console.log('Database is up to date');
    return;
  }
  
  console.log(`Applying ${pendingMigrations.length} migrations...`);
  
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.version}: ${migration.name}`);
    await migration.up(client);
    
    await client.query(
      'INSERT INTO migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    );
  }
  console.log('All migrations applied successfully');
};

// Initialize database with migrations
export const initializeDatabase = async () => {
  const client = await getPool().connect();
  try {
    await applyMigrations(client);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  const client = await getPool().connect();
  try {
    const result = await client.query('SELECT 1 as health');
    return result.rows[0]?.health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  } finally {
    client.release();
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
