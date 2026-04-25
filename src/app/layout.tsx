import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crick-Buddy | AI Cricket Analytics Platform',
  description: 'Professional AI-powered cricket performance analysis. Analyze your batting, bowling and posture with MediaPipe & OpenCV AI technology.',
  keywords: 'cricket analysis, AI cricket coach, batting analysis, bowling analysis, cricket training',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: ['/icon.png'],
    apple: [{ url: '/icon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1f35', color: '#fff', border: '1px solid rgba(0,255,136,0.2)' },
              success: { iconTheme: { primary: '#00ff88', secondary: '#0a0e1a' } },
              error: { iconTheme: { primary: '#ff4757', secondary: '#0a0e1a' } },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
