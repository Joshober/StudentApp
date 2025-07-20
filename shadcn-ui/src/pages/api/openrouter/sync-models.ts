import type { NextApiRequest, NextApiResponse } from 'next';
import { ModelSyncService, ModelService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const syncService = new ModelSyncService();
    const modelService = new ModelService();

    // Check if sync is already in progress (optional)
    const recentLogs = syncService.getRecentSyncLogs(1);
    const lastSync = recentLogs[0];
    
    if (lastSync && lastSync.success && 
        Date.now() - new Date(lastSync.created_at).getTime() < 5 * 60 * 1000) { // 5 minutes
      return res.status(429).json({ 
        error: 'Sync already completed recently',
        message: 'Please wait at least 5 minutes between syncs'
      });
    }

    // Perform the sync
    const success = await syncService.syncModelsFromOpenRouter();
    
    if (success) {
      // Get updated statistics
      const stats = modelService.getSyncStats();
      const health = syncService.getSyncHealth();
      
      res.status(200).json({
        success: true,
        message: 'Model sync completed successfully',
        stats,
        health
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Model sync failed'
      });
    }
  } catch (error) {
    console.error('Model sync API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 