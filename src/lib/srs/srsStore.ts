/**
 * SRS Store - IndexedDB storage for SRS card records.
 *
 * Uses idb-keyval with a dedicated store ('civic-prep-srs' / 'cards')
 * for persisting FSRS card state across sessions. Each card is keyed
 * by questionId for O(1) lookup.
 *
 * Follows the same pattern as src/lib/mastery/masteryStore.ts.
 */

import { createStore, get, set, del, keys } from 'idb-keyval';

import type { SRSCardRecord } from './srsTypes';
import { isDue } from './fsrsEngine';
import { recordStudyActivity } from '@/lib/social';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for SRS data
// ---------------------------------------------------------------------------

const srsDb = createStore('civic-prep-srs', 'cards');

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/** Get a single SRS card record by questionId. */
export async function getSRSCard(questionId: string): Promise<SRSCardRecord | undefined> {
  return get<SRSCardRecord>(questionId, srsDb);
}

/** Upsert an SRS card record, keyed by questionId. */
export async function setSRSCard(record: SRSCardRecord): Promise<void> {
  await set(record.questionId, record, srsDb);

  // Fire-and-forget: record SRS review activity for streak tracking.
  // Only record when card has been reviewed (not just added to deck).
  if (record.lastReviewedAt) {
    recordStudyActivity('srs_review').catch(() => {
      // Streak recording is non-critical
    });
  }
}

/** Remove an SRS card from the deck by questionId. */
export async function removeSRSCard(questionId: string): Promise<void> {
  await del(questionId, srsDb);
}

/** Get all SRS card records in the deck. */
export async function getAllSRSCards(): Promise<SRSCardRecord[]> {
  const allKeys = await keys(srsDb);
  const cards: SRSCardRecord[] = [];
  for (const key of allKeys) {
    const record = await get<SRSCardRecord>(key, srsDb);
    if (record) cards.push(record);
  }
  return cards;
}

/** Get all SRS cards that are currently due for review. */
export async function getDueSRSCards(): Promise<SRSCardRecord[]> {
  const allCards = await getAllSRSCards();
  return allCards.filter(record => isDue(record.card));
}

/** Get the total number of SRS cards without loading all records. */
export async function getSRSCardCount(): Promise<number> {
  return (await keys(srsDb)).length;
}
