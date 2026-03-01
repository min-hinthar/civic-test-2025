'use client';

import { useEffect, useRef } from 'react';

const MIN_SYNC_INTERVAL_MS = 5000; // Minimum 5 seconds between visibility syncs

/**
 * Hook that triggers data re-pull from Supabase when the tab becomes visible.
 *
 * Uses a throttle (5-second minimum interval) to prevent rapid-fire pulls
 * from quick tab switches. Pattern adapted from useLeaderboard.ts.
 *
 * @param userId - Current authenticated user ID (null/undefined skips sync)
 * @param callbacks - Pull functions to call on visibility change
 */
export function useVisibilitySync(
  userId: string | undefined,
  callbacks: {
    pullSettings: () => Promise<void>;
    pullBookmarks: () => Promise<void>;
    pullStreaks: () => Promise<void>;
  }
): void {
  const lastSyncRef = useRef<number>(0);

  // Sync callback ref in effect (React Compiler safe)
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      const now = Date.now();
      if (now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) return;
      lastSyncRef.current = now;

      // Fire all pulls concurrently, each handles its own errors
      callbacksRef.current.pullSettings();
      callbacksRef.current.pullBookmarks();
      callbacksRef.current.pullStreaks();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);
}
