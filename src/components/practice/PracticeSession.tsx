'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import SpeechButton from '@/components/ui/SpeechButton';
import { Progress } from '@/components/ui/Progress';
import { CircularTimer } from '@/components/test/CircularTimer';
import { AnswerFeedback, getAnswerOptionClasses } from '@/components/test/AnswerFeedback';
import { WhyButton } from '@/components/explanations/WhyButton';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { saveSession } from '@/lib/sessions/sessionStore';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { PracticeSnapshot } from '@/lib/sessions/sessionTypes';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playCorrect, playIncorrect } from '@/lib/audio/soundEffects';
import type { Answer, Question, QuestionResult } from '@/types';

const PRACTICE_DURATION_SECONDS = 20 * 60;
const FEEDBACK_DELAY_MS = 1500;

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
}

/**
 * Practice session component with Duolingo visual treatment.
 *
 * Features:
 * - Horizontal progress bar at top with compact timer alongside
 * - 3D chunky answer buttons with shadow depth
 * - Sound effects: playCorrect/playIncorrect on answer selection
 * - Animated feedback icons (star/shake via AnswerFeedback)
 * - WhyButton after each answer with pausable auto-advance
 * - Records answers to masteryStore with sessionType: 'practice'
 * - Navigation lock via beforeunload
 */
