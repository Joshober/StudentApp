import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';
import { tokenManager } from '@/lib/token-service';
import { OPENROUTER_MODELS, getModelById } from '@/lib/openrouter-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userService = new UserService();
    const userIdNum = parseInt(userId);
    
    // Get comprehensive token information
    const tokenStatus = tokenManager.checkTokenStatus(userIdNum);
    const detailedUsage = tokenManager.getTokenUsageStats(userIdNum);
    
    // Calculate usage metrics
    const totalRequests = detailedUsage.reduce((sum, item) => sum + (item.total_requests || 0), 0);
    const averageTokensPerRequest = totalRequests > 0 ? tokenStatus.totalUsed / totalRequests : 0;
    
    // Get user's API key
    let apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const userApiKey = userService.getUserApiKey(userIdNum);
      if (userApiKey) {
        apiKey = userApiKey;
      }
    }

    // Fetch OpenRouter models and credits
    let openRouterCredits = null;
    let availableModels = [];
    let userApiKeyStatus = 'none';
    
    if (apiKey) {
      try {
        // Get OpenRouter credits
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
          userApiKeyStatus = 'valid';
        }
      } catch (error) {
        console.error('Failed to fetch OpenRouter credits:', error);
        userApiKeyStatus = 'error';
      }

      // Get available models from OpenRouter
      try {
        const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': req.headers.origin || '',
            'X-Title': 'AI Homework Tutor',
          },
        });

        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          availableModels = modelsData.data || [];
        }
      } catch (error) {
        console.error('Failed to fetch OpenRouter models:', error);
        // Fallback to local models if API call fails
        availableModels = OPENROUTER_MODELS;
      }
    }

    // Analyze model usage patterns
    const modelUsage: Record<string, any> = detailedUsage.reduce((acc, item) => {
      const modelId = item.model;
      const modelInfo = getModelById(modelId) || { name: modelId, id: modelId };
      
      if (!acc[modelId]) {
        acc[modelId] = {
          id: modelId,
          name: modelInfo.name,
          totalTokens: 0,
          totalRequests: 0,
          averageTokensPerRequest: 0,
          lastUsed: null
        };
      }
      
      acc[modelId].totalTokens += item.total_tokens || 0;
      acc[modelId].totalRequests += item.total_requests || 0;
      acc[modelId].lastUsed = item.date;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for each model
    Object.values(modelUsage).forEach((model: any) => {
      model.averageTokensPerRequest = model.totalRequests > 0 
        ? Math.round((model.totalTokens / model.totalRequests) * 100) / 100 
        : 0;
    });

    // Get popular models (most used)
    const popularModels = Object.values(modelUsage)
      .sort((a: any, b: any) => b.totalTokens - a.totalTokens)
      .slice(0, 5);

    // Get recommended models based on usage patterns
    const recommendedModels = OPENROUTER_MODELS
      .filter(model => model.pricing.prompt === '0' && model.pricing.completion === '0')
      .slice(0, 3);

    // Get cache statistics
    const cacheStats = tokenManager.getCacheStats();

    return res.status(200).json({
      // User information
      userId: userIdNum,
      userApiKeyStatus,
      
      // Token usage
      tokenStatus: {
        totalUsed: tokenStatus.totalUsed,
        remaining: tokenStatus.remainingTokens,
        hasTokens: tokenStatus.hasTokens,
        limit: tokenStatus.limit,
        percentageUsed: Math.round((tokenStatus.totalUsed / tokenStatus.limit) * 100)
      },
      
      // Usage statistics
      usageStats: {
        totalRequests,
        averageTokensPerRequest: Math.round(averageTokensPerRequest * 100) / 100,
        detailedUsage,
        modelUsage,
        popularModels
      },
      
      // AI Models
      models: {
        available: availableModels.length,
        recommended: recommendedModels,
        userUsage: Object.values(modelUsage)
      },
      
      // OpenRouter integration
      openRouter: {
        credits: openRouterCredits,
        hasApiKey: !!apiKey,
        modelsAvailable: availableModels.length > 0
      },
      
      // System information
      system: {
        cacheStats,
        rateLimitInfo: {
          maxRequests: 10,
          windowMs: 60000
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching AI usage data:', error);
    
    // If database table doesn't exist, return default values
    if (error instanceof Error && error.message.includes('no such table')) {
      return res.status(200).json({
        userId: parseInt(userId),
        userApiKeyStatus: 'none',
        tokenStatus: {
          totalUsed: 0,
          remaining: 10000,
          hasTokens: true,
          limit: 10000,
          percentageUsed: 0
        },
        usageStats: {
          totalRequests: 0,
          averageTokensPerRequest: 0,
          detailedUsage: [],
          modelUsage: {},
          popularModels: []
        },
        models: {
          available: 0,
          recommended: OPENROUTER_MODELS.filter(m => m.pricing.prompt === '0').slice(0, 3),
          userUsage: []
        },
        openRouter: {
          credits: null,
          hasApiKey: false,
          modelsAvailable: false
        },
        system: {
          cacheStats: { rateLimitEntries: 0, tokenCacheEntries: 0 },
          rateLimitInfo: {
            maxRequests: 10,
            windowMs: 60000
          },
          lastUpdated: new Date().toISOString()
        }
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch AI usage data',
      details: error instanceof Error ? error.message : error 
    });
  }
} 