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
  saveStreakData,
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

// Share card renderer
export { renderShareCard } from './shareCardRenderer';
export type { ShareCardData } from './shareCardRenderer';

// Share utilities
export { shareScoreCard } from './shareUtils';
export type { ShareResult } from './shareUtils';

// Streak sync (Supabase)
export {
  loadStreakFromSupabase,
  mergeStreakData,
  syncStreakToSupabase,
} from './streakSync';

// Social profile sync (Supabase)
export {
  getSocialProfile,
  toggleSocialOptIn,
  updateCompositeScore,
  upsertSocialProfile,
} from './socialProfileSync';
export type { SocialProfile } from './socialProfileSync';
