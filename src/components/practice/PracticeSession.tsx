'use client';

import { useCallback, useState, useEffect, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import SpeechButton from '@/components/ui/SpeechButton';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { useAutoRead } from '@/hooks/useAutoRead';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { getBurmeseAudioUrl } from '@/lib/audio/burmeseAudio';
import { CircularTimer } from '@/components/test/CircularTimer';
import { AnswerOptionGroup } from '@/components/quiz/AnswerOption';
import { FeedbackPanel } from '@/components/quiz/FeedbackPanel';
import { SegmentedProgressBar } from '@/components/quiz/SegmentedProgressBar';
import type { SegmentStatus } from '@/components/quiz/SegmentedProgressBar';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { SkipButton } from '@/components/quiz/SkipButton';
import { SkippedReviewPhase } from '@/components/quiz/SkippedReviewPhase';
import { StreakReward, STREAK_DISPLAY_DURATION_MS } from '@/components/quiz/StreakReward';
import { XPPopup } from '@/components/quiz/XPPopup';
import { quizReducer, initialQuizState } from '@/lib/quiz/quizReducer';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { saveSession } from '@/lib/sessions/sessionStore';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { PracticeSnapshot } from '@/lib/sessions/sessionTypes';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playCorrect, playIncorrect } from '@/lib/audio/soundEffects';
import { hapticLight, hapticDouble } from '@/lib/haptics';
import type { Answer, Question, QuestionResult } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRACTICE_DURATION_SECONDS = 20 * 60;
const CHECK_DELAY_MS = 250;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PracticeSessionProps {
  /** Questions to practice */
  questions: Question[];
  /** Whether timer is enabled */
  timerEnabled: boolean;
  /** Called when all questions are answered */
  onComplete: (results: QuestionResult[]) => void;
  /** Session ID for persistence (optional -- when provided, saves to IndexedDB) */
  sessionId?: string;
  /** Practice config for persistence metadata */
  practiceConfig?: PracticeSnapshot['config'];
  /** Initial results when resuming a saved session */
  initialResults?: QuestionResult[];
  /** Initial question index when resuming a saved session */
  initialIndex?: number;
  /** Initial skipped indices when resuming a saved session */
  initialSkippedIndices?: number[];
  /** Per-session speech speed override from PracticeConfig */
  speedOverride?: 'slow' | 'normal' | 'fast';
  /** Per-session auto-read override from PracticeConfig */
  autoReadOverride?: boolean;
}

// ---------------------------------------------------------------------------
// Segment tap review dialog
// ---------------------------------------------------------------------------

interface SegmentReviewDialogProps {
  question: Question;
  result: QuestionResult;
  onClose: () => void;
  showBurmese: boolean;
  shouldReduceMotion: boolean;
}

