import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';
import { tokenManager } from '@/lib/token-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userService = new UserService();
    const userIdNum = parseInt(userId);
    
    // Get comprehensive token information in one call
    const tokenStatus = tokenManager.checkTokenStatus(userIdNum);
    const detailedUsage = tokenManager.getTokenUsageStats(userIdNum);
    
    // Calculate additional metrics
    const totalRequests = detailedUsage.reduce((sum, item) => sum + (item.total_requests || 0), 0);
    const averageTokensPerRequest = totalRequests > 0 ? tokenStatus.totalUsed / totalRequests : 0;
    
    // Get API key for OpenRouter credits
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

    // Get cache statistics for debugging
    const cacheStats = tokenManager.getCacheStats();

    return res.status(200).json({
      // Token status
      totalUsed: tokenStatus.totalUsed,
      remaining: tokenStatus.remainingTokens,
      hasTokens: tokenStatus.hasTokens,
      limit: tokenStatus.limit,
      
      // Usage statistics
      totalRequests,
      averageTokensPerRequest: Math.round(averageTokensPerRequest * 100) / 100,
      detailedUsage,
      
      // OpenRouter credits
      openRouterCredits,
      
      // Cache information (for debugging)
      cacheStats,
      
      // Rate limit information
      rateLimitInfo: {
        maxRequests: 10,
        windowMs: 60000
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive token data:', error);
    
    // If database table doesn't exist, return default values
    if (error instanceof Error && error.message.includes('no such table')) {
      return res.status(200).json({
        totalUsed: 0,
        remaining: 10000,
        hasTokens: true,
        limit: 10000,
        totalRequests: 0,
        averageTokensPerRequest: 0,
        detailedUsage: [],
        openRouterCredits: null,
        cacheStats: { rateLimitEntries: 0, tokenCacheEntries: 0 },
        rateLimitInfo: {
          maxRequests: 10,
          windowMs: 60000
        }
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch token data',
      details: error instanceof Error ? error.message : error 
    });
  }
} 