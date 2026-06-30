'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
  // E2E escape hatch: first-run overlays (PWA prompt, onboarding tour, and the
  // sign-in Welcome modal) render full-screen and intercept pointer events,
  // which makes the authenticated e2e flows untestable. When the test flag is
  // present, skip them. Real users never set this flag; it is read from
  // localStorage after mount to stay hydration-safe (matches SSR on first render).
  const [suppressOnboarding, setSuppressOnboarding] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate flag from localStorage on mount (matches useOnboarding)
      setSuppressOnboarding(localStorage.getItem('civic-test-e2e') === '1');
    } catch {
      // localStorage unavailable — keep overlays enabled
    }
  }, []);

  return (
    <>
      <ErrorBoundary fallback={null}>
        <CelebrationOverlay />
      </ErrorBoundary>
      {!suppressOnboarding && (
        <>
          <PWAOnboardingFlow />
          <OnboardingTour />
          <GreetingFlow />
        </>
      )}
      <SyncStatusIndicator />
    </>
  );
}
