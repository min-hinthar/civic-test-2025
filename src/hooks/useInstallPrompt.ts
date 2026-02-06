'use client';

/**
 * useInstallPrompt Hook
 *
 * Captures the browser's `beforeinstallprompt` event and provides
 * a programmatic install trigger. Handles iOS detection (which lacks
 * beforeinstallprompt) and dismiss-with-cooldown logic.
 *
 * Features:
 * - Captures deferred prompt from beforeinstallprompt event
 * - Detects standalone (already installed) mode
 * - Detects iOS for manual install instructions fallback
 * - 7-day cooldown after user dismisses prompt
 * - Tracks installation via appinstalled event
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Extended Event interface for the beforeinstallprompt browser event.
 * This event is non-standard and only available in Chromium browsers.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Return type for the useInstallPrompt hook.
 */
export interface UseInstallPromptResult {
  /** Whether the browser can show an install prompt */
  canInstall: boolean;
  /** Whether the app is already installed (standalone mode) */
  isInstalled: boolean;
  /** Whether the device is running iOS (needs manual install instructions) */
  isIOS: boolean;
  /** Trigger the native install prompt. Returns true if user accepted. */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the prompt with a 7-day cooldown */
  dismissPrompt: () => void;
  /** Whether the user previously dismissed the prompt (within cooldown) */
  wasDismissed: boolean;
}

const DISMISSED_UNTIL_KEY = 'pwa-install-dismissed-until';

/**
 * Hook to capture and trigger the PWA install prompt.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canInstall, isIOS, promptInstall, dismissPrompt } = useInstallPrompt();
 *
 *   if (!canInstall && !isIOS) return null;
 *
 *   return (
 *     <button onClick={promptInstall}>Install App</button>
 *   );
 * }
 * ```
 */
/**
 * Compute initial installed state from browser APIs.
 * Uses lazy initializer to avoid calling setState in effects.
 */
function getInitialInstalledState(): boolean {
  if (typeof window === 'undefined') return false;

  // Check standalone display mode (Chromium installed PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check iOS standalone mode
  if (
    (navigator as unknown as { standalone?: boolean }).standalone === true
  ) {
    return true;
  }

  return false;
}

/**
 * Check if the prompt was previously dismissed within the cooldown period.
 */
function getInitialDismissedState(): boolean {
  if (typeof window === 'undefined') return false;

  const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
  if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
    return true;
  }

  return false;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(getInitialInstalledState);
  const [wasDismissed, setWasDismissed] = useState(getInitialDismissedState);

  // Detect iOS (no beforeinstallprompt support)
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Listen for install-related browser events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already installed, no need for listeners
    if (isInstalled) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    return outcome === 'accepted';
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setWasDismissed(true);
    // Re-prompt after 7 days
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(dismissUntil));
  }, []);

  return {
    canInstall: !!deferredPrompt && !wasDismissed,
    isInstalled,
    isIOS,
    promptInstall,
    dismissPrompt,
    wasDismissed,
  };
}
