import type { NextApiRequest, NextApiResponse } from 'next';
import { TokenService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userIdNum = parseInt(userId as string);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const tokenService = new TokenService();

    // Get total token usage
    const totalUsed = tokenService.getUserTotalTokenUsage(userIdNum);
    
    // Get detailed token usage by model and date
    const detailedUsage = tokenService.getUserTokenUsage(userIdNum);
    
    // Calculate total requests
    const totalRequests = detailedUsage.reduce((sum, item) => sum + (item.total_requests || 0), 0);

    return res.status(200).json({
      totalUsed,
      totalRequests,
      detailedUsage,
      remaining: Math.max(0, 10000 - totalUsed) // Default limit of 10,000 tokens
    });
  } catch (error) {
    console.error('Error getting token usage:', error);
    return res.status(500).json({ error: 'Failed to get token usage' });
  }
} 