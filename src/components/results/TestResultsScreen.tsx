'use client';

/**
 * TestResultsScreen
 *
 * Comprehensive results screen shared between mock test and practice modes.
 * Provides score animation, confetti celebration, category breakdown,
 * filterable question review, SRS batch offer, and action buttons.
 *
 * Features:
 * - Big score number with CountUpScore animation + pass/fail indicator
 * - Confetti on passing (celebration intensity for pass, burst for completion)
 * - Sound effect (playMilestone on pass, playLevelUp on completion)
 * - Time taken display with comparison to previous attempts
 * - Category breakdown (strong/weak areas)
 * - Filterable question review with SRS integration
 * - Share button using native share API
 * - Bilingual end-reason message
 * - Weak area nudge
 * - Scroll to top on mount
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, RotateCcw, Home, ListFilter } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { CategoryBreakdown } from '@/components/results/CategoryBreakdown';
import { QuestionReviewList } from '@/components/results/QuestionReviewList';
import { ShareButton } from '@/components/social/ShareButton';
import { WeakAreaNudge } from '@/components/nudges/WeakAreaNudge';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { FadeIn } from '@/components/animations/StaggeredList';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useStreak } from '@/hooks/useStreak';
import { playMilestone, playLevelUp } from '@/lib/audio/soundEffects';
import { detectWeakAreas, getCategoryQuestionIds, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory, CategoryMasteryEntry } from '@/lib/mastery';
import { allQuestions as allQuestionsPool } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import type { QuestionResult, Question, TestEndReason } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TestResultsScreenProps {
  results: QuestionResult[];
  questions: Question[];
  mode: 'mock-test' | 'practice';
  endReason: TestEndReason | null;
  timeTaken?: number; // seconds (optional for practice mode)
  previousAttempts?: { score: number; total: number; date: string }[];
  skippedQuestionIds?: string[];
  showBurmese: boolean;
  onRetry: () => void;
  onReviewWrongOnly: () => void;
  onHome: () => void;
}

// ---------------------------------------------------------------------------
// Bilingual completion messages
// ---------------------------------------------------------------------------

const completionMessages: Record<TestEndReason, { en: string; my: string }> = {
  passThreshold: {
    en: 'USCIS interview stops after 12 correct answers. Great job reaching the passing threshold early!',
    my: 'အဖြေမှန် ၁၂ ချက်ဖြေဆိုပြီးလျှင်ရပ်တန့်ပါတယ်။ အောင်မြင်ပါတယ်!',
  },
  failThreshold: {
    en: 'Interview ended after 9 incorrect answers. Review the feedback below before retrying.',
    my: 'အမှား ၉ ကြိမ်ဖြေဆိုပြီးနောက်ရပ်တန့်လိုက်ပါတယ်။ အောက်ပါအကြံပြုချက်များကို ပြန်ကြည့်ပါ။',
  },
  time: {
    en: 'Time expired before the full set finished.',
    my: 'အချိန်ကုန်ချိန်မတိုင်မီ ပြီးဆုံးပါပြီ။',
  },
  complete: {
    en: 'You completed all questions. Well done!',
    my: 'မေးခွန်းအားလုံးဖြေဆိုပြီးပါပြီ။ အရမ်းကောင်းပါတယ်!',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Comprehensive results screen shared between mock test and practice.
 */
