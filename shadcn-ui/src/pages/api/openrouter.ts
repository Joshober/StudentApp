import type { NextApiRequest, NextApiResponse } from 'next';
import { UserService, TokenService } from '@/lib/database';

// Simple in-memory rate limiting (for development)
const requestCounts = new Map<string, { count: number; resetTime: number; lastRequest: number }>();

// Cache for successful model responses to avoid redundant calls
const modelResponseCache = new Map<string, { response: any; timestamp: number }>();
const RESPONSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const userData = requestCounts.get(identifier);
  
  if (!userData || now > userData.resetTime) {
    requestCounts.set(identifier, { 
      count: 1, 
      resetTime: now + 60000, // 1 minute window
      lastRequest: now
    });
    return false;
  }
  
  // More conservative rate limiting: 5 requests per minute
  if (userData.count >= 5) {
    return true;
  }
  
  userData.count++;
  userData.lastRequest = now;
  return false;
}

// Fallback models that are known to work and have different rate limits
const FALLBACK_MODELS = [
  'microsoft/phi-3-medium-128k-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'google/gemma-2-2b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct:free'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, model, settings, userId } = req.body;

  // Get API key with priority: user's API key > environment variable
  let apiKey = null;
  let apiKeySource = 'none';
  
  // First try to get user's API key
  if (userId) {
    try {
      const userService = new UserService();
      const userApiKey = userService.getUserApiKey(userId);
      if (userApiKey) {
        apiKey = userApiKey;
        apiKeySource = 'user';
      }
    } catch (error) {
      console.error('Error getting user API key:', error);
    }
  }
  
  // Fallback to environment variable if no user API key
  if (!apiKey) {
    apiKey = process.env.OPENROUTER_API_KEY;
    apiKeySource = 'server';
  }
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'No OpenRouter API key available. Please add your API key in your profile settings.',
      suggestion: 'Get your API key from https://openrouter.ai/keys'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enhanced rate limiting with better user feedback
  const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(userIP as string)) {
    const userData = requestCounts.get(userIP as string);
    const timeUntilReset = userData ? Math.ceil((userData.resetTime - Date.now()) / 1000) : 60;
    
    return res.status(429).json({ 
      error: `Too many requests. Please wait ${timeUntilReset} seconds before trying again.`,
      retryAfter: timeUntilReset
    });
  }

  // Check token limits if user is authenticated
  if (userId) {
    const tokenService = new TokenService();
    const hasTokens = tokenService.hasTokensRemaining(userId);
    if (!hasTokens) {
      return res.status(403).json({ 
        error: 'Token limit exceeded. You have used all your available tokens.',
        remainingTokens: 0
      });
    }
  }

  // Try the requested model first, then fallback models
  const modelsToTry = [model, ...FALLBACK_MODELS].filter(Boolean);
  
  for (const currentModel of modelsToTry) {
    try {
      console.log(`Attempting to use model: ${currentModel}`);
      
      // Create cache key for this specific request
      const cacheKey = `${currentModel}:${prompt.substring(0, 100)}:${settings?.temperature || 0.7}:${settings?.maxTokens || 2000}`;
      const cached = modelResponseCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_DURATION) {
        console.log(`Returning cached response for model: ${currentModel}`);
        
        // Track token usage if user is authenticated
        if (userId && cached.response.usage) {
          try {
            const tokenService = new TokenService();
            tokenService.recordTokenUsage(
              userId,
              cached.response.usage.total_tokens || 0,
              currentModel,
              'homework_help'
            );
          } catch (error) {
            console.error('Failed to record token usage:', error);
          }
        }
        
        return res.status(200).json(cached.response);
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': req.headers.origin || '',
          'X-Title': 'AI Homework Tutor',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: 'system', content: settings?.context || '' },
            { role: 'user', content: prompt }
          ],
          temperature: settings?.temperature || 0.7,
          max_tokens: settings?.maxTokens || 2000,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases with better messaging
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) : 60;
          
          // If this is the last model to try, return the rate limit error
          if (currentModel === modelsToTry[modelsToTry.length - 1]) {
            return res.status(429).json({ 
              error: `OpenRouter rate limit exceeded. Please wait ${waitTime} seconds before trying again.`,
              retryAfter: waitTime,
              model: currentModel,
              details: data,
              suggestion: 'Try using a different model or wait a moment before retrying.'
            });
          }
          
          // Otherwise, try the next model
          console.warn(`Model ${currentModel} rate limited, trying next model...`);
          continue;
        }
        
        if (response.status === 401) {
          return res.status(401).json({ 
            error: 'Invalid OpenRouter API key. Please check your configuration.',
            details: data
          });
        }
        
        if (response.status === 400 && data.error?.message?.includes('not a valid model ID')) {
          console.warn(`Model ${currentModel} not available, trying next model...`);
          continue; // Try next model
        }
        
        // If it's not a model ID error and this is the last model, return the error
        if (currentModel === modelsToTry[modelsToTry.length - 1]) {
          return res.status(response.status).json({ 
            error: data.error?.message || `OpenRouter API error (${response.status})`,
            details: data,
            model: currentModel
          });
        }
        
        // For other errors, try the next model
        console.warn(`Model ${currentModel} failed with status ${response.status}, trying next model...`);
        continue;
      }

      // Success! Cache the response and track token usage if user is authenticated
      modelResponseCache.set(cacheKey, { response: data, timestamp: Date.now() });
      
      if (userId && data.usage) {
        try {
          const tokenService = new TokenService();
          tokenService.recordTokenUsage(
            userId,
            data.usage.total_tokens || 0,
            currentModel,
            'homework_help'
          );
        } catch (error) {
          console.error('Failed to record token usage:', error);
          // Don't fail the request if token tracking fails
        }
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error with model ${currentModel}:`, error);
      
      // If this is the last model to try, return the error
      if (currentModel === modelsToTry[modelsToTry.length - 1]) {
        return res.status(500).json({ 
          error: 'Failed to contact OpenRouter. Please check your internet connection and try again.', 
          details: error instanceof Error ? error.message : error 
        });
      }
      
      // Otherwise, continue to next model
      console.warn(`Model ${currentModel} failed, trying next model...`);
    }
  }
  
  // If we get here, all models failed
  return res.status(500).json({ 
    error: 'All available models are currently unavailable. Please try again in a few minutes.',
    details: 'No working models found'
  });
} 