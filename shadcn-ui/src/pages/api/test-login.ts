import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userService = new UserService();
    
    // Check if test user exists
    const testUser = userService.findUserByEmail('test@example.com');
    
    if (!testUser) {
      // Create test user
      const userId = await userService.createUser(
        'test@example.com',
        'password123',
        'Test User'
      );
      
      return res.status(200).json({
        message: 'Test user created successfully',
        userId: userId,
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        },
        suggestion: 'You can now test the login system'
      });
    }
    
    return res.status(200).json({
      message: 'Test user already exists',
      userId: testUser.id,
      credentials: {
        email: 'test@example.com',
        password: 'password123'
      },
      suggestion: 'You can test the login system with these credentials'
    });
  } catch (error) {
    console.error('Test login error:', error);
    return res.status(500).json({ 
      error: 'Failed to setup test login',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 