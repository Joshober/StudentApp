import { NextApiRequest, NextApiResponse } from 'next';
import { forceReinitializeDatabase } from '@/lib/db-init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Reinitializing database via API...');
    const success = forceReinitializeDatabase();
    
    if (success) {
      res.status(200).json({ 
        success: true, 
        message: 'Database reinitialized successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reinitialize database' 
      });
    }
  } catch (error) {
    console.error('❌ Database reinitialization failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database reinitialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 