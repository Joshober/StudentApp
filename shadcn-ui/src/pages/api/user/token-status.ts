import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';
import { tokenManager } from '@/lib/token-service';

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
    
    const userIdNum = parseInt(userId);
    const tokenStatus = tokenManager.checkTokenStatus(userIdNum);

    // Get API key to fetch OpenRouter credits
    let apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const userApiKey = userService.getUserApiKey(userIdNum);
      if (userApiKey) {
        apiKey = userApiKey;
      }
    }

    // Fetch OpenRouter credits if API key is available
    let openRouterCredits = null;
    if (apiKey) {
      try {
        const creditsResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': req.headers.origin || '',
            'X-Title': 'AI Homework Tutor',
          },
        });

        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          openRouterCredits = {
            remaining: creditsData.credits || 0,
            used: creditsData.used || 0,
            total: creditsData.total || 0
          };
        }
      } catch (error) {
        console.error('Failed to fetch OpenRouter credits:', error);
        // Don't fail the request if credits fetch fails
      }
    }

    res.status(200).json({
      totalUsed: tokenStatus.totalUsed,
      remaining: tokenStatus.remainingTokens,
      hasTokens: tokenStatus.hasTokens,
      limit: tokenStatus.limit,
      openRouterCredits
    });
  } catch (error) {
    console.error('Error fetching token status:', error);
    
    // If database table doesn't exist, return default values
    if (error instanceof Error && error.message.includes('no such table')) {
      res.status(200).json({
        totalUsed: 0,
        remaining: 10000,
        hasTokens: true,
        limit: 10000
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch token status',
      details: error instanceof Error ? error.message : error 
    });
  }
} 