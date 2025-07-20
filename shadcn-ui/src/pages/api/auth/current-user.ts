import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

const userService = new UserService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, we'll return a mock user
    // In a real application, you would get the user from the session/token
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
      role: 'student' // or 'admin'
    };

    res.status(200).json({
      success: true,
      user: mockUser
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current user'
    });
  }
} 