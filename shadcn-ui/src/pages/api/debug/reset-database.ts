import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase, seedDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Resetting database...');
    
    // Re-initialize the database (this will apply all migrations)
    initializeDatabase();
    
    // Seed the database with test data
    seedDatabase();
    
    console.log('Database reset completed successfully');
    
    return res.status(200).json({
      message: 'Database reset successfully',
      details: 'All migrations applied and test data seeded'
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return res.status(500).json({ 
      error: 'Failed to reset database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 