'use client';

import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { CategoryRing } from './CategoryRing';
import { MasteryBadge } from './MasteryBadge';
import {
  USCIS_CATEGORIES,
  SUB_CATEGORY_NAMES,
  CATEGORY_COLORS,
} from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface CategoryGridProps {
  /** Mastery percentage (0-100) for each main USCIS category */
  categoryMasteries: Record<string, number>;
  /** Mastery percentage (0-100) for each sub-category */
  subCategoryMasteries?: Record<string, number>;
  /** Callback when a category card is clicked */
  onCategoryClick?: (category: string) => void;
  /** Additional className */
  className?: string;
}

/**
 * Color class mapping for category progress rings.
 * Uses Tailwind text-{color}-500 classes.
 */
const ringColorClasses: Record<string, string> = {
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  emerald: 'text-emerald-500',
};

/**
 * Color class mapping for sub-category progress bars.
 * Uses Tailwind bg-{color}-{shade} classes.
 */
const barColorClasses: Record<string, { bg: string; track: string }> = {
  blue: { bg: 'bg-blue-500', track: 'bg-blue-100 dark:bg-blue-950/30' },
  amber: { bg: 'bg-amber-500', track: 'bg-amber-100 dark:bg-amber-950/30' },
  emerald: { bg: 'bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-950/30' },
};

// Stagger animation config (matching 03-04 pattern: 80ms gap, 100ms initial delay)
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Compact grid of all USCIS categories with progress rings, badges,
 * and sub-category progress bars.
 *
 * Features:
 * - 1 column on mobile, 3 columns on desktop (one per USCIS category)
 * - CategoryRing with animated progress for each main category
 * - MasteryBadge showing achievement level
 * - Sub-category horizontal progress bars within each card
 * - Staggered entrance animation (80ms gap, 100ms initial delay)
 * - Distinct colors: blue (Government), amber (History), emerald (Civics)
 * - Tappable cards (calls onCategoryClick)
 *
 * Usage:
 * ```tsx
 * const { categoryMasteries, subCategoryMasteries } = useCategoryMastery();
 * <CategoryGrid
 *   categoryMasteries={categoryMasteries}
 *   subCategoryMasteries={subCategoryMasteries}
 *   onCategoryClick={(cat) => navigate(`/progress/${cat}`)}
 * />
 * ```
 */
export function CategoryGrid({
  categoryMasteries,
  subCategoryMasteries,
  onCategoryClick,
  className,
}: CategoryGridProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

  return (
    <motion.div
      className={clsx(
        'grid grid-cols-1 md:grid-cols-3 gap-4',
        className
      )}
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? undefined : 'hidden'}
      animate={shouldReduceMotion ? undefined : 'visible'}
    >
      {categories.map(category => {
        const def = USCIS_CATEGORIES[category];
        const color = CATEGORY_COLORS[category];
        const mastery = categoryMasteries[category] ?? 0;
        const ringColor = ringColorClasses[color] ?? 'text-blue-500';
        const barColors = barColorClasses[color] ?? barColorClasses.blue;

        return (
          <motion.div
            key={category}
            variants={shouldReduceMotion ? undefined : itemVariants}
            className={clsx(
              'rounded-2xl border border-border/60 bg-card p-4',
              'shadow-sm hover:shadow-md transition-shadow',
              onCategoryClick && 'cursor-pointer active:scale-[0.98]'
            )}
            onClick={() => onCategoryClick?.(category)}
            role={onCategoryClick ? 'button' : undefined}
            tabIndex={onCategoryClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onCategoryClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onCategoryClick(category);
              }
            }}
          >
            {/* Header: Ring + Name + Badge */}
            <div className="flex items-center gap-3 mb-3">
              <CategoryRing
                percentage={mastery}
                color={ringColor}
                size={64}
                strokeWidth={6}
              >
                <span className="text-sm font-bold text-foreground">
                  {mastery}%
                </span>
              </CategoryRing>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {def.name.en}
                </h3>
                {showBurmese && (
                  <p className="text-xs font-myanmar text-muted-foreground truncate">
                    {def.name.my}
                  </p>
                )}
              </div>

              <MasteryBadge mastery={mastery} size="sm" />
            </div>

            {/* Sub-category progress bars */}
            {subCategoryMasteries && (
              <div className="space-y-2">
                {def.subCategories.map(subCategory => {
                  const subMastery = subCategoryMasteries[subCategory] ?? 0;
                  const subName = SUB_CATEGORY_NAMES[subCategory];

                  return (
                    <div key={subCategory}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                          {subName?.en ?? subCategory}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {subMastery}%
                        </span>
                      </div>
                      <div
                        className={clsx(
                          'h-1.5 rounded-full overflow-hidden',
                          barColors.track
                        )}
                      >
                        <motion.div
                          className={clsx('h-full rounded-full', barColors.bg)}
                          initial={shouldReduceMotion ? { width: `${subMastery}%` } : { width: 0 }}
                          animate={{ width: `${subMastery}%` }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
