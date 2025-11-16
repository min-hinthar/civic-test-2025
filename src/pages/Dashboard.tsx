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

  const quickActions = [
    {
      href: '/history',
      title: 'View analytics',
      titleMy: 'အချက်အလက်ဇယား',
      description: 'Open your Supabase-synced score trend.',
      icon: HistoryIcon,
      gradient: 'from-sky-500/20 via-sky-400/10 to-indigo-500/20',
    },
    {
      href: '/study',
      title: 'Master categories',
      titleMy: 'အပိုင်းလိုက်ကျွမ်းကျင်ရေး',
      description: 'Jump straight to bilingual flip-cards.',
      icon: Compass,
      gradient: 'from-emerald-500/20 via-lime-400/10 to-teal-500/20',
    },
  ];

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="glass-panel flex flex-col gap-4 p-8 shadow-rose-100/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Dashboard · ဒိုင်ခွက်</p>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Learner'}!
              <span className="mt-1 block text-lg font-medium text-muted-foreground font-myanmar">
                သင့်ရဲ့ မေးခွန်းသင်ကြားမှု တိုးတက်မှုများကို ဤနေရာတွင် ကြည့်ရှုနိုင်ပါသည်။
              </span>
            </h1>
            <p className="text-muted-foreground">Track your bilingual study journey, jump into a new test, or brush up with flip cards.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/study"
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
            >
              <BookOpenCheck className="h-4 w-4" /> Study guide
            </Link>
            <Link
              to="/test"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
            >
              Start mock test
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map(card => (
            <div key={card.title} className="stat-card p-6 transition hover:-translate-y-1">
              <card.icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{card.title}</p>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <p className="text-xs text-muted-foreground font-myanmar mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="stat-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Navigate faster · <span className="font-myanmar text-muted-foreground">လမ်းကြောင်းမည်သို့လဲ</span></h2>
            <p className="text-sm text-muted-foreground">Quick actions optimized for thumb reach on any phone.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {quickActions.map(action => (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`group flex items-center gap-3 rounded-3xl border border-border/60 bg-gradient-to-br ${action.gradient} px-4 py-4 text-left text-sm font-semibold text-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-primary/30`}
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p>{action.title}</p>
                    <p className="text-xs text-muted-foreground font-myanmar">{action.titleMy}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Link
            to={latestAttempt ? '/history' : '/test'}
            className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-emerald-100/40 to-sky-100/40 p-6 text-left shadow-lg transition hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold text-foreground">Latest summary · <span className="font-myanmar text-muted-foreground">နောက်ဆုံးရလေ့ကျင့်မှု</span></h2>
            <p className="text-sm text-muted-foreground">
              {latestAttempt ? 'Tap to review full analytics.' : 'Tap to launch your very first mock test.'}
            </p>
            {latestAttempt && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-foreground">{latestAttempt.score} / {latestAttempt.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">{new Date(latestAttempt.date).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Time</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(latestAttempt.durationSeconds / 60)} mins</p>
                  <p className={`text-sm font-semibold ${latestAttempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {latestAttempt.passed ? 'Passing pace' : 'Review needed'}
                  </p>
                </div>
              </div>
            )}
            {!latestAttempt && (
              <div className="mt-4 rounded-2xl bg-card/70 p-4 text-sm text-muted-foreground">
                Start your journey with a bilingual mock test and we will track every result automatically.
              </div>
            )}
            <p className="mt-4 text-sm font-semibold text-primary">
              {latestAttempt ? 'View full analytics →' : 'Start mock test →'}
            </p>
          </Link>
        </section>

        <section className="mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Category accuracy · <span className="font-myanmar text-muted-foreground">အပိုင်းလိုက်မှန်ကန်မှု</span></h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              View full analytics →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(categoryBreakdown).map(([category, stats]) => {
              const rate = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={category} className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm font-semibold text-foreground">{category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.correct} correct out of {stats.total} questions</p>
                </div>
              );
            })}
            {!Object.keys(categoryBreakdown).length && <p className="text-muted-foreground">Complete a mock test to unlock insights.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
