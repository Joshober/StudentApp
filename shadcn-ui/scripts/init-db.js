#!/usr/bin/env node

// Simple database initialization script
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing EduLearn Database...\n');

// Check if database file exists
const dbPath = path.join(__dirname, '..', 'edulearn.db');
const dbExists = fs.existsSync(dbPath);

if (dbExists) {
  console.log('🗑️ Removing existing database...');
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ Existing database removed');
  } catch (error) {
    console.error('❌ Failed to remove existing database:', error.message);
  }
}

console.log('🔄 Creating new database...');

// Make a request to the init-database API endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/init-database',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Database initialized successfully!');
        console.log('📚 Sample resources have been added to the database.');
        console.log('🌐 You can now start the development server with: npm run dev');
      } else {
        console.log('❌ Database initialization failed:', response.error);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Failed to initialize database:', error.message);
  console.log('💡 Make sure the development server is running: npm run dev');
  process.exit(1);
});

req.end(); 