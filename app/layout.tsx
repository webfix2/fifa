import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import RootLayoutWrapper from './RootLayout';
import { Inter } from 'next/font/google';

import { UserProvider } from './UserContext';
import ManifestLoader from './ManifestLoader';
import RegisterSW from './RegisterSW';
import PwaInstallPrompt from './PwaInstallPrompt';
import HideSplash from './HideSplash';

config.autoAddCss = false;
const inter = Inter({ subsets: ['latin'] });

const FAVICON = 'https://play-lh.googleusercontent.com/nQLbIovsHYyx1EhAHYc2gdNO9MIIdDLkWWXHuKnLoSVcaOCRtsHPdiYcVQ3tieTe8F3EkKGZVHdcQRO3rU48=w240-h480-rw';

export const metadata = {
  title: 'FIFA World Cup 2026™ - Official Mobile Tickets',
  description: 'Send, receive, and manage your FIFA World Cup 2026™ match tickets with the official FIFA Mobile Tickets application.',
  keywords: 'fifa, world cup, 2026, tickets, football, soccer, mobile tickets, fwc2026',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
  icons: {
    icon: [
      { url: FAVICON },
    ],
    shortcut: FAVICON,
    apple: FAVICON,
  },
  openGraph: {
    url: 'https://intl-fifa.com/',
    title: 'FIFA World Cup 2026™ - Official Mobile Tickets',
    description: 'Send, receive, and manage your FIFA World Cup 2026™ match tickets with the official FIFA Mobile Tickets application.',
    siteName: 'fifa.com',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FIFA Tickets" />
        <link rel="apple-touch-startup-image" href="/splash-1024x1024.png" />
        <link rel="icon" href={FAVICON} />
        <link rel="shortcut icon" href={FAVICON} />
        <link rel="apple-touch-icon" href={FAVICON} />
        <style>{`
          html { background: #F5F5F5; }
          body {
            padding-bottom: env(safe-area-inset-bottom);
            overscroll-behavior: none;
          }
          header.fixed {
            padding-top: env(safe-area-inset-top);
          }
          nav.fixed {
            padding-bottom: env(safe-area-inset-bottom);
          }
          #splash-screen {
            position: fixed; inset: 0; z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            background: #002B7F;
            opacity: 1; transition: opacity 0.4s ease;
            pointer-events: none;
          }
          #splash-screen.hidden { opacity: 0; }
          #splash-screen img {
            width: 80px; height: 80px; border-radius: 50%;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <div id="splash-screen" suppressHydrationWarning>
          <img src={FAVICON} alt="FIFA" />
        </div>
        <HideSplash />
        <UserProvider>
          <PwaInstallPrompt />
          <RootLayoutWrapper inter={inter}>
            {children}
          </RootLayoutWrapper>
        </UserProvider>
        <ManifestLoader />
        <RegisterSW />
      </body>
    </html>
  );
}