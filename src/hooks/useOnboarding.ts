'use client';

import { useState, useCallback, useEffect } from 'react';

const ONBOARDING_KEY = 'civic-test-onboarding-complete';

export interface OnboardingState {
  hasCompleted: boolean;
  shouldShow: boolean;
  complete: () => void;
  skip: () => void;
  reset: () => void;
}

/**
 * Hook to manage onboarding tour state.
 *
 * Features:
 * - Persists completion to localStorage
 * - Can be reset for testing
 * - Hydration-safe: initializes to `true` (matching SSR),
 *   then syncs from localStorage after mount (like ThemeContext).
 *
 * Usage:
 * ```tsx
 * const { shouldShow, complete, skip, reset } = useOnboarding();
 * ```
 */
export function useOnboarding(): OnboardingState {
  // Initialize to true (complete) to match SSR output — prevents hydration mismatch
  const [hasCompleted, setHasCompleted] = useState(true);

  // Sync from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY) === 'true';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate from localStorage on mount
    setHasCompleted(stored);
  }, []);

  const complete = useCallback(() => {
    setHasCompleted(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const skip = useCallback(() => {
    setHasCompleted(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const reset = useCallback(() => {
    setHasCompleted(false);
    localStorage.removeItem(ONBOARDING_KEY);
  }, []);

  return {
    hasCompleted,
    shouldShow: !hasCompleted,
    complete,
    skip,
    reset,
  };
}
