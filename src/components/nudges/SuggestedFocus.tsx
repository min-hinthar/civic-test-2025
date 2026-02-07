'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { FadeIn } from '@/components/animations/StaggeredList';
import { WeakAreaNudge } from './WeakAreaNudge';
import {
  detectWeakAreas,
  detectStaleCategories,
  getNextMilestone,
  getEncouragingMessage,
  getLevelUpMessage,
  getCategoryQuestionIds,
  USCIS_CATEGORIES,
} from '@/lib/mastery';
import type { USCISCategory, CategoryMasteryEntry, StoredAnswer } from '@/lib/mastery';
import { allQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';

/** Maximum number of weak area cards to show */
const MAX_NUDGE_CARDS = 3;

/** Threshold below which a category is considered weak */
const WEAK_THRESHOLD = 60;

export interface SuggestedFocusProps {
  /** Mastery percentage (0-100) for each main USCIS category */
  categoryMasteries: Record<string, number>;
  /** Full answer history for stale category detection */
  answerHistory: StoredAnswer[];
}

/**
 * Dashboard section showing top weak/stale categories with nudge cards.
 *
 * Modes:
 * - Normal mode: Shows top 2-3 weak/stale categories as WeakAreaNudge cards
 * - Level-up mode: When all categories are above threshold, shows the
 *   category closest to the next milestone
 *
 * Prioritizes stale categories (not practiced recently) even if they
 * aren't the absolute weakest by mastery percentage.
 */
export function SuggestedFocus({ categoryMasteries, answerHistory }: SuggestedFocusProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const [encouragement] = useState(() => getEncouragingMessage());

  // Build category entries for weak area detection
  const categoryEntries = useMemo<CategoryMasteryEntry[]>(() => {
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
    return categories.map(cat => ({
      categoryId: cat,
      mastery: categoryMasteries[cat] ?? 0,
      questionCount: getCategoryQuestionIds(cat, allQuestions).length,
    }));
  }, [categoryMasteries]);

  // Build category-question map for stale detection
  const categoryQuestionMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
    for (const cat of categories) {
      map[cat] = getCategoryQuestionIds(cat, allQuestions);
    }
    return map;
  }, []);

  // Detect weak and stale categories
  const weakAreas = useMemo(
    () => detectWeakAreas(categoryEntries, WEAK_THRESHOLD),
    [categoryEntries]
  );

  const staleCategories = useMemo(
    () => detectStaleCategories(answerHistory, categoryQuestionMap),
    [answerHistory, categoryQuestionMap]
  );

  // Find unattempted categories (mastery = 0 and no answers)
  const unattemptedIds = useMemo(() => {
    const staleNeverPracticed = new Set(
      staleCategories.filter(s => s.lastPracticed === null).map(s => s.categoryId)
    );
    return staleNeverPracticed;
  }, [staleCategories]);

  // Merge and prioritize: stale categories first, then weak by mastery
  const prioritized = useMemo(() => {
    const staleIds = new Set(staleCategories.map(s => s.categoryId));
    const weakIds = new Set(weakAreas.map(w => w.categoryId));
    const allIds = new Set([...staleIds, ...weakIds]);

    type FocusItem = {
      category: string;
      mastery: number;
      isUnattempted: boolean;
      isStale: boolean;
      priority: number;
    };

    const items: FocusItem[] = [];
    for (const id of allIds) {
      const mastery = categoryMasteries[id] ?? 0;
      const isUnattempted = unattemptedIds.has(id);
      const isStale = staleIds.has(id) && !isUnattempted;

      // Priority: unattempted > stale > weak (lower number = higher priority)
      let priority = 3; // just weak
      if (isUnattempted) priority = 1;
      else if (isStale) priority = 2;

      items.push({ category: id, mastery, isUnattempted, isStale, priority });
    }

    // Sort by priority then mastery ascending
    items.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.mastery - b.mastery;
    });

    return items.slice(0, MAX_NUDGE_CARDS);
  }, [weakAreas, staleCategories, unattemptedIds, categoryMasteries]);

  // Level-up mode: all categories above threshold
  const isLevelUpMode = weakAreas.length === 0 && unattemptedIds.size === 0;

  // Find the category closest to next milestone for level-up mode
  const levelUpTarget = useMemo(() => {
    if (!isLevelUpMode) return null;

    let closestCategory: string | null = null;
    let smallestRemaining = Infinity;
    let bestMilestone: ReturnType<typeof getNextMilestone> = null;

    for (const entry of categoryEntries) {
      const milestone = getNextMilestone(entry.mastery);
      if (milestone && milestone.remaining < smallestRemaining) {
        smallestRemaining = milestone.remaining;
        closestCategory = entry.categoryId;
        bestMilestone = milestone;
      }
    }

    if (!closestCategory || !bestMilestone) return null;

    return {
      category: closestCategory,
      mastery: categoryMasteries[closestCategory] ?? 0,
      milestone: bestMilestone,
      message: getLevelUpMessage(
        closestCategory,
        categoryMasteries[closestCategory] ?? 0,
        bestMilestone.target
      ),
    };
  }, [isLevelUpMode, categoryEntries, categoryMasteries]);

  // Don't render if nothing to show (e.g., all gold with no next milestone)
  if (!isLevelUpMode && prioritized.length === 0) return null;
  if (isLevelUpMode && !levelUpTarget) return null;

  const handlePractice = (category: string) => {
    navigate(`/practice?category=${encodeURIComponent(category)}`);
  };

  const handleReview = (category: string) => {
    navigate(`/study#category-${encodeURIComponent(category)}`);
  };

  const handlePracticeAllWeak = () => {
    navigate('/practice');
  };

  return (
    <section className="mb-8">
      <FadeIn delay={200}>
        <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2 p-5 pb-0">
            <Lightbulb className="h-5 w-5 text-primary-500 shrink-0" />
            <SectionHeading text={strings.progress.suggestedFocus} className="mb-0" />
          </div>

          {/* Encouraging message */}
          <div className="px-5 pt-2 pb-1">
            <p className="text-sm text-muted-foreground">{encouragement.en}</p>
            {showBurmese && (
              <p className="text-xs text-muted-foreground font-myanmar">{encouragement.my}</p>
            )}
          </div>

          <div className="px-5 pb-5 pt-3">
            {isLevelUpMode && levelUpTarget ? (
              // Level-up mode
              <div className="space-y-3">
                <div
                  className={clsx(
                    'rounded-2xl border border-primary-500/20 p-4',
                    'bg-gradient-to-br from-primary-50/80 to-primary-100/40',
                    'dark:from-primary-500/5 dark:to-primary-500/10'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                      Level Up Mode
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    {levelUpTarget.message.en}
                  </p>
                  {showBurmese && (
                    <p className="text-xs text-muted-foreground font-myanmar mt-0.5">
                      {levelUpTarget.message.my}
                    </p>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => handlePractice(levelUpTarget.category)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5',
                        'text-sm font-semibold transition-colors min-h-[44px]',
                        'bg-primary-500 text-white hover:bg-primary-600'
                      )}
                    >
                      {strings.progress.practiceNow.en}
                      {showBurmese && (
                        <span className="font-myanmar text-xs ml-1">
                          {strings.progress.practiceNow.my}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Normal mode: weak/stale categories
              <div className="space-y-3">
                {prioritized.map(item => (
                  <WeakAreaNudge
                    key={item.category}
                    category={item.category}
                    mastery={item.mastery}
                    isUnattempted={item.isUnattempted}
                    onPractice={() => handlePractice(item.category)}
                    onReview={() => handleReview(item.category)}
                  />
                ))}

                {/* Practice all weak areas button */}
                {prioritized.length > 1 && (
                  <div className="flex justify-center pt-1">
                    <BilingualButton
                      label={strings.practice.practiceAllWeak}
                      variant="outline"
                      size="sm"
                      onClick={handlePracticeAllWeak}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
