/**
 * Badge Definitions - Declarative badge configuration.
 *
 * Defines all achievable badges with bilingual (EN/MY) content,
 * icons (lucide-react names), and check functions.
 *
 * Three categories:
 * - Streak: Consecutive study day milestones
 * - Accuracy: Test score milestones
 * - Coverage: Question/category completion milestones
 */

/** Data provided to badge check functions for evaluation */
export interface BadgeCheckData {
  currentStreak: number;
  longestStreak: number;
  bestTestAccuracy: number;
  bestTestScore: number;
  totalTestsTaken: number;
  uniqueQuestionsAnswered: number;
  categoriesMastered: number;
  totalCategories: number;
}

/** A single badge definition with bilingual content and check logic */
export interface BadgeDefinition {
  id: string;
  category: 'streak' | 'accuracy' | 'coverage';
  name: { en: string; my: string };
  description: { en: string; my: string };
  requirement: { en: string; my: string };
  icon: string;
  check: (data: BadgeCheckData) => boolean;
}

/**
 * All badge definitions in the app.
 *
 * Ordered by category (streak -> accuracy -> coverage) then by difficulty.
 * This order determines celebration priority in getNewlyEarnedBadge.
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- Streak badges ---
  {
    id: 'streak-7',
    category: 'streak',
    name: {
      en: 'Week Warrior',
      my: '\u1010\u1005\u103A\u1015\u1010\u103A\u1010\u102D\u102F\u1000\u103A\u101E\u1030',
    },
    description: {
      en: '7-day study streak',
      my: '\u1047 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F',
    },
    requirement: {
      en: 'Study for 7 consecutive days',
      my: '\u1047 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 7 || data.longestStreak >= 7,
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: {
      en: 'Fortnight Focus',
      my: '\u1014\u103E\u1005\u103A\u1015\u1010\u103A\u1005\u102D\u102F\u1000\u103A\u101C\u103B\u1000\u103A',
    },
    description: {
      en: '14-day study streak',
      my: '\u1041\u1044 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F',
    },
    requirement: {
      en: 'Study for 14 consecutive days',
      my: '\u1041\u1044 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 14 || data.longestStreak >= 14,
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: {
      en: 'Monthly Master',
      my: '\u1010\u1005\u103A\u101C\u1015\u1010\u103A\u101E\u1030\u101B\u1032',
    },
    description: {
      en: '30-day study streak',
      my: '\u1043\u1040 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F',
    },
    requirement: {
      en: 'Study for 30 consecutive days',
      my: '\u1043\u1040 \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 30 || data.longestStreak >= 30,
  },

  // --- Accuracy badges ---
  {
    id: 'accuracy-90',
    category: 'accuracy',
    name: {
      en: 'Sharp Shooter',
      my: '\u1011\u102D\u1015\u103A\u1010\u1014\u103A\u1038\u1010\u102D\u1000\u103B\u101E\u1030',
    },
    description: {
      en: 'Score 90% on a test',
      my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1010\u103D\u1004\u103A \u1049\u1040% \u101B\u1019\u103E\u1010\u103A',
    },
    requirement: {
      en: 'Get 90% on a mock test',
      my: '\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1010\u103D\u1004\u103A \u1049\u1040% \u101B\u101A\u1030\u1015\u102B',
    },
    icon: 'Target',
    check: data => data.bestTestAccuracy >= 90,
  },
  {
    id: 'accuracy-100',
    category: 'accuracy',
    name: {
      en: 'Perfect Score',
      my: '\u1021\u1015\u103C\u100A\u1037\u103A\u1021\u1019\u103E\u1010\u103A',
    },
    description: {
      en: 'Score 100% on a test',
      my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1010\u103D\u1004\u103A \u1041\u1040\u1040% \u101B\u1019\u103E\u1010\u103A',
    },
    requirement: {
      en: 'Get a perfect score on a mock test',
      my: '\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1010\u103D\u1004\u103A \u1041\u1040\u1040% \u101B\u101A\u1030\u1015\u102B',
    },
    icon: 'Star',
    check: data => data.bestTestAccuracy >= 100,
  },

  // --- Coverage badges ---
  {
    id: 'coverage-all',
    category: 'coverage',
    name: {
      en: 'Complete Scholar',
      my: '\u1015\u103C\u100A\u1037\u103A\u1005\u102F\u1036\u1015\u100A\u102C\u101B\u103E\u1004\u103A',
    },
    description: {
      en: 'Answered all 100 questions',
      my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1041\u1040\u1040 \u101C\u102F\u1036\u1038\u101C\u1031\u1037\u101C\u102C\u1015\u103C\u102E\u1038',
    },
    requirement: {
      en: 'Answer all 100 questions at least once',
      my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1041\u1040\u1040 \u101C\u102F\u1036\u1038\u1000\u102D\u102F \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 \u1010\u1005\u103A\u1000\u103C\u102D\u1019\u103A\u1016\u103C\u1031\u1015\u102B',
    },
    icon: 'BookCheck',
    check: data => data.uniqueQuestionsAnswered >= 100,
  },
  {
    id: 'coverage-mastered',
    category: 'coverage',
    name: {
      en: 'Category Champion',
      my: '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1001\u103B\u1014\u103A\u1015\u102E\u101A\u1036',
    },
    description: {
      en: 'Mastered all categories',
      my: '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1015\u103C\u102E\u1038',
    },
    requirement: {
      en: 'Master all question categories',
      my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1000\u102D\u102F \u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1015\u102B',
    },
    icon: 'Award',
    check: data => data.totalCategories > 0 && data.categoriesMastered >= data.totalCategories,
  },
];
