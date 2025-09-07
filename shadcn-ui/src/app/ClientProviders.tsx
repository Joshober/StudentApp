"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AISettingsProvider } from '@/context/AISettingsContext';
import { StudySessionProvider } from '@/context/StudySessionContext';
import { AuthProvider } from '@/context/AuthContext';
import { useState } from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());



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