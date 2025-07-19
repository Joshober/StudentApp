import type { NextApiRequest, NextApiResponse } from 'next';
import { checkDatabaseHealth, getDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database health
    const dbHealthy = checkDatabaseHealth();
    
    // Get database info
    let dbInfo = null;
    if (dbHealthy) {
      try {
        const database = getDatabase();
        const result = database.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM users) as user_count,
            (SELECT COUNT(*) FROM resources) as resource_count,
            (SELECT COUNT(*) FROM events) as event_count,
            (SELECT COUNT(*) FROM token_usage) as token_usage_count
        `).get() as any;
        dbInfo = result;
      } catch (error) {
        console.error('Error getting database info:', error);
      }
    }

    // Check environment
    const env = {
      nodeEnv: process.env.NODE_ENV,
      databasePath: process.env.DATABASE_PATH || 'edulearn.db',
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'dev-jwt-secret-key-change-in-production'
    };

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        healthy: dbHealthy,
        info: dbInfo
      },
      environment: env,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    const statusCode = dbHealthy ? 200 : 503;
    
    return res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
} 