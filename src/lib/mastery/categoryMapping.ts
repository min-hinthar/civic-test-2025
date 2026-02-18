/**
 * USCIS Category Mapping
 *
 * Maps the 7 sub-categories used in question data to the 3 main USCIS categories.
 * Provides colors, bilingual names, and helper functions for category-based features.
 *
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

import type { Category, Question } from '@/types';

/** The 3 main USCIS civics test categories */
export type USCISCategory = 'American Government' | 'American History' | 'Integrated Civics';

/** Bilingual name for a category */
export interface CategoryName {
  en: string;
  my: string;
}

/** Category definition with sub-categories and metadata */
export interface USCISCategoryDef {
  name: CategoryName;
  color: string;
  subCategories: Category[];
}

/**
 * USCIS 3-category mapping with colors and sub-categories.
 *
 * Colors chosen to avoid clash with success-500 semantic color:
 * - blue for Government (authoritative, institutional)
 * - amber for History (warm, historical)
 * - emerald for Integrated Civics (distinct from success green)
 */
export const USCIS_CATEGORIES: Record<USCISCategory, USCISCategoryDef> = {
  'American Government': {
    name: {
      en: 'American Government',
      my: 'အမေရိကန်အစိုးရ',
    },
    color: 'blue',
    subCategories: [
      'Principles of American Democracy',
      'System of Government',
      'Rights and Responsibilities',
    ],
  },
  'American History': {
    name: {
      en: 'American History',
      my: 'အမေရိကန်သမိုင်း',
    },
    color: 'amber',
    subCategories: [
      'American History: Colonial Period and Independence',
      'American History: 1800s',
      'Recent American History and Other Important Historical Information',
    ],
  },
  'Integrated Civics': {
    name: {
      en: 'Integrated Civics',
      my: 'ပေါင်းစပ်နိုင်ငံသားပညာ',
    },
    color: 'emerald',
    subCategories: ['Civics: Symbols and Holidays'],
  },
};

/**
 * CSS-friendly color names for each USCIS category.
 * Use emerald instead of green to avoid clash with success-500 semantic color.
 */
export const CATEGORY_COLORS: Record<USCISCategory, string> = {
  'American Government': 'blue',
  'American History': 'amber',
  'Integrated Civics': 'emerald',
};

/** Bilingual names for each USCIS main category */
export const USCIS_CATEGORY_NAMES: Record<USCISCategory, CategoryName> = {
  'American Government': { en: 'American Government', my: 'အမေရိကန်အစိုးရ' },
  'American History': { en: 'American History', my: 'အမေရိကန်သမိုင်း' },
  'Integrated Civics': { en: 'Integrated Civics', my: 'ပေါင်းစပ်နိုင်ငံသားပညာ' },
};

/** Bilingual names for each sub-category */
export const SUB_CATEGORY_NAMES: Record<Category, CategoryName> = {
  'Principles of American Democracy': {
    en: 'Principles of American Democracy',
    my: 'အမေရိကန်ဒီမိုကရေစီ၏ မူဝါဒများ',
  },
  'System of Government': {
    en: 'System of Government',
    my: 'အစိုးရစနစ်',
  },
  'Rights and Responsibilities': {
    en: 'Rights and Responsibilities',
    my: 'အခွင့်အရေးများနှင့် တာဝန်များ',
  },
  'American History: Colonial Period and Independence': {
    en: 'Colonial Period and Independence',
    my: 'ကိုလိုနီခေတ်နှင့် လွတ်လပ်ရေး',
  },
  'American History: 1800s': {
    en: '1800s',
    my: '၁၈၀၀ ပြည့်နှစ်များ',
  },
  'Recent American History and Other Important Historical Information': {
    en: 'Recent American History',
    my: 'မကြာသေးမီ အမေရိကန်သမိုင်း',
  },
  'Civics: Symbols and Holidays': {
    en: 'Symbols and Holidays',
    my: 'သင်္ကေတများနှင့် ပိတ်ရက်များ',
  },
};

