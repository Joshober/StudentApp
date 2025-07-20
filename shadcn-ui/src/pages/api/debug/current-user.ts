import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        suggestion: 'Add ?userId=YOUR_USER_ID to the URL'
      });
    }

    const userService = new UserService();
    const user = userService.findUserById(parseInt(userId as string));

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        userId: userId,
        suggestion: 'Try signing in again or create a new user'
      });
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    
    return res.status(200).json({
      message: 'User found successfully',
      user: userData,
      suggestion: 'This user exists in the database'
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return res.status(500).json({ 
      error: 'Failed to check user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 