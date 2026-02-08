'use client';

/**
 * useLeaderboard - Hook for fetching leaderboard data from Supabase RPC.
 *
 * Calls supabase.rpc('get_leaderboard') for top 25 entries,
 * and supabase.rpc('get_user_rank') for the authenticated user's own rank.
 *
 * Works for both authenticated and unauthenticated users:
 * - Anon users see the leaderboard (SELECT granted to anon on RPC)
 * - Authenticated users also see their own rank
 *
 * Refreshes on tab focus/visibility with a 30-second minimum interval.
 * Uses cancellation pattern in useEffect per codebase conventions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  compositeScore: number;
  currentStreak: number;
  topBadge: string | null;
  isWeeklyWinner: boolean;
}

interface UseLeaderboardReturn {
  /** Top entries from the leaderboard */
  entries: LeaderboardEntry[];
  /** The current user's rank (null if not ranked or not authenticated) */
  userRank: number | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Manually refresh leaderboard data */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// RPC row shapes (snake_case from Supabase)
// ---------------------------------------------------------------------------

interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  composite_score: number;
  current_streak: number;
  top_badge: string | null;
  is_weekly_winner: boolean;
}

interface UserRankRow {
  rank: number;
}

// ---------------------------------------------------------------------------
// Row -> Entry mapper
// ---------------------------------------------------------------------------

function rowToEntry(row: LeaderboardRow): LeaderboardEntry {
  return {
    rank: row.rank,
    userId: row.user_id,
    displayName: row.display_name,
    compositeScore: Number(row.composite_score),
    currentStreak: row.current_streak,
    topBadge: row.top_badge,
    isWeeklyWinner: row.is_weekly_winner,
  };
}

// ---------------------------------------------------------------------------
// Minimum refresh interval (30 seconds)
// ---------------------------------------------------------------------------

const MIN_REFRESH_INTERVAL_MS = 30_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetch leaderboard data from Supabase.
 *
 * @param boardType - 'all-time' or 'weekly' leaderboard view
 * @param limit - Maximum number of entries to fetch (default 25)
 */
export function useLeaderboard(
  boardType: 'all-time' | 'weekly' = 'all-time',
  limit: number = 25
): UseLeaderboardReturn {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Stable fetch function
  const fetchLeaderboard = useCallback(
    async (cancelled: { current: boolean }) => {
      try {
        // Fetch top entries via RPC
        const { data: leaderboardData, error: leaderboardError } = await supabase.rpc(
          'get_leaderboard',
          {
            board_type: boardType,
            result_limit: limit,
          }
        );

        if (cancelled.current) return;

        if (leaderboardError) {
          console.error('[useLeaderboard] RPC get_leaderboard error:', leaderboardError.message);
          setIsLoading(false);
          return;
        }

        const rows = (leaderboardData ?? []) as LeaderboardRow[];
        setEntries(rows.map(rowToEntry));

        // For authenticated users, fetch their own rank
        if (user?.id) {
          const { data: rankData, error: rankError } = await supabase.rpc('get_user_rank', {
            target_user_id: user.id,
          });

          if (cancelled.current) return;

          if (rankError) {
            // Non-fatal: user might not be opted in
            console.warn('[useLeaderboard] RPC get_user_rank error:', rankError.message);
            setUserRank(null);
          } else {
            // RPC returns a single row or scalar
            const rankResult = rankData as UserRankRow | UserRankRow[] | number | null;
            if (typeof rankResult === 'number') {
              setUserRank(rankResult > 0 ? rankResult : null);
            } else if (Array.isArray(rankResult) && rankResult.length > 0) {
              setUserRank(rankResult[0].rank > 0 ? rankResult[0].rank : null);
            } else if (rankResult && typeof rankResult === 'object' && 'rank' in rankResult) {
              setUserRank(rankResult.rank > 0 ? rankResult.rank : null);
            } else {
              setUserRank(null);
            }
          }
        } else {
          setUserRank(null);
        }

        setLastFetchTime(Date.now());
      } catch (err) {
        console.error('[useLeaderboard] Unexpected error:', err);
      } finally {
        if (!cancelled.current) {
          setIsLoading(false);
        }
      }
    },
    [boardType, limit, user?.id]
  );

  // Initial load
  useEffect(() => {
    const cancelled = { current: false };
    setIsLoading(true);
    fetchLeaderboard(cancelled);

    return () => {
      cancelled.current = true;
    };
  }, [fetchLeaderboard]);

  // Refresh on tab focus/visibility with minimum interval
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastFetchTime < MIN_REFRESH_INTERVAL_MS) return;

      const cancelled = { current: false };
      fetchLeaderboard(cancelled);

      // Cleanup: mark cancelled if we get another visibility change before fetch completes
      return () => {
        cancelled.current = true;
      };
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLeaderboard, lastFetchTime]);

  // Manual refresh function
  const refresh = useCallback(() => {
    const cancelled = { current: false };
    setIsLoading(true);
    fetchLeaderboard(cancelled);
  }, [fetchLeaderboard]);

  return useMemo(
    () => ({ entries, userRank, isLoading, refresh }),
    [entries, userRank, isLoading, refresh]
  );
}
