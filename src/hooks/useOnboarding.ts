'use client';

import { useState, useCallback } from 'react';

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
 * - SSR-safe lazy initialization
 *
 * Usage:
 * ```tsx
 * const { shouldShow, complete, skip, reset } = useOnboarding();
 * ```
 */
export function useOnboarding(): OnboardingState {
  // SSR-safe lazy initialization
  const [hasCompleted, setHasCompleted] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR: assume complete
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const complete = useCallback(() => {
    setHasCompleted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
  }, []);

  const skip = useCallback(() => {
    setHasCompleted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
  }, []);

  const reset = useCallback(() => {
    setHasCompleted(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_KEY);
    }
  }, []);

  return {
    hasCompleted,
    shouldShow: !hasCompleted,
    complete,
    skip,
    reset,
  };
}
