import { ModelSyncService } from './database';

class CronService {
  private syncService: ModelSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.syncService = new ModelSyncService();
  }

  // Start the periodic sync (every 6 hours by default)
  startPeriodicSync(intervalHours: number = 6): void {
    if (this.syncInterval) {
      console.log('Periodic sync is already running');
      return;
    }

    console.log(`Starting periodic model sync every ${intervalHours} hours`);
    
    // Run initial sync
    this.performSync();
    
    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  // Stop the periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Periodic model sync stopped');
    }
  }

  // Perform a single sync operation
  private async performSync(): Promise<void> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting model sync from OpenRouter...');

    try {
      const success = await this.syncService.syncModelsFromOpenRouter();
      
      if (success) {
        console.log('Model sync completed successfully');
      } else {
        console.error('Model sync failed');
      }
    } catch (error) {
      console.error('Error during model sync:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Manual sync trigger
  async triggerSync(): Promise<boolean> {
    if (this.isRunning) {
      console.log('Sync already in progress');
      return false;
    }

    console.log('Manual sync triggered');
    return await this.syncService.syncModelsFromOpenRouter();
  }

  // Get sync status
  getSyncStatus(): { isRunning: boolean; hasInterval: boolean } {
    return {
      isRunning: this.isRunning,
      hasInterval: this.syncInterval !== null
    };
  }
}

// Create singleton instance
const cronService = new CronService();

export { cronService };

// Auto-start periodic sync when this module is imported (in production)
if (process.env.NODE_ENV === 'production') {
  // Start sync after a 30-second delay to allow server to fully start
  setTimeout(() => {
    cronService.startPeriodicSync(6); // Sync every 6 hours
  }, 30000);
} 