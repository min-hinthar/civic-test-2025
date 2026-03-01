/**
 * Bookmark Sync - Supabase sync layer for bookmarks.
 *
 * Provides functions to sync bookmarked question IDs to/from Supabase
 * for cross-device persistence. Follows the fire-and-forget pattern
 * from streakSync.ts: sync failures are logged but never break UX.
 *
 * Merge strategy: add-wins (union of local and remote sets).
 * If bookmarked anywhere, stays bookmarked everywhere.
 *
 * Sync strategy:
 * - On sign-in: load remote, merge with local (add-wins union), save merged
 * - After bookmark change: upsert full set to Supabase (fire-and-forget)
 */

import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/async';
import { captureError } from '@/lib/sentry';

// ---------------------------------------------------------------------------
// Pure merge function
// ---------------------------------------------------------------------------

/**
 * Merge local and remote bookmark sets using add-wins strategy.
 *
 * Returns the union of both arrays, deduplicated and sorted.
 * Pure function - no side effects.
 */
export function mergeBookmarks(localIds: string[], remoteIds: string[]): string[] {
  return Array.from(new Set([...localIds, ...remoteIds])).sort();
}

// ---------------------------------------------------------------------------
// Sync to Supabase
// ---------------------------------------------------------------------------

/**
 * Upsert bookmarked question IDs to the user_bookmarks table.
 *
 * Stores the full set of IDs as a text[] array.
 * Skips silently if offline (fire-and-forget pattern).
 * On error: logs to Sentry, does not throw.
 */
export async function syncBookmarksToSupabase(
  userId: string,
  questionIds: string[]
): Promise<void> {
  // Skip if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    await withRetry(
      async () => {
        const { error } = await supabase.from('user_bookmarks').upsert({
          user_id: userId,
          question_ids: questionIds,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'bookmarkSync.push', userId });
  }
}

// ---------------------------------------------------------------------------
// Load from Supabase
// ---------------------------------------------------------------------------

/**
 * Load bookmarked question IDs from Supabase.
 *
 * Used on sign-in to merge remote bookmarks with local.
 * Returns empty array if no data exists or on error (graceful degradation).
 */
export async function loadBookmarksFromSupabase(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return [];

    return (data as { question_ids: string[] }).question_ids ?? [];
  } catch (err) {
    captureError(err, { operation: 'bookmarkSync.pull', userId });
    return [];
  }
}
