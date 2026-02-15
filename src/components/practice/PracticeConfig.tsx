'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, Timer, ChevronDown, Zap, BookOpen, Award, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { PillTabBar } from '@/components/ui/PillTabBar';
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
  /** Per-session speech speed override */
  speedOverride?: 'slow' | 'normal' | 'fast';
  /** Per-session auto-read override */
  autoReadOverride?: boolean;
}

/** Speed pill options matching Settings page pattern */
const SPEED_OPTIONS: { value: 'slow' | 'normal' | 'fast'; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: '\u1014\u103E\u1031\u1038' },
  { value: 'normal', en: 'Normal', my: '\u1015\u102F\u1036\u1019\u103E\u1014\u103A' },
  { value: 'fast', en: 'Fast', my: '\u1019\u103C\u1014\u103A' },
];

interface PracticeConfigProps {
  onStart: (config: PracticeConfigType) => void;
}

type CountOption = 5 | 10 | 'full';

const categoryColorMap: Record<string, string> = {
  blue: 'text-primary',
  amber: 'text-warning',
  emerald: 'text-success',
};

const categoryBorderMap: Record<string, string> = {
  blue: 'border-primary/30 hover:border-primary/50',
  amber: 'border-warning/30 hover:border-warning/50',
  emerald: 'border-success/30 hover:border-success/50',
};

const categoryBgMap: Record<string, string> = {
  blue: 'bg-primary-subtle',
  amber: 'bg-warning-subtle',
  emerald: 'bg-emerald-50',
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
  const { isSupported: ttsSupported } = useTTS();
  const { settings: globalTTS } = useTTSSettings();

  const [selectedCategory, setSelectedCategory] = useState<
    USCISCategory | Category | 'weak' | null
  >(null);
  const [expandedCategory, setExpandedCategory] = useState<USCISCategory | null>(null);
  const [countOption, setCountOption] = useState<CountOption>(10);
  const [timerEnabled, setTimerEnabled] = useState(false);

  // Per-session speech overrides (initialized from global, NOT synced back)
  const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalTTS.rate);
  const [sessionAutoRead, setSessionAutoRead] = useState(globalTTS.autoRead);

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
      speedOverride: sessionSpeed,
      autoReadOverride: sessionAutoRead,
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
          'mb-6 flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors min-h-[56px]',
          selectedCategory === 'weak'
            ? 'border-primary bg-primary-subtle'
            : 'border-border hover:border-primary-400 bg-card'
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-subtle">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{strings.practice.practiceAllWeak.en}</p>
          {showBurmese && (
            <p className="font-myanmar text-sm text-muted-foreground">
              {strings.practice.practiceAllWeak.my}
            </p>
          )}
        </div>
        <Zap className="h-5 w-5 text-primary" />
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
                  'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors min-h-[56px]',
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
                  className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors min-h-[44px]',
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
          <PillTabBar
            tabs={[
              {
                id: '5',
                label: `5 \u00B7 ${strings.practice.quick.en}`,
                labelMy: strings.practice.quick.my,
              },
              {
                id: '10',
                label: `10 \u00B7 ${strings.practice.standard.en}`,
                labelMy: strings.practice.standard.my,
              },
              {
                id: 'full',
                label: `${selectedQuestionCount} \u00B7 ${strings.practice.full.en}`,
                labelMy: strings.practice.full.my,
              },
            ]}
            activeTab={String(countOption)}
            onTabChange={id => setCountOption(id === 'full' ? 'full' : (Number(id) as 5 | 10))}
            ariaLabel="Question count"
            showBurmese={showBurmese}
            size="sm"
          />
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
              timerEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
            role="switch"
            aria-checked={timerEnabled}
            aria-label="Toggle timer"
          >
            <motion.span
              className="inline-block h-5 w-5 rounded-full bg-surface shadow-sm"
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

      {/* Speech options */}
      {selectedCategory && ttsSupported && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Speech Speed</p>
            {showBurmese && (
              <span className="font-myanmar text-xs text-muted-foreground">
                {
                  '\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038'
                }
              </span>
            )}
          </div>

          {/* Speed pill selector */}
          <div className="flex gap-2" role="radiogroup" aria-label="Speech speed">
            {SPEED_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={sessionSpeed === option.value}
                onClick={() => setSessionSpeed(option.value)}
                className={clsx(
                  'flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition-all duration-150 min-h-[44px]',
                  sessionSpeed === option.value
                    ? 'border-primary bg-primary-subtle text-primary shadow-[0_2px_0_0] shadow-primary-200'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                )}
              >
                <span>{option.en}</span>
                {showBurmese && (
                  <span className="block font-myanmar text-xs mt-0.5 font-normal">{option.my}</span>
                )}
              </button>
            ))}
          </div>

          {/* Auto-read toggle */}
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/40">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Read</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1021\u101C\u102D\u102F\u1021\u101C\u103B\u103E\u1031\u102C\u1000\u103A\u1016\u1010\u103A\u1015\u102B'
                  }
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sessionAutoRead}
              aria-label="Toggle auto-read"
              onClick={() => setSessionAutoRead(prev => !prev)}
              className="relative inline-flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span
                className={clsx(
                  'inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent transition-colors duration-200',
                  sessionAutoRead ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-6 w-6 rounded-full bg-surface shadow-md ring-0 transition-transform duration-200',
                    sessionAutoRead ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Mastered category warning */}
      {selectedCategory && selectedCategory !== 'weak' && isMastered && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-amber-500/30 bg-warning-subtle p-4"
        >
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 shrink-0 text-warning mt-0.5" />
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
                  className="inline-flex items-center rounded-full px-3 py-1 min-h-[36px] bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                >
                  {USCIS_CATEGORY_NAMES[weakestCategory].en}
                </button>{' '}
                instead?
              </p>
              <button
                onClick={handleStart}
                className="mt-2 inline-flex items-center rounded-full px-4 py-2 min-h-[36px] bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
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
            variant="chunky"
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
