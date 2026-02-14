'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Eye, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { InterviewTimer } from '@/components/interview/InterviewTimer';
import { SelfGradeButtons } from '@/components/interview/SelfGradeButtons';
import { AnswerReveal } from '@/components/interview/AnswerReveal';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { BilingualText } from '@/components/bilingual/BilingualText';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { useInterviewTTS } from '@/hooks/useInterviewTTS';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { playChime } from '@/lib/interview/audioChime';
import { getRandomGreeting } from '@/lib/interview/interviewGreetings';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { InterviewMode, InterviewResult, InterviewEndReason, Question } from '@/types';

/** Maximum replays per question */
const MAX_REPLAYS = 2;

/** Timer duration for realistic mode in seconds */
const REALISTIC_TIMER_SECONDS = 15;

/** Delay between grading and next question in ms */
const TRANSITION_DELAY_MS = 1500;

/** Pass threshold for realistic mode */
const PASS_THRESHOLD = 12;

/** Fail threshold for realistic mode */
const FAIL_THRESHOLD = 9;

/** Number of questions per interview session */
const QUESTIONS_PER_SESSION = 20;

type QuestionPhase = 'greeting' | 'chime' | 'reading' | 'responding' | 'grading' | 'transition';

interface InterviewSessionProps {
  /** Interview mode (realistic or practice) */
  mode: InterviewMode;
  /** Called when the session is complete */
  onComplete: (
    results: InterviewResult[],
    durationSeconds: number,
    endReason: InterviewEndReason
  ) => void;
  /** Whether mic permission was granted */
  micPermission: boolean;
}

/**
 * Core interview session flow orchestrator.
 *
 * Manages the full question lifecycle:
 * greeting -> (chime -> reading -> responding -> revealing -> grading -> transition) * N
 *
 * State-driven transitions via questionPhase state. Each phase transition
 * triggers appropriate effects for TTS, recording, and timers.
 *
 * Distinct behaviors:
 * - Realistic: 15s timer, auto-reveal, threshold stop (12 correct / 9 incorrect)
 * - Practice: user-paced, Show Answer button, WhyButton, AddToDeck, quit option
 */
