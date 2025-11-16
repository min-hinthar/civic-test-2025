'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Clock3, FileText } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0] ?? 'Learner'}!</h1>
            <p className="text-slate-600">
              Track your bilingual study journey, jump into a new test, or brush up with flip cards.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/study"
              className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Study guide
            </Link>
            <Link
              to="/test"
              className="inline-flex items-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
            >
              Start mock test
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(card => (
            <div key={card.title} className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
              <card.icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-slate-500">{card.title}</p>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500">{card.description}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Category accuracy</h2>
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
