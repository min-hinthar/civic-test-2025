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

  const trackedCategories = Object.keys(categoryBreakdown).length;
  const masteredCategories = Object.values(categoryBreakdown).filter(stats => stats.total > 0 && stats.correct === stats.total).length;

  const cards = [
    {
      title: 'Attempts completed',
      titleMy: 'လုပ်ဆောင်မှုအရေအတွက်',
      value: history.length,
      description: 'Each mock test contains 20 randomized questions.',
      icon: FileText,
      href: '/history#overview',
    },
    {
      title: 'Average accuracy',
      titleMy: 'မှန်ကန်မှုပျမ်းမျှ',
      value: `${accuracy || 0}%`,
      description: 'Across every completed mock test.',
      icon: BookOpenCheck,
      href: '/history#trend',
    },
    {
      title: 'Latest duration',
      titleMy: 'နောက်ဆုံးအချိန်',
      value: latestAttempt ? `${Math.round(latestAttempt.durationSeconds / 60)} mins` : '—',
      description: latestAttempt ? new Date(latestAttempt.date).toLocaleDateString() : 'No attempts yet',
      icon: Clock3,
      href: latestAttempt ? '/history#attempts' : '/test',
    },
  ];

  const quickActions = [
    {
      href: '/history#trend',
      title: 'View analytics',
      titleMy: 'အချက်အလက်ဇယား',
      description: 'Open your Supabase-synced score trend.',
      icon: HistoryIcon,
      gradient: 'from-sky-500/20 via-sky-400/10 to-indigo-500/20',
    },
    {
      href: '/study#cards',
      title: 'Master categories',
      titleMy: 'အပိုင်းလိုက်ကျွမ်းကျင်ရေး',
      description: 'Jump straight to bilingual flip-cards.',
      icon: Compass,
      gradient: 'from-emerald-500/20 via-lime-400/10 to-teal-500/20',
    },
  ];

  const detailTiles = [
    {
      href: '/history#trend',
      title: 'Analytics snapshot',
      titleMy: 'ဆန်းစစ်ချက်',
      stat: history.length ? `${accuracy}% avg accuracy` : 'Need data',
      description: history.length ? 'Based on all completed mock tests.' : 'Complete a mock test to unlock insights.',
      gradient: 'from-sky-500/30 via-indigo-500/20 to-purple-500/10',
    },
    {
      href: '/study#cards',
      title: 'Master categories',
      titleMy: 'အပိုင်းကျွမ်းကျင်',
      stat: trackedCategories ? `${masteredCategories}/${trackedCategories} mastered` : '0 categories tracked',
      description: trackedCategories
        ? 'Tap to revisit bilingual flip-cards by category.'
        : 'Review flip-cards to start tracking mastery.',
      gradient: 'from-emerald-500/30 via-lime-500/20 to-teal-500/10',
    },
    {
      href: latestAttempt ? '/history#attempts' : '/test',
      title: 'Latest summary',
      titleMy: 'နောက်ဆုံးအကျဉ်းချုံး',
      stat: latestAttempt ? `${latestAttempt.score} / ${latestAttempt.totalQuestions}` : 'No attempts yet',
      description: latestAttempt
        ? `Finished in ${Math.round(latestAttempt.durationSeconds / 60)} mins on ${new Date(latestAttempt.date).toLocaleDateString()}`
        : 'Start a mock test to save your first report.',
      gradient: 'from-rose-500/30 via-amber-400/20 to-orange-500/10',
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

        <section id="highlights" className="mt-8 grid gap-6 md:grid-cols-3" aria-labelledby="dashboard-highlights">
          <span id="dashboard-highlights" className="sr-only">
            Dashboard highlights
          </span>
          {cards.map(card => (
            <Link
              key={card.title}
              to={card.href}
              className="stat-card focus-visible:ring-primary/50 p-6 transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2"
              aria-label={`${card.title} – ${card.titleMy}`}
            >
              <card.icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{card.title}</p>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <p className="mt-1 text-xs text-muted-foreground font-myanmar">{card.titleMy}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                {card.href.startsWith('/history') ? 'View details →' : 'Start practicing →'}
              </span>
            </Link>
          ))}
        </section>

        <section id="navigation" className="mt-8 grid gap-6 md:grid-cols-2" aria-labelledby="dashboard-navigation">
          <h2 id="dashboard-navigation" className="sr-only">
            Quick navigation
          </h2>
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
            to={latestAttempt ? '/history#attempts' : '/test'}
            className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-emerald-100/40 to-sky-100/40 p-6 text-left shadow-lg transition hover:-translate-y-1"
            id="latest-summary"
            aria-label="Latest summary"
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

        <section id="deep-dive" className="mt-8" aria-labelledby="deep-dive-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="deep-dive-title" className="text-lg font-semibold text-foreground">
              Tap for more data · <span className="font-myanmar text-muted-foreground">အသေးစိတ်အချက်အလက်</span>
            </h2>
            <p className="text-sm text-muted-foreground">Each tile opens the relevant section with deeper analytics.</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {detailTiles.map(tile => (
              <Link
                key={tile.title}
                to={tile.href}
                className={`interactive-tile ${tile.gradient}`}
                aria-label={`${tile.title} – ${tile.titleMy}`}
              >
                <p className="text-sm font-semibold text-foreground">{tile.title}</p>
                <p className="text-xs text-muted-foreground font-myanmar">{tile.titleMy}</p>
                <p className="mt-3 text-2xl font-bold text-foreground">{tile.stat}</p>
                <p className="text-sm text-muted-foreground">{tile.description}</p>
                <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">Open details →</span>
              </Link>
            ))}
          </div>
        </section>

        <section id="category-accuracy" className="mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-lg" aria-labelledby="category-accuracy-title">
          <div className="flex items-center justify-between">
            <h2 id="category-accuracy-title" className="text-lg font-semibold text-foreground">
              Category accuracy · <span className="font-myanmar text-muted-foreground">အပိုင်းလိုက်မှန်ကန်မှု</span>
            </h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              View full analytics →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(categoryBreakdown).map(([category, stats]) => {
              const rate = Math.round((stats.correct / stats.total) * 100);
              const encodedCategory = encodeURIComponent(category);
              return (
                <Link
                  key={category}
                  to={`/study?category=${encodedCategory}#cards`}
                  className="group rounded-2xl border border-border/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Review ${category}`}
                >
                  <p className="text-sm font-semibold text-foreground">{category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.correct} correct out of {stats.total} questions</p>
                  <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                    Go to flip-cards →
                  </span>
                </Link>
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
