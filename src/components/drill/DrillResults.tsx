'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import CountUp from 'react-countup';
import { ArrowRight, RotateCcw, Home } from 'lucide-react';
import { DrillBadge } from './DrillBadge';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { ReadinessRing } from '@/components/hub/ReadinessRing';
import { celebrate } from '@/hooks/useCelebration';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE } from '@/lib/motion-config';
import type { Question, QuestionResult } from '@/types';
import type { CategoryName } from '@/lib/mastery';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DrillResultsProps {
  /** Results from the drill session */
  results: QuestionResult[];
  /** Questions used in the drill */
  questions: Question[];
  /** How many questions were in the drill config (for partial completion) */
  totalQuestionCount: number;
  /** Mastery before drill (0-100) */
  preDrillMastery: number;
  /** Mastery after drill (0-100, from refreshed hook) */
  postDrillMastery: number;
  /** Readiness score before drill (0-100) */
  preDrillReadiness: number;
  /** Readiness score after drill (0-100, from refreshed hook) */
  postDrillReadiness: number;
  /** Drill mode */
  mode: 'weak-all' | 'category';
  /** Weakest category name for "Practice [Category]" button */
  categoryName?: CategoryName;
  /** Show Burmese translations */
  showBurmese: boolean;
  /** Start a new drill */
  onNewDrill: () => void;
  /** Navigate to practice the weakest category */
  onPracticeCategory: () => void;
  /** Navigate back to dashboard */
  onBackToDashboard: () => void;
}

// ---------------------------------------------------------------------------
// Animation timing constants
// ---------------------------------------------------------------------------

const SCORE_DELAY_MS = 500;
const MASTERY_DELAY_MS = 1500;
const READINESS_DELAY_MS = 2000;
const CELEBRATION_DELAY_MS = 2500;

/**
 * Animation phases:
 * 0 = initial (only score visible)
 * 1 = mastery section visible
 * 2 = readiness ring visible
 * 3 = celebration fired
 */
const PHASE_MASTERY = 1;
const PHASE_READINESS = 2;
const PHASE_CELEBRATION = 3;

// ---------------------------------------------------------------------------
// Mastery delta color helper
// ---------------------------------------------------------------------------

