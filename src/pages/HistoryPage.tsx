'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid, YAxis } from 'recharts';
import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { TestEndReason } from '@/types';

const reasonCopy: Record<TestEndReason, string> = {
  passThreshold: 'Ended early after 12 correct answers',
  failThreshold: 'Stopped after 9 incorrect answers',
  time: 'Time limit reached',
  complete: 'Completed all 20 questions',
};

const HistoryPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const history = user?.testHistory ?? [];
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      history
        .slice()
        .reverse()
        .map(session => ({
          date: new Date(session.date).toLocaleDateString(),
          score: (session.score / session.totalQuestions) * 100,
        })),
    [history]
  );

  const bestSession = history.reduce<(typeof history)[number] | null>((best, session) => {
    if (!best) return session;
    return session.score > best.score ? session : best;
  }, history[0] ?? null);
  const passRate = history.length ? Math.round((history.filter(session => session.passed).length / history.length) * 100) : 0;

  const toggleSession = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.replace('#', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="glass-panel p-6 shadow-primary/20">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">History · မှတ်တမ်း</p>
          <h1 className="text-3xl font-bold text-foreground">
            Mock test performance
            <span className="mt-1 block text-lg font-normal text-muted-foreground font-myanmar">စမ်းသပ်မေးခွန်းကျော်ကြားမှု</span>
          </h1>
          <p className="text-muted-foreground">Every attempt is securely stored in Supabase so you can review trends anytime.</p>
        </header>

        <section id="overview" className="mt-8 grid gap-6 sm:grid-cols-3" aria-labelledby="history-overview">
          <span id="history-overview" className="sr-only">
            Overview statistics
          </span>
          <div className="stat-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Attempts</p>
            <p className="text-3xl font-bold text-foreground">{history.length}</p>
            <p className="text-sm text-muted-foreground">Total Supabase-synced tests</p>
            <p className="text-xs text-muted-foreground font-myanmar">လုပ်ဆောင်မှု စုစုပေါင်း</p>
          </div>
          <div className="stat-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Best score</p>
            <p className="text-3xl font-bold text-foreground">
              {bestSession ? `${bestSession.score} / ${bestSession.totalQuestions}` : '—'}
            </p>
            <p className="text-sm text-muted-foreground">Keep chasing perfection</p>
            <p className="text-xs text-muted-foreground font-myanmar">အကောင်းဆုံးအမှတ်</p>
          </div>
          <div className="stat-card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Pass rate</p>
            <p className="text-3xl font-bold text-foreground">{passRate}%</p>
            <p className="text-sm text-muted-foreground">60%+ earns a pass</p>
            <p className="text-xs text-muted-foreground font-myanmar">အောင်မြင်နှုန်း</p>
          </div>
        </section>

        <section id="trend" className="mt-8 glass-panel p-6 shadow-primary/15" aria-labelledby="history-trend">
          <h2 id="history-trend" className="text-lg font-semibold text-foreground">Score trend · <span className="font-myanmar text-muted-foreground">အမှတ်တိုးတက်မှု</span></h2>
          <div className="mt-6 h-72 w-full">
            {chartData.length ? (
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip formatter={value => `${Number(value).toFixed(0)}%`} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">Complete your first test to unlock analytics.</p>
            )}
          </div>
        </section>

        <section id="attempts" className="mt-8 space-y-6" aria-labelledby="history-attempts">
          <div className="flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-primary" />
            <div>
              <h2 id="history-attempts" className="text-lg font-semibold text-foreground">Attempt log · <span className="font-myanmar text-muted-foreground">မှတ်တမ်းဇယား</span></h2>
              <p className="text-sm text-muted-foreground">Tap any row to review every question you answered.</p>
            </div>
          </div>
          {history.map(session => {
            const sessionId = session.id ?? session.date;
            const isExpanded = expandedSessionId === sessionId;
            return (
              <div key={sessionId} className="glass-panel p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{new Date(session.date).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Score {session.score} / {session.totalQuestions} · {Math.round(session.durationSeconds / 60)} mins ·{' '}
                      <span className={session.passed ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                        {session.passed ? 'PASS' : 'REVIEW'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{reasonCopy[session.endReason]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSession(sessionId)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
                  >
                    {isExpanded ? 'Hide review' : 'Review answers'}
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                    {session.results.map(result => (
                      <div
                        key={`${sessionId}-${result.questionId}`}
                        className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-muted/50 p-4 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
                        <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{result.questionText_my}</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Your answer · <span className="font-myanmar">အဖြေ</span>
                            </p>
                            <p className="text-sm font-semibold text-foreground">{result.selectedAnswer.text_en}</p>
                            <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{result.selectedAnswer.text_my}</p>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Official answer · <span className="font-myanmar">အဖြေမှန်</span>
                            </p>
                            <p className="text-sm font-semibold text-foreground">{result.correctAnswer.text_en}</p>
                            <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">{result.correctAnswer.text_my}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                            {result.category}
                          </span>
                          <span className={result.isCorrect ? 'text-emerald-500' : 'text-red-500'}>
                            {result.isCorrect ? 'Correct · မှန်' : 'Incorrect · မှား' }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!history.length && (
            <div className="glass-panel p-6 text-center text-muted-foreground">
              No attempts yet. Take your first practice test!
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HistoryPage;
