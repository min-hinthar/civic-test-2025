/**
 * Mastery Module
 *
 * Central export for mastery calculation, storage, and analysis.
 *
 * Usage:
 *   import { calculateCategoryMastery, recordAnswer, detectWeakAreas } from '@/lib/mastery';
 */

// Calculation engine
export {
  calculateCategoryMastery,
  calculateQuestionAccuracy,
  calculateOverallMastery,
  DECAY_HALF_LIFE_DAYS,
  TEST_WEIGHT,
  PRACTICE_WEIGHT,
} from './calculateMastery';
export type { CategoryMasteryEntry } from './calculateMastery';

// IndexedDB storage
export {
  recordAnswer,
  getAnswerHistory,
  getQuestionHistory,
  clearAnswerHistory,
} from './masteryStore';
export type { StoredAnswer } from './masteryStore';

// Analysis utilities
export { detectWeakAreas, detectStaleCategories, getNextMilestone } from './weakAreaDetection';
export type { WeakArea, StaleCategory, Milestone } from './weakAreaDetection';

// Category mapping (from 04-01)
export {
  getUSCISCategory,
  getCategoryQuestionIds,
  getSubCategoryColors,
  USCIS_CATEGORIES,
  CATEGORY_COLORS,
  USCIS_CATEGORY_NAMES,
  SUB_CATEGORY_NAMES,
  SUB_CATEGORY_COLORS,
} from './categoryMapping';
export type {
  USCISCategory,
  CategoryName,
  USCISCategoryDef,
  SubCategoryColors,
} from './categoryMapping';

// Nudge messages (from 04-09)
export {
  getEncouragingMessage,
  getNudgeMessage,
  getLevelUpMessage,
  getUnattemptedMessage,
} from './nudgeMessages';
