import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, seedDatabase } from '@/lib/db-init';

export async function GET(request: NextRequest) {
  try {
    // Initialize database
    initializeDatabase();
    
    // Seed database with initial data
    seedDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application initialized successfully' 
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please check your environment variables and try again.'
      },
      { status: 500 }
    );
  }
} 