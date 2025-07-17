import type { NextApiRequest, NextApiResponse } from 'next';
import { recordTokenUsage, hasTokensRemaining, getRemainingTokens, getUserApiKey } from '@/lib/database';

// Simple in-memory rate limiting (for development)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const userData = requestCounts.get(identifier);
  
  if (!userData || now > userData.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return false;
  }
  
  if (userData.count >= 10) { // Max 10 requests per minute
    return true;
  }
  
  userData.count++;
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, model, settings, userId } = req.body;

  // Get API key with priority: environment variable > user's API key
  let apiKey = process.env.OPENROUTER_API_KEY;
  
  // Only use user's API key if environment variable is not set
  if (!apiKey && userId) {
    try {
      const userApiKey = getUserApiKey(userId);
      if (userApiKey) {
        apiKey = userApiKey;
      }
    } catch (error) {
      console.error('Error getting user API key:', error);
      // Continue with environment variable or fail gracefully
    }
  }
  
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not set on server.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple rate limiting
  const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(userIP as string)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }

  // Check token limits if user is authenticated
  if (userId) {
    const hasTokens = hasTokensRemaining(userId);
    if (!hasTokens) {
      return res.status(403).json({ 
        error: 'Token limit exceeded. You have used all your available tokens.',
        remainingTokens: 0
      });
    }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || '',
        'X-Title': 'AI Homework Tutor',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3.2-3b-instruct:free',
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
      // Handle specific error cases
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          details: data
        });
      }
      
      if (response.status === 400 && data.error?.message?.includes('not a valid model ID')) {
        return res.status(400).json({ 
          error: `Invalid model ID: ${model}. Please select a different model from the settings.`,
          details: data,
          suggestion: 'Try using meta-llama/llama-3.2-3b-instruct:free or another available model.'
        });
      }
      
      return res.status(response.status).json({ 
        error: data.error?.message || 'OpenRouter API error',
        details: data
      });
    }

    // Track token usage if user is authenticated
    if (userId && data.usage) {
      try {
        recordTokenUsage(
          userId,
          data.usage.total_tokens || 0,
          model || 'meta-llama/llama-3.2-3b-instruct:free',
          'homework_help'
        );
      } catch (error) {
        console.error('Failed to record token usage:', error);
        // Don't fail the request if token tracking fails
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('OpenRouter API error:', error);
    res.status(500).json({ 
      error: 'Failed to contact OpenRouter', 
      details: error instanceof Error ? error.message : error 
    });
  }
} 