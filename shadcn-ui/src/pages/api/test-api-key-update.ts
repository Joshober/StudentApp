import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;
    const userService = new UserService();

    // Get or create a test user
    const testUser = await userService.ensureTestUser();
    
    if (!testUser) {
      return res.status(500).json({ error: 'Failed to create test user' });
    }

    console.log('Test user found:', { id: testUser.id, email: testUser.email });

    // Test API key update
    const updateSuccess = userService.updateUserApiKey(testUser.id, apiKey || 'sk-or-test-key');
    
    if (updateSuccess) {
      // Verify the update
      const updatedUser = userService.findUserById(testUser.id);
      
      return res.status(200).json({
        message: 'API key update test successful',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          hasApiKey: !!updatedUser.openrouter_api_key,
          apiKeyLength: updatedUser.openrouter_api_key ? updatedUser.openrouter_api_key.length : 0
        },
        testUser: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
    } else {
      return res.status(500).json({ 
        error: 'API key update test failed',
        userId: testUser.id
      });
    }
  } catch (error) {
    console.error('API key update test error:', error);
    return res.status(500).json({ 
      error: 'API key update test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 