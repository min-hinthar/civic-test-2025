'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Zap } from 'lucide-react';
import { SUB_CATEGORY_NAMES, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import type { Category } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Categories below this mastery % show a "Drill" button */
const DRILL_THRESHOLD = 70;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CategoryDrillListProps {
  /** Per-sub-category mastery percentages (0-100) */
  subCategoryMasteries: Record<string, number>;
  /** Per-main-category mastery percentages (0-100) */
  categoryMasteries: Record<string, number>;
  /** Whether to show Burmese translations */
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// CategoryDrillList
// ---------------------------------------------------------------------------

/**
 * List of all 7 sub-categories sorted by ascending mastery (weakest first).
 * Shows drill buttons on categories below 70% mastery threshold.
 * Zero-coverage categories get a red/warning accent.
 */
export function CategoryDrillList({ subCategoryMasteries, showBurmese }: CategoryDrillListProps) {
  const router = useRouter();

  // Build sorted list of all 7 sub-categories
  const sortedCategories = useMemo(() => {
    const categories: { name: Category; mastery: number }[] = [];
    const mainCats = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

    for (const mainCat of mainCats) {
      const def = USCIS_CATEGORIES[mainCat];
      for (const subCat of def.subCategories) {
        categories.push({
          name: subCat,
          mastery: subCategoryMasteries[subCat] ?? 0,
        });
      }
    }

    // Sort by ascending mastery (weakest first)
    categories.sort((a, b) => a.mastery - b.mastery);
    return categories;
  }, [subCategoryMasteries]);

  return (
    <div className="py-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Categories
        {showBurmese && (
          <span className="font-myanmar ml-1.5 normal-case tracking-normal">
            {'\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1019\u103B\u102C\u1038'}
          </span>
        )}
      </h4>

      <div className="divide-y divide-border/50">
        {sortedCategories.map(cat => {
          const isZero = cat.mastery === 0;
          const needsDrill = cat.mastery < DRILL_THRESHOLD;
          const names = SUB_CATEGORY_NAMES[cat.name];

          return (
            <div
              key={cat.name}
              className={`flex items-center gap-2 py-2 text-sm ${
                isZero ? 'bg-red-500/5 -mx-2 px-2 rounded-md' : ''
              }`}
            >
              {/* Zero-coverage warning icon */}
              {isZero && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}

              {/* Category name */}
              <div className="flex-1 min-w-0">
                <span
                  className={`font-medium truncate block ${isZero ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}
                >
                  {names.en}
                </span>
                {showBurmese && (
                  <span className="text-[10px] font-myanmar text-muted-foreground truncate block">
                    {names.my}
                  </span>
                )}
              </div>

              {/* Mastery percentage */}
              <span
                className={`text-xs font-semibold tabular-nums shrink-0 ${
                  isZero
                    ? 'text-red-500'
                    : cat.mastery >= DRILL_THRESHOLD
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {Math.round(cat.mastery)}%
              </span>

              {/* Drill button */}
              {needsDrill && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/drill?category=${encodeURIComponent(cat.name)}`);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors shrink-0"
                >
                  <Zap className="h-2.5 w-2.5" />
                  Drill
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
