'use client';

import { useState } from 'react';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { WelcomeModal } from '@/components/pwa/WelcomeModal';
import { IOSTip, shouldShowIOSTip } from '@/components/pwa/IOSTip';

/**
 * PWA Onboarding Flow
 *
 * Manages install prompt, welcome modal, and iOS tip lifecycle:
 * 1. First visit: InstallPrompt appears immediately
 * 2. User installs: InstallPrompt closes, WelcomeModal appears
 * 3. User dismisses install: prompt hidden for 7 days
 * 4. Returning installed user (never seen welcome): WelcomeModal appears once
 * 5. iOS Safari users: one-time friendly tip about weekly visits (after onboarding)
 */
export function PWAOnboardingFlow() {
  // Determine initial welcome state: show if installed but never shown welcome
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('pwa-installed') === 'true';
    const welcomeShown = localStorage.getItem('welcome-shown') === 'true';
    return isInstalled && !welcomeShown;
  });

  const [hideInstallPrompt, setHideInstallPrompt] = useState(false);

  // Lazy initializer: returning iOS user with no onboarding needed sees tip immediately
  const [showIOSTip, setShowIOSTip] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Show immediately only if no welcome flow is pending
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('pwa-installed') === 'true';
    const welcomeShown = localStorage.getItem('welcome-shown') === 'true';
    const welcomeNeeded = isInstalled && !welcomeShown;
    // If no welcome is needed and iOS tip is eligible, show right away
    return !welcomeNeeded && shouldShowIOSTip();
  });

  const handleInstalled = () => {
    // User just installed - hide install prompt, show welcome
    setHideInstallPrompt(true);
    setShowWelcome(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // After welcome closes, check if we should show iOS tip (with delay)
    if (shouldShowIOSTip()) {
      setTimeout(() => setShowIOSTip(true), 2000);
    }
  };

  return (
    <>
      {!hideInstallPrompt && !showWelcome && <InstallPrompt onInstalled={handleInstalled} />}
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      {/* iOS tip - shows after onboarding flow, as a non-blocking bottom banner */}
      {showIOSTip && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
          <IOSTip onDismiss={() => setShowIOSTip(false)} />
        </div>
      )}
    </>
  );
}
