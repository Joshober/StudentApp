import { initializeDatabase, seedDatabase, checkDatabaseHealth } from './database';

let isInitialized = false;

export const ensureDatabaseInitialized = () => {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🔧 Initializing database...');
    
    // Initialize database with migrations
    initializeDatabase();
    
    // Check database health
    const isHealthy = checkDatabaseHealth();
    if (!isHealthy) {
      console.error('❌ Database health check failed');
      return;
    }
    
    console.log('✅ Database initialized successfully');
    
    // Seed database with initial data (only if needed)
    try {
      seedDatabase();
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.log('ℹ️ Database already seeded or seeding failed:', error);
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Auto-initialize on module load (for server-side only)
if (typeof window === 'undefined') {
  ensureDatabaseInitialized();
} 