/**
 * Social Module
 *
 * Central export for streak tracking, badge evaluation, and composite scoring.
 *
 * Usage:
 *   import { recordStudyActivity, evaluateBadges, calculateCompositeScore } from '@/lib/social';
 */

// Streak calculation (pure functions)
export {
  calculateStreak,
  checkFreezeEligibility,
  getLocalDateString,
  shouldAutoUseFreeze,
} from './streakTracker';
export type { DailyActivityCounts } from './streakTracker';

// Streak IndexedDB storage
export {
  earnFreeze,
  getStreakData,
  recordStudyActivity,
} from './streakStore';
export type { StreakData } from './streakStore';

// Badge definitions
export { BADGE_DEFINITIONS } from './badgeDefinitions';
export type {
  BadgeCheckData,
  BadgeDefinition,
} from './badgeDefinitions';

// Badge evaluation engine
export { evaluateBadges, getNewlyEarnedBadge } from './badgeEngine';

// Badge IndexedDB storage
export {
  getEarnedBadges,
  getShownBadgeIds,
  markBadgeEarned,
  markBadgeShown,
} from './badgeStore';
export type { EarnedBadge } from './badgeStore';

// Composite score
export { calculateCompositeScore } from './compositeScore';
