import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load Inter variable font with latin subset
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArenaMind — Operational Decision Intelligence Platform',
  description:
    'AI-powered operational decision intelligence platform designed to enhance sporting venue and stadium operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary transition-colors duration-fast">
        {children}
      </body>
    </html>
  );
}
