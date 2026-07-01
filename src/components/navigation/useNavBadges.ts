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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getAllSessions } from '@/lib/sessions/sessionStore';
import { swUpdateManager } from '@/lib/pwa/swUpdateManager';
import type { NavBadges } from './navConfig';

const EARNED_KEY = 'civic-prep-earned-badge-count';
const SEEN_KEY = 'civic-prep-seen-badge-count';

/**
 * Visitor scope for the nav-dot counters — an account id, or 'guest'. Kept in
 * sync with useBadges' scoping so a guest's badge counts and an account's don't
 * cross-contaminate the "unseen badges" nav dot.
 */
export function navBadgeScope(userId: string | null | undefined): string {
  return userId ?? 'guest';
}
export const earnedCountKey = (scope: string): string => `${EARNED_KEY}:${scope}`;
export const seenCountKey = (scope: string): string => `${SEEN_KEY}:${scope}`;

/**
 * Read earned vs seen badge counts (for the given visitor scope) from
 * localStorage. Returns true if earned > seen (unseen badges exist).
 */
function checkHubBadge(scope: string): boolean {
  try {
    const earned = parseInt(localStorage.getItem(earnedCountKey(scope)) ?? '0', 10);
    const seen = parseInt(localStorage.getItem(seenCountKey(scope)) ?? '0', 10);
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
  const { user } = useAuth();
  const scope = navBadgeScope(user?.id);
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
      // Check both swUpdateManager state AND legacy registration.waiting
      const managerState = swUpdateManager.getState();
      if (managerState.updateAvailable) {
        if (!cancelled) setSettingsHasUpdate(true);
      } else {
        checkSWUpdate().then(hasUpdate => {
          if (!cancelled && hasUpdate) {
            setSettingsHasUpdate(true);
          }
        });
      }
      // Hub badge check is synchronous (localStorage)
      if (!cancelled) {
        setHubHasUpdate(checkHubBadge(scope));
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
      if ((e.key === earnedCountKey(scope) || e.key === seenCountKey(scope)) && !cancelled) {
        setHubHasUpdate(checkHubBadge(scope));
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
  }, [scope]);

  return {
    studyDueCount: dueCount,
    hubHasUpdate,
    settingsHasUpdate,
    testSessionCount,
    interviewSessionCount,
  };
}
