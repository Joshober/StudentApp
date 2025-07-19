import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const database = getDatabase();
    
    // Check users table schema
    const usersSchema = database.prepare("PRAGMA table_info(users)").all();
    
    // Check if updated_at column exists
    const hasUpdatedAt = usersSchema.some((col: any) => col.name === 'updated_at');
    
    // Get current migrations
    const migrations = database.prepare("SELECT * FROM migrations ORDER BY version").all();
    
    return res.status(200).json({
      database: {
        accessible: true
      },
      schema: {
        users: {
          columns: usersSchema,
          hasUpdatedAt: hasUpdatedAt
        }
      },
      migrations: {
        applied: migrations,
        count: migrations.length
      },
      issues: hasUpdatedAt ? [] : ['Missing updated_at column in users table']
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return res.status(500).json({ 
      error: 'Failed to check database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 