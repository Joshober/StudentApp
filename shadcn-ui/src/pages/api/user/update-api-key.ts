import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

// Test the API key against OpenRouter's actual API
async function validateOpenRouterApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; credits?: any }> {
  try {
    // Test 1: Get user credits (this is a lightweight call)
    const creditsResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!creditsResponse.ok) {
      if (creditsResponse.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check your OpenRouter API key.' };
      }
      return { valid: false, error: `API key validation failed (${creditsResponse.status})` };
    }

    const creditsData = await creditsResponse.json();
    
    // Test 2: Try a simple model list call to ensure the key works for API calls
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!modelsResponse.ok) {
      return { valid: false, error: 'API key cannot access OpenRouter models. Please check your permissions.' };
    }

    return { 
      valid: true, 
      credits: creditsData,
      error: undefined 
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { 
      valid: false, 
      error: 'Failed to validate API key. Please check your internet connection and try again.' 
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, apiKey } = req.body;

    console.log('Update API key request:', { userId, apiKey: apiKey ? '***' : 'null' });

    if (!userId || !apiKey) {
      return res.status(400).json({ error: 'User ID and API key are required' });
    }

    // Basic validation for OpenRouter API key format
    if (!apiKey.startsWith('sk-or-')) {
      return res.status(400).json({ error: 'Invalid OpenRouter API key format. Should start with "sk-or-"' });
    }

    // Use the UserService class
    const userService = new UserService();
    
    // Check if user exists first
    const user = userService.findUserById(userId);
    console.log('Database user check:', user ? 'User found' : 'User not found');

    if (!user) {
      // Try to create a test user if none exist
      console.log('User not found, attempting to create test user...');
      const testUser = await userService.ensureTestUser();
      
      if (testUser && testUser.id === userId) {
        console.log('Test user created/verified, proceeding with API key update');
      } else {
        return res.status(404).json({ 
          error: 'User not found',
          userId: userId,
          suggestion: 'Please sign out and sign in again to refresh your session'
        });
      }
    }

    // Validate the API key against OpenRouter's actual API
    console.log('Validating API key against OpenRouter...');
    const validation = await validateOpenRouterApiKey(apiKey);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error,
        suggestion: 'Please check your API key at https://openrouter.ai/keys'
      });
    }

    console.log('API key validation successful, credits:', validation.credits);

    // Update the user's API key using the service
    const updateSuccess = userService.updateUserApiKey(userId, apiKey);
    console.log('Update result:', updateSuccess);

    if (updateSuccess) {
      return res.status(200).json({ 
        message: 'API key validated and updated successfully!',
        success: true,
        credits: validation.credits
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to update API key in database',
        userId: userId
      });
    }
  } catch (error) {
    console.error('Error updating API key:', error);
    return res.status(500).json({ error: 'Failed to update API key' });
  }
} 