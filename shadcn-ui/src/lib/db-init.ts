import { initializeDatabase, seedDatabase } from './database';
import { validateConfig } from './config';

export const initializeApp = () => {
  try {
    // Validate environment configuration
    validateConfig();
    
    // Initialize database
    initializeDatabase();
    
    // Seed database with initial data
    seedDatabase();
    
    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    throw error;
  }
};

// Export for use in middleware or API routes
export { initializeDatabase, seedDatabase };

// Don't auto-initialize during build time
// Database will be initialized when the /api/init endpoint is called 