/**
 * Badge Store - IndexedDB storage for earned badge data.
 *
 * Uses idb-keyval with a dedicated store for persisting earned badges
 * and celebration state across sessions.
 *
 * Storage keys:
 * - 'earned-badges': Array of earned badge records
 * - 'shown-badges': Array of badge IDs shown in celebration modal
 *
 * Database: 'civic-prep-badges' / 'badge-data'
 */

import { createStore, get, set } from 'idb-keyval';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for badge data
// ---------------------------------------------------------------------------

const badgeDb = createStore('civic-prep-badges', 'badge-data');

/** Keys used in the badge store */
const EARNED_KEY = 'earned-badges';
const SHOWN_KEY = 'shown-badges';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A record of an earned badge with timestamp */
export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

// ---------------------------------------------------------------------------
// Earned badges
// ---------------------------------------------------------------------------

/**
 * Get all earned badges from IndexedDB.
 * Returns an empty array if no badges have been earned.
 */
export async function getEarnedBadges(): Promise<EarnedBadge[]> {
  return (await get<EarnedBadge[]>(EARNED_KEY, badgeDb)) ?? [];
}

/**
 * Mark a badge as earned with the current timestamp.
 * Skips if the badge is already in the earned list.
 */
export async function markBadgeEarned(badgeId: string): Promise<void> {
  const earned = await getEarnedBadges();

  // Skip if already earned
  if (earned.some(b => b.badgeId === badgeId)) {
    return;
  }

  earned.push({
    badgeId,
    earnedAt: new Date().toISOString(),
  });

  await set(EARNED_KEY, earned, badgeDb);
}

// ---------------------------------------------------------------------------
// Celebration tracking (shown badges)
// ---------------------------------------------------------------------------

/**
 * Get the set of badge IDs that have been shown in the celebration modal.
 * Returns an empty set if no badges have been celebrated yet.
 */
export async function getShownBadgeIds(): Promise<Set<string>> {
  const shown = (await get<string[]>(SHOWN_KEY, badgeDb)) ?? [];
  return new Set(shown);
}

/**
 * Mark a badge as shown in the celebration modal.
 * Prevents the same celebration from appearing multiple times.
 */
export async function markBadgeShown(badgeId: string): Promise<void> {
  const shown = (await get<string[]>(SHOWN_KEY, badgeDb)) ?? [];

  if (!shown.includes(badgeId)) {
    shown.push(badgeId);
    await set(SHOWN_KEY, shown, badgeDb);
  }
}
