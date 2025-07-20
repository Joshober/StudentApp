"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AISettingsProvider } from '@/context/AISettingsContext';
import { StudySessionProvider } from '@/context/StudySessionContext';
import { AuthProvider } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { cronService } from '@/lib/cron';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Initialize cron service for periodic model sync
  useEffect(() => {
    // Start periodic sync in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Initializing periodic model sync...');
      // The cron service will auto-start in production
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AISettingsProvider>
            <StudySessionProvider>
              {children}
            </StudySessionProvider>
          </AISettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
} 