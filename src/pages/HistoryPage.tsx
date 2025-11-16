'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid, YAxis } from 'recharts';
import { useMemo } from 'react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const HistoryPage = () => {
  const { user } = useAuth();
  const history = user?.testHistory ?? [];

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

  const bestScore = history.reduce((max, session) => Math.max(max, session.score), 0);
  const passRate = history.length
    ? Math.round((history.filter(session => session.passed).length / history.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-primary/10">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">History · မှတ်တမ်း</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Mock test performance
            <span className="mt-1 block text-lg font-normal text-slate-500 font-myanmar">စမ်းသပ်မေးခွန်းကျော်ကြားမှု</span>
          </h1>
          <p className="text-slate-600">Every attempt is securely stored in Supabase so you can review trends anytime.</p>
        </header>

        <section className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Attempts</p>
            <p className="text-3xl font-bold text-slate-900">{history.length}</p>
            <p className="text-sm text-slate-500">Total Supabase-synced tests</p>
            <p className="text-xs text-slate-400 font-myanmar">လုပ်ဆောင်မှု စုစုပေါင်း</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Best score</p>
            <p className="text-3xl font-bold text-slate-900">{bestScore} / 20</p>
            <p className="text-sm text-slate-500">Keep chasing perfection</p>
            <p className="text-xs text-slate-400 font-myanmar">အကောင်းဆုံးအမှတ်</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pass rate</p>
            <p className="text-3xl font-bold text-slate-900">{passRate}%</p>
            <p className="text-sm text-slate-500">60%+ earns a pass</p>
            <p className="text-xs text-slate-400 font-myanmar">အောင်မြင်နှုန်း</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/60 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900">Score trend · <span className="font-myanmar text-slate-500">အမှတ်တိုးတက်မှု</span></h2>
          <div className="mt-6 h-72 w-full">
            {chartData.length ? (
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={value => `${Number(value).toFixed(0)}%`} />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">Complete your first test to unlock analytics.</p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/60 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900">Attempt log · <span className="font-myanmar text-slate-500">မှတ်တမ်းဇယား</span></h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">
                    Date
                    <span className="block text-xs font-myanmar text-slate-400">ရက်စွဲ</span>
                  </th>
                  <th>
                    Score
                    <span className="block text-xs font-myanmar text-slate-400">အမှတ်</span>
                  </th>
                  <th>
                    Duration
                    <span className="block text-xs font-myanmar text-slate-400">ကြာချိန်</span>
                  </th>
                  <th>
                    Result
                    <span className="block text-xs font-myanmar text-slate-400">ရလဒ်</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map(session => (
                  <tr key={session.id ?? session.date} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{new Date(session.date).toLocaleString()}</td>
                    <td className="text-slate-900">
                      {session.score} / {session.totalQuestions}
                    </td>
                    <td className="text-slate-600">{Math.round(session.durationSeconds / 60)} mins</td>
                    <td className={session.passed ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                      {session.passed ? 'PASS' : 'REVIEW'}
                    </td>
                  </tr>
                ))}
                {!history.length && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">
                      No attempts yet. Take your first practice test!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HistoryPage;
