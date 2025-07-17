// Environment variable checking utilities
export const checkEnvironmentVariables = () => {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check for OpenRouter API key
  if (!process.env.OPENROUTER_API_KEY) {
    missingVars.push('OPENROUTER_API_KEY');
  }

  // Check for JWT secret
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-jwt-secret-key-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      missingVars.push('JWT_SECRET');
    } else {
      warnings.push('Using development JWT secret. Set JWT_SECRET for production.');
    }
  }

  return {
    missing: missingVars,
    warnings,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'dev-jwt-secret-key-change-in-production'
  };
};

export const getEnvironmentStatus = () => {
  const status = checkEnvironmentVariables();
  
  if (status.missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', status.missing.join(', '));
    console.warn('💡 Create a .env.local file with the required variables.');
  }
  
  if (status.warnings.length > 0) {
    status.warnings.forEach(warning => console.warn('⚠️', warning));
  }
  
  return status;
}; 