/**
 * Badge Engine - Badge evaluation logic.
 *
 * Evaluates badge definitions against current user data to determine
 * which badges have been newly earned and which should be celebrated.
 *
 * Pure functions - no side effects, no IndexedDB access.
 */

import type { BadgeCheckData, BadgeDefinition } from './badgeDefinitions';
import { BADGE_DEFINITIONS } from './badgeDefinitions';

/**
 * Evaluate all badge definitions and return newly earned badges.
 *
 * A badge is "newly earned" if:
 * 1. Its check function returns true for the current data
 * 2. It is NOT already in the earnedBadgeIds set
 *
 * Returns badges in definition order (streak -> accuracy -> coverage).
 */
export function evaluateBadges(
  data: BadgeCheckData,
  earnedBadgeIds: Set<string>
): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => badge.check(data) && !earnedBadgeIds.has(badge.id));
}

/**
 * Get the first badge that is earned but not yet shown in a celebration modal.
 *
 * Returns null if all earned badges have been celebrated.
 * Prioritizes by category order: streak -> accuracy -> coverage
 * (inherits from BADGE_DEFINITIONS order).
 *
 * This is used by the celebration modal to show one badge at a time.
 */
export function getNewlyEarnedBadge(
  data: BadgeCheckData,
  earnedBadgeIds: Set<string>,
  shownBadgeIds: Set<string>
): BadgeDefinition | null {
  for (const badge of BADGE_DEFINITIONS) {
    const isEarned = badge.check(data) || earnedBadgeIds.has(badge.id);
    const isShown = shownBadgeIds.has(badge.id);

    if (isEarned && !isShown) {
      return badge;
    }
  }

  return null;
}
