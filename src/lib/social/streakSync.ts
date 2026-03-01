/**
 * Streak Sync - Supabase sync layer for streak data.
 *
 * Provides functions to sync streak data to/from Supabase for
 * cross-device persistence. Follows the fire-and-forget pattern
 * from interviewSync.ts: sync failures are logged but never break UX.
 *
 * Sync strategy:
 * - On sign-in: load remote, merge with local, save merged to both
 * - After activity: upsert local data to remote (fire-and-forget)
 *
 * Merge strategy for multi-device usage:
 * - activityDates: union (deduplicated)
 * - freezesUsed: union (deduplicated), then recalculate (remove freezes on activity dates)
 * - freezesAvailable: max of both + freed freezes (capped at 3)
 * - longestStreak: recomputed from merged dates via calculateStreak
 */

import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/async';
import { captureError } from '@/lib/sentry';
import { calculateStreak } from './streakTracker';
import type { StreakData } from './streakStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Row shape from the streak_data Supabase table */
interface StreakDataRow {
  user_id: string;
  activity_dates: string[];
  freezes_available: number;
  freezes_used: string[];
  longest_streak: number;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Sync to Supabase
// ---------------------------------------------------------------------------

/**
 * Upsert streak data to the streak_data table.
 *
 * Maps StreakData fields to snake_case columns.
 * Skips silently if offline (fire-and-forget pattern).
 * On error: logs to console, does not throw.
 */
export async function syncStreakToSupabase(userId: string, streakData: StreakData): Promise<void> {
  // Skip if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    await withRetry(
      async () => {
        const { error } = await supabase.from('streak_data').upsert({
          user_id: userId,
          activity_dates: streakData.activityDates,
          freezes_available: streakData.freezesAvailable,
          freezes_used: streakData.freezesUsed,
          longest_streak: streakData.longestStreak,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'streakSync.syncStreakToSupabase', userId });
  }
}

// ---------------------------------------------------------------------------
// Load from Supabase
// ---------------------------------------------------------------------------

/**
 * Load streak data from Supabase.
 *
 * Used on sign-in to merge cloud data with local.
 * Returns null if no data exists or on error (graceful degradation).
 */
export async function loadStreakFromSupabase(userId: string): Promise<StreakData | null> {
  try {
    const data = await withRetry(
      async () => {
        const { data: result, error } = await supabase
          .from('streak_data')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        return result;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );

    if (!data) return null;

    const row = data as StreakDataRow;

    return {
      activityDates: row.activity_dates ?? [],
      freezesAvailable: row.freezes_available ?? 0,
      freezesUsed: row.freezes_used ?? [],
      longestStreak: row.longest_streak ?? 0,
      lastSyncedAt: row.updated_at ?? null,
      dailyActivityCounts: {
        srsReviewCount: 0,
        practiceTestCompleted: false,
      },
    };
  } catch (err) {
    captureError(err, { operation: 'streakSync.loadStreakFromSupabase', userId });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Merge strategy
// ---------------------------------------------------------------------------

/**
 * Merge local and remote streak data for multi-device consistency.
 *
 * Strategy:
 * - activityDates: union of both (deduplicated, sorted)
 * - freezesUsed: union of both, then recalculate — remove freezes on dates
 *   that now have activity after merge (the other device was active on that day)
 * - freezesAvailable: max of both + freed freeze count (capped at 3)
 * - longestStreak: recomputed from full merged date set via calculateStreak
 *   (more accurate than max of both — combined dates may reveal longer run)
 * - dailyActivityCounts: kept from local (current device state)
 * - lastSyncedAt: current time
 */
export function mergeStreakData(local: StreakData, remote: StreakData): StreakData {
  // Union activity dates (deduplicate and sort)
  const activityDates = Array.from(
    new Set([...local.activityDates, ...remote.activityDates])
  ).sort();

  // Union freezes used (deduplicate and sort)
  const allFreezesUsed = Array.from(new Set([...local.freezesUsed, ...remote.freezesUsed])).sort();

  // Recalculate: remove freezes for dates that now have activity after merge.
  // If the other device was active on a "missed" day, the freeze is unnecessary.
  const activitySet = new Set(activityDates);
  const validFreezes = allFreezesUsed.filter(date => !activitySet.has(date));

  // Return freed freezes to available pool (capped at 3)
  const freedCount = allFreezesUsed.length - validFreezes.length;
  const freezesAvailable = Math.min(
    Math.max(local.freezesAvailable, remote.freezesAvailable) + freedCount,
    3
  );

  // Recompute longest streak from full merged date set
  // (more accurate than max of both — combined dates may reveal longer run)
  const { longest } = calculateStreak(activityDates, validFreezes);

  return {
    activityDates,
    freezesAvailable,
    freezesUsed: validFreezes,
    longestStreak: longest,
    lastSyncedAt: new Date().toISOString(),
    // Keep local daily activity counts (current device state)
    dailyActivityCounts: local.dailyActivityCounts,
  };
}
