'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  YAxis,
} from 'recharts';
import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { TestEndReason } from '@/types';
import { BilingualHeading, PageTitle } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem, FadeIn } from '@/components/animations/StaggeredList';
import { Progress } from '@/components/ui/Progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAnswerHistory } from '@/lib/mastery/masteryStore';
import type { StoredAnswer } from '@/lib/mastery';
import { strings } from '@/lib/i18n/strings';

const reasonCopy: Record<TestEndReason, string> = {
  passThreshold: 'Ended early after 12 correct answers',
  failThreshold: 'Stopped after 9 incorrect answers',
  time: 'Time limit reached',
  complete: 'Completed all 20 questions',
};

/** Practice session derived from answer history */
interface PracticeSessionGroup {
  id: string;
  date: string;
  category: string;
  correctCount: number;
  totalCount: number;
  answers: StoredAnswer[];
}

const HistoryPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'practice'>('tests');
  const [practiceAnswers, setPracticeAnswers] = useState<StoredAnswer[]>([]);

  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);

  // Load practice session data from answer history
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          setPracticeAnswers(answers.filter(a => a.sessionType === 'practice'));
        }
      })
      .catch(() => {
        // IndexedDB not available
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group practice answers into sessions (5-minute windows)
  const practiceSessions: PracticeSessionGroup[] = useMemo(() => {
    if (practiceAnswers.length === 0) return [];

    const sorted = [...practiceAnswers].sort((a, b) => a.timestamp - b.timestamp);
    const SESSION_GAP_MS = 5 * 60 * 1000; // 5 minutes between sessions

    const toGroup = (groupAnswers: StoredAnswer[]): PracticeSessionGroup => {
      const firstTimestamp = groupAnswers[0].timestamp;
      const cats = new Set(groupAnswers.map(a => a.questionId.split('-')[0]));
      const categoryLabel =
        cats.size === 1 ? `Category: ${[...cats][0]}` : `${cats.size} categories`;
      return {
        id: `practice-${firstTimestamp}`,
        date: new Date(firstTimestamp).toISOString(),
        category: categoryLabel,
        correctCount: groupAnswers.filter(a => a.isCorrect).length,
        totalCount: groupAnswers.length,
        answers: groupAnswers,
      };
    };

    const groups: PracticeSessionGroup[] = [];
    let currentGroup: StoredAnswer[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].timestamp - sorted[i - 1].timestamp;
      if (gap > SESSION_GAP_MS) {
        groups.push(toGroup(currentGroup));
        currentGroup = [sorted[i]];
      } else {
        currentGroup.push(sorted[i]);
      }
    }
    if (currentGroup.length > 0) {
      groups.push(toGroup(currentGroup));
    }

    return groups.reverse();
  }, [practiceAnswers]);

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
  const passRate = history.length
    ? Math.round((history.filter(session => session.passed).length / history.length) * 100)
    : 0;

  const toggleSession = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.replace('#', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="page-shell" data-tour="test-history">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageTitle text={strings.nav.testHistory} />

        <p className="text-muted-foreground mb-6">
          Every attempt is securely stored so you can review trends anytime.
          <span className="block font-myanmar mt-1">
            ကြိုးစားမှုတိုင်းကို လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။
          </span>
        </p>

        {/* Tab navigation */}
        <div className="mb-8 flex rounded-lg border border-border bg-muted/30 p-0.5 w-fit">
          <button
            onClick={() => setActiveTab('tests')}
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]',
              activeTab === 'tests'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {strings.nav.mockTest.en}
            {showBurmese && (
              <span className="ml-1 font-myanmar text-xs">{strings.nav.mockTest.my}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]',
              activeTab === 'practice'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {strings.practice.practiceSessions.en}
            {showBurmese && (
              <span className="ml-1 font-myanmar text-xs">
                {strings.practice.practiceSessions.my}
              </span>
            )}
          </button>
        </div>

        {/* Practice Sessions Tab */}
        {activeTab === 'practice' && (
          <section className="space-y-6" aria-label="Practice Sessions">
            {practiceSessions.length > 0 ? (
              <StaggeredList className="space-y-4">
                {practiceSessions.map(session => {
                  const isExpanded = expandedSessionId === session.id;
                  const scorePercent =
                    session.totalCount > 0
                      ? Math.round((session.correctCount / session.totalCount) * 100)
                      : 0;

                  return (
                    <StaggeredItem key={session.id}>
                      <Card
                        interactive
                        onClick={() => toggleSession(session.id)}
                        className="min-h-[44px]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(session.date).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.category} · {session.totalCount} questions
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span
                                className={clsx(
                                  'text-2xl font-bold',
                                  scorePercent >= 60 ? 'text-success-500' : 'text-warning-500'
                                )}
                              >
                                {scorePercent}%
                              </span>
                              <span className="block text-sm text-muted-foreground">
                                {session.correctCount}/{session.totalCount} correct
                              </span>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 min-h-[44px]"
                              aria-label={isExpanded ? 'Hide details' : 'Show details'}
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Progress
                            value={scorePercent}
                            variant={scorePercent >= 60 ? 'success' : 'warning'}
                            size="sm"
                          />
                        </div>

                        {isExpanded && (
                          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                            {session.answers.map((answer, idx) => (
                              <div
                                key={`${session.id}-${idx}`}
                                className={clsx(
                                  'rounded-xl border p-3 text-sm',
                                  answer.isCorrect
                                    ? 'border-success-500/20 bg-success-50/50 dark:bg-success-500/5'
                                    : 'border-warning-500/20 bg-warning-50/50 dark:bg-warning-500/5'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {answer.questionId}
                                  </span>
                                  <span
                                    className={clsx(
                                      'text-xs font-semibold',
                                      answer.isCorrect ? 'text-success-500' : 'text-warning-500'
                                    )}
                                  >
                                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </StaggeredItem>
                  );
                })}
              </StaggeredList>
            ) : (
              <FadeIn>
                <div className="text-center py-12">
                  <BilingualHeading
                    text={{
                      en: 'No practice sessions yet',
                      my: 'လေ့ကျင့်မှုအကြိမ်များ မရှိသေးပါ',
                    }}
                    level={2}
                    size="lg"
                    centered
                    className="mb-2"
                  />
                  <p className="text-muted-foreground mb-6">
                    Start a practice session to track your progress here!
                    {showBurmese && (
                      <span className="block font-myanmar mt-1">
                        ဒီမှာတိုးတက်မှုခြေရာခံဖို့ လေ့ကျင့်မှုစတင်ပါ!
                      </span>
                    )}
                  </p>
                  <BilingualButton
                    label={strings.practice.startPractice}
                    variant="primary"
                    onClick={() => navigate('/practice')}
                  />
                </div>
              </FadeIn>
            )}
          </section>
        )}

        {/* Tests Tab Content */}
        {activeTab === 'tests' && (
          <>
            {/* Overview statistics */}
            <section
              id="overview"
              className="grid gap-6 sm:grid-cols-3"
              aria-labelledby="history-overview"
            >
              <span id="history-overview" className="sr-only">
                Overview statistics
              </span>
              <FadeIn>
                <Card className="p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Attempts
                  </p>
                  <p className="text-3xl font-bold text-foreground">{history.length}</p>
                  <p className="text-sm text-muted-foreground">Total synced tests</p>
                  <p className="text-xs text-muted-foreground font-myanmar">စာမေးပွဲ စုစုပေါင်း</p>
                </Card>
              </FadeIn>
              <FadeIn delay={100}>
                <Card className="p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Best score
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {bestSession ? `${bestSession.score} / ${bestSession.totalQuestions}` : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Keep chasing perfection</p>
                  <p className="text-xs text-muted-foreground font-myanmar">အကောင်းဆုံးအမှတ်</p>
                </Card>
              </FadeIn>
              <FadeIn delay={200}>
                <Card className="p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Pass rate
                  </p>
                  <p className="text-3xl font-bold text-foreground">{passRate}%</p>
                  <p className="text-sm text-muted-foreground">60%+ earns a pass</p>
                  <p className="text-xs text-muted-foreground font-myanmar">အောင်မြင်နှုန်း</p>
                </Card>
              </FadeIn>
            </section>

            {/* Score trend chart */}
            <section
              id="trend"
              className="mt-8 glass-panel p-6 shadow-primary/15"
              aria-labelledby="history-trend"
            >
              <h2 id="history-trend" className="text-lg font-semibold text-foreground">
                Score trend ·{' '}
                <span className="font-myanmar text-muted-foreground">အမှတ်တိုးတက်မှု</span>
              </h2>
              <div className="mt-6 h-72 w-full">
                {chartData.length ? (
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={value => `${value}%`}
                        stroke="#94a3b8"
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={value => `${Number(value).toFixed(0)}%`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderRadius: '1rem',
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">
                    Complete your first test to unlock analytics.
                  </p>
                )}
              </div>
            </section>

            {/* Attempt log with staggered list */}
            <section id="attempts" className="mt-8 space-y-6" aria-labelledby="history-attempts">
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-primary" />
                <div>
                  <h2 id="history-attempts" className="text-lg font-semibold text-foreground">
                    Attempt log ·{' '}
                    <span className="font-myanmar text-muted-foreground">မှတ်တမ်းဇယား</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tap any row to review every question you answered.
                  </p>
                </div>
              </div>

              {history.length > 0 && (
                <StaggeredList className="space-y-4">
                  {history.map(session => {
                    const sessionId = session.id ?? session.date;
                    const isExpanded = expandedSessionId === sessionId;
                    const scorePercent = Math.round((session.score / session.totalQuestions) * 100);

                    return (
                      <StaggeredItem key={sessionId}>
                        <Card
                          interactive
                          onClick={() => toggleSession(sessionId)}
                          className="min-h-[44px]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(session.date).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Score {session.score} / {session.totalQuestions} ·{' '}
                                {Math.round(session.durationSeconds / 60)} mins
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {reasonCopy[session.endReason]}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span
                                  className={clsx(
                                    'text-2xl font-bold',
                                    session.passed ? 'text-success-500' : 'text-warning-500'
                                  )}
                                >
                                  {scorePercent}%
                                </span>
                                <span className="block text-sm text-muted-foreground">
                                  {session.passed
                                    ? 'Passed / အောင်'
                                    : 'Keep trying / ဆက်ကြိုးစားပါ'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 min-h-[44px]"
                                aria-label={isExpanded ? 'Hide review' : 'Review answers'}
                              >
                                {isExpanded ? 'Hide' : 'Review'}
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Score progress bar */}
                          <div className="mt-3">
                            <Progress
                              value={scorePercent}
                              variant={session.passed ? 'success' : 'warning'}
                              size="sm"
                            />
                          </div>

                          {isExpanded && (
                            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                              {session.results.map(result => (
                                <div
                                  key={`${sessionId}-${result.questionId}`}
                                  className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-muted/50 p-4 shadow-sm"
                                >
                                  <p className="text-sm font-semibold text-foreground">
                                    {result.questionText_en}
                                  </p>
                                  <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                    {result.questionText_my}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <SpeechButton
                                      text={result.questionText_en}
                                      label="Play English question"
                                      ariaLabel={`Play English question audio for ${result.questionText_en}`}
                                    />
                                    <SpeechButton
                                      text={result.correctAnswer.text_en}
                                      label="Play official answer"
                                      ariaLabel={`Play official English answer for ${result.questionText_en}`}
                                    />
                                  </div>
                                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Your answer · <span className="font-myanmar">အဖြေ</span>
                                      </p>
                                      <p className="text-sm font-semibold text-foreground">
                                        {result.selectedAnswer.text_en}
                                      </p>
                                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                        {result.selectedAnswer.text_my}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Official answer ·{' '}
                                        <span className="font-myanmar">အဖြေမှန်</span>
                                      </p>
                                      <p className="text-sm font-semibold text-foreground">
                                        {result.correctAnswer.text_en}
                                      </p>
                                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                        {result.correctAnswer.text_my}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                      {result.category}
                                    </span>
                                    <span
                                      className={
                                        result.isCorrect ? 'text-success-500' : 'text-warning-500'
                                      }
                                    >
                                      {result.isCorrect ? 'Correct · မှန်' : 'Incorrect · မှား'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </StaggeredItem>
                    );
                  })}
                </StaggeredList>
              )}

              {/* Empty state with encouraging bilingual message */}
              {!history.length && (
                <FadeIn>
                  <div className="text-center py-12">
                    <BilingualHeading
                      text={{
                        en: "You haven't taken any tests yet",
                        my: 'သင်မည်သည့်စာမေးပွဲမှမဖြေဆိုရသေးပါ',
                      }}
                      level={2}
                      size="lg"
                      centered
                      className="mb-2"
                    />
                    <p className="text-muted-foreground mb-6">
                      Take your first practice test to start tracking progress!
                      <span className="block font-myanmar mt-1">
                        တိုးတက်မှုခြေရာခံဖို့ ပထမဆုံးစာမေးပွဲဖြေပါ!
                      </span>
                    </p>
                    <BilingualButton
                      label={strings.actions.startTest}
                      variant="primary"
                      onClick={() => navigate('/test')}
                    />
                  </div>
                </FadeIn>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
