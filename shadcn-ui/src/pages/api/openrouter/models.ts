import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserApiKey } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  // Get API key with priority: environment variable > user's API key
  let apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey && userId && typeof userId === 'string') {
    try {
      const userApiKey = getUserApiKey(parseInt(userId));
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
    // Fetch models from OpenRouter
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || '',
        'X-Title': 'AI Homework Tutor',
      },
    });

    if (!modelsResponse.ok) {
      return res.status(modelsResponse.status).json({ 
        error: 'Failed to fetch models from OpenRouter',
        details: await modelsResponse.text()
      });
    }

    const modelsData = await modelsResponse.json();
    
    // Filter for free models and add additional info
    const freeModels = modelsData.data
      .filter((model: any) => {
        // Check if model is free (no pricing or pricing is 0)
        const hasFreePricing = !model.pricing || 
          (model.pricing.prompt === '0' && model.pricing.completion === '0');
        
        // Check if model is available and not deprecated
        const isAvailable = model.status === 'active' && !model.deprecated;
        
        return hasFreePricing && isAvailable;
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: model.pricing,
        architecture: model.architecture,
        top_provider: model.top_provider,
        tags: model.tags || []
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Fetch user's remaining tokens/credits
    let userCredits = null;
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

    res.status(200).json({
      models: freeModels,
      userCredits,
      totalModels: freeModels.length
    });
  } catch (error) {
    console.error('OpenRouter models API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models from OpenRouter', 
      details: error instanceof Error ? error.message : error 
    });
  }
} 