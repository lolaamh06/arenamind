import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/*
 * Typography System — Phase 5A
 *
 * Inter (body): battle-tested for dense data UIs, full variable-weight support,
 *   excellent rendering at small sizes (11–14px range common in dashboards).
 *
 * Space Grotesk (display): geometric sans with subtle character — reads as
 *   "technical precision" without the sterility of a pure geometric (like Futura).
 *   Used for headings, hero stats, scoreboards, page titles.
 *
 * JetBrains Mono (data): purpose-built for data display — consistent character width,
 *   excellent numeral legibility, supports OpenType discretionary ligatures.
 *   Used for: confidence %, gate codes, decision IDs, JSON/prompts in Judge Portal.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ArenaMind — Operational Decision Intelligence Platform',
  description:
    'AI-powered operational decision intelligence platform designed to enhance sporting venue and stadium operations.',
  keywords: ['stadium management', 'AI operations', 'crowd analytics', 'decision intelligence'],
};

import { StadiumStateProvider } from '../context/StadiumStateContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary transition-colors duration-fast font-sans">
        <StadiumStateProvider>
          {children}
        </StadiumStateProvider>
      </body>
    </html>
  );
}
