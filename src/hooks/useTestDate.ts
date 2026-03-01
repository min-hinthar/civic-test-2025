'use client';

/**
 * useTestDate - localStorage hook for test date persistence.
 *
 * Persists the user's selected civics test date in localStorage
 * with SSR-safe initialization. Also manages post-test action state
 * (pending/passed/rescheduled) for the test date flow.
 *
 * Pattern: Follows LanguageContext/ThemeContext localStorage approach
 * with useState lazy initializer for SSR safety.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { gatherCurrentSettings, syncSettingsToSupabase } from '@/lib/settings';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_DATE_KEY = 'civic-prep-test-date';
const POST_TEST_ACTION_KEY = 'civic-prep-test-date-passed-action';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Post-test action state */
export type PostTestAction = 'pending' | 'passed' | 'rescheduled';

/** Return type for the useTestDate hook */
export interface UseTestDateReturn {
  /** Current test date in YYYY-MM-DD format, or null if not set */
  testDate: string | null;
  /** Set or clear the test date */
  setTestDate: (date: string | null) => void;
  /** Current post-test action state */
  postTestAction: PostTestAction;
  /** Update the post-test action */
  setPostTestAction: (action: PostTestAction) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook for persisting the civics test date in localStorage.
 *
 * Usage:
 * ```tsx
 * const { testDate, setTestDate, postTestAction, setPostTestAction } = useTestDate();
 * ```
 */
export function useTestDate(): UseTestDateReturn {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // SSR-safe lazy initializer -- only reads localStorage in browser
  const [testDate, setTestDateState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TEST_DATE_KEY);
  });

  const [postTestAction, setPostTestActionState] = useState<PostTestAction>(() => {
    if (typeof window === 'undefined') return 'pending';
    return (localStorage.getItem(POST_TEST_ACTION_KEY) as PostTestAction) ?? 'pending';
  });

  // Set or clear test date (writes to both state and localStorage)
  const setTestDate = useCallback((date: string | null) => {
    setTestDateState(date);
    if (date) {
      localStorage.setItem(TEST_DATE_KEY, date);
      // Clear post-test action when new date is set
      localStorage.removeItem(POST_TEST_ACTION_KEY);
      setPostTestActionState('pending');
    } else {
      localStorage.removeItem(TEST_DATE_KEY);
    }

    // Fire-and-forget sync to Supabase
    if (userRef.current?.id) {
      const settings = gatherCurrentSettings();
      syncSettingsToSupabase(userRef.current.id, settings);
    }
  }, []);

  // Update post-test action state
  const setPostTestAction = useCallback((action: PostTestAction) => {
    setPostTestActionState(action);
    localStorage.setItem(POST_TEST_ACTION_KEY, action);
    if (action === 'passed') {
      // Clear test date on pass
      localStorage.removeItem(TEST_DATE_KEY);
      setTestDateState(null);

      // Fire-and-forget sync to Supabase (testDate is now null)
      if (userRef.current?.id) {
        const settings = gatherCurrentSettings();
        syncSettingsToSupabase(userRef.current.id, settings);
      }
    }
  }, []);

  return { testDate, setTestDate, postTestAction, setPostTestAction };
}
