/**
 * Aggregated badge data hook.
 *
 * Provides badge values for all nav tabs that display badges:
 * - studyDueCount: SRS cards due for review (from SRSContext)
 * - hubHasUpdate: Whether Progress Hub has unseen earned badges
 * - settingsHasUpdate: Whether a service worker update is available
 *
 * hubHasUpdate uses localStorage as a lightweight bridge to avoid
 * importing the heavy useBadges hook into NavigationProvider.
 * HubPage writes 'civic-prep-earned-badge-count' whenever badges change,
 * and 'civic-prep-seen-badge-count' when the Achievements tab is viewed.
 */

import { useState, useEffect } from 'react';
import { useSRS } from '@/contexts/SRSContext';
import { getAllSessions } from '@/lib/sessions/sessionStore';
import type { NavBadges } from './navConfig';

const EARNED_KEY = 'civic-prep-earned-badge-count';
const SEEN_KEY = 'civic-prep-seen-badge-count';

/**
 * Read earned vs seen badge counts from localStorage.
 * Returns true if earned > seen (unseen badges exist).
 */
function checkHubBadge(): boolean {
  try {
    const earned = parseInt(localStorage.getItem(EARNED_KEY) ?? '0', 10);
    const seen = parseInt(localStorage.getItem(SEEN_KEY) ?? '0', 10);
    return earned > seen;
  } catch {
    return false;
  }
}

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
  const [hubHasUpdate, setHubHasUpdate] = useState(false);
  const [testSessionCount, setTestSessionCount] = useState(0);
  const [interviewSessionCount, setInterviewSessionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Subscribe to visibilitychange to check for SW updates and hub badge.
    // The initial check also runs via this pattern by scheduling it
    // as a microtask to avoid synchronous setState in effect body.
    const runCheck = () => {
      checkSWUpdate().then(hasUpdate => {
        if (!cancelled && hasUpdate) {
          setSettingsHasUpdate(true);
        }
      });
      // Hub badge check is synchronous (localStorage)
      if (!cancelled) {
        setHubHasUpdate(checkHubBadge());
      }
      // Session count check (IndexedDB, async)
      getAllSessions()
        .then(sessions => {
          if (!cancelled) {
            setTestSessionCount(
              sessions.filter(s => s.type === 'mock-test' || s.type === 'practice').length
            );
            setInterviewSessionCount(sessions.filter(s => s.type === 'interview').length);
          }
        })
        .catch(() => {
          // IndexedDB not available
        });
    };

    // Schedule initial check outside synchronous effect flow
    const timerId = setTimeout(runCheck, 0);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runCheck();
      }
    };

    // Listen for storage events (cross-tab updates)
    const handleStorage = (e: StorageEvent) => {
      if ((e.key === EARNED_KEY || e.key === SEEN_KEY) && !cancelled) {
        setHubHasUpdate(checkHubBadge());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      cancelled = true;
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    studyDueCount: dueCount,
    hubHasUpdate,
    settingsHasUpdate,
    testSessionCount,
    interviewSessionCount,
  };
}
