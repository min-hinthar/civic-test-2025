'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Lightbulb, X } from 'lucide-react';
import { clsx } from 'clsx';
import { SPRING_BOUNCY, SPRING_SNAPPY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playPanelReveal } from '@/lib/audio/soundEffects';
import { hapticMedium } from '@/lib/haptics';
import {
  getRandomCorrectEncouragement,
  getRandomIncorrectEncouragement,
  strings,
} from '@/lib/i18n/strings';
import SpeechButton from '@/components/ui/SpeechButton';
import type { Explanation } from '@/types';
import type { QuizMode } from '@/lib/quiz/quizTypes';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FeedbackPanelProps {
  isCorrect: boolean;
  show: boolean;
  correctAnswer: string;
  correctAnswerMy?: string;
  userAnswer?: string;
  userAnswerMy?: string;
  explanation?: Explanation;
  /** Question ID for pre-generated audio lookup */
  questionId?: string;
  streakCount: number;
  mode: QuizMode;
  onContinue: () => void;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Animated icon sub-components
// ---------------------------------------------------------------------------

/** Bouncing checkmark for correct answers */
function CorrectIcon({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { scale: 0 }}
      animate={shouldReduceMotion ? {} : { scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_BOUNCY}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white"
    >
      <Check className="h-5 w-5" strokeWidth={3} />
    </motion.div>
  );
}

/** Shaking X for incorrect answers */
function IncorrectIcon({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { x: -8 }}
      animate={shouldReduceMotion ? {} : { x: 0 }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 12 }
      }
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning text-white"
    >
      <X className="h-5 w-5" strokeWidth={3} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Streak badge
// ---------------------------------------------------------------------------

function StreakBadge({
  count,
  shouldReduceMotion,
  showBurmese,
}: {
  count: number;
  shouldReduceMotion: boolean;
  showBurmese: boolean;
}) {
  if (count <= 1) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
      animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { ...SPRING_BOUNCY, delay: 0.15 }}
      className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success"
    >
      <span aria-hidden="true">&#x1F525;</span>
      <span>
        {count} in a row!
        {showBurmese && (
          <span className="ml-1 font-myanmar text-sm font-normal">{count} ဆက်တိုက်!</span>
        )}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Explanation section (Practice mode only)
// ---------------------------------------------------------------------------

function ExplanationSection({
  explanation,
  showBurmese,
  questionId,
}: {
  explanation: Explanation;
  showBurmese: boolean;
  questionId?: string;
}) {
  const explStrings = strings.explanations;

  return (
    <div className="mt-3 space-y-2 border-t border-warning/20 pt-3">
      {/* Brief explanation */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {explStrings.why.en}
          {showBurmese && <span className="ml-1 font-myanmar">{explStrings.why.my}</span>}
        </p>
        <p className="mt-1 text-sm text-foreground">{explanation.brief_en}</p>
        {showBurmese && (
          <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">
            {explanation.brief_my}
          </p>
        )}
        <div className="mt-2">
          <SpeechButton
            text={explanation.brief_en}
            questionId={questionId}
            audioType="e"
            label="Explain"
            ariaLabel="Listen to explanation"
            className="text-xs"
            stopPropagation
          />
        </div>
      </div>

      {/* Memory tip */}
      {explanation.mnemonic_en && (
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">
                {explStrings.memoryTip.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{explStrings.memoryTip.my}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-foreground">{explanation.mnemonic_en}</p>
              {showBurmese && explanation.mnemonic_my && (
                <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">
                  {explanation.mnemonic_my}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeedbackPanel
// ---------------------------------------------------------------------------

/**
 * Slide-up feedback panel with Duolingo-style color coding.
 *
 * Features:
 * - Slides up from bottom with spring animation
 * - Green band for correct, amber band for incorrect
 * - Animated bouncing checkmark (correct) or shaking X (incorrect)
 * - Streak counter badge for consecutive correct answers
 * - Bilingual support (English + Burmese)
 * - Explanation section with TTS in Practice mode
 * - Continue button + full panel tap to advance
 * - Auto-focuses Continue button on appear
 * - Reduced motion support
 * - role="status" + aria-live="polite" for screen readers
 * - Sound effect on panel reveal
 */
export function FeedbackPanel({
  isCorrect,
  show,
  correctAnswer,
  correctAnswerMy,
  userAnswer,
  userAnswerMy,
  explanation,
  questionId,
  streakCount,
  mode,
  onContinue,
  showBurmese,
}: FeedbackPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const hasPlayedSound = useRef(false);

  const encouragement = isCorrect
    ? getRandomCorrectEncouragement()
    : getRandomIncorrectEncouragement();

  // Auto-focus Continue button when panel appears
  useEffect(() => {
    if (show) {
      // Small delay to let animation start before focusing
      const timer = setTimeout(() => {
        continueButtonRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
    // Reset sound flag when panel hides
    hasPlayedSound.current = false;
  }, [show]);

  // Play panel reveal sound + haptic when shown
  // Haptic in useEffect is acceptable: panel reveal is always user-action-initiated
  // (answering a question triggers the feedback panel)
  useEffect(() => {
    if (show && !hasPlayedSound.current) {
      hasPlayedSound.current = true;
      playPanelReveal();
      hapticMedium();
    }
  }, [show]);

  // Panel click handler (advances to next, but not if clicking interactive elements)
  const handlePanelClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger continue if clicking a button or interactive element inside
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        return;
      }
      onContinue();
    },
    [onContinue]
  );

  const showExplanation = mode === 'practice' && !isCorrect && explanation;

  // Build screen reader announcement text
  const announcementText = (() => {
    if (!show) return '';
    if (mode === 'practice') {
      if (isCorrect) {
        return `Correct. ${explanation?.brief_en ?? ''}`.trim();
      }
      return `Incorrect. The answer is ${correctAnswer}. ${explanation?.brief_en ?? ''}`.trim();
    }
    // Mock test: simpler verdict (no explanation, simulation fidelity)
    if (isCorrect) {
      return 'Correct.';
    }
    return `Incorrect. The answer is ${correctAnswer}.`;
  })();

  return (
    <>
      {/* Screen reader announcement -- always in the DOM so live region detects content changes */}
      <div aria-live="assertive" className="sr-only">
        {show && announcementText}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : SPRING_SNAPPY}
            onClick={handlePanelClick}
            className={clsx(
              'w-full cursor-pointer border-t-4 px-4 py-4 sm:px-6',
              'min-h-[120px]',
              isCorrect ? 'border-success bg-success-subtle' : 'border-warning bg-warning-subtle'
            )}
          >
            <div className="mx-auto max-w-2xl">
              {/* Header row: icon + encouragement + streak */}
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CorrectIcon shouldReduceMotion={shouldReduceMotion} />
                ) : (
                  <IncorrectIcon shouldReduceMotion={shouldReduceMotion} />
                )}

                <div className="flex-1 min-w-0">
                  {/* Encouragement message */}
                  <p className="text-lg font-bold text-foreground">
                    {encouragement.en}
                    {showBurmese && (
                      <span className="block font-myanmar text-lg font-normal text-muted-foreground mt-0.5">
                        {encouragement.my}
                      </span>
                    )}
                  </p>

                  {/* Streak badge */}
                  <div className="mt-1">
                    <StreakBadge
                      count={streakCount}
                      shouldReduceMotion={shouldReduceMotion}
                      showBurmese={showBurmese}
                    />
                  </div>
                </div>
              </div>

              {/* Answer display */}
              <div className="mt-3 space-y-2">
                {/* Correct answer display (always shown) */}
                {isCorrect ? (
                  // Correct: show user's selected answer
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {userAnswer ?? correctAnswer}
                    </p>
                    {showBurmese && (userAnswerMy ?? correctAnswerMy) && (
                      <p className="font-myanmar text-sm text-muted-foreground">
                        {userAnswerMy ?? correctAnswerMy}
                      </p>
                    )}
                  </div>
                ) : (
                  // Incorrect: user's wrong pick (dimmed) + correct answer
                  <div className="space-y-2">
                    {userAnswer && (
                      <div className="opacity-50">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {strings.test.yourAnswer.en}
                          {showBurmese && (
                            <span className="ml-1 font-myanmar">{strings.test.yourAnswer.my}</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground line-through">{userAnswer}</p>
                        {showBurmese && userAnswerMy && (
                          <p className="font-myanmar text-sm text-muted-foreground line-through">
                            {userAnswerMy}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {strings.test.correctAnswer.en}
                        {showBurmese && (
                          <span className="ml-1 font-myanmar">{strings.test.correctAnswer.my}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{correctAnswer}</p>
                      {showBurmese && correctAnswerMy && (
                        <p className="font-myanmar text-sm text-muted-foreground">
                          {correctAnswerMy}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation (Practice mode only, incorrect only) */}
                {showExplanation && (
                  <ExplanationSection
                    explanation={explanation}
                    showBurmese={showBurmese}
                    questionId={questionId}
                  />
                )}
              </div>

              {/* Continue button - 3D chunky style */}
              <div className="mt-4">
                <button
                  ref={continueButtonRef}
                  type="button"
                  onClick={onContinue}
                  className={clsx(
                    'w-full rounded-xl px-6 py-3 text-base font-bold',
                    'shadow-[0_4px_0_hsl(var(--color-border))] active:shadow-[0_1px_0_hsl(var(--color-border))]',
                    'active:translate-y-[3px] transition-all duration-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isCorrect
                      ? 'bg-success text-white hover:bg-success/90'
                      : 'bg-warning text-white hover:bg-warning/90'
                  )}
                >
                  {strings.actions.continue.en}
                  {showBurmese && (
                    <span className="ml-2 font-myanmar text-sm font-normal">
                      {strings.actions.continue.my}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
