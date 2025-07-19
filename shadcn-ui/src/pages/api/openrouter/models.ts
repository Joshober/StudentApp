import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/database';

// Server-side cache for models data
const modelsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Get cached models data
const getCachedModels = (apiKey: string) => {
  const cached = modelsCache.get(apiKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Set cached models data
const setCachedModels = (apiKey: string, data: any) => {
  modelsCache.set(apiKey, { data, timestamp: Date.now() });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  // Get API key with priority: environment variable > user's API key
  let apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey && userId && typeof userId === 'string') {
    try {
      const userService = new UserService();
      const userApiKey = userService.getUserApiKey(parseInt(userId));
      if (userApiKey) {
        apiKey = userApiKey;
      }
    } catch (error) {
      console.error('Error getting user API key:', error);
    }
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not set.' });
  }

  try {
    // Check cache first
    const cachedData = getCachedModels(apiKey);
    if (cachedData) {
      console.log('Returning cached models data');
      return res.status(200).json(cachedData);
    }

    // Fetch models from OpenRouter with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || '',
        'X-Title': 'AI Homework Tutor',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!modelsResponse.ok) {
      console.error('Models API response not ok:', modelsResponse.status, modelsResponse.statusText);
      return res.status(modelsResponse.status).json({ 
        error: 'Failed to fetch models from OpenRouter',
        details: await modelsResponse.text()
      });
    }

    const modelsData = await modelsResponse.json();
    
    if (!modelsData.data || !Array.isArray(modelsData.data)) {
      console.error('Invalid models data structure:', modelsData);
      return res.status(500).json({ 
        error: 'Invalid response format from OpenRouter',
        details: 'Models data is not in expected format'
      });
    }
    
    // Filter for free models and add additional info
    const freeModels = modelsData.data
      .filter((model: any) => {
        // Check if model is free (no pricing or pricing is 0)
        const hasFreePricing = !model.pricing || 
          (model.pricing.prompt === '0' && model.pricing.completion === '0');
        
        // Check if model is available and not deprecated
        const isAvailable = model.status === 'active' && !model.deprecated;
        
        // Additional safety checks
        const hasValidId = model.id && typeof model.id === 'string';
        const hasValidName = model.name && typeof model.name === 'string';
        
        return hasFreePricing && isAvailable && hasValidId && hasValidName;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description || 'No description available',
        context_length: model.context_length || 0,
        pricing: model.pricing || { prompt: '0', completion: '0' },
        architecture: model.architecture || { modality: 'text', tokenizer: 'unknown' },
        top_provider: model.top_provider || { is_moderated: false },
        tags: Array.isArray(model.tags) ? model.tags : []
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Fetch user's remaining tokens/credits with timeout
    let userCredits = null;
    try {
      const creditsController = new AbortController();
      const creditsTimeoutId = setTimeout(() => creditsController.abort(), 5000); // 5 second timeout

      const creditsResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': req.headers.origin || '',
          'X-Title': 'AI Homework Tutor',
        },
        signal: creditsController.signal,
      });

      clearTimeout(creditsTimeoutId);

      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        userCredits = {
          remaining: creditsData.credits || 0,
          used: creditsData.used || 0,
          total: creditsData.total || 0
        };
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
      // Don't fail the request if credits fetch fails
    }

    const responseData = {
      models: freeModels,
      userCredits,
      totalModels: freeModels.length
    };

    // Cache the response
    setCachedModels(apiKey, responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('OpenRouter models API error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout - OpenRouter is taking too long to respond',
        details: 'Please try again in a moment'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch models from OpenRouter', 
      details: error instanceof Error ? error.message : error 
    });
  }
} 