/**
 * NBA Bilingual String Catalog
 *
 * Provides contextual bilingual copy for all 8 NBA states.
 * Dynamic strings accept input data for interpolation (streak count, due count, etc.).
 *
 * Pure functions -- no React dependencies.
 */

import type { BilingualString } from '@/lib/i18n/strings';
import type { NBAIcon, NBAStateType } from './nbaTypes';

/** Full content payload for an NBA state */
export interface NBAContent {
  title: BilingualString;
  hint: BilingualString;
  cta: { label: BilingualString; to: string };
  skip: { label: BilingualString; to: string };
  gradient: string;
  icon: NBAIcon;
  urgent: boolean;
  estimatedMinutes?: number;
}

/** Gradients keyed by state type */
const NBA_GRADIENTS: Record<NBAStateType, string> = {
  'new-user': 'from-primary/20 via-primary/5 to-transparent',
  'returning-user': 'from-amber-500/20 via-amber-500/5 to-transparent',
  'streak-at-risk': 'from-orange-500/25 via-orange-500/5 to-transparent',
  'srs-due': 'from-blue-500/20 via-blue-500/5 to-transparent',
  'weak-category': 'from-amber-400/20 via-amber-400/5 to-transparent',
  'no-recent-test': 'from-emerald-500/15 via-emerald-500/5 to-transparent',
  'test-ready': 'from-emerald-600/20 via-emerald-600/5 to-transparent',
  celebration: 'from-amber-400/20 via-primary/10 to-success/10',
};

/** Icons keyed by state type */
const NBA_ICONS: Record<NBAStateType, NBAIcon> = {
  'new-user': 'sparkles',
  'returning-user': 'heart',
  'streak-at-risk': 'flame',
  'srs-due': 'brain',
  'weak-category': 'book-open',
  'no-recent-test': 'target',
  'test-ready': 'target',
  celebration: 'trophy',
};

// ---------------------------------------------------------------------------
// Content builders per state
// ---------------------------------------------------------------------------

function newUserContent(): NBAContent {
  return {
    title: {
      en: 'Start your citizenship journey',
      my: 'နိုင်ငံသားဖြစ်ရေး ခရီးစတင်ပါ',
    },
    hint: {
      en: 'Study flashcards to build knowledge',
      my: 'အသိပညာတည်ဆောက်ရန် ဖလက်ရှ်ကတ်များ လေ့လာပါ',
    },
    cta: {
      label: { en: 'Begin studying', my: 'လေ့လာစတင်ပါ' },
      to: '/study',
    },
    skip: {
      label: { en: 'Take a practice test', my: 'စာမေးပွဲ စမ်းကြည့်ပါ' },
      to: '/test',
    },
    gradient: NBA_GRADIENTS['new-user'],
    icon: NBA_ICONS['new-user'],
    urgent: false,
  };
}

function returningUserContent(): NBAContent {
  return {
    title: {
      en: 'Welcome back!',
      my: 'ပြန်လာတာ ကြိုဆိုပါတယ်!',
    },
    hint: {
      en: "Pick up where you left off -- let's review",
      my: 'ရပ်ထားတဲ့နေရာက ဆက်လေ့လာပါ',
    },
    cta: {
      label: { en: 'Quick review', my: 'အမြန်ပြန်လည်စစ်ဆေးပါ' },
      to: '/study',
    },
    skip: {
      label: { en: 'Check your progress', my: 'တိုးတက်မှု ကြည့်ပါ' },
      to: '/hub/overview',
    },
    gradient: NBA_GRADIENTS['returning-user'],
    icon: NBA_ICONS['returning-user'],
    urgent: false,
  };
}

