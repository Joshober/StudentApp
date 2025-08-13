// Configuration utility for environment variables
export const config = {
  // Database
  database: {
    path: process.env.DATABASE_PATH || 'edulearn.db',
    url: process.env.DATABASE_URL || 'postgresql://edulearn_user:edulearn_password@localhost:5432/edulearn',
    ssl: process.env.NODE_ENV === 'production',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // AI Provider API Keys (OpenRouter only)
  ai: {
    openrouter: process.env.OPENROUTER_API_KEY || '',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production',
  },
  
  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  
  // Analytics (optional)
  analytics: {
    id: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  },
} as const;

// Helper function to validate required environment variables
export const validateConfig = () => {
  // Skip validation during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return true;
  }
  
  const errors: string[] = [];
  
  // Check for required environment variables
  if (!config.jwt.secret || config.jwt.secret === 'dev-jwt-secret-key-change-in-production') {
    if (config.app.env === 'production') {
      errors.push('JWT_SECRET is not set. Please set a secure JWT secret in your .env file.');
    } else {
      console.warn('⚠️ Using development JWT secret. Set JWT_SECRET in .env for production.');
    }
  }
  
  if (config.app.env === 'production' && !config.app.url.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_APP_URL should use HTTPS in production.');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors found:');
    errors.forEach(error => console.error(`- ${error}`));
    throw new Error('Invalid configuration. Please check your environment variables.');
  }
  
  return true;
};

// Helper function to get AI provider API key
export const getAIProviderKey = (provider: 'openrouter'): string => {
  return config.ai.openrouter;
}; 