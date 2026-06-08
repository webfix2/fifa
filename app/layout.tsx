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

export const metadata = {
  title: 'Tickets - Buy and Sell Concert, Sports & Theatre Tickets | Ticketmaster',
  description: 'Search and buy tickets for your favorite artists, teams, and shows at Ticketmaster.',
  keywords: 'ticketmaster, buy tickets, sell tickets, concert, sport, theater',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
  icons: {
    icon: [
      { url: 'https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no' },
    ],
    shortcut: 'https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no',
    apple: 'https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no',
  },
  openGraph: {
    url: 'https://www.ticketmaster.com/',
    title: 'Tickets - Buy and Sell Concert, Sports & Theatre Tickets | Ticketmaster',
    description: 'Search and buy tickets for your favorite artists, teams, and shows at Ticketmaster.',
    siteName: 'ticketmaster.com',
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
        <meta name="theme-color" content="#026CDF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ticketmaster" />
        <link rel="apple-touch-startup-image" href="/splash-1024x1024.png" />
        <link rel="icon" href="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no" />
        <link rel="shortcut icon" href="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no" />
        <link rel="apple-touch-icon" href="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no" />
        <style>{`
          html { background: #1F1F1F; }
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
            background: #026CDF;
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
          <img src="https://lh3.googleusercontent.com/a-/ALV-UjXmI_R6mr2s1KnPXx7t5KhgAe9drmgY8So16bDQ9clqysQp-jQ=s300-p-k-rw-no" alt="" />
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