/**
 * Sub-category accent color definitions for visual differentiation.
 *
 * Each sub-category gets a vibrant, distinctive color matching the
 * original CATEGORY_COLORS_MAP palette used on flip card backs:
 * - Principles of American Democracy: rose (warm, founding docs)
 * - System of Government: blue (institutional, structural)
 * - Rights and Responsibilities: emerald (growth, civic duty)
 * - Colonial Period and Independence: amber (historical warmth)
 * - 1800s: fuchsia (distinctive, stands out)
 * - Recent American History: sky (modern, forward-looking)
 * - Symbols and Holidays: slate (neutral, grounded)
 */
export interface SubCategoryColors {
  /** Tailwind bg class for header strip (e.g. 'bg-rose-500') */
  stripBg: string;
  /** Tailwind border-l class for card accent (e.g. 'border-l-rose-500') */
  borderAccent: string;
  /** Tailwind text class for labels (e.g. 'text-rose-500') */
  textColor: string;
}

export const SUB_CATEGORY_COLORS: Record<Category, SubCategoryColors> = {
  'Principles of American Democracy': {
    stripBg: 'bg-rose-500',
    borderAccent: 'border-l-rose-500',
    textColor: 'text-rose-500',
  },
  'System of Government': {
    stripBg: 'bg-blue-500',
    borderAccent: 'border-l-blue-500',
    textColor: 'text-blue-500',
  },
  'Rights and Responsibilities': {
    stripBg: 'bg-emerald-500',
    borderAccent: 'border-l-emerald-500',
    textColor: 'text-emerald-500',
  },
  'American History: Colonial Period and Independence': {
    stripBg: 'bg-amber-500',
    borderAccent: 'border-l-amber-500',
    textColor: 'text-amber-500',
  },
  'American History: 1800s': {
    stripBg: 'bg-fuchsia-500',
    borderAccent: 'border-l-fuchsia-500',
    textColor: 'text-fuchsia-500',
  },
  'Recent American History and Other Important Historical Information': {
    stripBg: 'bg-sky-500',
    borderAccent: 'border-l-sky-500',
    textColor: 'text-sky-500',
  },
  'Civics: Symbols and Holidays': {
    stripBg: 'bg-slate-500',
    borderAccent: 'border-l-slate-500',
    textColor: 'text-slate-500',
  },
};

/**
 * Get sub-category accent colors for a given category.
 * Falls back to the parent USCIS category color if sub-category not found.
 */
export function getSubCategoryColors(category: Category): SubCategoryColors {
  return (
    SUB_CATEGORY_COLORS[category] ?? {
      stripBg: 'bg-gray-500',
      borderAccent: 'border-l-gray-500',
      textColor: 'text-gray-500',
    }
  );
}

/**
 * Get the main USCIS category for a given sub-category.
 */
export function getUSCISCategory(subCategory: Category): USCISCategory {
  for (const [mainCategory, def] of Object.entries(USCIS_CATEGORIES)) {
    if (def.subCategories.includes(subCategory)) {
      return mainCategory as USCISCategory;
    }
  }
  // Fallback — should never happen with valid Category type
  return 'Integrated Civics';
}

/**
 * Get all question IDs belonging to a USCIS main category or sub-category.
 *
 * @param category - A main USCIS category name or a sub-category name
 * @param questions - The question pool to search
 * @returns Array of question IDs matching the category
 */
export function getCategoryQuestionIds(
  category: USCISCategory | Category,
  questions: Question[]
): string[] {
  // Check if it's a main USCIS category
  if (category in USCIS_CATEGORIES) {
    const def = USCIS_CATEGORIES[category as USCISCategory];
    return questions.filter(q => def.subCategories.includes(q.category)).map(q => q.id);
  }

  // Otherwise treat as sub-category
  return questions.filter(q => q.category === category).map(q => q.id);
}
