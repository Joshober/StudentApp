import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userService = new UserService();
    const user = userService.findUserById(userId);

    if (!user) {
      return res.status(200).json({ 
        valid: false, 
        error: 'User not found' 
      });
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    
    return res.status(200).json({
      valid: true,
      user: userData
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Failed to validate session' 
    });
  }
} 