import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Chatbot from './components/Chatbot';
import IdleTimer from './components/IdleTimer';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'HIPATIA | Ecosistema Educativo Inteligente',
    description: 'Plataforma avanzada de IA para la gestión docente y corrección de exámenes.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='es'>
            <body className={`${inter.variable} antialiased bg-white text-slate-900`}>
                <IdleTimer />
                {children}
                <Chatbot />
            </body>
        </html>
    );
}
