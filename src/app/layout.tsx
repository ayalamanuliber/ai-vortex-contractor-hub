import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Vortex - Contractor Intelligence Hub',
  description: 'Complete intelligence profiles • Campaign execution • Activity tracking',
  keywords: 'contractor intelligence, campaign management, business analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}