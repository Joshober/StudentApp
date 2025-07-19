import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase, seedDatabase, checkDatabaseHealth } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing database...');
    
    // Initialize database with migrations
    initializeDatabase();
    
    // Check database health
    const isHealthy = checkDatabaseHealth();
    if (!isHealthy) {
      return res.status(500).json({ error: 'Database health check failed' });
    }
    
    // Seed database with initial data
    seedDatabase();
    
    console.log('Database initialization completed successfully');
    
    return res.status(200).json({
      message: 'Database initialized successfully',
      health: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return res.status(500).json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 