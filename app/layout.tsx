import type { Metadata, Viewport } from 'next';
import { ClientProviders } from '@/components/ClientProviders';
import { THEME_SCRIPT, HASH_REDIRECT_SCRIPT } from '@/lib/themeScript';
import { CelebrationOverlay } from '@/components/celebrations';
import { PWAOnboardingFlow } from '@/components/pwa/PWAOnboardingFlow';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { GreetingFlow } from '@/components/onboarding/GreetingFlow';
import { SyncStatusIndicator } from '@/components/pwa/SyncStatusIndicator';

// Self-hosted Myanmar font (PWA offline support) — match _app.tsx import order
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';

import '../src/styles/globals.css';

export const metadata: Metadata = {
  title: 'Civic Test Prep - Master Your U.S. Citizenship Test',
  description:
    'Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'US Civics',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#002868' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1f36' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: HASH_REDIRECT_SCRIPT }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ClientProviders>
          {children}
          <CelebrationOverlay />
          <PWAOnboardingFlow />
          <OnboardingTour />
          <GreetingFlow />
          <SyncStatusIndicator />
        </ClientProviders>
      </body>
    </html>
  );
}
