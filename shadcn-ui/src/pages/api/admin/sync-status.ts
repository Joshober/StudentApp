import type { NextApiRequest, NextApiResponse } from 'next';
import { cronService } from '@/lib/cron';
import { ModelSyncService, ModelService } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const syncService = new ModelSyncService();
    const modelService = new ModelService();

    if (req.method === 'GET') {
      // Get sync status and statistics
      const syncStatus = cronService.getSyncStatus();
      const syncHealth = syncService.getSyncHealth();
      const syncStats = modelService.getSyncStats();
      const recentLogs = syncService.getRecentSyncLogs(5);

      res.status(200).json({
        syncStatus,
        syncHealth,
        syncStats,
        recentLogs
      });
    } else if (req.method === 'POST') {
      // Manually trigger sync
      const success = await cronService.triggerSync();
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Manual sync triggered successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Manual sync failed or already in progress'
        });
      }
    }
  } catch (error) {
    console.error('Sync status API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 