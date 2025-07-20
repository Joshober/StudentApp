import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Fixing models table...');
    const db = getDatabase();
    
    // Check if models table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='models'
    `).get();
    
    if (!tableExists) {
      console.log('📋 Creating models table...');
      
      // Create models table
      db.exec(`
        CREATE TABLE IF NOT EXISTS models (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          context_length INTEGER DEFAULT 0,
          pricing_prompt TEXT DEFAULT '0',
          pricing_completion TEXT DEFAULT '0',
          architecture_modality TEXT DEFAULT 'text',
          architecture_tokenizer TEXT DEFAULT 'unknown',
          top_provider_is_moderated BOOLEAN DEFAULT 0,
          tags TEXT,
          status TEXT DEFAULT 'active',
          deprecated BOOLEAN DEFAULT 0,
          is_free BOOLEAN DEFAULT 1,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_models_is_free ON models(is_free);
        CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
        CREATE INDEX IF NOT EXISTS idx_models_last_updated ON models(last_updated);
      `);
      
      console.log('✅ Models table created successfully');
    } else {
      console.log('✅ Models table already exists');
    }
    
    // Check if model_sync_log table exists
    const syncTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='model_sync_log'
    `).get();
    
    if (!syncTableExists) {
      console.log('📋 Creating model_sync_log table...');
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS model_sync_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sync_type TEXT NOT NULL CHECK(sync_type IN ('full', 'incremental')),
          models_fetched INTEGER DEFAULT 0,
          models_updated INTEGER DEFAULT 0,
          models_added INTEGER DEFAULT 0,
          models_removed INTEGER DEFAULT 0,
          sync_duration_ms INTEGER DEFAULT 0,
          success BOOLEAN DEFAULT 1,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_model_sync_log_created_at ON model_sync_log(created_at);
        CREATE INDEX IF NOT EXISTS idx_model_sync_log_success ON model_sync_log(success);
      `);
      
      console.log('✅ Model sync log table created successfully');
    } else {
      console.log('✅ Model sync log table already exists');
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Models tables fixed successfully',
      modelsTableExists: !!tableExists,
      syncTableExists: !!syncTableExists
    });
  } catch (error) {
    console.error('❌ Failed to fix models table:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fix models table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 