function streakAtRiskContent(currentStreak: number): NBAContent {
  return {
    title: {
      en: `Keep your ${currentStreak}-day streak alive!`,
      my: `${currentStreak} ရက်ဆက်တိုက် မှတ်တမ်းကို ဆက်ထိန်းပါ!`,
    },
    hint: {
      en: 'Study today to keep your streak going',
      my: 'ဆက်တိုက်ရက် ထိန်းဖို့ ဒီနေ့ လေ့လာပါ',
    },
    cta: {
      label: { en: 'Study now', my: 'ယခု လေ့လာပါ' },
      to: '/study',
    },
    skip: {
      label: { en: 'Review flashcards', my: 'ဖလက်ရှ်ကတ် ပြန်ကြည့်ပါ' },
      to: '/study#review',
    },
    gradient: NBA_GRADIENTS['streak-at-risk'],
    icon: NBA_ICONS['streak-at-risk'],
    urgent: true,
  };
}

function srsDueContent(dueCount: number): NBAContent {
  return {
    title: {
      en: `${dueCount} card${dueCount === 1 ? '' : 's'} ready for review`,
      my: `ပြန်လည်စစ်ဆေးရန် ကတ် ${dueCount} ခု အဆင်သင့်`,
    },
    hint: {
      en: 'Spaced repetition keeps knowledge fresh',
      my: 'အချိန်ခြားပြန်လေ့ကျင့်ခြင်းက အသိပညာကို လတ်ဆတ်နေစေပါတယ်',
    },
    cta: {
      label: {
        en: `Review ${dueCount} card${dueCount === 1 ? '' : 's'}`,
        my: `ကတ် ${dueCount} ခု ပြန်စစ်ပါ`,
      },
      to: '/study#review',
    },
    skip: {
      label: { en: 'Practice weak areas', my: 'အားနည်းချက်များ လေ့ကျင့်ပါ' },
      to: '/study',
    },
    gradient: NBA_GRADIENTS['srs-due'],
    icon: NBA_ICONS['srs-due'],
    urgent: true,
    estimatedMinutes: Math.ceil(dueCount * 0.5),
  };
}

function weakCategoryContent(categoryName: BilingualString, mastery: number): NBAContent {
  const masteryPct = Math.round(mastery);
  return {
    title: {
      en: `Practice ${categoryName.en} -- you're at ${masteryPct}%`,
      my: `${categoryName.my} လေ့ကျင့်ပါ -- ${masteryPct}% ရှိပါတယ်`,
    },
    hint: {
      en: 'Focus on your weakest area to boost overall readiness',
      my: 'အားနည်းဆုံးနေရာကို အာရုံစိုက်ပြီး အဆင်သင့်ဖြစ်မှုကို မြှင့်ပါ',
    },
    cta: {
      label: {
        en: `Practice ${categoryName.en}`,
        my: `${categoryName.my} လေ့ကျင့်ပါ`,
      },
      to: '/study',
    },
    skip: {
      label: { en: 'Take a mock test', my: 'စာမေးပွဲ စမ်းကြည့်ပါ' },
      to: '/test',
    },
    gradient: NBA_GRADIENTS['weak-category'],
    icon: NBA_ICONS['weak-category'],
    urgent: false,
    estimatedMinutes: 8,
  };
}

function noRecentTestContent(daysSinceTest: number): NBAContent {
  return {
    title: {
      en: 'Time for a practice test',
      my: 'စာမေးပွဲ စမ်းကြည့်ချိန် ရောက်ပါပြီ',
    },
    hint: {
      en: `Testing reinforces what you've learned${daysSinceTest > 0 ? ` -- it's been ${daysSinceTest} days` : ''}`,
      my: `စာမေးပွဲက သင်ယူထားတာကို ခိုင်မာစေပါတယ်${daysSinceTest > 0 ? ` -- ${daysSinceTest} ရက် ကြာပါပြီ` : ''}`,
    },
    cta: {
      label: { en: 'Start mock test', my: 'စာမေးပွဲ စတင်ပါ' },
      to: '/test',
    },
    skip: {
      label: { en: 'Study flashcards', my: 'ဖလက်ရှ်ကတ် လေ့လာပါ' },
      to: '/study',
    },
    gradient: NBA_GRADIENTS['no-recent-test'],
    icon: NBA_ICONS['no-recent-test'],
    urgent: false,
    estimatedMinutes: 12,
  };
}

