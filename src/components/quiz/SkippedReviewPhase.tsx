'use client';

import { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_GENTLE, SPRING_SNAPPY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { playCorrect, playIncorrect } from '@/lib/audio/soundEffects';
import { hapticLight, hapticDouble } from '@/lib/haptics';
import { AnswerOptionGroup } from '@/components/quiz/AnswerOption';
import { FeedbackPanel } from '@/components/quiz/FeedbackPanel';
import { SegmentedProgressBar } from '@/components/quiz/SegmentedProgressBar';
import type { SegmentStatus } from '@/components/quiz/SegmentedProgressBar';
import { quizReducer, initialQuizState } from '@/lib/quiz/quizReducer';
import SpeechButton from '@/components/ui/SpeechButton';
import type { Question, QuestionResult } from '@/types';
import type { PracticeSnapshot } from '@/lib/sessions/sessionTypes';

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const reviewLabels = {
  reviewingSkipped: {
    en: 'Reviewing Skipped Questions',
    my: 'ကျော်ခဲ့သော မေးခွန်းများ ပြန်လည်စစ်ဆေးခြင်း',
  },
  ofSkipped: {
    en: 'of',
    my: 'မှ',
  },
  skipped: {
    en: 'skipped',
    my: 'ကျော်ခဲ့',
  },
  finishWithout: {
    en: 'Finish Without Reviewing',
    my: 'မစစ်ဆေးဘဲ ပြီးဆုံးရန်',
  },
  check: {
    en: 'Check',
    my: 'စစ်ဆေးပါ',
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SkippedReviewPhaseProps {
  questions: Question[];
  skippedIndices: number[];
  existingResults: QuestionResult[];
  onComplete: (results: QuestionResult[]) => void;
  showBurmese: boolean;
  sessionId?: string;
  practiceConfig?: PracticeSnapshot['config'];
}

// ---------------------------------------------------------------------------
// SkippedReviewPhase
// ---------------------------------------------------------------------------

/**
 * Review phase for skipped questions at end of practice quiz.
 *
 * Features:
 * - Presents skipped questions in original order
 * - Uses the same Check/Continue flow as the main quiz
 * - No skip button available (you already skipped once)
 * - Progress bar shows only skipped questions as segments
 * - "Finish Without Reviewing" bail-out option (skipped = incorrect)
 * - Animated entrance (slide in from bottom with SPRING_GENTLE)
 * - When all reviewed, calls onComplete with combined results
 */
export function SkippedReviewPhase({
  questions,
  skippedIndices,
  existingResults,
  onComplete,
  showBurmese: _showBurmeseProp,
  sessionId: _sessionId,
  practiceConfig: _practiceConfig,
}: SkippedReviewPhaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const checkDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Internal quiz state for the review phase
  const [quizState, dispatch] = useReducer(
    quizReducer,
    {
      mode: 'practice' as const,
      questionCount: skippedIndices.length,
      allowSkipReview: false,
      allowSegmentTap: false,
      showLiveScore: false,
      showExplanation: true,
    },
    initialQuizState
  );

  // Track review results separately from the reducer's results
  const [reviewResults, setReviewResults] = useState<QuestionResult[]>([]);

  // Current review index (uses currentIndex from the internal quiz state)
  const currentReviewIndex = quizState.currentIndex;
  const currentSkippedOriginalIndex = skippedIndices[currentReviewIndex];
  const currentQuestion = questions[currentSkippedOriginalIndex] ?? null;

  // Build segment statuses for the review progress bar
  const segments: SegmentStatus[] = skippedIndices.map((_, i) => {
    if (i < reviewResults.length) {
      return reviewResults[i].isCorrect ? 'correct' : 'incorrect';
    }
    if (i === currentReviewIndex) {
      return 'current';
    }
    return 'unanswered';
  });

  const correctCount = reviewResults.filter(r => r.isCorrect).length;

  // Handle answer selection
  const handleSelect = useCallback(
    (answer: (typeof questions)[0]['answers'][0]) => {
      if (quizState.phase !== 'answering') return;
      dispatch({ type: 'SELECT_ANSWER', answer });
    },
    [quizState.phase]
  );

  // Handle Check press
  const handleCheck = useCallback(() => {
    if (quizState.phase !== 'answering' || !quizState.selectedAnswer) return;

    dispatch({ type: 'CHECK' });

    // Brief intentional delay before showing feedback
    checkDelayRef.current = setTimeout(() => {
      checkDelayRef.current = null;

      if (!currentQuestion) return;

      const isCorrect = quizState.selectedAnswer!.correct;
      const correctAnswer = currentQuestion.answers.find(a => a.correct)!;

      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        selectedAnswer: quizState.selectedAnswer!,
        correctAnswer,
        isCorrect,
        category: currentQuestion.category,
      };

      // Play sound + haptic
      if (isCorrect) {
        playCorrect();
        hapticLight();
      } else {
        playIncorrect();
        hapticDouble();
      }

      dispatch({ type: 'SHOW_FEEDBACK', result, isCorrect });
    }, 250);
  }, [quizState.phase, quizState.selectedAnswer, currentQuestion]);

  // Handle Continue (after feedback)
  const handleContinue = useCallback(() => {
    if (quizState.phase !== 'feedback') return;

    // Collect the result from the latest quiz state
    const latestResult = quizState.results[quizState.results.length - 1];
    if (latestResult) {
      setReviewResults(prev => [...prev, latestResult]);
    }

    dispatch({ type: 'CONTINUE' });
  }, [quizState.phase, quizState.results]);

  // Handle transition complete
  useEffect(() => {
    if (quizState.phase !== 'transitioning') return;

    const timer = setTimeout(
      () => {
        dispatch({ type: 'TRANSITION_COMPLETE' });
      },
      shouldReduceMotion ? 0 : 300
    );

    return () => clearTimeout(timer);
  }, [quizState.phase, shouldReduceMotion]);

  // Detect finished state -- use ref to avoid calling onComplete in effect body repeatedly
  const hasCompletedRef = useRef(false);
  useEffect(() => {
    if (quizState.phase === 'finished' && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      // Combine existing results with review results
      // Use quizState.results which has all reviewed answers
      onComplete([...existingResults, ...quizState.results]);
    }
  }, [quizState.phase, existingResults, quizState.results, onComplete]);

  // Handle "Finish Without Reviewing"
  const handleFinishWithout = useCallback(() => {
    // Remaining skipped questions count as incorrect
    const answeredSoFar = reviewResults.length;
    const remainingIndices = skippedIndices.slice(answeredSoFar);
    const incorrectResults: QuestionResult[] = remainingIndices.map(idx => {
      const q = questions[idx];
      const correctAnswer = q.answers.find(a => a.correct)!;
      return {
        questionId: q.id,
        questionText_en: q.question_en,
        questionText_my: q.question_my,
        selectedAnswer: correctAnswer, // Placeholder
        correctAnswer,
        isCorrect: false,
        category: q.category,
      };
    });

    onComplete([...existingResults, ...reviewResults, ...incorrectResults]);
  }, [skippedIndices, reviewResults, questions, existingResults, onComplete]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkDelayRef.current) {
        clearTimeout(checkDelayRef.current);
      }
    };
  }, []);

  if (!currentQuestion || quizState.phase === 'finished') {
    return null;
  }

  const isChecking = quizState.phase === 'checked';
  const isFeedback = quizState.phase === 'feedback';
  const isLocked = isChecking || isFeedback;
  const correctAnswer = currentQuestion.answers.find(a => a.correct);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0.15 } : SPRING_GENTLE}
      className="mx-auto max-w-5xl px-4 pb-16 pt-6"
    >
      {/* Review header */}
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold text-foreground">{reviewLabels.reviewingSkipped.en}</h2>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground mt-0.5">
            {reviewLabels.reviewingSkipped.my}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {currentReviewIndex + 1} {reviewLabels.ofSkipped.en} {skippedIndices.length}{' '}
          {reviewLabels.skipped.en}
          {showBurmese && (
            <span className="ml-1 font-myanmar">
              {currentReviewIndex + 1} {reviewLabels.ofSkipped.my} {skippedIndices.length}{' '}
              {reviewLabels.skipped.my}
            </span>
          )}
        </p>
      </div>

      {/* Progress bar for review questions only */}
      <div className="mb-6">
        <SegmentedProgressBar
          segments={segments}
          currentIndex={currentReviewIndex}
          totalCount={skippedIndices.length}
          correctCount={correctCount}
          showLiveScore
          showBurmese={showBurmese}
        />
      </div>

      {/* Question card */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        {/* Question area with slide-left transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSkippedOriginalIndex}
            initial={shouldReduceMotion ? { opacity: 0 } : { x: 60, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: -60, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : SPRING_SNAPPY}
          >
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                {currentQuestion.category}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground leading-snug">
                {currentQuestion.question_en}
              </p>
              {showBurmese && (
                <p className="mt-2 text-base text-muted-foreground font-myanmar leading-relaxed">
                  {currentQuestion.question_my}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <SpeechButton
                  text={currentQuestion.question_en}
                  questionId={currentQuestion.id}
                  audioType="q"
                  label="Question"
                  ariaLabel="Play question audio"
                />
              </div>
            </div>

            {/* Answer options */}
            <div className="mt-6">
              <AnswerOptionGroup
                answers={currentQuestion.answers}
                selectedAnswer={quizState.selectedAnswer}
                isLocked={isLocked}
                correctAnswer={isLocked ? correctAnswer : undefined}
                onSelect={handleSelect}
                showBurmese={showBurmese}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Check button (no Skip in review) */}
        {!isFeedback && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCheck}
              disabled={!quizState.selectedAnswer || isChecking}
              className={clsx(
                'w-full rounded-xl px-6 py-3 text-base font-bold',
                'min-h-[48px]',
                'transition-all duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                quizState.selectedAnswer && !isChecking
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              )}
            >
              {reviewLabels.check.en}
              {showBurmese && (
                <span className="ml-2 font-myanmar text-sm font-normal">
                  {reviewLabels.check.my}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Feedback panel */}
        <div className="mt-4">
          <FeedbackPanel
            isCorrect={quizState.isCorrect ?? false}
            show={isFeedback}
            correctAnswer={correctAnswer?.text_en ?? ''}
            correctAnswerMy={correctAnswer?.text_my}
            userAnswer={quizState.selectedAnswer?.text_en}
            userAnswerMy={quizState.selectedAnswer?.text_my}
            explanation={currentQuestion.explanation}
            questionId={currentQuestion.id}
            streakCount={quizState.streakCount}
            mode="practice"
            onContinue={handleContinue}
            showBurmese={showBurmese}
          />
        </div>

        {/* Finish Without Reviewing button */}
        {!isFeedback && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleFinishWithout}
              className={clsx(
                'w-full rounded-xl px-4 py-2.5 text-sm font-medium',
                'border-2 border-border bg-transparent text-muted-foreground',
                'hover:bg-muted/30 hover:text-foreground',
                'transition-colors duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              {reviewLabels.finishWithout.en}
              {showBurmese && (
                <span className="ml-2 font-myanmar text-xs">{reviewLabels.finishWithout.my}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
