'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, AlertTriangle, Zap } from 'lucide-react';
import { ReadinessRing } from '@/components/hub/ReadinessRing';
import { DimensionBreakdown } from '@/components/readiness/DimensionBreakdown';
import { CategoryDrillList } from '@/components/readiness/CategoryDrillList';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { USCIS_CATEGORY_NAMES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import type { ReadinessResult } from '@/lib/readiness';

// ---------------------------------------------------------------------------
// Tier gradient config
// ---------------------------------------------------------------------------

interface TierGradient {
  light: string;
  dark: string;
}

function getTierGradient(score: number): TierGradient {
  if (score <= 25) {
    return {
      light: 'from-red-500/5 to-red-500/10',
      dark: 'dark:from-red-500/15 dark:to-red-500/20',
    };
  }
  if (score <= 50) {
    return {
      light: 'from-amber-500/5 to-amber-500/10',
      dark: 'dark:from-amber-500/15 dark:to-amber-500/20',
    };
  }
  if (score <= 75) {
    return {
      light: 'from-blue-500/5 to-blue-500/10',
      dark: 'dark:from-blue-500/15 dark:to-blue-500/20',
    };
  }
  return {
    light: 'from-green-500/5 to-green-500/10',
    dark: 'dark:from-green-500/15 dark:to-green-500/20',
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DRILL_THRESHOLD = 70;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReadinessHeroCardProps {
  /** Complete readiness result (null while loading) */
  readiness: ReadinessResult | null;
  /** Per-sub-category mastery percentages */
  subCategoryMasteries: Record<string, number>;
  /** Per-main-category mastery percentages */
  categoryMasteries: Record<string, number>;
  /** Whether data is still loading */
  isLoading: boolean;
  /** Whether to show Burmese translations */
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ReadinessHeroSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-muted/30 to-muted/50 p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-3 w-48 bg-muted/70 rounded" />
        </div>
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
      <div className="flex justify-center">
        <div className="w-[140px] h-[140px] rounded-full border-[14px] border-muted/30" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReadinessHeroCard
// ---------------------------------------------------------------------------

/**
 * Dashboard hero card showing the readiness score in a radial ring.
 * Tap to expand: reveals dimension breakdown + category drill list.
 * Gradient background shifts with score tier. Dark mode uses brighter tones.
 */
export function ReadinessHeroCard({
  readiness,
  subCategoryMasteries,
  categoryMasteries,
  isLoading,
  showBurmese,
}: ReadinessHeroCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // Check if any sub-categories need drilling
  const hasWeakCategories = useMemo(() => {
    return Object.values(subCategoryMasteries).some(m => m < DRILL_THRESHOLD);
  }, [subCategoryMasteries]);

  // Loading skeleton
  if (isLoading || !readiness) {
    return <ReadinessHeroSkeleton />;
  }

  const score = readiness.score;
  const tierGradient = getTierGradient(score);
  const isEmpty = score === 0;

  // Get first capped category name for the warning
  const cappedCategoryName = readiness.cappedCategories[0]
    ? USCIS_CATEGORY_NAMES[readiness.cappedCategories[0] as USCISCategory]
    : null;

  return (
    <motion.div
      layout
      transition={SPRING_GENTLE}
      className={`rounded-2xl p-6 shadow-sm border border-border/30 bg-gradient-to-br ${tierGradient.light} ${tierGradient.dark} cursor-pointer select-none`}
      onClick={() => setExpanded(prev => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`Test readiness: ${score}%. Tap to ${expanded ? 'collapse' : 'expand'} details.`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(prev => !prev);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Test Readiness</h2>
          {showBurmese && (
            <p className="text-sm font-myanmar text-muted-foreground">
              {
                '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1016\u103C\u1005\u103A\u1019\u103E\u102F'
              }
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on your study history
            {showBurmese && (
              <span className="font-myanmar ml-1">
                /{' '}
                {
                  '\u101E\u1004\u103A\u1037\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038\u1021\u1015\u1031\u102B\u103A\u1019\u103E \u1010\u103D\u1000\u103A\u1001\u103B\u1000\u103A\u1011\u102C\u1038\u101E\u100A\u103A'
                }
              </span>
            )}
          </p>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={SPRING_GENTLE}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Main ring area */}
      <div className="flex flex-col items-center">
        <motion.div layout transition={SPRING_GENTLE} className="flex justify-center">
          <ReadinessRing
            percentage={score}
            size={expanded ? 80 : 140}
            strokeWidth={expanded ? 8 : 14}
          />
        </motion.div>

        {/* 0% empty state */}
        {isEmpty && !expanded && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            Start studying to see your readiness
            {showBurmese && (
              <>
                <br />
                <span className="font-myanmar text-xs">
                  {
                    '\u101E\u1004\u103A\u1037\u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1016\u103C\u1005\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1000\u103C\u100A\u103A\u1037\u101B\u1014\u103A \u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B'
                  }
                </span>
              </>
            )}
          </p>
        )}

        {/* 60% cap warning */}
        {readiness.isCapped && !expanded && cappedCategoryName && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              router.push(
                `/practice?category=${encodeURIComponent(readiness.cappedCategories[0])}`
              );
            }}
            className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>
              Score capped &mdash; you haven&apos;t studied{' '}
              {showBurmese ? cappedCategoryName.my : cappedCategoryName.en}
            </span>
          </button>
        )}

        {/* Drill Weak Areas CTA (collapsed only) */}
        {!expanded && !isEmpty && hasWeakCategories && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              router.push('/drill');
            }}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Drill Weak Areas
            {showBurmese && (
              <span className="font-myanmar ml-1">
                /{' '}
                {
                  '\u1021\u102C\u1038\u1014\u100A\u103A\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B'
                }
              </span>
            )}
          </button>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_GENTLE}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-border/30 mt-4">
              {/* 60% cap warning (in expanded view) */}
              {readiness.isCapped && cappedCategoryName && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    router.push(
                      `/practice?category=${encodeURIComponent(readiness.cappedCategories[0])}`
                    );
                  }}
                  className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors w-full"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>
                    Score capped &mdash; study{' '}
                    {showBurmese ? cappedCategoryName.my : cappedCategoryName.en} to unlock higher
                    scores
                  </span>
                </button>
              )}

              {/* Dimension breakdown rings */}
              <DimensionBreakdown dimensions={readiness.dimensions} showBurmese={showBurmese} />

              {/* Category drill list */}
              <CategoryDrillList
                subCategoryMasteries={subCategoryMasteries}
                categoryMasteries={categoryMasteries}
                showBurmese={showBurmese}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
