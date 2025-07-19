import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userService = new UserService();
    const userApiKey = userService.getUserApiKey(parseInt(userId));
    const envApiKey = process.env.OPENROUTER_API_KEY;
    
    let source: 'environment' | 'user' | 'none' = 'none';
    
    if (envApiKey) {
      source = 'environment';
    } else if (userApiKey) {
      source = 'user';
    }

    res.status(200).json({
      source,
      hasUserKey: !!userApiKey,
      hasEnvKey: !!envApiKey
    });
  } catch (error) {
    console.error('Error checking API key status:', error);
    res.status(500).json({ 
      error: 'Failed to check API key status',
      details: error instanceof Error ? error.message : error 
    });
  }
} 