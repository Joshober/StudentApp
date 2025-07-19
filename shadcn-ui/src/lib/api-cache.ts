// API Cache utility to reduce OpenRouter API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ModelsCache {
  models: any[];
  credits: any;
  lastUpdated: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  // Cache duration in milliseconds
  static CACHE_DURATIONS = {
    MODELS: 30 * 60 * 1000, // 30 minutes
    CREDITS: 5 * 60 * 1000, // 5 minutes
    TOKEN_STATUS: 2 * 60 * 1000, // 2 minutes
  };

  // Get cached data if valid
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cache entry
  set<T>(key: string, data: T, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    });
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get or create pending request
  getOrCreateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if we have a valid cached result
    const cached = this.get<T>(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    // Check if there's already a pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Create new request
    const request = requestFn().then(result => {
      this.pendingRequests.delete(key);
      return result;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Batch multiple API calls
  async batchRequests<T>(requests: Array<{ key: string; request: () => Promise<T>; duration: number }>): Promise<T[]> {
    const results = await Promise.allSettled(
      requests.map(({ key, request, duration }) =>
        this.getOrCreateRequest(key, request).then(result => {
          this.set(key, result, duration);
          return result;
        })
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Request ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  }

  // Clear specific cache entries
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  // Get cache statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Cache keys
export const CACHE_KEYS = {
  MODELS: 'openrouter_models',
  CREDITS: 'openrouter_credits',
  TOKEN_STATUS: (userId: number) => `token_status_${userId}`,
  COMBINED_DATA: (userId: number) => `combined_data_${userId}`,
};

// Optimized API functions
export const getCachedModels = async (userId?: number): Promise<{ models: any[]; credits: any }> => {
  const key = CACHE_KEYS.COMBINED_DATA(userId || 0);
  
  return apiCache.getOrCreateRequest(key, async () => {
    const response = await fetch(`/api/openrouter/models?userId=${userId || ''}`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    const data = await response.json();
    return {
      models: data.models || [],
      credits: data.userCredits || null,
    };
  });
};

export const getCachedTokenStatus = async (userId: number): Promise<any> => {
  const key = CACHE_KEYS.TOKEN_STATUS(userId);
  
  return apiCache.getOrCreateRequest(key, async () => {
    const response = await fetch(`/api/user/token-status?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token status');
    }
    return response.json();
  });
};

// Batch API calls for initial page load
export const getInitialData = async (userId: number) => {
  const [modelsData, tokenStatus] = await apiCache.batchRequests([
    {
      key: CACHE_KEYS.COMBINED_DATA(userId),
      request: () => getCachedModels(userId),
      duration: APICache.CACHE_DURATIONS.MODELS,
    },
    {
      key: CACHE_KEYS.TOKEN_STATUS(userId),
      request: () => getCachedTokenStatus(userId),
      duration: APICache.CACHE_DURATIONS.TOKEN_STATUS,
    },
  ]);

  return {
    models: modelsData.models,
    credits: modelsData.credits,
    tokenStatus,
  };
};

// Force refresh specific data
export const refreshModels = async (userId?: number) => {
  const key = CACHE_KEYS.COMBINED_DATA(userId || 0);
  apiCache.clear(key);
  return getCachedModels(userId);
};

export const refreshTokenStatus = async (userId: number) => {
  const key = CACHE_KEYS.TOKEN_STATUS(userId);
  apiCache.clear(key);
  return getCachedTokenStatus(userId);
};

// Clear all cache entries
export const clearAllCache = () => {
  apiCache.clear();
};

// Get cache statistics for debugging
export const getCacheStats = () => {
  return apiCache.getStats();
};

// Cleanup expired cache entries periodically
setInterval(() => {
  apiCache.cleanup();
}, 60000); // Clean up every minute 