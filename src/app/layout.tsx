
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';


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
  // Rendered by Next.js as the standard `mobile-web-app-capable` tag plus the
  // Apple status-bar style (the old apple-mobile-web-app-capable tag is deprecated).
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // globals.css sets `scroll-behavior: smooth`; this tells Next.js to switch it off
    // during route changes so new pages open at the top instantly.
    <html lang="en" data-scroll-behavior="smooth">
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
        </AuthProvider>
      </body>
    </html>
  );
}
