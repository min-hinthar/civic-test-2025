'use client';

/**
 * TestResultsScreen
 *
 * Comprehensive results screen shared between mock test and practice modes.
 * Multi-stage choreographed celebration that sequences card entrance,
 * score count-up, pass/fail reveal, confetti, sound, and action buttons.
 *
 * Choreography stages:
 * 1. Card entrance (slide up + scale in, ~500ms)
 * 2. Score count-up (dramatic easing, 1.5-2s)
 * 3. Pass/fail badge reveal (pop+bounce, ~300ms)
 * 4. Confetti + sound (celebrate() dispatch)
 * 5. Action buttons stagger (100ms gaps)
 *
 * Features:
 * - Two-act celebration arc: teaser confetti at pass threshold during count-up
 * - Pass: snappy ~2.5-3s total, fail: slower/gentler
 * - 100% perfect score: ultimate choreography (golden + fireworks + fanfare)
 * - Practice mode: light celebration, mini count-up
 * - Replay button on return visit
 * - Haptics at each stage: light -> medium -> heavy progression
 * - Background gradient shift during reveal
 * - Reduced motion: instant final state, sound still plays
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, RotateCcw, Home, ListFilter, PlayCircle } from 'lucide-react';
import { motion, useAnimationControls, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
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
import { useThemeContext } from '@/contexts/ThemeContext';
import { celebrate, isFirstTimeCelebration } from '@/hooks/useCelebration';
import {
  playCelebrationSequence,
  playFailReveal,
  playPracticeComplete,
} from '@/lib/audio/celebrationSounds';
import { hapticLight, hapticMedium, hapticHeavy } from '@/lib/haptics';
import { detectWeakAreas, getCategoryQuestionIds, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory, CategoryMasteryEntry } from '@/lib/mastery';
import { allQuestions as allQuestionsPool } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import type { QuestionResult, Question, TestEndReason } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChoreographyStage =
  | 'idle'
  | 'card-enter'
  | 'count-up'
  | 'pass-fail'
  | 'confetti'
  | 'buttons'
  | 'complete';

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
    my: '\u1021\u1016\u103C\u1031\u1019\u103E\u1014\u103A \u1041\u1042 \u1001\u103B\u1000\u103A\u1016\u103C\u1031\u1006\u102D\u102F\u1015\u103C\u102E\u101C\u103B\u103E\u1004\u103A\u101B\u1015\u103A\u1010\u1014\u1037\u103A\u1015\u102B\u1010\u101A\u103A\u104B \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1015\u102B\u1010\u101A\u103A!',
  },
  failThreshold: {
    en: 'Interview ended after 9 incorrect answers. Review the feedback below before retrying.',
    my: '\u1021\u1019\u103E\u102C\u1038 \u1049 \u1000\u103C\u102D\u1019\u103A\u1016\u103C\u1031\u1006\u102D\u102F\u1015\u103C\u102E\u1038\u1014\u1031\u102C\u1000\u103A\u101B\u1015\u103A\u1010\u1014\u1037\u103A\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1010\u101A\u103A\u104B \u1021\u1031\u102C\u1000\u103A\u1015\u102B\u1021\u1000\u103C\u1036\u1015\u103C\u102F\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1015\u103C\u1014\u103A\u1000\u103C\u100A\u1037\u103A\u1015\u102B\u104B',
  },
  time: {
    en: 'Time expired before the full set finished.',
    my: '\u1021\u1001\u103B\u102D\u1014\u103A\u1000\u102F\u1014\u103A\u1001\u103B\u102D\u1014\u103A\u1019\u1010\u102D\u102F\u1004\u103A\u1019\u102E \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u102B\u1015\u103C\u102E\u104B',
  },
  complete: {
    en: 'You completed all questions. Well done!',
    my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1016\u103C\u1031\u1006\u102D\u102F\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E\u104B \u1021\u101B\u1019\u103A\u1038\u1000\u1031\u102C\u1004\u103A\u1038\u1015\u102B\u1010\u101A\u103A!',
  },
};

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Comprehensive results screen shared between mock test and practice.
 * Multi-stage choreographed celebration for a cinematic results reveal.
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
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { categoryMasteries } = useCategoryMastery();
  const { currentStreak } = useStreak();
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';

  const [stage, setStage] = useState<ChoreographyStage>('idle');
  const [showGradient, setShowGradient] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'skipped'>('all');
  const questionListRef = useRef<HTMLDivElement>(null);
  const hasPlayedChoreography = useRef(false);
  const countUpResolveRef = useRef<(() => void) | null>(null);
  const tickIndexRef = useRef(0);
  const cardControls = useAnimationControls();
  const badgeControls = useAnimationControls();

  // Derived stats
  const correctCount = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Pass/fail logic
  const isPassing = mode === 'mock-test' ? correctCount >= 12 : percentage >= 60;
  const isPerfect = correctCount === totalCount && totalCount > 0;
  const isPractice = mode === 'practice';

  // Pass threshold for teaser confetti (mock: 12, practice: 60%)
  const passThreshold = mode === 'mock-test' ? 12 : Math.ceil(totalCount * 0.6);

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

  // -------------------------------------------------------------------------
  // Choreography engine
  // -------------------------------------------------------------------------

  const runChoreography = useCallback(
    async (signal: AbortSignal) => {
      try {
        if (signal.aborted) return;

        // --- Stage 1: Card entrance ---
        setStage('card-enter');
        hapticLight();
        playCelebrationSequence('card-enter');
        await cardControls.start({
          y: 0,
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 200, damping: 20 },
        });
        if (signal.aborted) return;

        // --- Stage 2: Count-up ---
        setStage('count-up');
        tickIndexRef.current = 0;
        await new Promise<void>(resolve => {
          countUpResolveRef.current = resolve;
        });
        if (signal.aborted) return;

        // Landing haptic + sound
        hapticMedium();
        playCelebrationSequence('count-up-land');

        // Brief gap before pass/fail reveal
        await sleep(100, signal);

        // --- Stage 3: Pass/fail badge ---
        setStage('pass-fail');
        hapticHeavy();
        if (isPassing) {
          playCelebrationSequence('pass-reveal');
        }
        await badgeControls.start({
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 400, damping: 15 },
        });
        if (signal.aborted) return;

        // --- Stage 4: Confetti + sound ---
        setStage('confetti');
        setShowGradient(true);

        if (isPassing) {
          celebrate({
            level: isPerfect ? 'ultimate' : 'celebration',
            source: isPerfect ? '100-percent' : 'test-pass',
            isFirstTime: isFirstTimeCelebration(isPerfect ? '100-percent' : 'test-pass'),
            isDarkMode,
          });
        } else {
          // Fail: no confetti, soft sound, gentle haptic
          playFailReveal();
          hapticLight();
        }

        // Gradient fade-out after 3s
        setTimeout(() => setShowGradient(false), 3000);

        await sleep(200, signal);

        // --- Stage 5: Buttons ---
        setStage('buttons');

        // Wait for buttons to cascade in (~400ms for 3-4 buttons)
        await sleep(500, signal);

        // --- Complete ---
        setStage('complete');
        hasPlayedChoreography.current = true;
      } catch (err) {
        // AbortError is expected on unmount -- silently ignore
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Re-throw unexpected errors
        throw err;
      }
    },
    [cardControls, badgeControls, isPassing, isPerfect, isDarkMode]
  );

  const runPracticeChoreography = useCallback(
    async (signal: AbortSignal) => {
      try {
        if (signal.aborted) return;

        // Faster card entrance
        setStage('card-enter');
        hapticLight();
        playPracticeComplete();
        await cardControls.start({
          y: 0,
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 200, damping: 20 },
        });
        if (signal.aborted) return;

        // Mini count-up
        setStage('count-up');
        tickIndexRef.current = 0;
        await new Promise<void>(resolve => {
          countUpResolveRef.current = resolve;
        });
        if (signal.aborted) return;

        hapticMedium();

        await sleep(100, signal);

        // Pass/fail badge
        setStage('pass-fail');
        hapticLight();
        await badgeControls.start({
          scale: 1,
          opacity: 1,
          transition: { type: 'spring', stiffness: 400, damping: 15 },
        });
        if (signal.aborted) return;

        // Light celebration
        setStage('confetti');
        celebrate({ level: 'sparkle', source: 'practice-complete', isDarkMode });

        await sleep(200, signal);

        setStage('buttons');
        await sleep(500, signal);

        setStage('complete');
        hasPlayedChoreography.current = true;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        throw err;
      }
    },
    [cardControls, badgeControls, isDarkMode]
  );

  // Launch choreography on mount
  useEffect(() => {
    if (hasPlayedChoreography.current) return;

    // Reduced motion: skip to final state immediately
    if (shouldReduceMotion) {
      setStage('complete');
      hasPlayedChoreography.current = true;
      // Still fire sound for reduced motion
      if (isPassing && !isPractice) {
        playCelebrationSequence('pass-reveal');
      } else if (isPractice) {
        playPracticeComplete();
      }
      return;
    }

    const controller = new AbortController();
    if (isPractice) {
      void runPracticeChoreography(controller.signal);
    } else {
      void runChoreography(controller.signal);
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  // Count-up complete: resolve the choreography promise
  const handleScoreCountComplete = useCallback(() => {
    countUpResolveRef.current?.();
    countUpResolveRef.current = null;
  }, []);

  // Count-up formatting/tick callback for sound sync
  const handleCountUpTick = useCallback(
    (currentValue: number) => {
      // Fire teaser confetti when crossing pass threshold during count-up
      if (
        !isPractice &&
        isPassing &&
        currentValue >= passThreshold &&
        tickIndexRef.current < passThreshold
      ) {
        celebrate({ level: 'sparkle', source: 'threshold-tease', isDarkMode });
      }

      // Play tick sound with rising pitch
      const idx = tickIndexRef.current;
      tickIndexRef.current = Math.round(currentValue);
      if (Math.round(currentValue) > idx) {
        playCelebrationSequence('count-up-tick', {
          consecutiveIndex: Math.round(currentValue),
          total: correctCount,
        });
      }
    },
    [isPractice, isPassing, passThreshold, correctCount, isDarkMode]
  );

  // Replay choreography
  const handleReplay = useCallback(() => {
    hasPlayedChoreography.current = false;
    setStage('idle');
    setShowGradient(false);
    tickIndexRef.current = 0;

    // Small delay to let state reset, then re-trigger
    const controller = new AbortController();
    setTimeout(() => {
      if (isPractice) {
        void runPracticeChoreography(controller.signal);
      } else {
        void runChoreography(controller.signal);
      }
    }, 50);
  }, [isPractice, runChoreography, runPracticeChoreography]);

  // Review wrong only: scroll to question list with filter
  const handleReviewWrongOnly = useCallback(() => {
    setReviewFilter('incorrect');
    onReviewWrongOnly();
    setTimeout(() => {
      questionListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [onReviewWrongOnly]);

  // -------------------------------------------------------------------------
  // Derived visibility flags
  // -------------------------------------------------------------------------

  const showCard = stage !== 'idle';
  const showCountUp = stage !== 'idle' && stage !== 'card-enter';
  const showBadge =
    stage === 'pass-fail' || stage === 'confetti' || stage === 'buttons' || stage === 'complete';
  const showButtons = stage === 'buttons' || stage === 'complete';
  const showContent = stage === 'complete' || shouldReduceMotion;
  const isComplete = stage === 'complete';

  // Button list (for stagger)
  const actionButtons = useMemo(() => {
    const btns: Array<{ key: string; element: React.ReactNode }> = [];

    btns.push({
      key: 'retry',
      element: (
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
      ),
    });

    if (results.some(r => !r.isCorrect)) {
      btns.push({
        key: 'review-wrong',
        element: (
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
        ),
      });
    }

    btns.push({
      key: 'home',
      element: (
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
            <span className="font-myanmar text-sm font-normal ml-1">{strings.actions.back.my}</span>
          )}
        </button>
      ),
    });

    if (shareCardData) {
      btns.push({
        key: 'share',
        element: <ShareButton data={shareCardData} />,
      });
    }

    return btns;
  }, [onRetry, onHome, handleReviewWrongOnly, showBurmese, results, shareCardData]);

  // Count-up duration based on mode and pass/fail
  const countUpDuration = isPractice ? 0.8 : isPassing ? 1.5 : 2;

  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-8">
      {/* -------------------------------------------------------------- */}
      {/* Background gradient overlay                                     */}
      {/* -------------------------------------------------------------- */}
      <AnimatePresence>
        {showGradient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={clsx(
              'pointer-events-none fixed inset-0 z-10',
              isPerfect
                ? 'bg-gradient-to-b from-amber-400/10 via-amber-300/5 to-transparent'
                : isPassing
                  ? 'bg-gradient-to-b from-amber-500/5 via-transparent to-transparent'
                  : 'bg-gradient-to-b from-orange-500/5 via-transparent to-transparent'
            )}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="glass-light relative z-20 p-6 shadow-2xl shadow-primary/20 transition duration-500 hover:-translate-y-1 hover:shadow-primary/30 focus-within:ring-2 focus-within:ring-primary/40">
        {/* -------------------------------------------------------------- */}
        {/* Header: Trophy + Score + Badge + Buttons (choreographed)       */}
        {/* -------------------------------------------------------------- */}
        <div className="text-center py-8">
          {/* Card entrance: trophy + title */}
          <motion.div
            initial={
              shouldReduceMotion
                ? { y: 0, scale: 1, opacity: 1 }
                : { y: 60, scale: 0.85, opacity: 0 }
            }
            animate={shouldReduceMotion ? { y: 0, scale: 1, opacity: 1 } : undefined}
            style={shouldReduceMotion ? undefined : { y: 60, scale: 0.85, opacity: 0 }}
          >
            {showCard && (
              <motion.div animate={cardControls}>
                <div
                  className={clsx(
                    'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                    isPerfect ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary-subtle'
                  )}
                >
                  <Trophy
                    className={clsx(
                      'h-8 w-8',
                      isPerfect ? 'text-amber-500' : isPassing ? 'text-success' : 'text-warning'
                    )}
                  />
                </div>

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
              </motion.div>
            )}
          </motion.div>

          {/* Score count-up */}
          {showCountUp && (
            <div className="mt-6">
              <CountUpScore
                score={correctCount}
                total={totalCount}
                duration={countUpDuration}
                delay={0}
                onComplete={handleScoreCountComplete}
                onUpdate={handleCountUpTick}
              />
            </div>
          )}

          {/* Reduced motion: show score immediately */}
          {shouldReduceMotion && !showCountUp && (
            <div className="mt-6">
              <span
                className={clsx(
                  'text-5xl font-bold tabular-nums',
                  isPassing ? 'text-success' : 'text-warning'
                )}
              >
                {correctCount}
              </span>
              <span className="text-xl text-muted-foreground"> / {totalCount}</span>
            </div>
          )}

          {/* Pass/fail badge */}
          {showBadge && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={badgeControls} className="mt-4">
              <span
                className={clsx(
                  'inline-block rounded-full px-4 py-1.5 text-sm font-bold',
                  isPerfect
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : isPassing
                      ? 'bg-success/15 text-success'
                      : 'bg-warning/15 text-warning'
                )}
              >
                {isPerfect
                  ? 'Perfect Score!'
                  : isPassing
                    ? strings.test.passed.en
                    : strings.test.needsWork.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">
                    {isPassing ? strings.test.passed.my : strings.test.needsWork.my}
                  </span>
                )}
              </span>
            </motion.div>
          )}

          {/* Reduced motion: show badge immediately */}
          {shouldReduceMotion && !showBadge && (
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
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* End reason message                                              */}
        {/* -------------------------------------------------------------- */}
        {endReason && showContent && (
          <FadeIn delay={200}>
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

        {/* -------------------------------------------------------------- */}
        {/* Action buttons (staggered cascade)                              */}
        {/* -------------------------------------------------------------- */}
        {showButtons && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actionButtons.map((btn, idx) => (
              <motion.div
                key={btn.key}
                initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        delay: idx * 0.1,
                      }
                }
              >
                {btn.element}
              </motion.div>
            ))}
          </div>
        )}

        {/* Replay button (only after choreography has completed at least once) */}
        {isComplete && hasPlayedChoreography.current && !shouldReduceMotion && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleReplay}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                'text-muted-foreground hover:text-foreground',
                'border border-transparent hover:border-border',
                'transition-colors duration-150'
              )}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Replay
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* Stats grid                                                      */}
        {/* -------------------------------------------------------------- */}
        {showContent && (
          <FadeIn delay={300}>
            <div
              className={clsx(
                'mt-8 grid gap-4',
                timeTaken > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
              )}
            >
              {/* Duration (only shown when timeTaken is provided) */}
              {timeTaken > 0 && (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Duration
                    {showBurmese && (
                      <span className="font-myanmar normal-case tracking-normal ml-1">
                        {'\u1000\u103C\u102C\u1001\u103B\u102D\u1014\u103A'}
                      </span>
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
                      {showBurmese && (
                        <span className="font-myanmar ml-1">
                          {'\u101A\u1001\u1004\u103A\u1014\u103E\u1004\u1037\u103A'}
                        </span>
                      )}
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
                    <span className="font-myanmar normal-case tracking-normal ml-1">
                      {'\u1021\u1001\u103C\u1031\u1021\u1014\u1031'}
                    </span>
                  )}
                </p>
                <p
                  className={clsx(
                    'text-2xl font-bold',
                    isPassing ? 'text-success' : 'text-warning'
                  )}
                >
                  {isPassing ? 'Pass' : 'Review'}
                  {showBurmese && (
                    <span className="block font-myanmar text-sm font-normal">
                      {isPassing
                        ? '\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A'
                        : '\u1015\u103C\u1014\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* -------------------------------------------------------------- */}
        {/* Category Breakdown                                              */}
        {/* -------------------------------------------------------------- */}
        {showContent && (
          <FadeIn delay={500}>
            <div className="mt-10">
              <SectionHeading
                text={{
                  en: 'Category Breakdown',
                  my: '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1001\u103D\u1032\u1001\u103C\u1019\u103A\u1038\u1001\u103B\u1000\u103A',
                }}
                className="mb-4"
              />
              <CategoryBreakdown results={results} showBurmese={showBurmese} />
            </div>
          </FadeIn>
        )}

        {/* -------------------------------------------------------------- */}
        {/* Weak area nudge                                                 */}
        {/* -------------------------------------------------------------- */}
        {showContent &&
          (() => {
            const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
            const entries: CategoryMasteryEntry[] = categories.map(cat => ({
              categoryId: cat,
              mastery: categoryMasteries[cat] ?? 0,
              questionCount: getCategoryQuestionIds(cat, allQuestionsPool).length,
            }));
            const weak = detectWeakAreas(entries, 60).slice(0, 2);
            if (weak.length === 0) return null;

            return (
              <FadeIn delay={700}>
                <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <SectionHeading
                    text={{
                      en: 'Based on this test, consider reviewing:',
                      my: '\u1012\u102E\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1021\u1015\u1031\u102B\u103A\u1021\u1001\u103C\u1031\u1001\u1036\u104D \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A:',
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
                          router.push(`/practice?category=${encodeURIComponent(w.categoryId)}`)
                        }
                        onReview={() =>
                          router.push(`/study#category-${encodeURIComponent(w.categoryId)}`)
                        }
                      />
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })()}

        {/* -------------------------------------------------------------- */}
        {/* Question Review                                                 */}
        {/* -------------------------------------------------------------- */}
        {showContent && (
          <div ref={questionListRef} className="mt-10">
            <SectionHeading
              text={{
                en: 'Question Review',
                my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101E\u102F\u1036\u1038\u101E\u1015\u103A\u1001\u103B\u1000\u103A',
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
        )}
      </div>
    </div>
  );
}
