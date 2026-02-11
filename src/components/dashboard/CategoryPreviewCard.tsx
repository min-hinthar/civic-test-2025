'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/hub/GlassCard';
import { SubcategoryBar } from '@/components/hub/SubcategoryBar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  USCIS_CATEGORIES,
  SUB_CATEGORY_NAMES,
  type USCISCategory,
} from '@/lib/mastery/categoryMapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryPreviewCardProps {
  categoryMasteries: Record<string, number>;
  subCategoryMasteries: Record<string, number>;
  isLoading: boolean;
}

const CATEGORIES_ORDER: USCISCategory[] = [
  'American Government',
  'American History',
  'Integrated Civics',
];

// ---------------------------------------------------------------------------
// Skeleton (loading state)
// ---------------------------------------------------------------------------

function CategorySkeleton() {
  return (
    <GlassCard className="rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-text-secondary/20" />
        <div className="h-4 w-32 animate-pulse rounded bg-text-secondary/20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-text-secondary/10" />
            <div className="h-2 flex-1 animate-pulse rounded-full bg-text-secondary/10" />
            <div className="h-3 w-8 animate-pulse rounded bg-text-secondary/10" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// CategoryPreviewCard component
// ---------------------------------------------------------------------------

/**
 * Preview card showing all 3 USCIS categories with their subcategories.
 *
 * Features:
 * - Groups subcategories under main category headers
 * - Animated striped progress bars via SubcategoryBar
 * - Weak subcategories (<50%) are clickable to study guide
 * - Loading/empty states handled
 * - Bilingual heading via useLanguage
 * - Footer links to Hub Categories tab
 */
export function CategoryPreviewCard({
  categoryMasteries,
  subCategoryMasteries,
  isLoading,
}: CategoryPreviewCardProps) {
  const { showBurmese } = useLanguage();
  const navigate = useNavigate();

  const hasData = useMemo(() => {
    const values = Object.values(categoryMasteries);
    return values.length > 0 && values.some(v => v > 0);
  }, [categoryMasteries]);

  if (isLoading) {
    return <CategorySkeleton />;
  }

  return (
    <GlassCard className="rounded-2xl p-0">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Category Progress</h3>
            {showBurmese && (
              <span className="font-myanmar text-[10px] leading-tight text-text-secondary/70">
                {
                  '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038 \u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F'
                }
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        {!hasData ? (
          <p className="text-sm text-text-secondary">
            Start studying to see progress
            {showBurmese && (
              <span className="block font-myanmar text-[10px] mt-0.5">
                {
                  '\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1000\u103C\u100A\u103A\u1037\u101B\u1014\u103A \u101C\u1031\u1037\u101C\u102C\u1005\u1010\u1004\u103A\u1015\u102B'
                }
              </span>
            )}
          </p>
        ) : (
          <div className="space-y-4">
            {CATEGORIES_ORDER.map(category => {
              const def = USCIS_CATEGORIES[category];

              return (
                <div key={category}>
                  {/* Category header */}
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    {def.name.en}
                    {showBurmese && (
                      <span className="font-myanmar text-[9px] font-normal lowercase tracking-normal ml-2">
                        {def.name.my}
                      </span>
                    )}
                  </h4>

                  {/* Subcategory bars */}
                  <div className="space-y-2">
                    {def.subCategories.map(subCategory => {
                      const subMastery = subCategoryMasteries[subCategory] ?? 0;
                      const subName = SUB_CATEGORY_NAMES[subCategory];

                      return (
                        <SubcategoryBar
                          key={subCategory}
                          percentage={subMastery}
                          label={subName ?? { en: subCategory, my: subCategory }}
                          onClick={() =>
                            navigate(`/study?category=${encodeURIComponent(subCategory)}#cards`)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {hasData && (
          <button
            type="button"
            className="mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={() => navigate('/hub/categories')}
          >
            View all in Hub &rarr;
          </button>
        )}
      </div>
    </GlassCard>
  );
}
