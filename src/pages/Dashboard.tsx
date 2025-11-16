'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Clock3, Compass, FileText, History as HistoryIcon } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { QuestionResult } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  const history = user?.testHistory ?? [];
  const latestAttempt = history[0];
  const accuracy = history.length
    ? Math.round((history.reduce((sum, session) => sum + session.score, 0) / (history.length * 20)) * 100)
    : 0;

  const categoryBreakdown = history.reduce<Record<string, { correct: number; total: number }>>((acc, session) => {
    session.results.forEach((result: QuestionResult) => {
      if (!acc[result.category]) {
        acc[result.category] = { correct: 0, total: 0 };
      }
      acc[result.category].total += 1;
      if (result.isCorrect) acc[result.category].correct += 1;
    });
    return acc;
  }, {});

  const cards = [
    {
      title: 'Attempts completed',
      value: history.length,
      description: 'Each mock test contains 20 randomized questions.',
      icon: FileText,
    },
    {
      title: 'Average accuracy',
      value: `${accuracy || 0}%`,
      description: 'Across every completed mock test.',
      icon: BookOpenCheck,
    },
    {
      title: 'Latest duration',
      value: latestAttempt ? `${Math.round(latestAttempt.durationSeconds / 60)} mins` : '—',
      description: latestAttempt ? new Date(latestAttempt.date).toLocaleDateString() : 'No attempts yet',
      icon: Clock3,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-sky-50">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/95 p-8 shadow-2xl shadow-rose-100/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Dashboard · ဒိုင်ခွက်</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Learner'}!
              <span className="mt-1 block text-lg font-medium text-slate-500 font-myanmar">
                သင့်ရဲ့ မေးခွန်းသင်ကြားမှု တိုးတက်မှုများကို ဤနေရာတွင် ကြည့်ရှုနိုင်ပါသည်။
              </span>
            </h1>
            <p className="text-slate-600">Track your bilingual study journey, jump into a new test, or brush up with flip cards.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/study"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <BookOpenCheck className="h-4 w-4" /> Study guide
            </Link>
            <Link
              to="/test"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
            >
              Start mock test
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map(card => (
            <div key={card.title} className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md shadow-slate-200/70 transition hover:-translate-y-1">
              <card.icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-slate-500">{card.title}</p>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500">{card.description}</p>
              <p className="text-xs text-slate-400 font-myanmar mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">Navigate faster · <span className="font-myanmar text-slate-500">လမ်းကြောင်းမည်သို့လဲ</span></h2>
            <p className="text-sm text-slate-500">Quick actions optimized for thumb reach on any phone.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link
                to="/history"
                className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary"
              >
                <HistoryIcon className="h-4 w-4 text-primary" /> View analytics
              </Link>
              <Link
                to="/study"
                className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary"
              >
                <Compass className="h-4 w-4 text-emerald-500" /> Master categories
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-primary/10 via-emerald-100/40 to-sky-100/40 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Latest summary · <span className="font-myanmar text-slate-500">နောက်ဆုံးရလေ့ကျင့်မှု</span></h2>
            <p className="text-sm text-slate-500">{latestAttempt ? 'Keep the streak going!' : 'Take your first mock test to begin tracking.'}</p>
            {latestAttempt && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Score</p>
                  <p className="text-2xl font-bold text-slate-900">{latestAttempt.score} / {latestAttempt.totalQuestions}</p>
                  <p className="text-sm text-slate-500">{new Date(latestAttempt.date).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Time</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(latestAttempt.durationSeconds / 60)} mins</p>
                  <p className={`text-sm font-semibold ${latestAttempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {latestAttempt.passed ? 'Passing pace' : 'Review needed'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/60 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Category accuracy · <span className="font-myanmar text-slate-500">အပိုင်းလိုက်မှန်ကန်မှု</span></h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              View full analytics →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(categoryBreakdown).map(([category, stats]) => {
              const rate = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={category} className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">{category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{rate}%</span>
                  </div>
                  <p className="text-xs text-slate-500">{stats.correct} correct out of {stats.total} questions</p>
                </div>
              );
            })}
            {!Object.keys(categoryBreakdown).length && <p className="text-slate-500">Complete a mock test to unlock insights.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
