import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserTokenUsage, getUserTotalTokenUsage } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const usage = getUserTokenUsage(parseInt(userId));
    const totalTokens = getUserTotalTokenUsage(parseInt(userId));

    res.status(200).json({
      usage,
      totalTokens
    });
  } catch (error) {
    console.error('Error fetching token usage:', error);
    
    // If database table doesn't exist, return default values
    if (error instanceof Error && error.message.includes('no such table')) {
      res.status(200).json({
        usage: [],
        totalTokens: 0
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch token usage',
      details: error instanceof Error ? error.message : error 
    });
  }
} 