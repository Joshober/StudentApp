import { initializeDatabase, getDatabase, seedDatabase } from './database';
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
    
    // Seed the database with sample data
    console.log('🌱 Seeding database with sample data...');
    seedDatabase();
    
    console.log('✅ Database reinitialized and seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to reinitialize database:', error);
    return false;
  }
};

export const initializeDatabaseWithSeed = () => {
  try {
    console.log('🔄 Initializing database...');
    initializeDatabase();
    
    console.log('🌱 Seeding database...');
    seedDatabase();
    
    console.log('✅ Database initialized and seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
};

export const ensureDatabaseInitialized = () => {
  try {
    initializeDatabase();
    return true;
  } catch (error) {
    console.error('❌ Failed to ensure database initialization:', error);
    return false;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--force')) {
    forceReinitializeDatabase();
  } else {
    initializeDatabaseWithSeed();
  }
} 