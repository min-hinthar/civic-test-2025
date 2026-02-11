'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/hub/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMasteryColor } from '@/components/hub/CategoryDonut';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryPreviewCardProps {
  categoryMasteries: Record<string, number>;
  isLoading: boolean;
}

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
 * Compact preview card showing the top 3 weakest study categories.
 *
 * Features:
 * - Sorted by mastery ascending (weakest first)
 * - Mastery-colored progress bars (red -> amber -> green)
 * - Tappable to navigate to Hub Overview tab
 * - Loading/empty states handled
 * - Bilingual heading via useLanguage
 */
export function CategoryPreviewCard({ categoryMasteries, isLoading }: CategoryPreviewCardProps) {
  const { showBurmese } = useLanguage();
  const navigate = useNavigate();

  // Get top 3 weakest categories
  const weakest = useMemo(() => {
    const entries = Object.entries(categoryMasteries);
    if (entries.length === 0) return [];
    return entries.sort(([, a], [, b]) => a - b).slice(0, 3);
  }, [categoryMasteries]);

  const hasData = weakest.length > 0 && weakest.some(([, v]) => v > 0);

  if (isLoading) {
    return <CategorySkeleton />;
  }

  const handleClick = () => {
    navigate('/hub/overview');
  };

  return (
    <GlassCard interactive className="cursor-pointer rounded-2xl p-0" onClick={handleClick}>
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
          <div className="space-y-3">
            {weakest.map(([category, mastery]) => {
              const clampedMastery = Math.max(0, Math.min(100, Math.round(mastery)));
              const barColor = getMasteryColor(clampedMastery);
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className="w-24 truncate text-xs text-text-secondary">{category}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-text-secondary/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                      style={{
                        width: `${clampedMastery}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold tabular-nums text-text-primary">
                    {clampedMastery}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {hasData && <p className="mt-4 text-xs font-medium text-primary">View all in Hub &rarr;</p>}
      </div>
    </GlassCard>
  );
}
