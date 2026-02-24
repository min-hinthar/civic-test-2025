'use client';

import dynamic from 'next/dynamic';

// Dynamic imports with ssr: false — these components use browser-only APIs
// (canvas-confetti path shapes, localStorage, matchMedia, etc.)
const CelebrationOverlay = dynamic(
  () => import('@/components/celebrations').then(m => m.CelebrationOverlay),
  { ssr: false }
);
const PWAOnboardingFlow = dynamic(
  () => import('@/components/pwa/PWAOnboardingFlow').then(m => m.PWAOnboardingFlow),
  { ssr: false }
);
const OnboardingTour = dynamic(
  () => import('@/components/onboarding/OnboardingTour').then(m => m.OnboardingTour),
  { ssr: false }
);
const GreetingFlow = dynamic(
  () => import('@/components/onboarding/GreetingFlow').then(m => m.GreetingFlow),
  { ssr: false }
);
const SyncStatusIndicator = dynamic(
  () => import('@/components/pwa/SyncStatusIndicator').then(m => m.SyncStatusIndicator),
  { ssr: false }
);

/**
 * Global overlay components rendered in the root layout.
 * All use dynamic import with ssr: false because they depend on browser APIs
 * (canvas-confetti, localStorage, matchMedia, etc.) that are unavailable
 * during Next.js static page generation.
 */
export function GlobalOverlays() {
  return (
    <>
      <CelebrationOverlay />
      <PWAOnboardingFlow />
      <OnboardingTour />
      <GreetingFlow />
      <SyncStatusIndicator />
    </>
  );
}
