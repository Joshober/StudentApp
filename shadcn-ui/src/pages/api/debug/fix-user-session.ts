import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;
    const userService = new UserService();

    console.log('Fix user session request:', { userId, email });

    // If userId is provided, check if user exists
    if (userId) {
      const user = userService.findUserById(userId);
      if (user) {
        return res.status(200).json({
          message: 'User found in database',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasApiKey: !!user.openrouter_api_key
          },
          suggestion: 'User exists, try signing in again'
        });
      }
    }

    // If email is provided, check if user exists by email
    if (email) {
      const user = userService.findUserByEmail(email);
      if (user) {
        return res.status(200).json({
          message: 'User found by email',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasApiKey: !!user.openrouter_api_key
          },
          suggestion: 'Use this user ID in your session'
        });
      }
    }

    // Create a test user if none exist
    console.log('Creating test user...');
    const testUser = await userService.ensureTestUser();
    
    if (testUser) {
      return res.status(200).json({
        message: 'Test user created successfully',
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          hasApiKey: !!testUser.openrouter_api_key
        },
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        },
        suggestion: 'Sign in with these credentials and try again'
      });
    }

    return res.status(500).json({
      error: 'Failed to create test user',
      suggestion: 'Check database initialization'
    });
  } catch (error) {
    console.error('Fix user session error:', error);
    return res.status(500).json({ 
      error: 'Failed to fix user session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 