function getDeltaColor(delta: number): string {
  if (delta > 0) return 'text-emerald-500';
  if (delta < 0) return 'text-amber-500';
  return 'text-muted-foreground';
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}%`;
  if (delta < 0) return `${delta}%`;
  return '0%';
}

// ---------------------------------------------------------------------------
// DrillResults Component
// ---------------------------------------------------------------------------

/**
 * Post-drill results with mastery delta, celebration, and readiness ring animation.
 *
 * Features:
 * - Headline score with CountUpScore animation
 * - Mastery delta with animated counter (green for improvement, amber for decline)
 * - Mini ReadinessRing animating from pre to post drill value
 * - Tiered celebration: confetti (80%+), sparkle (50-79%), motivational (<50%)
 * - Partial completion note
 * - Three action buttons: New Drill, Practice [Category], Back to Dashboard
 * - All text localized for Burmese
 *
 * Animation uses a single phase counter to avoid setState-in-effect violations.
 * Reduced motion shows all content immediately (phase initialized to final value).
 */
export function DrillResults({
  results,
  totalQuestionCount,
  preDrillMastery,
  postDrillMastery,
  preDrillReadiness,
  postDrillReadiness,
  mode,
  categoryName,
  showBurmese,
  onNewDrill,
  onPracticeCategory,
  onBackToDashboard,
}: DrillResultsProps) {
  const { theme } = useThemeContext();
  const shouldReduceMotion = useReducedMotion();
  const ringId = useId();

  // Single animation phase counter -- init to final phase for reduced motion
  const [animPhase, setAnimPhase] = useState(() => (shouldReduceMotion ? PHASE_CELEBRATION : 0));

  // Derived visibility from animation phase
  const showMastery = animPhase >= PHASE_MASTERY;
  const showReadiness = animPhase >= PHASE_READINESS;

  // Readiness value: show pre-drill until readiness phase reached, then post-drill
  const readinessValue = useMemo(
    () => (showReadiness ? postDrillReadiness : preDrillReadiness),
    [showReadiness, postDrillReadiness, preDrillReadiness]
  );

  const correctCount = results.filter(r => r.isCorrect).length;
  const accuracy = results.length > 0 ? correctCount / results.length : 0;
  const isPartial = results.length < totalQuestionCount;
  const masteryDelta = Math.round(postDrillMastery - preDrillMastery);
  const isDarkMode = theme === 'dark';

  // Staggered animation timing via setTimeout callbacks (async -- not direct setState in effect)
  useEffect(() => {
    if (shouldReduceMotion) return;

    const timers = [
      setTimeout(() => setAnimPhase(PHASE_MASTERY), MASTERY_DELAY_MS),
      setTimeout(() => setAnimPhase(PHASE_READINESS), READINESS_DELAY_MS),
      setTimeout(() => setAnimPhase(PHASE_CELEBRATION), CELEBRATION_DELAY_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, [shouldReduceMotion]);

  // Celebration effect -- fires when animPhase reaches PHASE_CELEBRATION
  useEffect(() => {
    if (animPhase < PHASE_CELEBRATION) return;

    if (accuracy >= 0.8) {
      celebrate({ level: 'celebration', source: 'drill-complete', isDarkMode });
    } else if (accuracy >= 0.5) {
      celebrate({ level: 'sparkle', source: 'drill-good', isDarkMode });
    }
  }, [animPhase, accuracy, isDarkMode]);

  // Stable formatting function for CountUp (avoid re-render restarts)
  const formatMastery = useCallback((n: number): string => `${Math.round(n)}%`, []);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
        className="flex flex-col items-center text-center"
      >
        <DrillBadge showBurmese={showBurmese} />
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Drill Complete
          {showBurmese && (
            <span className="mt-1 block font-myanmar text-lg text-muted-foreground">
              {
                '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1001\u1014\u103A\u1038 \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u102B\u1015\u103C\u102E'
              }
            </span>
          )}
        </h1>

        {/* Partial completion note */}
        {isPartial && (
          <p className="mt-1 text-sm text-muted-foreground">
            Completed {results.length} of {totalQuestionCount} questions
            {showBurmese && (
              <span className="ml-1 font-myanmar">
                ({'\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038'} {results.length} /{' '}
                {totalQuestionCount}{' '}
                {'\u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1001\u1032\u1037'})
              </span>
            )}
          </p>
        )}
      </motion.div>

      {/* Headline score */}
      <div className="mt-8 flex flex-col items-center">
        <CountUpScore
          score={correctCount}
          total={results.length}
          delay={SCORE_DELAY_MS}
          size="lg"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {correctCount} of {results.length} correct
          {showBurmese && (
            <span className="ml-1 font-myanmar">
              ({correctCount} / {results.length} {'\u1019\u103E\u1014\u103A\u1000\u1014\u103A'})
            </span>
          )}
        </p>
      </div>

      {/* Mastery delta section */}
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={showMastery ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
        className="mt-8 rounded-xl border border-border bg-card p-4 text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Mastery
          {showBurmese && (
            <span className="ml-1 font-myanmar font-normal">
              {
                '\u101E\u1004\u103A\u1037\u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F'
              }
            </span>
          )}
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-lg tabular-nums text-muted-foreground">{preDrillMastery}%</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {showMastery ? (
              <CountUp
                start={preDrillMastery}
                end={postDrillMastery}
                duration={1.5}
                decimals={0}
                formattingFn={formatMastery}
              />
            ) : (
              `${preDrillMastery}%`
            )}
          </span>
          {showMastery && masteryDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className={clsx('text-sm font-bold', getDeltaColor(masteryDelta))}
            >
              {formatDelta(masteryDelta)}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Mini readiness ring section */}
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={showReadiness ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
        className="mt-6 flex flex-col items-center"
      >
        <div key={ringId}>
          <ReadinessRing percentage={readinessValue} size={80} strokeWidth={10} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Your readiness: {preDrillReadiness}% {'\u2192'} {postDrillReadiness}%
          {showBurmese && (
            <span className="ml-1 font-myanmar">
              ({'\u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1019\u103E\u102F'}:{' '}
              {preDrillReadiness}% {'\u2192'} {postDrillReadiness}%)
            </span>
          )}
        </p>
      </motion.div>

      {/* Motivational text for <50% accuracy */}
      {accuracy < 0.5 && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: shouldReduceMotion ? 0 : CELEBRATION_DELAY_MS / 1000,
            duration: 0.5,
          }}
          className="mt-6 rounded-xl bg-amber-500/10 p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            Tough set! Review these topics and try again.
          </p>
          {showBurmese && (
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">
              {
                '\u1001\u1000\u103A\u1001\u1032\u101C\u103E\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B\u1010\u1032\u1037! \u1024\u1001\u1031\u102B\u1004\u103A\u1038\u1005\u1025\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u103C\u102E\u1038 \u1011\u1015\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B'
              }
            </p>
          )}
        </motion.div>
      )}

      {/* Encouragement for no improvement */}
      {masteryDelta <= 0 && accuracy >= 0.5 && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: shouldReduceMotion ? 0 : CELEBRATION_DELAY_MS / 1000,
            duration: 0.5,
          }}
          className="mt-6 rounded-xl bg-blue-500/10 p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            Every practice session makes you stronger!
          </p>
          {showBurmese && (
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">
              {
                '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1019\u103E\u102F\u1010\u102D\u102F\u1004\u103A\u1038\u1000 \u101E\u1004\u103A\u1037\u1000\u102D\u102F \u1015\u102D\u102F\u1019\u102D\u102F \u1021\u102C\u1038\u1000\u103C\u102D\u102F\u1038\u1014\u1031\u1015\u102B\u101E\u100A\u103A!'
              }
            </p>
          )}
        </motion.div>
      )}

      {/* Post-drill action buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {/* New Drill - primary orange */}
        <button
          type="button"
          onClick={onNewDrill}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold',
            'bg-orange-500 text-white shadow-md',
            'hover:bg-orange-600 active:bg-orange-700',
            'transition-colors'
          )}
        >
          <RotateCcw className="h-4 w-4" />
          New Drill
          {showBurmese && (
            <span className="font-myanmar text-sm font-normal">
              {
                '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1001\u1014\u103A\u1038 \u1021\u101E\u1005\u103A'
              }
            </span>
          )}
        </button>

        {/* Practice [Category] - secondary (weak-all mode only) */}
        {mode === 'weak-all' && categoryName && (
          <button
            type="button"
            onClick={onPracticeCategory}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
              'border-2 border-border bg-card text-foreground',
              'hover:bg-muted/50',
              'transition-colors'
            )}
          >
            Practice {categoryName.en}
            {showBurmese && categoryName.my && (
              <span className="font-myanmar font-normal">
                {'\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B'} {categoryName.my}
              </span>
            )}
          </button>
        )}

        {/* Back to Dashboard - ghost */}
        <button
          type="button"
          onClick={onBackToDashboard}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium',
            'text-muted-foreground',
            'hover:bg-muted/30 hover:text-foreground',
            'transition-colors'
          )}
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
          {showBurmese && (
            <span className="font-myanmar font-normal">
              {
                '\u1015\u1004\u103A\u1019\u1005\u102C\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u102D\u102F\u1037 \u1015\u103C\u1014\u103A\u101E\u103D\u102C\u1038\u1019\u100A\u103A'
              }
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
