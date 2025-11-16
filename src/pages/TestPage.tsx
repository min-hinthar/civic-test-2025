'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fullCivicsQuestions } from '@/constants/civicsQuestions';
import type { Answer, QuestionResult, TestSession } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const TEST_DURATION_SECONDS = 20 * 60;

const shuffle = <T,>(array: T[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const TestPage = () => {
  const { saveTestSession } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);

  const questions = useMemo(() => shuffle(fullCivicsQuestions).slice(0, 20), []);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return null;
  }

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
    if (!isFinished || !results.length) return;
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const session: Omit<TestSession, 'id'> = {
      date: new Date().toISOString(),
      score: correctAnswers,
      totalQuestions: questions.length,
      durationSeconds: TEST_DURATION_SECONDS - timeLeft,
      passed: correctAnswers >= 12,
      results,
    };
    saveTestSession(session).then(() => {
      toast({
        title: 'Mock test saved',
        description: `You answered ${correctAnswers} questions correctly.`,
      });
    });
  }, [isFinished, questions.length, results, saveTestSession, timeLeft]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  const correctCount = results.filter(result => result.isCorrect).length;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Results</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">You scored {correctCount} / {questions.length}</h1>
          <p className="text-slate-600">Review each answer below and retake anytime.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              Retake test
            </button>
          </div>
          <div className="mt-10 space-y-6">
            {results.map(result => (
              <div key={result.questionId} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-700">{result.questionText_en}</p>
                <p className="text-sm text-slate-500">{result.questionText_my}</p>
                <p className={`mt-2 text-sm font-semibold ${result.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.isCorrect ? 'Correct' : 'Correct answer: ' + result.correctAnswer.text_en}
                </p>
                {!result.isCorrect && (
                  <p className="text-sm text-slate-500">{result.correctAnswer.text_my}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Mock Test</p>
            <h1 className="text-2xl font-bold text-slate-900">
              Question {currentIndex + 1} / {questions.length}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Time remaining</p>
            <p className="text-3xl font-semibold text-primary">{formattedTime}</p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl bg-slate-50 p-6">
          <p className="text-lg font-semibold text-slate-900">{currentQuestion.question_en}</p>
          <p className="text-base text-slate-600">{currentQuestion.question_my}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">{currentQuestion.category}</p>
        </div>
        <div className="mt-6 grid gap-4">
          {currentQuestion.answers.map(answer => (
            <button
              key={answer.text_en}
              onClick={() => handleAnswer(answer)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-primary hover:shadow"
            >
              <p className="font-semibold text-slate-900">{answer.text_en}</p>
              <p className="text-sm text-slate-600">{answer.text_my}</p>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">Select an answer to move to the next question.</p>
      </div>
    </div>
  );
};

export default TestPage;
