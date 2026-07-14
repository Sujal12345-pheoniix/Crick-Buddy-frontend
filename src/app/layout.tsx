
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { KenzoLoader } from "../components/kenzo-loader";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#06080f',
};

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
        <meta name="theme-color" content="#06080f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111626',
                color: '#f1f5f9',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#111626' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#111626' } },
            }}
          />
          {children}
            <KenzoLoader />
        </AuthProvider>
      </body>
    </html>
  );
}
