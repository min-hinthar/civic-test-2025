/**
 * Per-badge icon colors and background tints for consistent styling
 * across BadgeHighlights, BadgeGrid, and BadgeCelebration.
 */

export interface BadgeColorScheme {
  /** Tailwind text color class for the icon */
  icon: string;
  /** Tailwind bg class for earned circle fill (light) */
  bgLight: string;
  /** Tailwind bg class for earned circle fill (dark) */
  bgDark: string;
  /** CSS drop-shadow for icon glow */
  glow: string;
  /** Tailwind ring color for celebration modal */
  ring: string;
  /** Tailwind bg class for progress bar fill */
  bar: string;
}

const BADGE_COLORS: Record<string, BadgeColorScheme> = {
  // Flame icon — warm orange fire
  'streak-7': {
    icon: 'text-orange-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]',
    ring: 'ring-orange-400/50',
    bar: 'bg-orange-500',
  },
  // Flame icon — hotter red-orange fire
  'streak-14': {
    icon: 'text-orange-600',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]',
    ring: 'ring-orange-500/50',
    bar: 'bg-orange-600',
  },
  // Flame icon — hottest deep red fire
  'streak-30': {
    icon: 'text-red-500',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    ring: 'ring-red-400/50',
    bar: 'bg-red-500',
  },
  // Target icon — red bullseye
  'accuracy-90': {
    icon: 'text-red-600',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]',
    ring: 'ring-red-500/50',
    bar: 'bg-red-600',
  },
  // Star icon — gold star
  'accuracy-100': {
    icon: 'text-yellow-500',
    bgLight: 'bg-yellow-50',
    bgDark: 'dark:bg-yellow-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]',
    ring: 'ring-yellow-400/50',
    bar: 'bg-yellow-500',
  },
  // BookCheck icon — scholarly blue-green
  'coverage-all': {
    icon: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]',
    ring: 'ring-emerald-400/50',
    bar: 'bg-emerald-600',
  },
  // Award/trophy icon — royal purple champion
  'coverage-mastered': {
    icon: 'text-violet-500',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    ring: 'ring-violet-400/50',
    bar: 'bg-violet-500',
  },
};

const FALLBACK: BadgeColorScheme = {
  icon: 'text-amber-500',
  bgLight: 'bg-amber-50',
  bgDark: 'dark:bg-amber-950/40',
  glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  ring: 'ring-amber-400/50',
  bar: 'bg-amber-500',
};

export function getBadgeColors(badgeId: string): BadgeColorScheme {
  return BADGE_COLORS[badgeId] ?? FALLBACK;
}
