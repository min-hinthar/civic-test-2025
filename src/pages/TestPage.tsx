'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, Sparkles } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { fullCivicsQuestions } from '@/constants/civicsQuestions';
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

  const questions = useMemo(() => shuffle(fullCivicsQuestions).slice(0, 20), []);
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
      <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Mock Test · စမ်းသပ်မေးခွန်း</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Question {currentIndex + 1} <span className="text-slate-400">/ {questions.length}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">{currentQuestion?.category}</p>
            <p className="text-xs text-slate-500 font-myanmar">{currentQuestion?.question_my}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
            <Clock3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time remaining · <span className="font-myanmar">ချိန်ရှည်</span></p>
              <p className="text-2xl font-semibold text-slate-900">{formattedTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl bg-slate-50/70 p-6">
            <p className="text-lg font-semibold text-slate-900">{currentQuestion?.question_en}</p>
            <p className="mt-3 text-base text-slate-600 font-myanmar leading-relaxed">{currentQuestion?.question_my}</p>
          </div>
          <div className="w-full rounded-2xl border border-slate-100 bg-white/80 p-6 lg:w-64">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Progress · <span className="font-myanmar">တိုးတက်မှု</span></p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-600">{progressPercent}%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Answered {answeredQuestions} of {questions.length}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Saving · <span className="font-myanmar">မှတ်တမ်းသိမ်းဆည်း</span></p>
            <p className="text-sm font-semibold text-slate-700">{isSavingSession ? 'Syncing…' : 'Secure Supabase sync'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {currentQuestion?.answers.map(answer => (
            <button
              key={answer.text_en}
              onClick={() => handleAnswer(answer)}
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary"
            >
              <p className="font-semibold text-slate-900">{answer.text_en}</p>
              <p className="text-sm text-slate-600 font-myanmar leading-relaxed">{answer.text_my}</p>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Tap an answer to move to the next question.</p>
      </div>
    </div>
  );

  const resultView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Results · အောင်မြင်မှု</p>
            <h1 className="text-3xl font-bold text-slate-900">
              You scored {correctCount} / {questions.length}
              <span className="mt-1 block text-lg font-normal text-slate-500 font-myanmar">အမှတ် {correctCount} / {questions.length}</span>
            </h1>
            <p className="text-slate-600">Review your answers and retake the mock test anytime.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
            >
              <Sparkles className="h-4 w-4" /> Retake test
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Duration</p>
            <p className="text-2xl font-bold text-slate-900">{Math.round((TEST_DURATION_SECONDS - timeLeft) / 60)} mins</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Correct</p>
            <p className="text-2xl font-bold text-emerald-600">{correctCount}</p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
            <p className={`text-2xl font-bold ${correctCount >= 12 ? 'text-emerald-600' : 'text-red-600'}`}>
              {correctCount >= 12 ? 'Pass' : 'Review'}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {results.map(result => (
            <div key={result.questionId} className="rounded-3xl border border-slate-100 p-5">
              <p className="text-sm font-semibold text-slate-900">{result.questionText_en}</p>
              <p className="text-sm text-slate-500 font-myanmar leading-relaxed">{result.questionText_my}</p>
              <p className={`mt-2 text-sm font-semibold ${result.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.isCorrect ? 'Correct' : `Correct answer: ${result.correctAnswer.text_en}`}
              </p>
              {!result.isCorrect && (
                <p className="text-sm text-slate-500 font-myanmar leading-relaxed">{result.correctAnswer.text_my}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50">
      <AppNavigation />
      {isFinished ? resultView : activeView}
    </div>
  );
};

export default TestPage;
