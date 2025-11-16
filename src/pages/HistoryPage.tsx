'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid, YAxis } from 'recharts';
import { useMemo } from 'react';
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">History</p>
          <h1 className="text-3xl font-bold text-slate-900">Mock test performance</h1>
          <p className="text-slate-600">Every attempt is securely stored in Supabase so you can review trends anytime.</p>
        </header>

        <section className="mt-8 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Score trend</h2>
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

        <section className="mt-8 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attempt log</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">Date</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Result</th>
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
