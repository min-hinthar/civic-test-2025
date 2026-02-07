'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import SpeechButton from '@/components/ui/SpeechButton';
import { Progress } from '@/components/ui/Progress';
import { CircularTimer } from '@/components/test/CircularTimer';
import { AnswerFeedback, getAnswerOptionClasses } from '@/components/test/AnswerFeedback';
import { WhyButton } from '@/components/explanations/WhyButton';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
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
}

/**
 * Practice session component.
 *
 * Like TestPage but simplified for practice mode:
 * - No pass/fail thresholds
 * - Optional timer (20 min if enabled, hidden if not)
 * - Same answer selection and feedback UX
 * - WhyButton after each answer (same as test mode)
 * - 1500ms auto-advance paused when explanation expanded
 * - Records answers to masteryStore with sessionType: 'practice'
 * - Navigation lock via beforeunload
 */
export function PracticeSession({
  questions,
  timerEnabled,
  onComplete,
}: PracticeSessionProps) {
  const { showBurmese } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION_SECONDS);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<QuestionResult | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const progressPercent = Math.round((results.length / questions.length) * 100);
  const questionAudioText = currentQuestion?.question_en ?? '';
  const answerChoicesAudioText =
    currentQuestion?.answers?.map(a => a.text_en).join('. ') ?? '';

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

      // Delay before advancing
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        advanceToNext();
      }, FEEDBACK_DELAY_MS);
    },
    [currentQuestion, showFeedback, advanceToNext]
  );

  const handleExplanationExpandChange = useCallback(
    (expanded: boolean) => {
      setExplanationExpanded(expanded);
      if (expanded && feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    },
    []
  );

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
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <div className="glass-panel p-6 shadow-2xl shadow-primary/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              {strings.practice.practiceMode.en}
              {showBurmese && (
                <span className="ml-1 font-myanmar">{strings.practice.practiceMode.my}</span>
              )}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Question {currentIndex + 1}{' '}
              <span className="text-muted-foreground">/ {questions.length}</span>
            </h1>
          </div>

          {/* Timer - only shown when enabled */}
          {timerEnabled && (
            <CircularTimer
              duration={PRACTICE_DURATION_SECONDS}
              remainingTime={timeLeft}
              allowHide
            />
          )}

          <div className="w-full rounded-2xl border border-border bg-card/80 p-6 lg:w-64">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Practice Progress
              {showBurmese && (
                <span className="font-myanmar block">လေ့ကျင့်မှုတိုးတက်မှု</span>
              )}
            </p>
            <div className="mt-2">
              <Progress value={progressPercent} size="sm" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Answered {results.length} of {questions.length}
            </p>
          </div>
        </div>

        {/* Question area */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-border/50 bg-muted/30 p-6">
            <p className="mt-1 text-sm text-muted-foreground">{currentQuestion.category}</p>
            <p className="text-lg font-semibold text-foreground">{currentQuestion.question_en}</p>
            {showBurmese && (
              <p className="mt-3 text-base text-muted-foreground font-myanmar leading-relaxed">
                {currentQuestion.question_my}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
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
        </div>

        {/* Answer options */}
        <div className="mt-8 grid gap-4">
          {currentQuestion.answers.map(answer => (
            <button
              key={answer.text_en}
              onClick={() => handleAnswerSelect(answer)}
              disabled={showFeedback}
              className={clsx(
                getAnswerOptionClasses(
                  selectedAnswer === answer,
                  showFeedback ? answer.correct : null,
                  showFeedback
                ),
                'w-full min-h-[44px] py-3 px-4 text-left space-y-1'
              )}
            >
              <span className="font-semibold block">{answer.text_en}</span>
              {showBurmese && (
                <span className="font-myanmar text-muted-foreground block text-sm">
                  {answer.text_my}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Answer feedback */}
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
                  'min-h-[44px] rounded-xl border border-primary-500/30 bg-primary-50 px-4 py-2.5',
                  'text-sm font-semibold text-primary-600',
                  'transition-colors duration-150 hover:bg-primary-100',
                  'dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20'
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Tap an answer to move to the next question.
        </p>
      </div>
    </div>
  );
}
