/**
 * Nudge Messages
 *
 * Pool of rotating bilingual encouragement messages for the weak area
 * detection system. Messages use a warm, supportive study-buddy tone.
 *
 * Functions use deterministic selection (hash-based) for consistent
 * display per category while still providing variety.
 */

import type { BilingualString } from '@/lib/i18n/strings';
import { USCIS_CATEGORY_NAMES, SUB_CATEGORY_NAMES } from './categoryMapping';
import type { USCISCategory, CategoryName } from './categoryMapping';
import type { Category } from '@/types';

/** Encouraging messages shown at the top of the Suggested Focus section */
const ENCOURAGING_MESSAGES: BilingualString[] = [
  { en: "You're improving! Keep it up!", my: 'သင်တိုးတက်နေပါတယ်! ဆက်လက်ကြိုးစားပါ!' },
  { en: "Keep going, you've got this!", my: 'ဆက်လုပ်ပါ၊ သင်တတ်နိုင်ပါတယ်!' },
  { en: 'Every question brings you closer!', my: 'မေးခွန်းတိုင်း သင့်ကိုပိုနီးကပ်စေပါတယ်!' },
  {
    en: 'Great effort! Your hard work shows.',
    my: 'ကြိုးစားမှု ကောင်းပါတယ်! သင့်ကြိုးစားမှု မြင်ရပါတယ်။',
  },
  {
    en: 'A little practice every day goes a long way!',
    my: 'နေ့တိုင်း အနည်းငယ်လေ့ကျင့်ခြင်းက အများကြီးတိုးတက်စေတယ်!',
  },
  { en: "You're building real knowledge!", my: 'သင်အမှန်တကယ် အသိပညာတည်ဆောက်နေပါတယ်!' },
  { en: 'Small steps lead to big results!', my: 'ခြေလှမ်းငယ်များက ရလဒ်ကြီးများဖြစ်လာတယ်!' },
  {
    en: 'Your citizenship journey is on track!',
    my: 'သင့်နိုင်ငံသားခရီးစဉ် မှန်ကန်စွာသွားနေပါတယ်!',
  },
  { en: 'Practice makes progress!', my: 'လေ့ကျင့်ခြင်းက တိုးတက်မှုဖြစ်စေတယ်!' },
  {
    en: 'Every session counts toward your goal!',
    my: 'လေ့ကျင့်မှုတိုင်းက သင့်ပန်းတိုင်ဆီသို့ တိုးတက်စေတယ်!',
  },
  { en: 'Consistency is the key to success!', my: 'တသမတ်တည်းလေ့ကျင့်ခြင်းက အောင်မြင်ရေးသော့ချက်!' },
  { en: "You're closer than you think!", my: 'သင်ထင်တာထက် ပိုနီးနေပြီ!' },
];

/** Category-specific nudge messages with placeholder for category name */
const NUDGE_TEMPLATES: Array<{ en: string; my: string }> = [
  { en: '{category} needs a little attention', my: '{category} အနည်းငယ် အာရုံစိုက်ရန်လိုပါတယ်' },
  { en: "Let's strengthen {category}", my: '{category} ကိုပိုအားကောင်းအောင်လုပ်ကြရအောင်' },
  { en: 'Focus on {category} today', my: 'ယနေ့ {category} ကိုအာရုံစိုက်ပါ' },
  { en: '{category} could use more practice', my: '{category} ထပ်လေ့ကျင့်ဖို့ လိုပါတယ်' },
  { en: 'Review {category} for a boost', my: '{category} ကိုပြန်လေ့လာပြီး တိုးတက်ပါ' },
];

/** Level-up messages for users close to next milestone */
const LEVEL_UP_TEMPLATES: Array<{ en: string; my: string }> = [
  {
    en: '{mastery}% - push to {level} ({target}%)!',
    my: '{mastery}% - {levelMy} ({target}%) ရန်ကြိုးစားပါ!',
  },
  {
    en: 'Almost {level}! Just {remaining}% more in {category}.',
    my: 'နီးပါး {levelMy}! {category} တွင် {remaining}% သာလိုပါတယ်။',
  },
  {
    en: '{category} is {mastery}% - {level} is within reach!',
    my: '{category} {mastery}% - {levelMy} လက်တစ်ကမ်းမှာ!',
  },
];

