/**
 * SRS Sync Layer
 *
 * Handles syncing SRS card state between local IndexedDB and Supabase.
 * Provides offline queue for reviews done without connectivity,
 * push/pull operations for cross-device sync, and last-write-wins merge.
 *
 * Follows the pattern from src/lib/pwa/syncQueue.ts.
 */

import { createStore, get, set, del, keys } from 'idb-keyval';
import { supabase } from '@/lib/supabaseClient';
import type { SRSCardRecord, SupabaseSRSRow } from './srsTypes';
import { cardToRow, rowToCard } from './srsTypes';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for pending SRS sync operations
// ---------------------------------------------------------------------------

const srsSyncDb = createStore('civic-prep-srs-sync', 'pending-reviews');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A pending SRS sync operation queued for when connectivity returns */
export interface PendingSRSSync {
  questionId: string;
  record: SRSCardRecord;
  reviewedAt: string; // ISO timestamp
  action: 'upsert' | 'delete';
}

// ---------------------------------------------------------------------------
// Offline queue operations
// ---------------------------------------------------------------------------

/**
 * Queue an SRS sync operation for later processing.
 * Called when the user is offline or not logged in.
 */
export async function queueSRSSync(sync: PendingSRSSync): Promise<void> {
  const key = `srs-${sync.questionId}-${Date.now()}`;
  await set(key, sync, srsSyncDb);
}

/**
 * Process all pending SRS sync operations.
 * For each queued item, attempts to sync to Supabase.
 * Successfully synced items are removed from the queue.
 * Failed items remain for the next sync attempt.
 *
 * @returns Counts of synced and failed operations
 */
export async function syncPendingSRSReviews(
  userId: string
): Promise<{ synced: number; failed: number }> {
  const allKeys = await keys(srsSyncDb);
  let synced = 0;
  let failed = 0;

  for (const key of allKeys) {
    const pending = await get<PendingSRSSync>(key, srsSyncDb);
    if (!pending) {
      // Orphaned key -- clean up
      await del(key, srsSyncDb);
      continue;
    }

    try {
      if (pending.action === 'upsert') {
        const row = cardToRow(userId, pending.questionId, pending.record);
        const { error } = await supabase
          .from('srs_cards')
          .upsert(row, { onConflict: 'user_id,question_id' });

        if (error) throw error;
      } else if (pending.action === 'delete') {
        const { error } = await supabase
          .from('srs_cards')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', pending.questionId);

        if (error) throw error;
      }

      // Success -- remove from queue
      await del(key, srsSyncDb);
      synced++;
    } catch (error) {
      // Leave in queue for next sync attempt
      console.error(`[srsSync] Failed to sync ${String(key)}:`, error);
      failed++;
    }
  }

  return { synced, failed };
}

// ---------------------------------------------------------------------------
// Push / Pull operations
// ---------------------------------------------------------------------------

/**
 * Push all local SRS cards to Supabase via batch upsert.
 * Used for initial sync when user first logs in or for full deck push.
 */
export async function pushSRSCards(userId: string, cards: SRSCardRecord[]): Promise<void> {
  if (cards.length === 0) return;

  const rows = cards.map(record => cardToRow(userId, record.questionId, record));

  const { error } = await supabase
    .from('srs_cards')
    .upsert(rows, { onConflict: 'user_id,question_id' });

  if (error) {
    console.error('[srsSync] pushSRSCards failed:', error);
    throw error;
  }
}

/**
 * Pull all SRS cards from Supabase for the given user.
 * Returns the remote deck converted to local SRSCardRecord format.
 */
export async function pullSRSCards(userId: string): Promise<SRSCardRecord[]> {
  const { data, error } = await supabase.from('srs_cards').select('*').eq('user_id', userId);

  if (error) {
    console.error('[srsSync] pullSRSCards failed:', error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  return (data as SupabaseSRSRow[]).map(rowToCard);
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge local and remote SRS decks using last-write-wins strategy.
 *
 * For each questionId present in either deck:
 * - If only in local: keep local
 * - If only in remote: keep remote
 * - If in both: keep whichever has a more recent lastReviewedAt
 *   (falls back to addedAt if neither has been reviewed)
 *
 * Conflict resolution is silent -- no user-facing notification.
 */
export function mergeSRSDecks(local: SRSCardRecord[], remote: SRSCardRecord[]): SRSCardRecord[] {
  const localMap = new Map<string, SRSCardRecord>();
  for (const card of local) {
    localMap.set(card.questionId, card);
  }

  const remoteMap = new Map<string, SRSCardRecord>();
  for (const card of remote) {
    remoteMap.set(card.questionId, card);
  }

  // Collect all unique questionIds
  const allIds = new Set<string>([...localMap.keys(), ...remoteMap.keys()]);

  const merged: SRSCardRecord[] = [];

  for (const id of allIds) {
    const localCard = localMap.get(id);
    const remoteCard = remoteMap.get(id);

    if (localCard && !remoteCard) {
      merged.push(localCard);
    } else if (!localCard && remoteCard) {
      merged.push(remoteCard);
    } else if (localCard && remoteCard) {
      // Last-write-wins: compare lastReviewedAt, fall back to addedAt
      const localTime = localCard.lastReviewedAt ?? localCard.addedAt;
      const remoteTime = remoteCard.lastReviewedAt ?? remoteCard.addedAt;

      if (new Date(localTime) >= new Date(remoteTime)) {
        merged.push(localCard);
      } else {
        merged.push(remoteCard);
      }
    }
  }

  return merged;
}
