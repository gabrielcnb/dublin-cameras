import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dublin Traffic Cameras - Mapa Interativo',
  description:
    'Visualize cameras de trafego publicas de Dublin em tempo real em um mapa interativo.',
  keywords: ['Dublin', 'traffic', 'cameras', 'Ireland', 'TII', 'map'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#888' }}>
          Este site não coleta dados pessoais. Preferências são salvas localmente no seu navegador.
        </footer>
      </body>
    </html>
  );
}