export function TestResultsScreen({
  results,
  questions,
  mode,
  endReason,
  timeTaken = 0,
  previousAttempts,
  skippedQuestionIds = [],
  showBurmese,
  onRetry,
  onReviewWrongOnly,
  onHome,
}: TestResultsScreenProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { categoryMasteries } = useCategoryMastery();
  const { currentStreak } = useStreak();

  const [showConfetti, setShowConfetti] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'skipped'>('all');
  const questionListRef = useRef<HTMLDivElement>(null);

  // Derived stats
  const correctCount = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Pass/fail logic
  const isPassing = mode === 'mock-test' ? correctCount >= 12 : percentage >= 60;

  // Time formatting
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeDisplay = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;

  // Previous attempt comparison
  const lastAttempt = previousAttempts?.[0];
  const improvement = lastAttempt ? correctCount - lastAttempt.score : null;

  // Share card data
  const shareCardData: ShareCardData | null = useMemo(() => {
    if (!isPassing && mode === 'mock-test') return null;

    const catMap: Record<string, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!catMap[r.category]) catMap[r.category] = { correct: 0, total: 0 };
      catMap[r.category].total += 1;
      if (r.isCorrect) catMap[r.category].correct += 1;
    }

    return {
      score: correctCount,
      total: totalCount,
      sessionType: mode === 'mock-test' ? 'test' : 'practice',
      streak: currentStreak,
      topBadge: null,
      categories: Object.entries(catMap).map(([name, stats]) => ({
        name,
        correct: stats.correct,
        total: stats.total,
      })),
      date: new Date().toISOString(),
    };
  }, [isPassing, mode, results, correctCount, totalCount, currentStreak]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Score count complete handler: fire confetti + sound
  const handleScoreCountComplete = useCallback(() => {
    setShowConfetti(true);
    if (isPassing) {
      playMilestone();
    } else {
      playLevelUp();
    }
  }, [isPassing]);

  // Review wrong only: scroll to question list with filter set to 'incorrect'
  const handleReviewWrongOnly = useCallback(() => {
    setReviewFilter('incorrect');
    onReviewWrongOnly();
    // Scroll to question review section
    setTimeout(() => {
      questionListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [onReviewWrongOnly]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <Confetti fire={showConfetti} intensity={isPassing ? 'celebration' : 'burst'} />

      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        {/* ---------------------------------------------------------------- */}
        {/* Header: Trophy + Score                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="text-center py-8">
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }
            }
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle"
          >
            <Trophy className={clsx('h-8 w-8', isPassing ? 'text-success' : 'text-warning')} />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'mock-test'
              ? strings.test.testComplete.en
              : strings.practice.practiceComplete.en}
          </h1>
          {showBurmese && (
            <p className="font-myanmar text-2xl text-muted-foreground mt-1">
              {mode === 'mock-test'
                ? strings.test.testComplete.my
                : strings.practice.practiceComplete.my}
            </p>
          )}

          {/* Score */}
          <div className="mt-6">
            <CountUpScore
              score={correctCount}
              total={totalCount}
              onComplete={handleScoreCountComplete}
            />
          </div>

          {/* Pass/Fail badge */}
          <FadeIn delay={1500}>
            <div className="mt-4">
              <span
                className={clsx(
                  'inline-block rounded-full px-4 py-1.5 text-sm font-bold',
                  isPassing ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                )}
              >
                {isPassing ? strings.test.passed.en : strings.test.needsWork.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">
                    {isPassing ? strings.test.passed.my : strings.test.needsWork.my}
                  </span>
                )}
              </span>
            </div>
          </FadeIn>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* End reason message                                               */}
        {/* ---------------------------------------------------------------- */}
        {endReason && (
          <FadeIn delay={800}>
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-primary">
                {completionMessages[endReason].en}
              </p>
              {showBurmese && completionMessages[endReason].my && (
                <p className="font-myanmar text-sm text-muted-foreground mt-0.5">
                  {completionMessages[endReason].my}
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Stats grid                                                       */}
        {/* ---------------------------------------------------------------- */}
        <FadeIn delay={600}>
          <div className={clsx('grid gap-4', timeTaken > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
            {/* Duration (only shown when timeTaken is provided) */}
            {timeTaken > 0 && (
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Duration
                  {showBurmese && (
                    <span className="font-myanmar normal-case tracking-normal ml-1">ကြာချိန်</span>
                  )}
                </p>
                <p className="text-2xl font-bold text-foreground">{timeDisplay}</p>
                {improvement !== null && (
                  <p
                    className={clsx(
                      'mt-1 text-xs font-semibold',
                      improvement > 0
                        ? 'text-success'
                        : improvement < 0
                          ? 'text-warning'
                          : 'text-muted-foreground'
                    )}
                  >
                    {improvement > 0 ? `+${improvement}` : improvement} vs last
                    {showBurmese && <span className="font-myanmar ml-1">ယခင်နှင့်</span>}
                  </p>
                )}
              </div>
            )}
            {/* Correct */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {strings.test.correct.en}
              </p>
              <p className="text-2xl font-bold text-success">{correctCount}</p>
            </div>
            {/* Incorrect */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {strings.test.incorrect.en}
              </p>
              <p className="text-2xl font-bold text-warning">{totalCount - correctCount}</p>
            </div>
            {/* Status */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Status
                {showBurmese && (
                  <span className="font-myanmar normal-case tracking-normal ml-1">အခြေအနေ</span>
                )}
              </p>
              <p
                className={clsx('text-2xl font-bold', isPassing ? 'text-success' : 'text-warning')}
              >
                {isPassing ? 'Pass' : 'Review'}
                {showBurmese && (
                  <span className="block font-myanmar text-sm font-normal">
                    {isPassing ? 'အောင်မြင်' : 'ပြန်လေ့လာပါ'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ---------------------------------------------------------------- */}
        {/* Action buttons                                                   */}
        {/* ---------------------------------------------------------------- */}
        <FadeIn delay={1000}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Retry */}
            <button
              type="button"
              onClick={onRetry}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-5 min-h-[48px] text-base font-bold',
                'bg-primary text-primary-foreground',
                'shadow-[0_4px_0_hsl(var(--primary-700))]',
                'active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                'hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'transition-all duration-100'
              )}
            >
              <RotateCcw className="h-4 w-4" />
              {strings.actions.tryAgain.en}
              {showBurmese && (
                <span className="font-myanmar text-sm font-normal ml-1">
                  {strings.actions.tryAgain.my}
                </span>
              )}
            </button>

            {/* Review wrong only (only if there are wrong answers) */}
            {results.some(r => !r.isCorrect) && (
              <button
                type="button"
                onClick={handleReviewWrongOnly}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full px-5 min-h-[48px] text-base font-bold',
                  'border border-border bg-card text-foreground',
                  'shadow-[0_4px_0_hsl(var(--border))]',
                  'active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[3px]',
                  'hover:bg-muted/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'transition-all duration-100'
                )}
              >
                <ListFilter className="h-4 w-4" />
                {strings.test.incorrectOnly.en}
              </button>
            )}

            {/* Home */}
            <button
              type="button"
              onClick={onHome}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-5 min-h-[48px] text-base font-bold',
                'border border-border bg-card text-foreground',
                'shadow-[0_4px_0_hsl(var(--border))]',
                'active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[3px]',
                'hover:bg-muted/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'transition-all duration-100'
              )}
            >
              <Home className="h-4 w-4" />
              {strings.actions.back.en}
              {showBurmese && (
                <span className="font-myanmar text-sm font-normal ml-1">
                  {strings.actions.back.my}
                </span>
              )}
            </button>

            {/* Share */}
            {shareCardData && <ShareButton data={shareCardData} />}
          </div>
        </FadeIn>

        {/* ---------------------------------------------------------------- */}
        {/* Category Breakdown                                               */}
        {/* ---------------------------------------------------------------- */}
        <FadeIn delay={1200}>
          <div className="mt-10">
            <SectionHeading
              text={{
                en: 'Category Breakdown',
                my: 'အမျိုးအစားခွဲခြမ်းချက်',
              }}
              className="mb-4"
            />
            <CategoryBreakdown results={results} showBurmese={showBurmese} />
          </div>
        </FadeIn>

        {/* ---------------------------------------------------------------- */}
        {/* Weak area nudge                                                  */}
        {/* ---------------------------------------------------------------- */}
        {(() => {
          const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
          const entries: CategoryMasteryEntry[] = categories.map(cat => ({
            categoryId: cat,
            mastery: categoryMasteries[cat] ?? 0,
            questionCount: getCategoryQuestionIds(cat, allQuestionsPool).length,
          }));
          const weak = detectWeakAreas(entries, 60).slice(0, 2);
          if (weak.length === 0) return null;

          return (
            <FadeIn delay={1400}>
              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <SectionHeading
                  text={{
                    en: 'Based on this test, consider reviewing:',
                    my: 'ဒီစာမေးပွဲအပေါ်အခြေခံ၍ ပြန်လည်လေ့လာရန်:',
                  }}
                  className="mb-3"
                />
                <div className="space-y-3">
                  {weak.map(w => (
                    <WeakAreaNudge
                      key={w.categoryId}
                      category={w.categoryId}
                      mastery={w.mastery}
                      isUnattempted={w.mastery === 0}
                      onPractice={() =>
                        navigate(`/practice?category=${encodeURIComponent(w.categoryId)}`)
                      }
                      onReview={() =>
                        navigate(`/study#category-${encodeURIComponent(w.categoryId)}`)
                      }
                    />
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })()}

        {/* ---------------------------------------------------------------- */}
        {/* Question Review                                                  */}
        {/* ---------------------------------------------------------------- */}
        <div ref={questionListRef} className="mt-10">
          <SectionHeading
            text={{
              en: 'Question Review',
              my: 'မေးခွန်းပြန်လည်သုံးသပ်ချက်',
            }}
            className="mb-4"
          />
          <QuestionReviewList
            results={results}
            skippedQuestionIds={skippedQuestionIds}
            questions={questions}
            mode={mode}
            showBurmese={showBurmese}
            filter={reviewFilter}
            onFilterChange={setReviewFilter}
          />
        </div>
      </div>
    </div>
  );
}
