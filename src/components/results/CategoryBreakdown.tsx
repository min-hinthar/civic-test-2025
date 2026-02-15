'use client';

/**
 * CategoryBreakdown
 *
 * Groups quiz results by sub-category and shows a summary card for each,
 * including correct/total count, percentage bar, and strong/weak indicator.
 *
 * Uses SUB_CATEGORY_NAMES for bilingual labels and SUB_CATEGORY_COLORS
 * for per-category accent colors.
 */

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { FadeIn } from '@/components/animations/StaggeredList';
import { SUB_CATEGORY_NAMES, getSubCategoryColors } from '@/lib/mastery/categoryMapping';
import type { QuestionResult, Category } from '@/types';

interface CategoryBreakdownProps {
  results: QuestionResult[];
  showBurmese: boolean;
}

interface CategoryStat {
  category: Category;
  correct: number;
  total: number;
  percentage: number;
}

/**
 * Category-level score breakdown with color-coded bars and strong/weak labels.
 */
export function CategoryBreakdown({ results, showBurmese }: CategoryBreakdownProps) {
  const categoryStats: CategoryStat[] = useMemo(() => {
    const map = new Map<Category, { correct: number; total: number }>();

    for (const result of results) {
      const existing = map.get(result.category);
      if (existing) {
        existing.total += 1;
        if (result.isCorrect) existing.correct += 1;
      } else {
        map.set(result.category, { correct: result.isCorrect ? 1 : 0, total: 1 });
      }
    }

    const stats: CategoryStat[] = [];
    for (const [category, { correct, total }] of map) {
      stats.push({
        category,
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      });
    }

    // Sort by percentage ascending (weakest first)
    stats.sort((a, b) => a.percentage - b.percentage);
    return stats;
  }, [results]);

  if (categoryStats.length === 0) return null;

  return (
    <div className="space-y-3">
      {categoryStats.map((stat, index) => {
        const colors = getSubCategoryColors(stat.category);
        const name = SUB_CATEGORY_NAMES[stat.category];
        const isWeak = stat.percentage < 50;
        const isStrong = stat.percentage >= 80;

        return (
          <FadeIn key={stat.category} delay={index * 80}>
            <div
              className={clsx(
                'rounded-xl border p-4 transition-colors',
                isWeak
                  ? 'border-warning/30 bg-warning-subtle/30'
                  : isStrong
                    ? 'border-success/30 bg-success-subtle/30'
                    : 'border-border/60 bg-muted/20'
              )}
            >
              {/* Category name + score */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {name?.en ?? stat.category}
                  </p>
                  {showBurmese && name?.my && (
                    <p className="text-xs text-muted-foreground font-myanmar truncate">{name.my}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {stat.correct}/{stat.total}
                  </span>
                  {isWeak && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
                      Needs Review
                    </span>
                  )}
                  {isStrong && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      Strong
                    </span>
                  )}
                </div>
              </div>

              {/* Percentage bar */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    isWeak ? 'bg-warning' : isStrong ? 'bg-success' : colors.stripBg
                  )}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>

              {/* Percentage label */}
              <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
                {stat.percentage}%
              </p>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