function testReadyContent(readinessScore: number, suggestInterview: boolean): NBAContent {
  const pct = Math.round(readinessScore);
  return {
    title: {
      en: "You're ready for the civics test!",
      my: 'နိုင်ငံသားစာမေးပွဲအတွက် အဆင်သင့်ဖြစ်ပါပြီ!',
    },
    hint: {
      en: `Your readiness score is ${pct}% -- you've got this!`,
      my: `အဆင်သင့်ဖြစ်မှုရမှတ် ${pct}% -- သင်လုပ်နိုင်ပါတယ်!`,
    },
    cta: suggestInterview
      ? {
          label: {
            en: 'Try interview practice',
            my: 'အင်တာဗျူး လေ့ကျင့်ကြည့်ပါ',
          },
          to: '/interview',
        }
      : {
          label: { en: 'Take a mock test', my: 'စာမေးပွဲ စမ်းကြည့်ပါ' },
          to: '/test',
        },
    skip: {
      label: { en: 'Review your progress', my: 'တိုးတက်မှု ပြန်ကြည့်ပါ' },
      to: '/hub/overview',
    },
    gradient: NBA_GRADIENTS['test-ready'],
    icon: NBA_ICONS['test-ready'],
    urgent: false,
    estimatedMinutes: suggestInterview ? 8 : 12,
  };
}

function celebrationContent(
  streak: number,
  mastery: number,
  suggestInterview: boolean
): NBAContent {
  const masteryPct = Math.round(mastery);
  return {
    title: {
      en: "Amazing work! You're doing great!",
      my: 'အံ့မခန်းပါပဲ! အရမ်းကောင်းနေပါတယ်!',
    },
    hint: {
      en: `${streak}-day streak and ${masteryPct}% mastery -- keep it up!`,
      my: `${streak} ရက်ဆက်တိုက်နှင့် ${masteryPct}% ကျွမ်းကျင်မှု -- ဆက်လက်ကြိုးစားပါ!`,
    },
    cta: suggestInterview
      ? {
          label: { en: 'Practice interview', my: 'အင်တာဗျူး လေ့ကျင့်ပါ' },
          to: '/interview',
        }
      : {
          label: { en: 'Keep reviewing', my: 'ဆက်လက်ပြန်လည်စစ်ဆေးပါ' },
          to: '/study',
        },
    skip: {
      label: { en: 'View achievements', my: 'အောင်မြင်မှုများ ကြည့်ပါ' },
      to: '/hub/achievements',
    },
    gradient: NBA_GRADIENTS.celebration,
    icon: NBA_ICONS.celebration,
    urgent: false,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type NBAContentBuilder = typeof getNBAContent;

/**
 * Get bilingual content for a given NBA state type with dynamic data.
 *
 * This is called by determineNextBestAction to build the full NBAState object.
 */
export function getNBAContent(
  type: NBAStateType,
  data: {
    currentStreak?: number;
    dueCount?: number;
    categoryName?: BilingualString;
    mastery?: number;
    daysSinceTest?: number;
    readinessScore?: number;
    suggestInterview?: boolean;
  } = {}
): NBAContent {
  switch (type) {
    case 'new-user':
      return newUserContent();
    case 'returning-user':
      return returningUserContent();
    case 'streak-at-risk':
      return streakAtRiskContent(data.currentStreak ?? 0);
    case 'srs-due':
      return srsDueContent(data.dueCount ?? 0);
    case 'weak-category':
      return weakCategoryContent(
        data.categoryName ?? { en: 'Unknown', my: 'မသိ' },
        data.mastery ?? 0
      );
    case 'no-recent-test':
      return noRecentTestContent(data.daysSinceTest ?? 0);
    case 'test-ready':
      return testReadyContent(data.readinessScore ?? 0, data.suggestInterview ?? false);
    case 'celebration':
      return celebrationContent(
        data.currentStreak ?? 0,
        data.mastery ?? 0,
        data.suggestInterview ?? false
      );
  }
}
