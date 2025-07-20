import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenManager } from '@/lib/token-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId = 2, tokensUsed = 100, model = 'test-model' } = req.body;
    
    console.log('Testing consolidated token system...');
    
    // Test 1: Check initial token status
    const initialStatus = tokenManager.checkTokenStatus(Number(userId));
    console.log('Initial token status:', initialStatus);
    
    // Test 2: Record some token usage
    const recordSuccess = tokenManager.recordTokenUsage(Number(userId), tokensUsed, model, 'test');
    console.log('Token usage recorded:', recordSuccess);
    
    // Test 3: Check token status after usage (should be cached)
    const updatedStatus = tokenManager.checkTokenStatus(Number(userId));
    console.log('Updated token status:', updatedStatus);
    
    // Test 4: Get detailed usage stats
    const usageStats = tokenManager.getTokenUsageStats(Number(userId));
    console.log('Usage stats:', usageStats);
    
    // Test 5: Test rate limiting
    const testIP = '192.168.1.1';
    const rateLimit1 = tokenManager.checkRateLimit(testIP, 5, 60000);
    console.log('Rate limit check 1:', rateLimit1);
    
    const rateLimit2 = tokenManager.checkRateLimit(testIP, 5, 60000);
    console.log('Rate limit check 2:', rateLimit2);
    
    // Test 6: Get cache statistics
    const cacheStats = tokenManager.getCacheStats();
    console.log('Cache stats:', cacheStats);
    
    return res.status(200).json({
      message: 'Consolidated token system test completed',
      results: {
        initialStatus,
        recordSuccess,
        updatedStatus,
        usageStats: usageStats.slice(0, 3), // Show first 3 entries
        rateLimitTests: {
          first: rateLimit1,
          second: rateLimit2
        },
        cacheStats
      },
      improvements: {
        reducedAPICalls: 'Token status is now cached for 30 seconds',
        consolidatedEndpoints: 'All token operations use the same service',
        betterRateLimiting: 'Rate limits are now more accurate and cached'
      }
    });
  } catch (error) {
    console.error('Consolidated token test error:', error);
    return res.status(500).json({ 
      error: 'Consolidated token test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 