import { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase, seedDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database with all migrations
    console.log('🔄 Initializing database...');
    initializeDatabase();
    
    // Seed database with sample data
    console.log('🌱 Seeding database...');
    seedDatabase();
    
    res.status(200).json({
      success: true,
      message: 'Database initialized and seeded successfully'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database'
    });
  }
} 