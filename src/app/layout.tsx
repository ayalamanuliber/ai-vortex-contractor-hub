import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import AuthSessionProvider from '@/components/providers/SessionProvider';
import { authOptions } from '@/lib/auth-config';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Vortex - Contractor Intelligence Hub',
  description: 'Complete intelligence profiles • Campaign execution • Activity tracking',
  keywords: 'contractor intelligence, campaign management, business analytics',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthSessionProvider session={session}>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}