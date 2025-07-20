import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, seedDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const database = getDatabase();
    
    // Clear existing resources
    database.prepare('DELETE FROM resources').run();
    
    // Reseed the database
    seedDatabase();
    
    res.status(200).json({
      success: true,
      message: 'Resources reset and reseeded successfully'
    });
  } catch (error) {
    console.error('Error resetting resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset resources'
    });
  }
} 