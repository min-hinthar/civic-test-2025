'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, Timer, ChevronDown, Zap, BookOpen, Award } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { strings } from '@/lib/i18n/strings';
import {
  USCIS_CATEGORIES,
  USCIS_CATEGORY_NAMES,
  SUB_CATEGORY_NAMES,
  CATEGORY_COLORS,
  getCategoryQuestionIds,
} from '@/lib/mastery';
import type { USCISCategory, CategoryName } from '@/lib/mastery';
import type { Category } from '@/types';
import { allQuestions } from '@/constants/questions';

/** Configuration output from PracticeConfig */
export interface PracticeConfigType {
  /** Selected category (main or sub) or 'weak' for all weak areas */
  category: USCISCategory | Category | 'weak';
  /** Category display name */
  categoryName: CategoryName;
  /** Number of questions to practice */
  count: number;
  /** Whether timer is enabled */
  timerEnabled: boolean;
}

interface PracticeConfigProps {
  onStart: (config: PracticeConfigType) => void;
}

type CountOption = 5 | 10 | 'full';

const categoryColorMap: Record<string, string> = {
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  emerald: 'text-emerald-500',
};

const categoryBorderMap: Record<string, string> = {
  blue: 'border-blue-500/30 hover:border-blue-500/50',
  amber: 'border-amber-500/30 hover:border-amber-500/50',
  emerald: 'border-emerald-500/30 hover:border-emerald-500/50',
};

const categoryBgMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10',
  amber: 'bg-amber-50 dark:bg-amber-500/10',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
};

/**
 * Practice configuration screen.
 *
 * Features:
 * - "Practice All Weak Areas" prominent option at top
 * - 3 main USCIS category cards with CategoryRing mastery indicators
 * - Expandable sub-categories within each main category
 * - Question count pills: Quick (5), Standard (10), Full (all)
 * - Timer toggle (off by default)
 * - Mastered category handling with redirection suggestion
 * - Staggered animation for category card entrance
 */
