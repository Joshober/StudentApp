import { TokenService as DatabaseTokenService } from './database';

export interface TokenUsage {
  total_tokens: number;
  total_requests: number;
  model: string;
  date: string;
}

export interface TokenStatus {
  hasTokens: boolean;
  remainingTokens: number;
  totalUsed: number;
  limit: number;
}

export interface RateLimitInfo {
  isRateLimited: boolean;
  timeUntilReset: number;
  requestsRemaining: number;
  maxRequests: number;
}

// In-memory rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number; lastRequest: number }>();
const tokenUsageCache = new Map<string, { data: TokenStatus; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

export class TokenManager {
  private tokenService: DatabaseTokenService;

  constructor() {
    this.tokenService = new DatabaseTokenService();
  }

  /**
   * Check if a user has tokens remaining
   */
  checkTokenStatus(userId: number, limit: number = 10000): TokenStatus {
    const cacheKey = `token_status_${userId}`;
    const cached = tokenUsageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const totalUsed = this.tokenService.getUserTotalTokenUsage(Number(userId));
    const hasTokens = totalUsed < limit;
    const remainingTokens = Math.max(0, limit - totalUsed);

    const status: TokenStatus = {
      hasTokens,
      remainingTokens,
      totalUsed,
      limit
    };

    // Cache the result
    tokenUsageCache.set(cacheKey, { data: status, timestamp: Date.now() });
    
    return status;
  }

  /**
   * Record token usage for a request
   */
  recordTokenUsage(userId: number, tokensUsed: number, model: string, requestType: string): boolean {
    const success = this.tokenService.recordTokenUsage(Number(userId), tokensUsed, model, requestType);
    
    if (success) {
      // Invalidate cache when new usage is recorded
      const cacheKey = `token_status_${userId}`;
      tokenUsageCache.delete(cacheKey);
    }
    
    return success;
  }

  /**
   * Get detailed token usage statistics
   */
  getTokenUsageStats(userId: number): TokenUsage[] {
    return this.tokenService.getUserTokenUsage(Number(userId));
  }

  /**
   * Check rate limiting for a user/IP
   */
  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): RateLimitInfo {
    const now = Date.now();
    const userData = rateLimitCache.get(identifier);
    
    if (!userData || now > userData.resetTime) {
      // Reset rate limit window
      rateLimitCache.set(identifier, { 
        count: 1, 
        resetTime: now + windowMs,
        lastRequest: now
      });
      
      return {
        isRateLimited: false,
        timeUntilReset: windowMs / 1000,
        requestsRemaining: maxRequests - 1,
        maxRequests
      };
    }
    
    const isRateLimited = userData.count >= maxRequests;
    const timeUntilReset = Math.ceil((userData.resetTime - now) / 1000);
    const requestsRemaining = Math.max(0, maxRequests - userData.count);
    
    if (!isRateLimited) {
      userData.count++;
      userData.lastRequest = now;
    }
    
    return {
      isRateLimited,
      timeUntilReset,
      requestsRemaining,
      maxRequests
    };
  }

  /**
   * Clear rate limit cache for a user/IP
   */
  clearRateLimit(identifier: string): void {
    rateLimitCache.delete(identifier);
  }

  /**
   * Clear all caches (useful for testing or debugging)
   */
  clearAllCaches(): void {
    rateLimitCache.clear();
    tokenUsageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { rateLimitEntries: number; tokenCacheEntries: number } {
    return {
      rateLimitEntries: rateLimitCache.size,
      tokenCacheEntries: tokenUsageCache.size
    };
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager(); 