import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt = 'Hello, how are you?' } = req.body;
    
    // Test the OpenRouter API with fallback models
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'meta-llama/llama-3.2-3b-instruct:free', // This might be rate limited
        settings: {
          temperature: 0.7,
          maxTokens: 100
        },
        userId: 2 // Test user
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return res.status(200).json({
        message: 'Rate limit test successful',
        model: data.model || 'unknown',
        response: data.choices?.[0]?.message?.content || 'No response content',
        usage: data.usage
      });
    } else {
      return res.status(response.status).json({
        message: 'Rate limit test failed',
        error: data.error,
        retryAfter: data.retryAfter,
        model: data.model,
        suggestion: data.suggestion
      });
    }
  } catch (error) {
    console.error('Rate limit test error:', error);
    return res.status(500).json({ 
      error: 'Rate limit test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 