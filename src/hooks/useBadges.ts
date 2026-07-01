'use client';

/**
 * useBadges - Hook for badge detection and celebration state.
 *
 * Loads earned/shown badges from IndexedDB and evaluates current user stats
 * against badge definitions. Detects newly earned badges for celebration.
 *
 * Follows React Compiler patterns:
 * - useMemo for derived badge state
 * - Cancellation pattern for async data loads (no setState in effects except initial load)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BadgeCheckData, BadgeDefinition } from '@/lib/social/badgeDefinitions';
import { BADGE_DEFINITIONS } from '@/lib/social/badgeDefinitions';
import {
  getEarnedBadges,
  getShownBadgeIds,
  markBadgeEarned,
  markBadgeShown,
  GUEST_BADGE_SCOPE,
} from '@/lib/social/badgeStore';
import type { EarnedBadge } from '@/lib/social/badgeStore';
import { getNewlyEarnedBadge } from '@/lib/social/badgeEngine';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseBadgesReturn {
  /** All badges the user has currently earned */
  earnedBadges: BadgeDefinition[];
  /** All badges not yet earned */
  lockedBadges: BadgeDefinition[];
  /** First badge earned but not yet celebrated (for modal) */
  newlyEarnedBadge: BadgeDefinition | null;
  /** Dismiss the celebration and persist shown state */
  dismissCelebration: (badgeId: string) => void;
  /** Whether IndexedDB data is still loading */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook for managing badge state and celebration flow.
 *
 * @param badgeCheckData - Current user stats for badge evaluation.
 *   Pass null while data is loading to skip evaluation.
 *
 * Usage:
 * ```tsx
 * const { earnedBadges, lockedBadges, newlyEarnedBadge, dismissCelebration } = useBadges(stats);
 * ```
 */
export function useBadges(badgeCheckData: BadgeCheckData | null): UseBadgesReturn {
  // Scope badge state to the current visitor (account id, or 'guest') so a
  // guest's earned/shown badges never surface as a signed-in account's.
  const { user } = useAuth();
  const scope = user?.id ?? GUEST_BADGE_SCOPE;

  // IndexedDB state. `loadedScope` marks which scope the records belong to;
  // deriving isLoading from it (rather than a setState in the effect) keeps the
  // celebration suppressed while a scope change reloads, so a returning user's
  // already-shown badges can't briefly re-celebrate from the previous scope's
  // (empty) shown set.
  const [earnedRecords, setEarnedRecords] = useState<EarnedBadge[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [loadedScope, setLoadedScope] = useState<string | null>(null);
  const isLoading = loadedScope !== scope;

  // Load earned and shown badges for the current scope; reload when the visitor
  // changes (e.g. guest -> signed-in after hydration).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [earned, shown] = await Promise.all([
          getEarnedBadges(scope),
          getShownBadgeIds(scope),
        ]);

        if (!cancelled) {
          setEarnedRecords(earned);
          setShownIds(shown);
          setLoadedScope(scope);
        }
      } catch {
        if (!cancelled) {
          // Reset so the previous scope's badges don't linger on error.
          setEarnedRecords([]);
          setShownIds(new Set());
          setLoadedScope(scope);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  // Derive earned badge IDs as a Set for O(1) lookup
  const earnedBadgeIds: Set<string> = useMemo(
    () => new Set(earnedRecords.map(r => r.badgeId)),
    [earnedRecords]
  );

  // Derive earned badges (check function passes OR previously earned)
  const earnedBadges: BadgeDefinition[] = useMemo(() => {
    if (!badgeCheckData) return [];

    return BADGE_DEFINITIONS.filter(
      badge => badge.check(badgeCheckData) || earnedBadgeIds.has(badge.id)
    );
  }, [badgeCheckData, earnedBadgeIds]);

  // Derive locked badges (not earned)
  const lockedBadges: BadgeDefinition[] = useMemo(() => {
    if (!badgeCheckData) return BADGE_DEFINITIONS;

    const earnedIds = new Set(earnedBadges.map(b => b.id));
    return BADGE_DEFINITIONS.filter(badge => !earnedIds.has(badge.id));
  }, [badgeCheckData, earnedBadges]);

  // Derive newly earned badge (earned but not shown - for celebration)
  const newlyEarnedBadge: BadgeDefinition | null = useMemo(() => {
    if (!badgeCheckData || isLoading) return null;

    return getNewlyEarnedBadge(badgeCheckData, earnedBadgeIds, shownIds);
  }, [badgeCheckData, earnedBadgeIds, shownIds, isLoading]);

  // Dismiss celebration: persist to IndexedDB and update local state
  const dismissCelebration = useCallback(
    async (badgeId: string) => {
      try {
        await Promise.all([markBadgeShown(scope, badgeId), markBadgeEarned(scope, badgeId)]);
      } catch {
        // IndexedDB write failed - still update local state
      }

      // Update local state to reflect dismissal
      setShownIds(prev => {
        const next = new Set(prev);
        next.add(badgeId);
        return next;
      });

      setEarnedRecords(prev => {
        if (prev.some(r => r.badgeId === badgeId)) return prev;
        return [...prev, { badgeId, earnedAt: new Date().toISOString() }];
      });
    },
    [scope]
  );

  return {
    earnedBadges,
    lockedBadges,
    newlyEarnedBadge,
    dismissCelebration,
    isLoading,
  };
}
