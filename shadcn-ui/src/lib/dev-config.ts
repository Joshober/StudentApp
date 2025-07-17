// Development configuration defaults
// This file provides default values for development environment
// In production, these should be set via environment variables

export const devConfig = {
  // Database
  database: {
    path: process.env.DATABASE_PATH || 'edulearn.db',
  },
  
  // AI Provider API Keys (optional - users can set these in the app)
  ai: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || '',
  },
  
  // JWT Configuration - Use a default for development
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

// Override the config import to use development defaults
export const config = devConfig; 