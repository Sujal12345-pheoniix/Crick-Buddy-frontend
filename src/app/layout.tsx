import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Display face: condensed, scoreboard-like. Body face: neutral and legible.
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#03060E',
};

export const metadata: Metadata = {
  title: 'CrickBuddy — Cricket technique analysis',
  description: 'Upload a batting or bowling clip and get a measured breakdown of your technique: timing, balance, release, follow-through and the drills to fix what holds you back.',
  keywords: 'cricket analysis, batting technique, bowling action, cricket coaching, cricket training',
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
    <html lang="en" data-scroll-behavior="smooth" className={`${barlow.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'toast-cb',
              style: {
                background: '#0E1A33',
                color: '#F5F7FB',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 24px 64px -24px rgba(0,0,0,0.85)',
              },
              success: { iconTheme: { primary: '#4CC38A', secondary: '#0E1A33' } },
              error: { iconTheme: { primary: '#E5636B', secondary: '#0E1A33' } },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
