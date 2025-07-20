import { ensureDatabaseInitialized } from '@/lib/db-init';

// This component runs on the server and initializes the database
export default function DatabaseInitializer() {
  // Initialize database on server-side
  if (typeof window === 'undefined') {
    try {
      ensureDatabaseInitialized();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  // This component doesn't render anything
  return null;
} 