/** Messages for categories not yet attempted */
const UNATTEMPTED_TEMPLATES: Array<{ en: string; my: string }> = [
  {
    en: "Haven't started {category} yet - give it a try!",
    my: '{category} မစတင်ရသေးပါ - စမ်းကြည့်ပါ!',
  },
  { en: '{category} is waiting for you!', my: '{category} သင့်ကိုစောင့်နေပါတယ်!' },
  {
    en: 'Discover {category} - new questions await!',
    my: '{category} ကိုရှာဖွေပါ - မေးခွန်းအသစ်များစောင့်နေပါတယ်!',
  },
];

/** Level names in Burmese for milestone messages */
const LEVEL_NAMES_MY: Record<string, string> = {
  bronze: 'ကြေးတံဆိပ်',
  silver: 'ငွေတံဆိပ်',
  gold: 'ရွှေတံဆိပ်',
};

/**
 * Simple hash function for deterministic selection.
 * Sums character codes of a string.
 */
function simpleHash(str: string): number {
  return str.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

/**
 * Look up the bilingual name for a category.
 * Works for both main USCIS categories and sub-categories.
 */
function getCategoryDisplayName(category: string): CategoryName {
  if (category in USCIS_CATEGORY_NAMES) {
    return USCIS_CATEGORY_NAMES[category as USCISCategory];
  }
  if (category in SUB_CATEGORY_NAMES) {
    return SUB_CATEGORY_NAMES[category as Category];
  }
  return { en: category, my: category };
}

/**
 * Get a random encouraging message.
 * Uses current time to rotate messages across visits.
 */
export function getEncouragingMessage(): BilingualString {
  // Rotate based on hour of day for variety without being truly random per render
  const hourSeed = new Date().getHours();
  const daySeed = new Date().getDate();
  const index = (hourSeed + daySeed) % ENCOURAGING_MESSAGES.length;
  return ENCOURAGING_MESSAGES[index];
}

/**
 * Get a category-specific nudge message.
 * Uses deterministic hash for consistent display per category.
 */
export function getNudgeMessage(category: string, mastery: number): BilingualString {
  const name = getCategoryDisplayName(category);
  const hash = simpleHash(category);
  const template = NUDGE_TEMPLATES[hash % NUDGE_TEMPLATES.length];

  return {
    en: `${template.en.replace('{category}', name.en)} - ${mastery}% mastery`,
    my: `${template.my.replace('{category}', name.my)} - ${mastery}%`,
  };
}

/**
 * Get a level-up message for a category close to the next milestone.
 */
export function getLevelUpMessage(
  category: string,
  currentMastery: number,
  nextTarget: number
): BilingualString {
  const name = getCategoryDisplayName(category);
  const hash = simpleHash(category);
  const template = LEVEL_UP_TEMPLATES[hash % LEVEL_UP_TEMPLATES.length];

  const level = nextTarget <= 50 ? 'bronze' : nextTarget <= 75 ? 'silver' : 'gold';
  const levelMy = LEVEL_NAMES_MY[level];
  const remaining = nextTarget - currentMastery;

  return {
    en: template.en
      .replace('{category}', name.en)
      .replace('{mastery}', String(currentMastery))
      .replace('{level}', level)
      .replace('{target}', String(nextTarget))
      .replace('{remaining}', String(remaining)),
    my: template.my
      .replace('{category}', name.my)
      .replace('{mastery}', String(currentMastery))
      .replace('{levelMy}', levelMy)
      .replace('{level}', levelMy)
      .replace('{target}', String(nextTarget))
      .replace('{remaining}', String(remaining)),
  };
}

/**
 * Get a message for unattempted categories.
 */
export function getUnattemptedMessage(category: string): BilingualString {
  const name = getCategoryDisplayName(category);
  const hash = simpleHash(category);
  const template = UNATTEMPTED_TEMPLATES[hash % UNATTEMPTED_TEMPLATES.length];

  return {
    en: template.en.replace('{category}', name.en),
    my: template.my.replace('{category}', name.my),
  };
}
