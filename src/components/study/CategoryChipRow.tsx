'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { Scale, Landmark, Shield, Flag, Scroll, Globe, Star, LayoutGrid } from 'lucide-react';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import type { Category } from '@/types';

/** Icon mapping for each USCIS sub-category */
const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  'Principles of American Democracy': Scale,
  'System of Government': Landmark,
  'Rights and Responsibilities': Shield,
  'American History: Colonial Period and Independence': Flag,
  'American History: 1800s': Scroll,
  'Recent American History and Other Important Historical Information': Globe,
  'Civics: Symbols and Holidays': Star,
};

/** Short subtitle descriptions for each category */
const CATEGORY_SUBTITLES: Record<Category, string> = {
  'Principles of American Democracy': 'Constitution, Democracy',
  'System of Government': 'Branches, Elections',
  'Rights and Responsibilities': 'Amendments, Duties',
  'American History: Colonial Period and Independence': 'Colonies, Revolution',
  'American History: 1800s': 'Civil War, Expansion',
  'Recent American History and Other Important Historical Information': 'Wars, Movements',
  'Civics: Symbols and Holidays': 'Flag, Holidays',
};

/** Accent bg class for each category chip */
const CATEGORY_ACCENT_BG: Record<Category, string> = {
  'Principles of American Democracy': 'bg-rose-500',
  'System of Government': 'bg-blue-500',
  'Rights and Responsibilities': 'bg-emerald-500',
  'American History: Colonial Period and Independence': 'bg-amber-500',
  'American History: 1800s': 'bg-fuchsia-500',
  'Recent American History and Other Important Historical Information': 'bg-sky-500',
  'Civics: Symbols and Holidays': 'bg-slate-500',
};

/** Active-state ring color per category */
const CATEGORY_RING: Record<Category, string> = {
  'Principles of American Democracy': 'ring-rose-500/30',
  'System of Government': 'ring-blue-500/30',
  'Rights and Responsibilities': 'ring-emerald-500/30',
  'American History: Colonial Period and Independence': 'ring-amber-500/30',
  'American History: 1800s': 'ring-fuchsia-500/30',
  'Recent American History and Other Important Historical Information': 'ring-sky-500/30',
  'Civics: Symbols and Holidays': 'ring-slate-500/30',
};

/** Active-state text color per category */
const CATEGORY_TEXT: Record<Category, string> = {
  'Principles of American Democracy': 'text-rose-600 dark:text-rose-400',
  'System of Government': 'text-blue-600 dark:text-blue-400',
  'Rights and Responsibilities': 'text-emerald-600 dark:text-emerald-400',
  'American History: Colonial Period and Independence': 'text-amber-600 dark:text-amber-400',
  'American History: 1800s': 'text-fuchsia-600 dark:text-fuchsia-400',
  'Recent American History and Other Important Historical Information':
    'text-sky-600 dark:text-sky-400',
  'Civics: Symbols and Holidays': 'text-slate-600 dark:text-slate-400',
};

/** Active-state border per category */
const CATEGORY_BORDER: Record<Category, string> = {
  'Principles of American Democracy': 'border-rose-500/40',
  'System of Government': 'border-blue-500/40',
  'Rights and Responsibilities': 'border-emerald-500/40',
  'American History: Colonial Period and Independence': 'border-amber-500/40',
  'American History: 1800s': 'border-fuchsia-500/40',
  'Recent American History and Other Important Historical Information': 'border-sky-500/40',
  'Civics: Symbols and Holidays': 'border-slate-500/40',
};

/** Short display labels for categories (avoid long overflow) */
const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  'Principles of American Democracy': 'Democracy',
  'System of Government': 'Government',
  'Rights and Responsibilities': 'Rights',
  'American History: Colonial Period and Independence': 'Colonial',
  'American History: 1800s': '1800s',
  'Recent American History and Other Important Historical Information': 'Recent',
  'Civics: Symbols and Holidays': 'Symbols',
};

/** Burmese short labels for categories */
const CATEGORY_SHORT_LABELS_MY: Record<Category, string> = {
  'Principles of American Democracy': 'ဒီမိုကရေစီ',
  'System of Government': 'အစိုးရစနစ်',
  'Rights and Responsibilities': 'အခွင့်အရေး',
  'American History: Colonial Period and Independence': 'ကိုလိုနီ',
  'American History: 1800s': '၁၈၀၀',
  'Recent American History and Other Important Historical Information': 'မကြာသေးမီ',
  'Civics: Symbols and Holidays': 'သင်္ကေတ',
};

export interface CategoryChipRowProps {
  categories: Category[];
  activeId: string | null; // null = "All"
  onSelect: (id: string | null) => void;
  showBurmese: boolean;
  totalCount: number;
  questionsPerCategory: Record<string, number>;
}

/**
 * Horizontal scrollable chip/pill row for category filtering.
 *
 * Features:
 * - CSS scroll-snap for smooth chip scrolling
 * - Fade masks on edges indicating overflow
 * - Each chip shows icon, short label, count badge, subtitle
 * - 44px minimum touch targets
 * - Full ARIA listbox/option semantics
 * - Motion tap animation via SPRING_SNAPPY
 */
export function CategoryChipRow({
  categories,
  activeId,
  onSelect,
  showBurmese,
  totalCount,
  questionsPerCategory,
}: CategoryChipRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (id: string | null) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <div
      className="relative"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
      }}
    >
      <div
        ref={scrollRef}
        role="listbox"
        aria-label="Category filter"
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 py-1"
      >
        {/* "All" chip */}
        <motion.button
          role="option"
          aria-selected={activeId === null}
          onClick={() => handleSelect(null)}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_SNAPPY}
          className={clsx(
            'snap-start shrink-0 flex flex-col items-start gap-0.5',
            'min-h-[44px] px-4 py-2.5 rounded-2xl border',
            'transition-colors cursor-pointer',
            activeId === null
              ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
              : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/50'
          )}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold whitespace-nowrap">All</span>
            <span
              className={clsx(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                activeId === null ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {totalCount}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            All Categories
          </span>
          {showBurmese && (
            <span className="text-[10px] text-muted-foreground font-myanmar whitespace-nowrap">
              အမျိုးအစားအားလုံး
            </span>
          )}
        </motion.button>

        {/* Category chips */}
        {categories.map(cat => {
          const isActive = activeId === cat;
          const Icon = CATEGORY_ICONS[cat];
          const subtitle = CATEGORY_SUBTITLES[cat];
          const shortLabel = CATEGORY_SHORT_LABELS[cat];
          const count = questionsPerCategory[cat] ?? 0;
          const accentBg = CATEGORY_ACCENT_BG[cat];

          return (
            <motion.button
              key={cat}
              role="option"
              aria-selected={isActive}
              onClick={() => handleSelect(cat)}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              className={clsx(
                'snap-start shrink-0 flex flex-col items-start gap-0.5',
                'min-h-[44px] px-4 py-2.5 rounded-2xl border',
                'transition-colors cursor-pointer',
                isActive
                  ? ['bg-card ring-2', CATEGORY_TEXT[cat], CATEGORY_BORDER[cat], CATEGORY_RING[cat]]
                  : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/50'
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold whitespace-nowrap">{shortLabel}</span>
                <span
                  className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white',
                    accentBg
                  )}
                >
                  {count}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {subtitle}
              </span>
              {showBurmese && (
                <span className="text-[10px] text-muted-foreground font-myanmar whitespace-nowrap">
                  {CATEGORY_SHORT_LABELS_MY[cat]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChipRow;