export function PracticeConfig({ onStart }: PracticeConfigProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const { categoryMasteries, subCategoryMasteries, isLoading } = useCategoryMastery();

  const [selectedCategory, setSelectedCategory] = useState<
    USCISCategory | Category | 'weak' | null
  >(null);
  const [expandedCategory, setExpandedCategory] = useState<USCISCategory | null>(null);
  const [countOption, setCountOption] = useState<CountOption>(10);
  const [timerEnabled, setTimerEnabled] = useState(false);

  const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

  // Calculate question counts per selection
  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat] = getCategoryQuestionIds(cat, allQuestions).length;
      const def = USCIS_CATEGORIES[cat];
      for (const sub of def.subCategories) {
        counts[sub] = getCategoryQuestionIds(sub, allQuestions).length;
      }
    }
    return counts;
  }, [categories]);

  // Find weakest category for mastered suggestion
  const weakestCategory = useMemo(() => {
    let lowest: USCISCategory = categories[0];
    let lowestMastery = Infinity;
    for (const cat of categories) {
      const mastery = categoryMasteries[cat] ?? 0;
      if (mastery < lowestMastery) {
        lowestMastery = mastery;
        lowest = cat;
      }
    }
    return lowest;
  }, [categories, categoryMasteries]);

  const selectedMastery =
    selectedCategory && selectedCategory !== 'weak'
      ? (categoryMasteries[selectedCategory] ?? subCategoryMasteries[selectedCategory] ?? 0)
      : 0;

  const isMastered = selectedMastery >= 100;

  const selectedQuestionCount =
    selectedCategory && selectedCategory !== 'weak'
      ? (questionCounts[selectedCategory] ?? 0)
      : allQuestions.length;

  const actualCount =
    countOption === 'full' ? selectedQuestionCount : Math.min(countOption, selectedQuestionCount);

  const getCategoryDisplayName = (cat: USCISCategory | Category | 'weak'): CategoryName => {
    if (cat === 'weak') return strings.practice.practiceAllWeak;
    if (cat in USCIS_CATEGORY_NAMES) return USCIS_CATEGORY_NAMES[cat as USCISCategory];
    if (cat in SUB_CATEGORY_NAMES) return SUB_CATEGORY_NAMES[cat as Category];
    return { en: cat, my: cat };
  };

  const handleStart = () => {
    if (!selectedCategory) return;
    onStart({
      category: selectedCategory,
      categoryName: getCategoryDisplayName(selectedCategory),
      count: actualCount,
      timerEnabled,
    });
  };

  const handleCategorySelect = (cat: USCISCategory | Category | 'weak') => {
    setSelectedCategory(cat);
  };

  const toggleExpanded = (cat: USCISCategory) => {
    setExpandedCategory(prev => (prev === cat ? null : cat));
  };

  const staggerDelay = (index: number) => (shouldReduceMotion ? 0 : 0.08 * index + 0.1);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8">
      <BilingualHeading
        text={strings.practice.practiceMode}
        level={1}
        size="2xl"
        centered
        className="mb-2"
      />
      <p className="text-center text-sm text-muted-foreground mb-8">
        {strings.practice.selectCategory.en}
        {showBurmese && (
          <span className="block font-myanmar">{strings.practice.selectCategory.my}</span>
        )}
      </p>

      {/* Practice All Weak Areas - prominent option */}
      <motion.button
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: staggerDelay(0) }}
        onClick={() => handleCategorySelect('weak')}
        className={clsx(
          'mb-6 flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors',
          selectedCategory === 'weak'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-border hover:border-primary-400 bg-card'
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
          <Target className="h-6 w-6 text-primary-500" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{strings.practice.practiceAllWeak.en}</p>
          {showBurmese && (
            <p className="font-myanmar text-sm text-muted-foreground">
              {strings.practice.practiceAllWeak.my}
            </p>
          )}
        </div>
        <Zap className="h-5 w-5 text-primary-400" />
      </motion.button>

      {/* Category cards */}
      <div className="space-y-3">
        {categories.map((cat, index) => {
          const def = USCIS_CATEGORIES[cat];
          const color = CATEGORY_COLORS[cat];
          const mastery = categoryMasteries[cat] ?? 0;
          const isSelected = selectedCategory === cat;
          const isExpanded = expandedCategory === cat;
          const qCount = questionCounts[cat];

          return (
            <motion.div
              key={cat}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: staggerDelay(index + 1) }}
            >
              {/* Main category card */}
              <button
                onClick={() => handleCategorySelect(cat)}
                className={clsx(
                  'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors',
                  isSelected
                    ? `${categoryBorderMap[color]} ${categoryBgMap[color]} border-2`
                    : 'border-border bg-card hover:border-border/80'
                )}
              >
                <CategoryRing
                  percentage={mastery}
                  color={categoryColorMap[color]}
                  size={56}
                  strokeWidth={5}
                >
                  <span className="text-xs font-bold text-foreground">{mastery}%</span>
                </CategoryRing>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {USCIS_CATEGORY_NAMES[cat].en}
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-muted-foreground truncate">
                      {USCIS_CATEGORY_NAMES[cat].my}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{qCount} questions</p>
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    toggleExpanded(cat);
                  }}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label={`Expand ${cat} sub-categories`}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>
              </button>

              {/* Sub-categories */}
              {isExpanded && (
                <div className="ml-8 mt-2 space-y-2">
                  {def.subCategories.map(sub => {
                    const subMastery = subCategoryMasteries[sub] ?? 0;
                    const subCount = questionCounts[sub];
                    const isSubSelected = selectedCategory === sub;

                    return (
                      <button
                        key={sub}
                        onClick={() => handleCategorySelect(sub)}
                        className={clsx(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                          isSubSelected
                            ? `${categoryBorderMap[color]} ${categoryBgMap[color]}`
                            : 'border-border/60 bg-card/50 hover:border-border'
                        )}
                      >
                        <CategoryRing
                          percentage={subMastery}
                          color={categoryColorMap[color]}
                          size={40}
                          strokeWidth={4}
                        >
                          <span className="text-[10px] font-bold text-foreground">
                            {subMastery}%
                          </span>
                        </CategoryRing>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {SUB_CATEGORY_NAMES[sub].en}
                          </p>
                          {showBurmese && (
                            <p className="font-myanmar text-xs text-muted-foreground truncate">
                              {SUB_CATEGORY_NAMES[sub].my}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">{subCount} questions</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Question count pills */}
      {selectedCategory && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            {strings.practice.questionCount.en}
            {showBurmese && (
              <span className="ml-2 font-myanmar text-muted-foreground font-normal">
                {strings.practice.questionCount.my}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {([5, 10, 'full'] as CountOption[]).map(option => {
              const isActive = countOption === option;
              const label =
                option === 5
                  ? strings.practice.quick
                  : option === 10
                    ? strings.practice.standard
                    : strings.practice.full;
              const displayCount = option === 'full' ? selectedQuestionCount : option;

              return (
                <button
                  key={String(option)}
                  onClick={() => setCountOption(option)}
                  className={clsx(
                    'flex-1 rounded-xl border-2 px-3 py-2.5 text-center transition-colors',
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'border-border bg-card text-foreground hover:border-primary-300'
                  )}
                >
                  <span className="block text-lg font-bold">{displayCount}</span>
                  <span className="block text-xs text-muted-foreground">{label.en}</span>
                  {showBurmese && (
                    <span className="block font-myanmar text-xs text-muted-foreground">
                      {label.my}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Timer toggle */}
      {selectedCategory && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{strings.practice.timer.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {strings.practice.timer.my}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setTimerEnabled(prev => !prev)}
            className={clsx(
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
              timerEnabled ? 'bg-primary-500' : 'bg-muted-foreground/30'
            )}
            role="switch"
            aria-checked={timerEnabled}
            aria-label="Toggle timer"
          >
            <motion.span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
              animate={{ x: timerEnabled ? 22 : 2 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 500, damping: 30 }
              }
            />
          </button>
          <span className="text-xs text-muted-foreground ml-2">
            {timerEnabled ? strings.practice.timerOn.en : strings.practice.timerOff.en}
          </span>
        </motion.div>
      )}

      {/* Mastered category warning */}
      {selectedCategory && selectedCategory !== 'weak' && isMastered && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-500/10"
        >
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {strings.practice.alreadyMastered.en}
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {strings.practice.alreadyMastered.my}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Want to practice{' '}
                <button
                  onClick={() => handleCategorySelect(weakestCategory)}
                  className="font-semibold text-primary-500 underline"
                >
                  {USCIS_CATEGORY_NAMES[weakestCategory].en}
                </button>{' '}
                instead?
              </p>
              <button onClick={handleStart} className="mt-2 text-xs font-semibold text-primary-500">
                {strings.practice.practiceAnyway.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.practice.practiceAnyway.my}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Start button */}
      {selectedCategory && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <BilingualButton
            label={strings.practice.startPractice}
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStart}
            disabled={isLoading}
            icon={<BookOpen className="h-5 w-5" />}
          />
          {selectedCategory !== 'weak' && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {getCategoryDisplayName(selectedCategory).en} ({selectedMastery}%) - {actualCount}{' '}
              questions
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
