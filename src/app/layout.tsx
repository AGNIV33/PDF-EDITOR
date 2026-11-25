import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter has an open licence. next/font downloads it at build time and serves it from our own site.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'PDF Tools',
  description: 'Free PDF tools. Your file never leaves your device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
