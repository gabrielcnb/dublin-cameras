import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dublin Traffic Cameras - Interactive Map',
  description:
    'Watch public traffic cameras across Dublin live on an interactive map.',
  keywords: ['Dublin', 'traffic', 'cameras', 'Ireland', 'TII', 'map'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#888' }}>
          This site collects no personal data. Preferences are stored locally in your browser.
        </footer>
      </body>
    </html>
  );
}