export function InterviewSession({ mode, onComplete, micPermission }: InterviewSessionProps) {
  const { showBurmese, mode: languageMode } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { speakWithCallback, cancel: cancelTTS, isSpeaking } = useInterviewTTS();
  const {
    startRecording,
    stopRecording,
    clearRecording,
    audioURL,
    stream,
    isRecording,
    cleanup: cleanupRecorder,
  } = useAudioRecorder();

  // --- Session state ---
  const questions: Question[] = useMemo(
    () => fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION),
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>('greeting');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [startTime] = useState(() => Date.now());
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs for callbacks that need current values
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const currentQuestion = questions[currentIndex];

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      cancelTTS();
      cleanupRecorder();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [cancelTTS, cleanupRecorder]);

  // --- Phase effects ---

  // GREETING phase: speak greeting, then start first question
  useEffect(() => {
    if (questionPhase !== 'greeting') return;

    console.debug('[analytics] interview_session_started', {
      interviewMode: mode,
      languageMode,
    });

    const greeting = getRandomGreeting();
    speakWithCallback(greeting, {
      onEnd: () => {
        // Wait 1s after greeting, then start first question
        transitionTimerRef.current = setTimeout(() => {
          setQuestionPhase('chime');
        }, 1000);
      },
    });

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [questionPhase, speakWithCallback, mode, languageMode]);

  // CHIME phase: play chime, wait 200ms, go to reading
  useEffect(() => {
    if (questionPhase !== 'chime') return;

    playChime();
    transitionTimerRef.current = setTimeout(() => {
      setQuestionPhase('reading');
    }, 200);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [questionPhase]);

  // READING phase: speak question text, then transition to responding
  useEffect(() => {
    if (questionPhase !== 'reading') return;
    if (!currentQuestion) return;

    speakWithCallback(currentQuestion.question_en, {
      onEnd: () => {
        setTextVisible(true);
        // Start recording if mic is available
        if (micPermission) {
          startRecording();
        }
        setQuestionPhase('responding');
      },
    });
  }, [questionPhase, currentQuestion, speakWithCallback, micPermission, startRecording]);

  // --- Event handlers ---

  const handleTimerExpired = useCallback(() => {
    stopRecording();
    setQuestionPhase('grading');
  }, [stopRecording]);

  const handleShowAnswer = useCallback(() => {
    stopRecording();
    setQuestionPhase('grading');
  }, [stopRecording]);

  // GRADING phase: read correct answer aloud (TTS only, no state change)
  useEffect(() => {
    if (questionPhase !== 'grading') return;
    if (!currentQuestion) return;

    // Read correct answer aloud during grading
    const primaryAnswer = currentQuestion.studyAnswers[0];
    if (primaryAnswer) {
      speakWithCallback(primaryAnswer.text_en);
    }
  }, [questionPhase, currentQuestion, speakWithCallback]);

  const handleReplay = useCallback(() => {
    if (replaysUsed >= MAX_REPLAYS || !currentQuestion) return;

    // Stop recording during replay
    stopRecording();
    setReplaysUsed(prev => prev + 1);

    // 1s pause before replay
    transitionTimerRef.current = setTimeout(() => {
      speakWithCallback(currentQuestion.question_en, {
        onEnd: () => {
          // Restart recording after replay TTS ends
          if (micPermission) {
            startRecording();
          }
        },
      });
    }, 1000);
  }, [
    replaysUsed,
    currentQuestion,
    stopRecording,
    speakWithCallback,
    micPermission,
    startRecording,
  ]);

  const handleGrade = useCallback(
    (grade: 'correct' | 'incorrect') => {
      if (!currentQuestion) return;

      const result: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: grade,
        category: currentQuestion.category,
      };

      const newResults = [...results, result];
      const newCorrect = grade === 'correct' ? correctCount + 1 : correctCount;
      const newIncorrect = grade === 'incorrect' ? incorrectCount + 1 : incorrectCount;

      setResults(newResults);
      setCorrectCount(newCorrect);
      setIncorrectCount(newIncorrect);

      // Clear recording blob
      clearRecording();

      // Check thresholds (realistic mode only)
      if (mode === 'realistic') {
        if (newCorrect >= PASS_THRESHOLD) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          onCompleteRef.current(newResults, duration, 'passThreshold');
          return;
        }
        if (newIncorrect >= FAIL_THRESHOLD) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          onCompleteRef.current(newResults, duration, 'failThreshold');
          return;
        }
      }

      // Check if all questions answered
      if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        onCompleteRef.current(newResults, duration, 'complete');
        return;
      }

      // Transition to next question
      setQuestionPhase('transition');
      transitionTimerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setReplaysUsed(0);
        setTextVisible(false);
        setQuestionPhase('chime');
      }, TRANSITION_DELAY_MS);
    },
    [
      currentQuestion,
      results,
      correctCount,
      incorrectCount,
      clearRecording,
      mode,
      currentIndex,
      startTime,
    ]
  );

  const handleQuit = useCallback(() => {
    cancelTTS();
    stopRecording();
    cleanupRecorder();
    const duration = Math.round((Date.now() - startTime) / 1000);
    onCompleteRef.current(results, duration, 'quit');
  }, [cancelTTS, stopRecording, cleanupRecorder, results, startTime]);

  // --- Render ---

  const isGreeting = questionPhase === 'greeting';
  const isTransition = questionPhase === 'transition';
  const showTimer = mode === 'realistic' && questionPhase === 'responding';
  const showShowAnswer = mode === 'practice' && questionPhase === 'responding';
  const showGradeButtons = questionPhase === 'grading';
  const showAnswerReveal = questionPhase === 'grading';
  const showReplayButton = questionPhase === 'responding' && replaysUsed < MAX_REPLAYS;
  const showWaveform = questionPhase === 'responding' && micPermission;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      {/* Header: question number + score (practice only) */}
      {!isGreeting && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            {mode === 'practice' ? (
              <>
                {currentIndex + 1} {strings.interview.questionOf.en} {QUESTIONS_PER_SESSION}
              </>
            ) : (
              <>Question {currentIndex + 1}</>
            )}
          </span>

          <div className="flex items-center gap-3">
            {mode === 'practice' && (
              <span className="text-sm text-muted-foreground">
                <BilingualText text={strings.interview.correctCount} size="xs" />: {correctCount}
              </span>
            )}

            {mode === 'practice' && (
              <button
                type="button"
                onClick={() => setShowQuitDialog(true)}
                className={clsx(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1.5',
                  'text-xs text-muted-foreground',
                  'transition-colors hover:bg-muted/40 hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{strings.interview.endInterview.en}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar for practice mode */}
      {mode === 'practice' && !isGreeting && (
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-muted/30">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / QUESTIONS_PER_SESSION) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Timer for realistic mode */}
      {showTimer && (
        <div className="mb-4" key={currentIndex}>
          <InterviewTimer
            duration={REALISTIC_TIMER_SECONDS}
            onExpired={handleTimerExpired}
            isActive
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Interviewer avatar + label */}
        <div className="mb-6 flex flex-col items-center">
          <InterviewerAvatar size={64} isSpeaking={isSpeaking} />
          <span className="mt-1.5 text-xs text-muted-foreground">
            USCIS Officer
            {showBurmese && <span className="font-myanmar ml-1">· USCIS အရာရှိ</span>}
          </span>
        </div>

        {/* Greeting state */}
        {isGreeting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            {strings.interview.listening.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-xs">
                {strings.interview.listening.my}
              </span>
            )}
          </motion.p>
        )}

        {/* Transition state */}
        {isTransition && (
          <div className="flex h-20 items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              {strings.interview.nextQuestion.en}
            </motion.div>
          </div>
        )}

        {/* Question area */}
        {!isGreeting && !isTransition && currentQuestion && (
          <div className="w-full space-y-4">
            {/* Question text - appears after TTS finishes with prismatic glow */}
            <AnimatePresence>
              {textVisible && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
                  className="prismatic-border glass-light rounded-2xl p-4 text-center"
                >
                  <p className="text-lg font-semibold text-foreground">
                    {currentQuestion.question_en}
                  </p>
                  {showBurmese && (
                    <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                      {currentQuestion.question_my}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Typing indicator dots (question not yet visible) */}
            {!textVisible && questionPhase === 'reading' && (
              <div className="flex items-center justify-center gap-1.5 p-3">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-primary/60"
                    animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { repeat: Infinity, duration: 0.6, delay: i * 0.15 }
                    }
                  />
                ))}
              </div>
            )}

            {/* Audio waveform */}
            {showWaveform && (
              <div className="mt-4">
                <AudioWaveform stream={stream} isActive={isRecording} />
              </div>
            )}

            {/* No mic fallback */}
            {questionPhase === 'responding' && !micPermission && (
              <div className="mt-4">
                <AudioWaveform stream={null} isActive={false} />
              </div>
            )}

            {/* Replay button */}
            {showReplayButton && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleReplay}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2',
                    'text-sm text-muted-foreground',
                    'transition-colors hover:bg-muted/40 hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>
                    {strings.interview.replay.en} ({replaysUsed}/{MAX_REPLAYS})
                  </span>
                </button>
              </div>
            )}

            {/* Show Answer button (practice mode) */}
            {showShowAnswer && (
              <div className="mt-4 flex justify-center">
                <motion.button
                  type="button"
                  onClick={handleShowAnswer}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl bg-primary px-6 py-3',
                    'text-sm font-semibold text-white',
                    'transition-colors hover:bg-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                  )}
                >
                  <Eye className="h-4 w-4" />
                  <BilingualText
                    text={strings.interview.showAnswer}
                    size="sm"
                    className="text-white [&_span]:text-white"
                  />
                </motion.button>
              </div>
            )}

            {/* Answer reveal */}
            {showAnswerReveal && (
              <div className="mt-4">
                <AnswerReveal question={currentQuestion} audioURL={audioURL} mode={mode} />
              </div>
            )}

            {/* Self-grade buttons */}
            {showGradeButtons && (
              <div className="mt-4">
                <SelfGradeButtons onGrade={handleGrade} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quit confirmation dialog */}
      <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <DialogContent>
          <DialogTitle>
            {strings.interview.confirmEndTitle.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-base font-normal text-muted-foreground">
                {strings.interview.confirmEndTitle.my}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {strings.interview.confirmEndMessage.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-xs">
                {strings.interview.confirmEndMessage.my}
              </span>
            )}
          </DialogDescription>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowQuitDialog(false)}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'border border-border text-foreground',
                'transition-colors hover:bg-muted/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              {strings.interview.cancel.en}
            </button>
            <button
              type="button"
              onClick={handleQuit}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'bg-warning text-white',
                'transition-colors hover:bg-warning-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning'
              )}
            >
              {strings.interview.confirm.en}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
