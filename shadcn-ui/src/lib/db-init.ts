import { initializeDatabase, getDatabase } from './database';
import fs from 'fs';
import path from 'path';
import { config } from './config';

export const forceReinitializeDatabase = () => {
  try {
    console.log('🔄 Force reinitializing database...');
    
    // Delete existing database file
    const dbPath = config.database.path;
    if (fs.existsSync(dbPath)) {
      console.log(`🗑️ Deleting existing database: ${dbPath}`);
      try {
        fs.unlinkSync(dbPath);
        console.log('✅ Database file deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete database file:', error);
        // Continue anyway, the database might be recreated
      }
    }
    
    // Reinitialize database with all migrations
    console.log('🏗️ Creating new database with all migrations...');
    initializeDatabase();
    
    console.log('✅ Database reinitialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to reinitialize database:', error);
    return false;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  forceReinitializeDatabase();
} 