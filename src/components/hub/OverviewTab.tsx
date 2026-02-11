'use client';

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, BookOpen, CheckCircle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

import { ReadinessRing } from '@/components/hub/ReadinessRing';
import { StatCard } from '@/components/hub/StatCard';
import { CategoryDonut } from '@/components/hub/CategoryDonut';
import { SubcategoryBar } from '@/components/hub/SubcategoryBar';
import { WelcomeState } from '@/components/hub/WelcomeState';
import { OverviewSkeleton } from '@/components/hub/HubSkeleton';
import { GlassCard } from '@/components/hub/GlassCard';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { useLanguage } from '@/contexts/LanguageContext';
import { USCIS_CATEGORIES, SUB_CATEGORY_NAMES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OverviewTabProps {
  /** Overall mastery percentage (0-100) */
  overallMastery: number;
  /** Mastery percentage per main USCIS category */
  categoryMasteries: Record<string, number>;
  /** Mastery percentage per sub-category */
  subCategoryMasteries: Record<string, number>;
  /** Current consecutive day streak */
  currentStreak: number;
  /** Number of SRS cards due for review */
  srsDueCount: number;
  /** Number of unique questions practiced */
  practicedCount: number;
  /** Total number of questions in the bank */
  totalQuestions: number;
  /** Whether data is still loading */
  isLoading: boolean;
  /** Optional error */
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES_ORDER: USCISCategory[] = [
  'American Government',
  'American History',
  'Integrated Civics',
];

// ---------------------------------------------------------------------------
// OverviewTab component
// ---------------------------------------------------------------------------

/**
 * Overview tab content for the Progress Hub.
 *
 * Features:
 * - Hero section with ReadinessRing (centered)
 * - 4 tappable stat cards in responsive grid
 * - 3 category sections with CategoryDonut + SubcategoryBar
 * - Collapsible category detail sections (default expanded)
 * - Welcome state for brand new users (0 practiced questions)
 * - Skeleton loading state
 * - Stagger children entrance animation
 */
export function OverviewTab({
  overallMastery,
  categoryMasteries,
  subCategoryMasteries,
  currentStreak,
  srsDueCount,
  practicedCount,
  totalQuestions,
  isLoading,
}: OverviewTabProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const categoriesSectionRef = useRef<HTMLElement>(null);

  // Track which categories are expanded (default: all expanded)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const scrollToCategories = useCallback(() => {
    categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Loading state
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  // Brand new user: show welcome state
  if (practicedCount === 0) {
    return <WelcomeState />;
  }

  return (
    <StaggeredList className="space-y-6" delay={100} stagger={80}>
      {/* Hero section: Readiness Ring */}
      <StaggeredItem>
        <div className="flex justify-center py-2">
          <ReadinessRing percentage={overallMastery} size={180} strokeWidth={14} />
        </div>
      </StaggeredItem>

      {/* Stat cards grid */}
      <StaggeredItem>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label={{
              en: 'Mastery',
              my: '\u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F',
            }}
            value={`${overallMastery}%`}
            onClick={scrollToCategories}
          />
          <StatCard
            icon={Flame}
            label={{
              en: 'Streak',
              my: '\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101B\u1000\u103A',
            }}
            value={currentStreak}
            onClick={() => navigate('/hub/achievements')}
          />
          <StatCard
            icon={BookOpen}
            label={{
              en: 'SRS Due',
              my: 'SRS \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A',
            }}
            value={srsDueCount}
            badge={srsDueCount > 0 ? 'Review Now' : undefined}
            onClick={() => navigate('/study#review')}
          />
          <StatCard
            icon={CheckCircle}
            label={{
              en: 'Practiced',
              my: '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u103C\u102E\u1038',
            }}
            value={`${practicedCount}/${totalQuestions}`}
            onClick={() => navigate('/study')}
          />
        </div>
      </StaggeredItem>

      {/* Category Mastery section */}
      <StaggeredItem>
        <section ref={categoriesSectionRef}>
          <h3 className="mb-3 text-lg font-bold text-text-primary">Category Mastery</h3>
          {showBurmese && (
            <p className="font-myanmar -mt-2 mb-3 text-xs text-text-secondary">
              {
                '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u101C\u102D\u102F\u1000\u103A \u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F'
              }
            </p>
          )}

          <div className="space-y-4">
            {CATEGORIES_ORDER.map(category => {
              const def = USCIS_CATEGORIES[category];
              const mastery = categoryMasteries[category] ?? 0;
              const isCollapsed = collapsedCategories.has(category);

              return (
                <GlassCard key={category} className="rounded-2xl p-5">
                  {/* Category header */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 text-left min-h-[44px]"
                    onClick={() => toggleCategory(category)}
                    aria-expanded={!isCollapsed}
                    aria-label={`${category} - ${mastery}% mastery`}
                  >
                    <CategoryDonut
                      percentage={mastery}
                      size={80}
                      strokeWidth={7}
                      label={def.name}
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-text-primary">{def.name.en}</h4>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-text-secondary">{def.name.my}</p>
                      )}
                    </div>

                    <ChevronDown
                      className={clsx(
                        'h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform',
                        !isCollapsed && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Subcategory progress bars */}
                  {!isCollapsed && (
                    <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                      {def.subCategories.map(subCategory => {
                        const subMastery = subCategoryMasteries[subCategory] ?? 0;
                        const subName = SUB_CATEGORY_NAMES[subCategory];

                        return (
                          <SubcategoryBar
                            key={subCategory}
                            percentage={subMastery}
                            label={subName ?? { en: subCategory, my: subCategory }}
                            onClick={
                              subMastery < 50
                                ? () =>
                                    navigate(
                                      `/study?category=${encodeURIComponent(subCategory)}#cards`
                                    )
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </section>
      </StaggeredItem>
    </StaggeredList>
  );
}
