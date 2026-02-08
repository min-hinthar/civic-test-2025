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
 * - freezesUsed: union (deduplicated)
 * - freezesAvailable: max of both
 * - longestStreak: max of both
 */

import { supabase } from '@/lib/supabaseClient';
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
    const { error } = await supabase.from('streak_data').upsert({
      user_id: userId,
      activity_dates: streakData.activityDates,
      freezes_available: streakData.freezesAvailable,
      freezes_used: streakData.freezesUsed,
      longest_streak: streakData.longestStreak,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[streakSync] Failed to sync streak data:', error.message);
    }
  } catch (err) {
    console.error('[streakSync] Unexpected error syncing streak data:', err);
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
    const { data, error } = await supabase
      .from('streak_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[streakSync] Failed to load streak data:', error.message);
      return null;
    }

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
    console.error('[streakSync] Unexpected error loading streak data:', err);
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
 * - freezesUsed: union of both (deduplicated, sorted)
 * - freezesAvailable: max of both
 * - longestStreak: max of both
 * - dailyActivityCounts: kept from local (current device state)
 * - lastSyncedAt: current time
 */
export function mergeStreakData(local: StreakData, remote: StreakData): StreakData {
  // Union activity dates (deduplicate and sort)
  const activityDates = Array.from(
    new Set([...local.activityDates, ...remote.activityDates])
  ).sort();

  // Union freezes used (deduplicate and sort)
  const freezesUsed = Array.from(new Set([...local.freezesUsed, ...remote.freezesUsed])).sort();

  return {
    activityDates,
    freezesAvailable: Math.max(local.freezesAvailable, remote.freezesAvailable),
    freezesUsed,
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    lastSyncedAt: new Date().toISOString(),
    // Keep local daily activity counts (current device state)
    dailyActivityCounts: local.dailyActivityCounts,
  };
}
