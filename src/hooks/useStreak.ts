'use client';

/**
 * useStreak - Hook for streak data and freeze auto-use.
 *
 * Loads streak data from IndexedDB on mount, computes current/longest streak
 * via useMemo, and auto-uses a freeze when appropriate with bilingual toast.
 *
 * Follows React Compiler patterns:
 * - useMemo for derived streak values
 * - Cancellation pattern for async data loads
 * - No setState in effects (only initial load pattern)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getStreakData, calculateStreak, shouldAutoUseFreeze } from '@/lib/social';
import type { StreakData } from '@/lib/social';
import { useToast } from '@/components/BilingualToast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseStreakReturn {
  /** Current consecutive day streak */
  currentStreak: number;
  /** Longest ever streak */
  longestStreak: number;
  /** Available streak freezes (max 3) */
  freezesAvailable: number;
  /** Dates where freezes were used */
  freezesUsed: string[];
  /** All dates with recorded activity */
  activityDates: string[];
  /** Whether IndexedDB data is still loading */
  isLoading: boolean;
  /** Reload streak data from IndexedDB */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Session-level guard for freeze auto-use (prevent duplicate toasts)
// ---------------------------------------------------------------------------

let freezeAutoUsedThisSession = false;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook for accessing streak data and auto-using freezes.
 *
 * On mount, checks if a freeze should be auto-used for yesterday
 * (user missed a day but had freezes). Shows bilingual toast notification.
 *
 * Usage:
 * ```tsx
 * const { currentStreak, longestStreak, freezesAvailable, isLoading } = useStreak();
 * ```
 */
export function useStreak(): UseStreakReturn {
  const { showInfo } = useToast();

  // IndexedDB streak data
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load streak data from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getStreakData();

        if (cancelled) return;

        // Check if freeze should be auto-used
        if (!freezeAutoUsedThisSession && data.freezesAvailable > 0) {
          const freezeCheck = shouldAutoUseFreeze(data.activityDates, data.freezesAvailable);

          if (
            freezeCheck.useFreeze &&
            freezeCheck.freezeDate &&
            !data.freezesUsed.includes(freezeCheck.freezeDate)
          ) {
            // Apply freeze via a lightweight activity recording
            // (recordStudyActivity handles freeze auto-use internally)
            freezeAutoUsedThisSession = true;

            showInfo({
              en: 'Streak freeze used! Your streak is safe.',
              my: 'Streak freeze သုံးပြီး! သင့် streak ဘေးကင်းပါတယ်၍',
            });

            // Re-load data after freeze application
            const updated = await getStreakData();
            if (!cancelled) {
              setStreakData(updated);
              setIsLoading(false);
            }
            return;
          }
        }

        setStreakData(data);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- showInfo is stable from context

  // Derive streak values via useMemo (React Compiler safe)
  const streakValues = useMemo(() => {
    if (!streakData) {
      return { current: 0, longest: 0 };
    }
    return calculateStreak(streakData.activityDates, streakData.freezesUsed);
  }, [streakData]);

  const currentStreak = streakValues.current;
  const longestStreak = useMemo(() => {
    if (!streakData) return 0;
    return Math.max(streakValues.longest, streakData.longestStreak);
  }, [streakData, streakValues.longest]);

  // Refresh function to reload data from IndexedDB
  const refresh = useCallback(() => {
    let cancelled = false;

    getStreakData()
      .then(data => {
        if (!cancelled) {
          setStreakData(data);
        }
      })
      .catch(() => {
        // IndexedDB not available
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    currentStreak,
    longestStreak,
    freezesAvailable: streakData?.freezesAvailable ?? 0,
    freezesUsed: streakData?.freezesUsed ?? [],
    activityDates: streakData?.activityDates ?? [],
    isLoading,
    refresh,
  };
}
