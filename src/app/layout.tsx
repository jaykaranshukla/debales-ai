import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Debales AI — Multi-tenant AI Assistant',
  description: 'AI-powered sales and support assistant platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
