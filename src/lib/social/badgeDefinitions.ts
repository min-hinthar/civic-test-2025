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
 *
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

import { totalQuestions } from '@/constants/questions';

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
      my: 'တစ်ပတ်သူရဲကောင်း (Week Warrior)',
    },
    description: {
      en: '7-day study streak',
      my: '၇ ရက်ဆက်တိုက် လေ့လာပြီး!',
    },
    requirement: {
      en: 'Study for 7 consecutive days',
      my: '၇ ရက်ဆက်တိုက် လေ့လာပါ',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 7 || data.longestStreak >= 7,
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: {
      en: 'Fortnight Focus',
      my: 'နှစ်ပတ်စွဲမြဲသူ (Fortnight Focus)',
    },
    description: {
      en: '14-day study streak',
      my: '၁၄ ရက်ဆက်တိုက် လေ့လာပြီး!',
    },
    requirement: {
      en: 'Study for 14 consecutive days',
      my: '၁၄ ရက်ဆက်တိုက် လေ့လာပါ',
    },
    icon: 'Flame',
    check: data => data.currentStreak >= 14 || data.longestStreak >= 14,
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: {
      en: 'Monthly Master',
      my: 'တစ်လတာချန်ပီယံ (Monthly Master)',
    },
    description: {
      en: '30-day study streak',
      my: '၃၀ ရက်ဆက်တိုက် လေ့လာပြီး!',
    },
    requirement: {
      en: 'Study for 30 consecutive days',
      my: '၃၀ ရက်ဆက်တိုက် လေ့လာပါ',
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
      my: 'ပစ်မှတ်ကျသူ (Sharp Shooter)',
    },
    description: {
      en: 'Score 90% on a test',
      my: 'စာမေးပွဲမှာ ၉၀% ရပြီး!',
    },
    requirement: {
      en: 'Get 90% on a mock test',
      my: 'စမ်းသပ်စာမေးပွဲမှာ ၉၀% ရယူပါ',
    },
    icon: 'Target',
    check: data => data.bestTestAccuracy >= 90,
  },
  {
    id: 'accuracy-100',
    category: 'accuracy',
    name: {
      en: 'Perfect Score',
      my: 'အမှတ်ပြည့် (Perfect Score)',
    },
    description: {
      en: 'Score 100% on a test',
      my: 'စာမေးပွဲမှာ ၁၀၀% ရပြီး!',
    },
    requirement: {
      en: 'Get a perfect score on a mock test',
      my: 'စမ်းသပ်စာမေးပွဲမှာ ၁၀၀% ရယူပါ',
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
      my: 'ပညာရှင်ပြည့်စုံ (Complete Scholar)',
    },
    description: {
      en: `Answered all ${totalQuestions} questions`,
      my: `မေးခွန်း ${totalQuestions} ခုလုံး ဖြေပြီး!`,
    },
    requirement: {
      en: `Answer all ${totalQuestions} questions at least once`,
      my: `မေးခွန်း ${totalQuestions} ခုလုံးကို အနည်းဆုံးတစ်ကြိမ် ဖြေပါ`,
    },
    icon: 'BookCheck',
    check: data => data.uniqueQuestionsAnswered >= totalQuestions,
  },
  {
    id: 'coverage-mastered',
    category: 'coverage',
    name: {
      en: 'Category Champion',
      my: 'အမျိုးအစားချန်ပီယံ (Category Champion)',
    },
    description: {
      en: 'Mastered all categories',
      my: 'အမျိုးအစားအားလုံး ကျွမ်းကျင်ပြီး!',
    },
    requirement: {
      en: 'Master all question categories',
      my: 'မေးခွန်းအမျိုးအစားအားလုံးကို ကျွမ်းကျင်ပါ',
    },
    icon: 'Award',
    check: data => data.totalCategories > 0 && data.categoriesMastered >= data.totalCategories,
  },
];