export function PracticeSession({
  questions,
  timerEnabled,
  onComplete,
  sessionId,
  practiceConfig,
  initialResults,
  initialIndex,
}: PracticeSessionProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [results, setResults] = useState<QuestionResult[]>(initialResults ?? []);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION_SECONDS);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<QuestionResult | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const progressPercent = Math.round((results.length / questions.length) * 100);
  const questionAudioText = currentQuestion?.question_en ?? '';
  const answerChoicesAudioText = currentQuestion?.answers?.map(a => a.text_en).join('. ') ?? '';

  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectCount = results.length - correctCount;

  const processResult = useCallback(
    (result: QuestionResult) => {
      const nextResults = [...results, result];
      setResults(nextResults);

      if (nextResults.length >= questions.length) {
        onComplete(nextResults);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    },
    [questions.length, results, onComplete]
  );

  const advanceToNext = useCallback(() => {
    const result = pendingResultRef.current;
    if (!result) return;
    pendingResultRef.current = null;
    setShowFeedback(false);
    setSelectedAnswer(null);
    setExplanationExpanded(false);
    processResult(result);
  }, [processResult]);

  const handleAnswerSelect = useCallback(
    (answer: Answer) => {
      if (!currentQuestion || showFeedback) return;

      setSelectedAnswer(answer);
      setShowFeedback(true);
      setExplanationExpanded(false);

      // Play sound in event handler (React Compiler safe)
      if (answer.correct) {
        playCorrect();
      } else {
        playIncorrect();
      }

      const correctAnswer = currentQuestion.answers.find(a => a.correct)!;
      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        selectedAnswer: answer,
        correctAnswer,
        isCorrect: answer.correct,
        category: currentQuestion.category,
      };

      pendingResultRef.current = result;

      // Record answer to mastery store immediately (before advancing)
      recordAnswer({
        questionId: currentQuestion.id,
        isCorrect: answer.correct,
        sessionType: 'practice',
      });

      // Save session to IndexedDB (fire-and-forget)
      if (sessionId && practiceConfig) {
        const snapshot: PracticeSnapshot = {
          id: sessionId,
          type: 'practice',
          savedAt: new Date().toISOString(),
          version: SESSION_VERSION,
          questions,
          results: [...results, result],
          currentIndex: currentIndex + 1,
          timerEnabled,
          timeLeft,
          config: practiceConfig,
        };
        saveSession(snapshot).catch(() => {});
      }

      // Delay before advancing
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        advanceToNext();
      }, FEEDBACK_DELAY_MS);
    },
    [
      currentQuestion,
      showFeedback,
      advanceToNext,
      sessionId,
      practiceConfig,
      questions,
      results,
      currentIndex,
      timerEnabled,
      timeLeft,
    ]
  );

  const handleExplanationExpandChange = useCallback((expanded: boolean) => {
    setExplanationExpanded(expanded);
    if (expanded && feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  // Timer countdown (only when enabled)
  useEffect(() => {
    if (!timerEnabled) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired - complete with current results
          onComplete(results);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerEnabled, results, onComplete]);

  // Navigation lock
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Preparing your practice questions...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
      {/* Horizontal progress bar at top with optional timer alongside */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {strings.practice.practiceMode.en} {currentIndex + 1} / {questions.length}
              {showBurmese && (
                <span className="ml-1 font-myanmar font-normal text-muted-foreground">
                  {strings.practice.practiceMode.my}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{results.length} answered</p>
          </div>
          <Progress value={progressPercent} size="lg" />
        </div>
        {/* Compact circular timer alongside progress (only when enabled) */}
        {timerEnabled && (
          <div className="shrink-0">
            <CircularTimer
              duration={PRACTICE_DURATION_SECONDS}
              remainingTime={timeLeft}
              size="sm"
              allowHide
            />
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
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
              text={questionAudioText}
              label="Play Question"
              ariaLabel="Play English question audio"
            />
            <SpeechButton
              text={answerChoicesAudioText}
              label="Play Answer Choices"
              ariaLabel="Play English answer choices audio"
            />
          </div>
        </div>

        {/* Answer options as 3D chunky buttons */}
        <div className="mt-6 grid gap-3">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isAnswered = showFeedback;

            // 3D chunky styles for unanswered state
            const chunkyBase = !isAnswered
              ? clsx(
                  'rounded-2xl border-2 px-5 py-4 text-left w-full min-h-[56px]',
                  'font-semibold transition-all duration-100',
                  'shadow-[0_4px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[3px]',
                  'hover:border-primary-400 hover:bg-primary-subtle/50 hover:shadow-[0_4px_0_hsl(var(--primary-600))]',
                  '',
                  isSelected
                    ? 'border-primary bg-primary-subtle shadow-[0_4px_0_hsl(var(--primary-600))]'
                    : 'border-border bg-card'
                )
              : undefined;

            // When answered, use getAnswerOptionClasses for correct/incorrect coloring
            const answeredClasses = isAnswered
              ? clsx(
                  getAnswerOptionClasses(isSelected, answer.correct, true),
                  'w-full min-h-[56px] py-4 px-5 text-left'
                )
              : undefined;

            return (
              <motion.button
                key={answer.text_en}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05 }}
                onClick={() => handleAnswerSelect(answer)}
                disabled={showFeedback}
                className={chunkyBase ?? answeredClasses}
              >
                <span className="font-bold block text-foreground">{answer.text_en}</span>
                {showBurmese && (
                  <span className="font-myanmar text-muted-foreground block text-sm mt-0.5">
                    {answer.text_my}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Answer feedback with animated icons */}
        <div className="mt-4">
          <AnswerFeedback
            isCorrect={selectedAnswer?.correct ?? false}
            show={showFeedback}
            correctAnswer={currentQuestion.answers.find(a => a.correct)?.text_en}
            correctAnswerMy={currentQuestion.answers.find(a => a.correct)?.text_my}
          />
        </div>

        {/* WhyButton inline explanation */}
        {showFeedback && currentQuestion.explanation && (
          <div className="mt-3">
            <WhyButton
              explanation={currentQuestion.explanation}
              isCorrect={selectedAnswer?.correct}
              compact
              onExpandChange={handleExplanationExpandChange}
            />
            {/* "Next" button when explanation expanded (auto-advance paused) */}
            {explanationExpanded && (
              <button
                onClick={advanceToNext}
                className={clsx(
                  'mt-3 flex w-full items-center justify-center gap-2',
                  'min-h-[48px] rounded-xl px-4 py-2.5',
                  'bg-primary text-primary-foreground font-bold',
                  'shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                  'transition-[box-shadow,transform] duration-100'
                )}
              >
                {strings.actions.next.en}
                {showBurmese && (
                  <span className="font-myanmar text-xs">{strings.actions.next.my}</span>
                )}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Progress summary */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-success font-bold">{correctCount} correct</span>
            <span className="text-warning font-bold">{incorrectCount} incorrect</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {questions.length - results.length} remaining
          </p>
        </div>
      </div>
    </div>
  );
}
