/**
 * Badge Store - IndexedDB storage for earned badge data, scoped per visitor.
 *
 * Earned/shown badge state is kept per visitor (a signed-in account id, or the
 * literal 'guest' for no-account visitors) so a guest's earned badges never
 * surface as a signed-in account's, and vice versa. Badges are otherwise
 * derived from the visitor's own stats, so once guest test history is migrated
 * into an account (see migrateGuestHistory), the account legitimately re-earns
 * those badges via the badge `check()` functions.
 *
 * Storage keys (per scope):
 * - 'earned-badges:<scope>': Array of earned badge records
 * - 'shown-badges:<scope>': Array of badge IDs shown in the celebration modal
 *
 * Database: 'civic-prep-badges' / 'badge-data'
 */

import { createStore, get, set, del } from 'idb-keyval';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for badge data
// ---------------------------------------------------------------------------

const badgeDb = createStore('civic-prep-badges', 'badge-data');

/** Scope used for no-account (guest) visitors. */
export const GUEST_BADGE_SCOPE = 'guest';

/** Legacy (pre-scoping) keys — device-wide. Adopted once into the first
 *  signed-in scope so existing users don't lose their celebration state. */
const LEGACY_EARNED_KEY = 'earned-badges';
const LEGACY_SHOWN_KEY = 'shown-badges';

const earnedKey = (scope: string): string => `${LEGACY_EARNED_KEY}:${scope}`;
const shownKey = (scope: string): string => `${LEGACY_SHOWN_KEY}:${scope}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A record of an earned badge with timestamp */
export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

// ---------------------------------------------------------------------------
// Legacy adoption (one-time migration of pre-scoping device-wide data)
// ---------------------------------------------------------------------------

/**
 * Move the legacy device-wide badge data into the first signed-in scope that
 * reads it, then delete the legacy keys. Guests never adopt (they start fresh),
 * so a guest read during the auth-loading window can't consume a signed-in
 * user's badges. Idempotent and a no-op once the legacy keys are gone.
 */
async function adoptLegacyBadges(scope: string): Promise<void> {
  if (scope === GUEST_BADGE_SCOPE) return;

  const [legacyEarned, legacyShown] = await Promise.all([
    get<EarnedBadge[]>(LEGACY_EARNED_KEY, badgeDb),
    get<string[]>(LEGACY_SHOWN_KEY, badgeDb),
  ]);
  if (legacyEarned === undefined && legacyShown === undefined) return;

  const [scopedEarned, scopedShown] = await Promise.all([
    get<EarnedBadge[]>(earnedKey(scope), badgeDb),
    get<string[]>(shownKey(scope), badgeDb),
  ]);

  // Don't clobber data already written under this scope.
  if (legacyEarned !== undefined && scopedEarned === undefined) {
    await set(earnedKey(scope), legacyEarned, badgeDb);
  }
  if (legacyShown !== undefined && scopedShown === undefined) {
    await set(shownKey(scope), legacyShown, badgeDb);
  }
  await Promise.all([del(LEGACY_EARNED_KEY, badgeDb), del(LEGACY_SHOWN_KEY, badgeDb)]);
}

// ---------------------------------------------------------------------------
// Earned badges
// ---------------------------------------------------------------------------

/**
 * Get all earned badges for a visitor scope. Returns an empty array if none.
 * @param scope - account id, or GUEST_BADGE_SCOPE for guests.
 */
export async function getEarnedBadges(scope: string): Promise<EarnedBadge[]> {
  await adoptLegacyBadges(scope);
  return (await get<EarnedBadge[]>(earnedKey(scope), badgeDb)) ?? [];
}

/**
 * Mark a badge as earned (with the current timestamp) for a visitor scope.
 * Skips if the badge is already in that scope's earned list.
 */
export async function markBadgeEarned(scope: string, badgeId: string): Promise<void> {
  const earned = await getEarnedBadges(scope);
  if (earned.some(b => b.badgeId === badgeId)) return;

  earned.push({ badgeId, earnedAt: new Date().toISOString() });
  await set(earnedKey(scope), earned, badgeDb);
}

// ---------------------------------------------------------------------------
// Celebration tracking (shown badges)
// ---------------------------------------------------------------------------

/**
 * Get the set of badge IDs shown in the celebration modal for a visitor scope.
 * Returns an empty set if none have been celebrated yet.
 */
export async function getShownBadgeIds(scope: string): Promise<Set<string>> {
  await adoptLegacyBadges(scope);
  const shown = (await get<string[]>(shownKey(scope), badgeDb)) ?? [];
  return new Set(shown);
}

/**
 * Mark a badge as shown in the celebration modal for a visitor scope, so the
 * same celebration doesn't reappear.
 */
export async function markBadgeShown(scope: string, badgeId: string): Promise<void> {
  await adoptLegacyBadges(scope);
  const shown = (await get<string[]>(shownKey(scope), badgeDb)) ?? [];

  if (!shown.includes(badgeId)) {
    shown.push(badgeId);
    await set(shownKey(scope), shown, badgeDb);
  }
}
