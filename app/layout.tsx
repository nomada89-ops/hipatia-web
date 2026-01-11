import type { Metadata } from 'next';
import { Inter, Merriweather, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/** 
 * --- TYPOGRAPHY SYSTEM ---
 * Primary: 'Inter' (Clean, modern sans-serif for UI)
 * Headings: 'Merriweather' (Classic serif for academic prestige)
 * Code: 'JetBrains Mono' (For technical data)
 */

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const merriweather = Merriweather({
  variable: '--font-serif',
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HIPATIA | Ecosistema Educativo Integral con IA',
  description: 'HIPATIA es la plataforma definitiva de IA para docentes: corrección universal de exámenes y generación de recursos especializados.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es'>
      <body
        className={\ \ \ antialiased selection:bg-emerald-100 selection:text-emerald-900 bg-stone-50 text-stone-800}
      >
        {children}
      </body>
    </html>
  );
}