function SegmentReviewDialog({
  question,
  result,
  onClose,
  showBurmese,
  shouldReduceMotion,
}: SegmentReviewDialogProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          aria-label="Close review"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Question */}
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          {question.category}
        </p>
        <p className="mt-2 text-base font-bold text-foreground leading-snug">
          {question.question_en}
        </p>
        {showBurmese && (
          <p className="mt-1.5 text-sm text-muted-foreground font-myanmar leading-relaxed">
            {question.question_my}
          </p>
        )}

        {/* User's answer */}
        <div className="mt-4 space-y-2">
          <div
            className={clsx(
              'rounded-xl border p-3',
              result.isCorrect
                ? 'border-success/30 bg-success-subtle'
                : 'border-warning/30 bg-warning-subtle'
            )}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              {strings.test.yourAnswer.en}
              {showBurmese && (
                <span className="ml-1 font-myanmar">{strings.test.yourAnswer.my}</span>
              )}
            </p>
            <p
              className={clsx(
                'mt-1 text-sm font-medium',
                result.isCorrect ? 'text-foreground' : 'text-foreground line-through'
              )}
            >
              {result.selectedAnswer.text_en}
            </p>
            {showBurmese && result.selectedAnswer.text_my && (
              <p className="font-myanmar text-sm text-muted-foreground">
                {result.selectedAnswer.text_my}
              </p>
            )}
          </div>

          {/* Correct answer (shown when wrong) */}
          {!result.isCorrect && (
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                {strings.test.correctAnswer.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.test.correctAnswer.my}</span>
                )}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {result.correctAnswer.text_en}
              </p>
              {showBurmese && result.correctAnswer.text_my && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  {result.correctAnswer.text_my}
                </p>
              )}
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div className="mt-2 border-t border-border/50 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {strings.explanations.why.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.explanations.why.my}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-foreground">{question.explanation.brief_en}</p>
              {showBurmese && (
                <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">
                  {question.explanation.brief_my}
                </p>
              )}
              <div className="mt-2">
                <SpeechButton
                  text={question.explanation.brief_en}
                  label="Listen"
                  ariaLabel="Listen to explanation"
                  className="text-xs"
                  stopPropagation
                />
              </div>
            </div>
          )}
        </div>

        {/* Close button at bottom */}
        <button
          onClick={onClose}
          className={clsx(
            'mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold',
            'bg-muted text-foreground hover:bg-muted/80',
            'transition-colors duration-100'
          )}
        >
          {strings.actions.back.en}
          {showBurmese && (
            <span className="ml-2 font-myanmar text-xs">{strings.actions.back.my}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Exit confirm dialog (inline)
// ---------------------------------------------------------------------------

interface ExitConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  showBurmese: boolean;
  shouldReduceMotion: boolean;
}

function ExitConfirmInline({
  open,
  onConfirm,
  onCancel,
  showBurmese,
  shouldReduceMotion,
}: ExitConfirmProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl text-center">
        <h3 className="text-lg font-bold text-foreground">{strings.quiz.exit.en}?</h3>
        {showBurmese && (
          <p className="mt-1 font-myanmar text-sm text-muted-foreground">{strings.quiz.exit.my}?</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Your progress is saved. You can resume this session later.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className={clsx(
              'flex-1 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold',
              'text-foreground hover:bg-muted/30 transition-colors'
            )}
          >
            {strings.quiz.continue.en}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold',
              'bg-warning text-white hover:bg-warning/90 transition-colors'
            )}
          >
            {strings.quiz.exit.en}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PracticeSession
// ---------------------------------------------------------------------------

/**
 * Practice session component with Check/Continue flow and educational features.
 *
 * Features:
 * - Quiz state machine via useReducer(quizReducer)
 * - Check/Continue flow (no auto-advance)
 * - Explanations shown in FeedbackPanel (Practice only)
 * - Live score tally in SegmentedProgressBar
 * - Tappable segments for read-only review of answered questions
 * - Skip button with amber segments; skipped questions reviewed at end
 * - Session persistence with skippedIndices
 * - Slide-left question transitions
 * - Exit confirmation dialog
 * - Timer pauses during feedback
 * - SRS marking batched at end
 */
export function PracticeSession({
  questions,
  timerEnabled,
  onComplete,
  sessionId,
  practiceConfig,
  initialResults,
  initialIndex,
  initialSkippedIndices,
  speedOverride,
  autoReadOverride,
}: PracticeSessionProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { settings: tts } = useTTSSettings();

  // Per-session effective values (override > global setting)
  const effectiveSpeed = speedOverride ?? tts.rate;
  const effectiveAutoRead = autoReadOverride ?? tts.autoRead;
  const speedLabel = { slow: '0.75x', normal: '1x', fast: '1.25x' }[effectiveSpeed];
  const numericRate = { slow: 0.7, normal: 0.98, fast: 1.3 }[effectiveSpeed];
  const checkDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Streak/XP micro-reward state
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpPoints, setXpPoints] = useState(10);

  // Quiz state machine
  const [quizState, dispatch] = useReducer(quizReducer, null, () => {
    const state = initialQuizState({
      mode: 'practice',
      questionCount: questions.length,
      allowSkipReview: true,
      allowSegmentTap: true,
      showLiveScore: true,
      showExplanation: true,
    });
    // Restore from saved session if available
    if (initialResults && initialResults.length > 0) {
      return {
        ...state,
        currentIndex: initialIndex ?? initialResults.length,
        results: initialResults,
        skippedIndices: initialSkippedIndices ?? [],
      };
    }
    return state;
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION_SECONDS);

  // Exit confirm
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Segment tap review
  const [reviewSegmentIndex, setReviewSegmentIndex] = useState<number | null>(null);

  // Track whether we are in skipped-review sub-phase
  const isInSkippedReview = quizState.phase === 'skipped-review';
  const isFinished = quizState.phase === 'finished';

  const currentQuestion =
    !isFinished && !isInSkippedReview ? (questions[quizState.currentIndex] ?? null) : null;

  // Auto-read question on question change (only during answering phase, not during feedback)
  useAutoRead({
    text: currentQuestion?.question_en ?? '',
    enabled:
      effectiveAutoRead && !isFinished && !isInSkippedReview && quizState.phase === 'answering',
    triggerKey: quizState.currentIndex,
    lang: 'en-US',
    autoReadLang: tts.autoReadLang,
    burmeseAudioUrl:
      showBurmese && currentQuestion
        ? getBurmeseAudioUrl(currentQuestion.id, 'q', tts.burmeseVoice)
        : undefined,
    burmeseRate: numericRate,
  });

  // Derived state
  const correctCount = quizState.results.filter(r => r.isCorrect).length;
  const isFeedback = quizState.phase === 'feedback';
  const isChecking = quizState.phase === 'checked';
  const isLocked = isChecking || isFeedback;

  // Build segment statuses
  const segments: SegmentStatus[] = questions.map((_, i) => {
    // Check if this index has a result
    const result = quizState.results.find(r => r.questionId === questions[i].id);
    if (result) {
      return result.isCorrect ? 'correct' : 'incorrect';
    }
    // Check if skipped
    if (quizState.skippedIndices.includes(i)) {
      return 'skipped';
    }
    // Current
    if (i === quizState.currentIndex && !isFinished && !isInSkippedReview) {
      return 'current';
    }
    return 'unanswered';
  });

  // Get correct answer for current question
  const correctAnswer = currentQuestion?.answers.find(a => a.correct);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  // Answer selection
  const handleSelect = useCallback(
    (answer: Answer) => {
      if (quizState.phase !== 'answering') return;
      dispatch({ type: 'SELECT_ANSWER', answer });
    },
    [quizState.phase]
  );

  // Check button
  const handleCheck = useCallback(() => {
    if (quizState.phase !== 'answering' || !quizState.selectedAnswer || !currentQuestion) return;

    dispatch({ type: 'CHECK' });

    // Brief intentional delay before showing feedback
    checkDelayRef.current = setTimeout(() => {
      checkDelayRef.current = null;

      const isCorrect = quizState.selectedAnswer!.correct;
      const correctAns = currentQuestion.answers.find(a => a.correct)!;

      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        selectedAnswer: quizState.selectedAnswer!,
        correctAnswer: correctAns,
        isCorrect,
        category: currentQuestion.category,
      };

      // Sound + haptic
      if (isCorrect) {
        playCorrect();
        hapticLight();
      } else {
        playIncorrect();
        hapticDouble();
      }

      dispatch({ type: 'SHOW_FEEDBACK', result, isCorrect });

      // Trigger streak/XP micro-rewards on correct answers
      if (isCorrect) {
        const newStreak = quizState.streakCount + 1;
        setXpPoints(newStreak >= 3 ? 15 : 10);
        setShowXP(true);
        setShowStreakReward(true);

        if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
        streakTimerRef.current = setTimeout(() => {
          setShowStreakReward(false);
          setShowXP(false);
          streakTimerRef.current = null;
        }, STREAK_DISPLAY_DURATION_MS);
      }

      // Save session snapshot (fire-and-forget)
      if (sessionId && practiceConfig) {
        const snapshot: PracticeSnapshot = {
          id: sessionId,
          type: 'practice',
          savedAt: new Date().toISOString(),
          version: SESSION_VERSION,
          questions,
          results: [...quizState.results, result],
          currentIndex: quizState.currentIndex + 1,
          timerEnabled,
          timeLeft,
          skippedIndices: quizState.skippedIndices,
          config: practiceConfig,
        };
        saveSession(snapshot).catch(() => {});
      }
    }, CHECK_DELAY_MS);
  }, [
    quizState.phase,
    quizState.selectedAnswer,
    quizState.results,
    quizState.currentIndex,
    quizState.skippedIndices,
    quizState.streakCount,
    currentQuestion,
    sessionId,
    practiceConfig,
    questions,
    timerEnabled,
    timeLeft,
  ]);

  // Continue after feedback
  const handleContinue = useCallback(() => {
    if (quizState.phase !== 'feedback') return;
    setShowStreakReward(false);
    setShowXP(false);
    dispatch({ type: 'CONTINUE' });
  }, [quizState.phase]);

  // Skip
  const handleSkip = useCallback(() => {
    if (quizState.phase !== 'answering') return;
    dispatch({ type: 'SKIP' });

    // Save session with skip
    if (sessionId && practiceConfig) {
      const newSkipped = [...quizState.skippedIndices, quizState.currentIndex];
      const snapshot: PracticeSnapshot = {
        id: sessionId,
        type: 'practice',
        savedAt: new Date().toISOString(),
        version: SESSION_VERSION,
        questions,
        results: quizState.results,
        currentIndex: quizState.currentIndex + 1,
        timerEnabled,
        timeLeft,
        skippedIndices: newSkipped,
        config: practiceConfig,
      };
      saveSession(snapshot).catch(() => {});
    }
  }, [
    quizState.phase,
    quizState.skippedIndices,
    quizState.currentIndex,
    quizState.results,
    sessionId,
    practiceConfig,
    questions,
    timerEnabled,
    timeLeft,
  ]);

  // Transition complete
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

  // Segment tap for review
  const handleSegmentTap = useCallback(
    (index: number) => {
      // Only allow tapping answered or skipped segments
      const status = segments[index];
      if (status === 'correct' || status === 'incorrect' || status === 'skipped') {
        setReviewSegmentIndex(index);
      }
    },
    [segments]
  );

  const handleCloseReview = useCallback(() => {
    setReviewSegmentIndex(null);
  }, []);

  // Exit confirmation
  const handleExitRequest = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleExitConfirm = useCallback(() => {
    setShowExitConfirm(false);
    // Complete with current results (partial)
    onComplete(quizState.results);
  }, [onComplete, quizState.results]);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Skipped review complete
  const handleSkippedReviewComplete = useCallback(
    (combinedResults: QuestionResult[]) => {
      // Batch SRS marking at end
      for (const result of combinedResults) {
        recordAnswer({
          questionId: result.questionId,
          isCorrect: result.isCorrect,
          sessionType: 'practice',
        });
      }
      onComplete(combinedResults);
    },
    [onComplete]
  );

  // Handle finished state (no skipped questions to review)
  const hasCompletedRef = useRef(false);
  useEffect(() => {
    if (isFinished && !hasCompletedRef.current) {
      hasCompletedRef.current = true;

      // Batch SRS marking at end
      for (const result of quizState.results) {
        recordAnswer({
          questionId: result.questionId,
          isCorrect: result.isCorrect,
          sessionType: 'practice',
        });
      }

      onComplete(quizState.results);
    }
  }, [isFinished, quizState.results, onComplete]);

  // Timer countdown (pauses during feedback)
  useEffect(() => {
    if (!timerEnabled || isFinished || isInSkippedReview || isFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch({ type: 'FINISH' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, isFinished, isInSkippedReview, isFeedback]);

  // Navigation lock (beforeunload)
  useEffect(() => {
    if (isFinished) return;

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isFinished]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (checkDelayRef.current) {
        clearTimeout(checkDelayRef.current);
      }
      if (streakTimerRef.current) {
        clearTimeout(streakTimerRef.current);
      }
    };
  }, []);

  // Keyboard navigation (TPUX-06): context-sensitive Enter + Escape
  useEffect(() => {
    if (isFinished || isInSkippedReview) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (quizState.phase === 'answering' && quizState.selectedAnswer) {
          e.preventDefault();
          handleCheck();
        } else if (quizState.phase === 'feedback') {
          e.preventDefault();
          handleContinue();
        }
      } else if (e.key === 'Escape' && !showExitConfirm) {
        e.preventDefault();
        setShowExitConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFinished,
    isInSkippedReview,
    quizState.phase,
    quizState.selectedAnswer,
    showExitConfirm,
    handleCheck,
    handleContinue,
  ]);

  // -----------------------------------------------------------------------
  // Skipped review phase
  // -----------------------------------------------------------------------

  if (isInSkippedReview) {
    return (
      <SkippedReviewPhase
        questions={questions}
        skippedIndices={quizState.skippedIndices}
        existingResults={quizState.results}
        onComplete={handleSkippedReviewComplete}
        showBurmese={showBurmese}
        sessionId={sessionId}
        practiceConfig={practiceConfig}
      />
    );
  }

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Preparing your practice questions...
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Reviewed segment data for dialog
  // -----------------------------------------------------------------------

  const reviewQuestion = reviewSegmentIndex !== null ? questions[reviewSegmentIndex] : null;
  const reviewResult =
    reviewSegmentIndex !== null
      ? quizState.results.find(r => r.questionId === questions[reviewSegmentIndex]?.id)
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-2">
      {/* Quiz header with exit button */}
      <QuizHeader
        questionNumber={quizState.currentIndex + 1}
        totalQuestions={questions.length}
        mode="practice"
        onExit={handleExitRequest}
        timerSlot={
          timerEnabled ? (
            <CircularTimer
              duration={PRACTICE_DURATION_SECONDS}
              remainingTime={timeLeft}
              size="sm"
              allowHide
            />
          ) : undefined
        }
        showBurmese={showBurmese}
      />

      {/* Segmented progress bar with live score + tappable segments */}
      <div className="mb-6">
        <SegmentedProgressBar
          segments={segments}
          currentIndex={quizState.currentIndex}
          totalCount={questions.length}
          correctCount={correctCount}
          allowTap
          onSegmentTap={handleSegmentTap}
          showLiveScore
          showBurmese={showBurmese}
        />
      </div>

      {/* Question card with slide-left transitions */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={quizState.currentIndex}
            initial={shouldReduceMotion ? { opacity: 0 } : { x: 60, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: -60, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : SPRING_SNAPPY}
          >
            {/* Question area */}
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
                  label="Play Question"
                  ariaLabel="Play English question audio"
                  rate={numericRate}
                  showSpeedLabel
                  speedLabel={speedLabel}
                />
                {showBurmese && (
                  <BurmeseSpeechButton
                    questionId={currentQuestion.id}
                    audioType="q"
                    label="မြန်မာ"
                    showSpeedLabel
                    speedLabel={speedLabel}
                  />
                )}
                <SpeechButton
                  text={currentQuestion.answers.map(a => a.text_en).join('. ')}
                  label="Play Answer Choices"
                  ariaLabel="Play English answer choices audio"
                  rate={numericRate}
                  showSpeedLabel
                  speedLabel={speedLabel}
                />
              </div>
            </div>

            {/* Answer options with keyboard navigation */}
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

        {/* Action buttons: Skip + Check (not during feedback) */}
        {!isFeedback && (
          <div className="mt-6 flex gap-3">
            <SkipButton onSkip={handleSkip} disabled={isChecking} showBurmese={showBurmese} />
            <button
              type="button"
              onClick={handleCheck}
              disabled={!quizState.selectedAnswer || isChecking}
              className={clsx(
                'flex-1 rounded-full px-6 py-3 text-base font-bold',
                'min-h-[48px]',
                'transition-all duration-100',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                quizState.selectedAnswer && !isChecking
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              )}
            >
              {strings.quiz.check.en}
              {showBurmese && (
                <span className="ml-2 font-myanmar text-sm font-normal">
                  {strings.quiz.check.my}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Streak/XP micro-rewards (above feedback panel) */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <StreakReward
            count={quizState.streakCount}
            show={showStreakReward}
            showBurmese={showBurmese}
          />
          <XPPopup points={xpPoints} show={showXP} />
        </div>

        {/* Feedback panel (slides up) */}
        <div className="mt-4">
          <FeedbackPanel
            isCorrect={quizState.isCorrect ?? false}
            show={isFeedback}
            correctAnswer={correctAnswer?.text_en ?? ''}
            correctAnswerMy={correctAnswer?.text_my}
            userAnswer={quizState.selectedAnswer?.text_en}
            userAnswerMy={quizState.selectedAnswer?.text_my}
            explanation={currentQuestion.explanation}
            streakCount={quizState.streakCount}
            mode="practice"
            onContinue={handleContinue}
            showBurmese={showBurmese}
          />
        </div>
      </div>

      {/* Segment tap review dialog */}
      <AnimatePresence>
        {reviewSegmentIndex !== null && reviewQuestion && reviewResult && (
          <SegmentReviewDialog
            question={reviewQuestion}
            result={reviewResult}
            onClose={handleCloseReview}
            showBurmese={showBurmese}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>

      {/* Exit confirmation dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <ExitConfirmInline
            open={showExitConfirm}
            onConfirm={handleExitConfirm}
            onCancel={handleExitCancel}
            showBurmese={showBurmese}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
