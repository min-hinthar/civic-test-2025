'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, Sparkles } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { civicsQuestions } from '@/constants/civicsQuestions';
import type { Answer, QuestionResult, TestSession } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const TEST_DURATION_SECONDS = 20 * 60;

const shuffle = <T,>(array: T[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const TestPage = () => {
  const { saveTestSession, isSavingSession } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  const questions = useMemo(() => shuffle(civicsQuestions).slice(0, 20), []);
  const currentQuestion = questions[currentIndex];

  const answeredQuestions = results.length;
  const progressPercent = Math.round((answeredQuestions / questions.length) * 100);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  const correctCount = results.filter(result => result.isCorrect).length;

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (!currentQuestion || isFinished) return;
      const correctAnswer = currentQuestion.answers.find(ans => ans.correct)!;
      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        selectedAnswer: answer,
        correctAnswer,
        isCorrect: answer.correct,
        category: currentQuestion.category,
      };
      setResults(prev => [...prev, result]);

      if (currentIndex === questions.length - 1) {
        setIsFinished(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    },
    [currentIndex, currentQuestion, isFinished, questions.length]
  );

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  useEffect(() => {
    if (!isFinished || !results.length || hasSavedSession) return;
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const session: Omit<TestSession, 'id'> = {
      date: new Date().toISOString(),
      score: correctAnswers,
      totalQuestions: questions.length,
      durationSeconds: TEST_DURATION_SECONDS - timeLeft,
      passed: correctAnswers >= 12,
      results,
    };
    setHasSavedSession(true);
    const persist = async () => {
      try {
        await saveTestSession(session);
        toast({
          title: 'Mock test saved',
          description: `You answered ${correctAnswers} questions correctly.`,
        });
      } catch (error) {
        console.error(error);
        setHasSavedSession(false);
        toast({
          title: 'Unable to save test',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
      }
    };
    persist();
  }, [hasSavedSession, isFinished, questions.length, results, saveTestSession, timeLeft]);

  if (!currentQuestion && !isFinished) {
    return null;
  }

  const activeView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <div className="glass-panel p-6 shadow-2xl shadow-primary/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Mock Test · စမ်းသပ်မေးခွန်း</p>
            <h1 className="text-3xl font-bold text-foreground">
              Question {currentIndex + 1} <span className="text-muted-foreground">/ {questions.length}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{currentQuestion?.category}</p>
            <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{currentQuestion?.question_my}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-foreground">
            <Clock3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Time remaining · <span className="font-myanmar">ချိန်ရှည်</span>
              </p>
              <p className="text-2xl font-semibold text-foreground">{formattedTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-border/50 bg-muted/30 p-6">
            <p className="text-lg font-semibold text-foreground">{currentQuestion?.question_en}</p>
            <p className="mt-3 text-base text-muted-foreground font-myanmar leading-relaxed">{currentQuestion?.question_my}</p>
          </div>
          <div className="w-full rounded-2xl border border-border bg-card/80 p-6 lg:w-64">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Progress · <span className="font-myanmar">တိုးတက်မှု</span>
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-muted/60">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{progressPercent}%</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Answered {answeredQuestions} of {questions.length}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Saving · <span className="font-myanmar">မှတ်တမ်းသိမ်းဆည်း</span>
            </p>
            <p className="text-sm font-semibold text-foreground">{isSavingSession ? 'Syncing…' : 'Secure Supabase sync'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {currentQuestion?.answers.map(answer => (
            <button
              key={answer.text_en}
              onClick={() => handleAnswer(answer)}
              className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
            >
              <p className="font-semibold text-foreground">{answer.text_en}</p>
              <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{answer.text_my}</p>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Tap an answer to move to the next question.</p>
      </div>
    </div>
  );

  const resultView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <div className="glass-panel p-6 shadow-2xl shadow-primary/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Results · အောင်မြင်မှု</p>
            <h1 className="text-3xl font-bold text-foreground">
              You scored {correctCount} / {questions.length}
              <span className="mt-1 block text-lg font-normal text-muted-foreground font-myanmar">
                မှတ် {correctCount} / {questions.length}
              </span>
            </h1>
            <p className="text-muted-foreground">Review your answers and retake the mock test anytime.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/40"
            >
              <Sparkles className="h-4 w-4" /> Retake test
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold text-foreground">{Math.round((TEST_DURATION_SECONDS - timeLeft) / 60)} mins</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Correct</p>
            <p className="text-2xl font-bold text-emerald-500">{correctCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
            <p className={`text-2xl font-bold ${correctCount >= 12 ? 'text-emerald-500' : 'text-red-500'}`}>
              {correctCount >= 12 ? 'Pass' : 'Review'}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {results.map(result => (
            <div key={result.questionId} className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
              <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{result.questionText_my}</p>
              <p className={`mt-2 text-sm font-semibold ${result.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.isCorrect ? 'Correct' : `Correct answer: ${result.correctAnswer.text_en}`}
              </p>
              {!result.isCorrect && (
                <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{result.correctAnswer.text_my}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <AppNavigation />
      {isFinished ? resultView : activeView}
    </div>
  );
};

export default TestPage;
