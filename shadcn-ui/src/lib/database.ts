import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { config } from './config';

let db: Database | null = null;

const getDatabase = () => {
  if (!db) {
    db = new Database(config.database.path);
  }
  return db;
};

// Initialize database tables
export const initializeDatabase = () => {
  const database = getDatabase();
  
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      openrouter_api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add openrouter_api_key column to existing users table if it doesn't exist
  try {
    database.exec(`ALTER TABLE users ADD COLUMN openrouter_api_key TEXT`);
  } catch (error) {
    // Column already exists, ignore error
    console.log('openrouter_api_key column already exists or table is new');
  }

  // Token usage tracking table
  database.exec(`
    CREATE TABLE IF NOT EXISTS token_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tokens_used INTEGER NOT NULL,
      model TEXT NOT NULL,
      request_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Resources table
  database.exec(`
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
  database.exec(`
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
  database.exec(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event_id INTEGER,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id),
      UNIQUE(user_id, event_id)
    )
  `);

  console.log('Database initialized successfully');
};

// Seed data
export const seedDatabase = () => {
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
      tags: JSON.stringify(['React', 'JavaScript', 'Advanced']),
      speaker: 'Sarah Johnson',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'UX Design Fundamentals',
      description: 'Learn the core principles of user experience design and how to apply them in real projects.',
      date: '2025-07-22',
      time: '18:00',
      location: 'Online',
      type: 'webinar',
      capacity: 100,
      registered: 67,
      tags: JSON.stringify(['UX', 'Design', 'Beginner']),
      speaker: 'Mike Chen',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Data Science Career Panel',
      description: 'Industry professionals share insights about breaking into data science careers.',
      date: '2025-07-25',
      time: '19:00',
      location: 'Main Auditorium',
      type: 'seminar',
      capacity: 150,
      registered: 89,
      tags: JSON.stringify(['Data Science', 'Career', 'Panel']),
      speaker: null,
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Startup Networking Mixer',
      description: 'Connect with entrepreneurs, investors, and fellow startup enthusiasts in a casual setting.',
      date: '2025-07-28',
      time: '17:30',
      location: 'Innovation Center Lobby',
      type: 'networking',
      capacity: 80,
      registered: 45,
      tags: JSON.stringify(['Networking', 'Startup', 'Business']),
      speaker: null,
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Machine Learning Bootcamp',
      description: 'Intensive 2-day bootcamp covering ML fundamentals and practical applications.',
      date: '2025-08-01',
      time: '09:00',
      location: 'Computer Lab A',
      type: 'workshop',
      capacity: 25,
      registered: 18,
      tags: JSON.stringify(['Machine Learning', 'Python', 'Intensive']),
      speaker: 'Dr. Emily Rodriguez',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Digital Marketing Strategy',
      description: 'Learn how to create effective digital marketing campaigns for modern businesses.',
      date: '2025-08-05',
      time: '16:00',
      location: 'Online',
      type: 'webinar',
      capacity: 200,
      registered: 134,
      tags: JSON.stringify(['Marketing', 'Digital', 'Strategy']),
      speaker: 'Alex Thompson',
      image: '/api/placeholder/400/250'
    }
  ];

  // Insert resources
  const insertResource = getDatabase().prepare(`
    INSERT OR IGNORE INTO resources (title, description, level, course, tags, type, duration, author, rating, thumbnail, link)
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
  const insertEvent = getDatabase().prepare(`
    INSERT OR IGNORE INTO events (title, description, date, time, location, type, capacity, registered, tags, speaker, image)
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
};

// User operations
export const createUser = async (email: string, password: string, name: string, openrouterApiKey?: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const database = getDatabase();
  
  const stmt = database.prepare(`
    INSERT INTO users (email, password, name, openrouter_api_key)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword, name, openrouterApiKey || null);
  return result.lastInsertRowid;
};

export const findUserByEmail = (email: string) => {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as any;
};

export const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Token usage tracking functions
export const recordTokenUsage = (userId: number, tokensUsed: number, model: string, requestType: string) => {
  try {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO token_usage (user_id, tokens_used, model, request_type)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(userId, tokensUsed, model, requestType);
  } catch (error) {
    console.error('Error recording token usage:', error);
    // Don't throw error to avoid breaking the main functionality
    return { lastInsertRowid: 0 };
  }
};

export const getUserTokenUsage = (userId: number) => {
  try {
    const database = getDatabase();
    const stmt = database.prepare(`
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
};

export const getUserTotalTokenUsage = (userId: number) => {
  try {
    const database = getDatabase();
    const stmt = database.prepare(`
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
};

// Check if user has tokens remaining (default limit: 10000 tokens)
export const hasTokensRemaining = (userId: number, limit: number = 10000) => {
  try {
    const totalUsed = getUserTotalTokenUsage(userId);
    return totalUsed < limit;
  } catch (error) {
    console.error('Error checking if user has tokens remaining:', error);
    return true; // Default to allowing if there's an error
  }
};

// Get remaining tokens for user
export const getRemainingTokens = (userId: number, limit: number = 10000) => {
  try {
    const totalUsed = getUserTotalTokenUsage(userId);
    return Math.max(0, limit - totalUsed);
  } catch (error) {
    console.error('Error getting remaining tokens:', error);
    return limit; // Default to full limit if there's an error
  }
};

export const getUserApiKey = (userId: number) => {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT openrouter_api_key FROM users WHERE id = ?');
    const result = stmt.get(userId) as any;
    return result?.openrouter_api_key;
  } catch (error) {
    console.error('Error getting user API key:', error);
    return null;
  }
};

export const updateUserApiKey = (userId: number, apiKey: string) => {
  const database = getDatabase();
  const stmt = database.prepare('UPDATE users SET openrouter_api_key = ? WHERE id = ?');
  return stmt.run(apiKey, userId);
};

// Resource operations
export const getAllResources = () => {
  const select = getDatabase().prepare('SELECT * FROM resources ORDER BY rating DESC');
  return select.all();
};

export const getFilteredResources = (level?: string, course?: string, search?: string) => {
  let query = 'SELECT * FROM resources WHERE 1=1';
  const params: any[] = [];

  if (level && level !== 'all') {
    query += ' AND level = ?';
    params.push(level);
  }

  if (course && course !== 'all') {
    query += ' AND course = ?';
    params.push(course);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY rating DESC';

  const select = getDatabase().prepare(query);
  return select.all(...params);
};

// Event operations
export const getAllEvents = () => {
  const select = getDatabase().prepare('SELECT * FROM events ORDER BY date ASC');
  return select.all();
};

export const getFilteredEvents = (type?: string) => {
  let query = 'SELECT * FROM events WHERE 1=1';
  const params: any[] = [];

  if (type && type !== 'all') {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY date ASC';

  const select = getDatabase().prepare(query);
  return select.all(...params);
};

// Don't export the db object directly to avoid serialization issues
// Use the exported functions instead