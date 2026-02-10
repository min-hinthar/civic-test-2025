/**
 * Aggregated badge data hook.
 *
 * Provides badge values for all nav tabs that display badges:
 * - studyDueCount: SRS cards due for review (from SRSContext)
 * - hubHasUpdate: Whether Progress Hub has new data (placeholder, wired in Phase 15)
 * - settingsHasUpdate: Whether a service worker update is available
 */

import { useState, useEffect } from 'react';
import { useSRS } from '@/contexts/SRSContext';
import type { NavBadges } from './navConfig';

/**
 * Check if a service worker update is waiting.
 * Returns a promise that resolves to true if an update is available.
 */
async function checkSWUpdate(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    return !!registration?.waiting;
  } catch {
    return false;
  }
}

export function useNavBadges(): NavBadges {
  const { dueCount } = useSRS();
  const [settingsHasUpdate, setSettingsHasUpdate] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Subscribe to visibilitychange to check for SW updates.
    // The initial check also runs via this pattern by scheduling it
    // as a microtask to avoid synchronous setState in effect body.
    const runCheck = () => {
      checkSWUpdate().then(hasUpdate => {
        if (!cancelled && hasUpdate) {
          setSettingsHasUpdate(true);
        }
      });
    };

    // Schedule initial check outside synchronous effect flow
    const timerId = setTimeout(runCheck, 0);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelled = true;
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    studyDueCount: dueCount,
    hubHasUpdate: false,
    settingsHasUpdate,
  };
}
