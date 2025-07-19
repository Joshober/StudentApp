import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './ClientProviders';
import DatabaseInitializer from '@/components/DatabaseInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tech Innovation Club - Powered by ACM',
  description: 'Join the Tech Innovation Club to explore, build, and innovate with the brightest minds on campus.',
  authors: [{ name: 'Tech Innovation Club' }],
  openGraph: {
    title: 'Tech Innovation Club',
    description: 'Join the Tech Innovation Club to explore, build, and innovate with the brightest minds on campus.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <TooltipProvider>
            <DatabaseInitializer />
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster />
          </TooltipProvider>
        </ClientProviders>
      </body>
    </html>
  );
} 