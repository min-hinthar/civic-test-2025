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
      my: 'တစ်ပတ်တိုက်သူ',
    },
    description: {
      en: '7-day study streak',
      my: '၇ ရက်ဆက်တိုက်လေ့လာမှု',
    },
    requirement: {
      en: 'Study for 7 consecutive days',
      my: '၇ ရက်ဆက်တိုက်လေ့လာပါ',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 7 || data.longestStreak >= 7,
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: {
      en: 'Fortnight Focus',
      my: 'နှစ်ပတ်စိုက်လျက်',
    },
    description: {
      en: '14-day study streak',
      my: '၁၄ ရက်ဆက်တိုက်လေ့လာမှု',
    },
    requirement: {
      en: 'Study for 14 consecutive days',
      my: '၁၄ ရက်ဆက်တိုက်လေ့လာပါ',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 14 || data.longestStreak >= 14,
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: {
      en: 'Monthly Master',
      my: 'တစ်လပတ်သူရဲ',
    },
    description: {
      en: '30-day study streak',
      my: '၃၀ ရက်ဆက်တိုက်လေ့လာမှု',
    },
    requirement: {
      en: 'Study for 30 consecutive days',
      my: '၃၀ ရက်ဆက်တိုက်လေ့လာပါ',
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
      my: 'ထိပ်တန်းတိကျသူ',
    },
    description: {
      en: 'Score 90% on a test',
      my: 'စာမေးပွဲတွင် ၉၀% ရမှတ်',
    },
    requirement: {
      en: 'Get 90% on a mock test',
      my: 'စမ်းသပ်စာမေးပွဲတွင် ၉၀% ရယူပါ',
    },
    icon: 'Target',
    check: data => data.bestTestAccuracy >= 90,
  },
  {
    id: 'accuracy-100',
    category: 'accuracy',
    name: {
      en: 'Perfect Score',
      my: 'အပြည့်အမှတ်',
    },
    description: {
      en: 'Score 100% on a test',
      my: 'စာမေးပွဲတွင် ၁၀၀% ရမှတ်',
    },
    requirement: {
      en: 'Get a perfect score on a mock test',
      my: 'စမ်းသပ်စာမေးပွဲတွင် ၁၀၀% ရယူပါ',
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
      my: 'ပြည့်စုံပညာရှင်',
    },
    description: {
      en: 'Answered all 100 questions',
      my: 'မေးခွန်း ၁၀၀ လုံးလေ့လာပြီး',
    },
    requirement: {
      en: 'Answer all 100 questions at least once',
      my: 'မေးခွန်း ၁၀၀ လုံးကို အနည်းဆုံး တစ်ကြိမ်ဖြေပါ',
    },
    icon: 'BookCheck',
    check: data => data.uniqueQuestionsAnswered >= 100,
  },
  {
    id: 'coverage-mastered',
    category: 'coverage',
    name: {
      en: 'Category Champion',
      my: 'အမျိုးအစားချန်ပီယံ',
    },
    description: {
      en: 'Mastered all categories',
      my: 'အမျိုးအစားအားလုံး ကျွမ်းကျင်ပြီး',
    },
    requirement: {
      en: 'Master all question categories',
      my: 'မေးခွန်းအမျိုးအစားအားလုံးကို ကျွမ်းကျင်ပါ',
    },
    icon: 'Award',
    check: data => data.totalCategories > 0 && data.categoriesMastered >= data.totalCategories,
  },
];
