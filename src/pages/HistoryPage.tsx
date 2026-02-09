'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ChevronDown, ChevronUp, Layers3, ClipboardList, Mic2, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { TestEndReason, InterviewSession } from '@/types';
import { getInterviewHistory } from '@/lib/interview';
import { BilingualHeading, PageTitle } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem, FadeIn } from '@/components/animations/StaggeredList';
import { Progress } from '@/components/ui/Progress';
import { ShareButton } from '@/components/social/ShareButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAnswerHistory } from '@/lib/mastery/masteryStore';
import type { StoredAnswer } from '@/lib/mastery';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';

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

  // Derive active tab from URL hash (tab-specific hashes) or use user-selected override
  const tabFromHash: 'tests' | 'practice' | 'interview' | null = useMemo(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'interview') return 'interview';
    if (hash === 'practice') return 'practice';
    if (hash === 'tests') return 'tests';
    return null;
  }, [location.hash]);

  const [userSelectedTab, setUserSelectedTab] = useState<'tests' | 'practice' | 'interview' | null>(
    null
  );
  const activeTab = userSelectedTab ?? tabFromHash ?? 'tests';

  const setActiveTab = useCallback((tab: 'tests' | 'practice' | 'interview') => {
    setUserSelectedTab(tab);
  }, []);

  const [practiceAnswers, setPracticeAnswers] = useState<StoredAnswer[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);

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

  // Load interview session data from IndexedDB
  useEffect(() => {
    let cancelled = false;
    getInterviewHistory()
      .then(sessions => {
        if (!cancelled) {
          setInterviewSessions(sessions);
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
    const hash = location.hash.replace('#', '');
    // Tab hashes are handled by tabFromHash derivation, skip scrolling for them
    if (hash === 'interview' || hash === 'practice' || hash === 'tests') return;
    const target = document.getElementById(hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  // Tab config for DRY rendering
  const tabs = [
    {
      key: 'tests' as const,
      en: strings.nav.mockTest.en,
      my: strings.nav.mockTest.my,
      icon: ClipboardList,
    },
    {
      key: 'practice' as const,
      en: strings.practice.practiceSessions.en,
      my: strings.practice.practiceSessions.my,
      icon: BookOpen,
    },
    {
      key: 'interview' as const,
      en: strings.interview.interviewHistory.en,
      my: strings.interview.interviewHistory.my,
      icon: Mic2,
    },
  ];

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

        {/* Tab navigation - Duolingo-style rounded pill tabs */}
        <div className="mb-8 flex rounded-2xl border border-border bg-muted/30 p-1 w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'rounded-xl px-4 py-2.5 text-sm font-bold transition-all min-h-[44px] flex items-center gap-2',
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px] transition-[box-shadow,transform] duration-100'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {tab.en}
                  {showBurmese && (
                    <span className="ml-1 font-myanmar text-xs opacity-80">{tab.my}</span>
                  )}
                </span>
              </button>
            );
          })}
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
                            <p className="text-sm font-bold text-foreground">
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
                              className={clsx(
                                'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-foreground min-h-[44px]',
                                'transition-all hover:bg-muted/40 hover:border-primary-300',
                                'shadow-[0_3px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]'
                              )}
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
                                      'text-xs font-bold',
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
                <Card className="text-center py-12">
                  <p className="text-4xl mb-4">📝</p>
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
                    variant="chunky"
                    onClick={() => navigate('/practice')}
                  />
                </Card>
              </FadeIn>
            )}
          </section>
        )}

        {/* Interview Sessions Tab */}
        {activeTab === 'interview' && (
          <section className="space-y-6" aria-label="Interview Sessions">
            {interviewSessions.length > 0 ? (
              <StaggeredList className="space-y-4">
                {interviewSessions.map((session, idx) => {
                  const sessionId = session.id ?? `interview-${idx}`;
                  const isExpanded = expandedSessionId === sessionId;
                  const scorePercent =
                    session.totalQuestions > 0
                      ? Math.round((session.score / session.totalQuestions) * 100)
                      : 0;

                  const endReasonCopy: Record<string, string> = {
                    passThreshold: 'Ended early after passing threshold',
                    failThreshold: 'Stopped after too many incorrect answers',
                    complete: 'Completed all questions',
                    quit: 'Ended by user',
                  };

                  return (
                    <StaggeredItem key={sessionId}>
                      <Card
                        interactive
                        onClick={() => toggleSession(sessionId)}
                        className="min-h-[44px]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground">
                                {new Date(session.date).toLocaleString()}
                              </p>
                              <span
                                className={clsx(
                                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                                  session.mode === 'realistic'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {session.mode === 'realistic' ? (
                                  showBurmese ? (
                                    <span className="font-myanmar">
                                      {strings.interview.realisticMode.my}
                                    </span>
                                  ) : (
                                    'Realistic'
                                  )
                                ) : showBurmese ? (
                                  <span className="font-myanmar">
                                    {strings.interview.practiceMode.my}
                                  </span>
                                ) : (
                                  'Practice'
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Score {session.score} / {session.totalQuestions} ·{' '}
                              {Math.round(session.durationSeconds / 60)} mins
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {endReasonCopy[session.endReason] ?? session.endReason}
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
                                {session.passed ? (
                                  showBurmese ? (
                                    <span className="font-myanmar">
                                      {strings.interview.passed.my}
                                    </span>
                                  ) : (
                                    'Passed'
                                  )
                                ) : showBurmese ? (
                                  <span className="font-myanmar">
                                    {strings.interview.failed.my}
                                  </span>
                                ) : (
                                  'Keep trying'
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={clsx(
                                'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-foreground min-h-[44px]',
                                'transition-all hover:bg-muted/40 hover:border-primary-300',
                                'shadow-[0_3px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]'
                              )}
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
                            variant={session.passed ? 'success' : 'warning'}
                            size="sm"
                          />
                        </div>

                        {isExpanded && session.results.length > 0 && (
                          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                            {session.results.map((result, rIdx) => (
                              <div
                                key={`${sessionId}-${rIdx}`}
                                className={clsx(
                                  'rounded-xl border p-3 text-sm',
                                  result.selfGrade === 'correct'
                                    ? 'border-success-500/20 bg-success-50/50 dark:bg-success-500/5'
                                    : 'border-warning-500/20 bg-warning-50/50 dark:bg-warning-500/5'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {result.questionId}
                                  </span>
                                  <span
                                    className={clsx(
                                      'text-xs font-bold',
                                      result.selfGrade === 'correct'
                                        ? 'text-success-500'
                                        : 'text-warning-500'
                                    )}
                                  >
                                    {result.selfGrade === 'correct' ? (
                                      showBurmese ? (
                                        <span className="font-myanmar">
                                          {strings.interview.correct.my}
                                        </span>
                                      ) : (
                                        'Correct'
                                      )
                                    ) : showBurmese ? (
                                      <span className="font-myanmar">
                                        {strings.interview.incorrect.my}
                                      </span>
                                    ) : (
                                      'Incorrect'
                                    )}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                  {result.questionText_en}
                                </p>
                                {showBurmese && (
                                  <p className="text-xs text-muted-foreground font-myanmar mt-0.5">
                                    {result.questionText_my}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.correctAnswers.map(a => a.text_en).join(' / ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {isExpanded && session.results.length === 0 && (
                          <p className="mt-4 text-xs text-muted-foreground italic">
                            {showBurmese ? (
                              <span className="font-myanmar">
                                {
                                  'အမေးခွန်းအသေးစိတ်များ မရနိုင်ပါ၍'
                                }
                              </span>
                            ) : (
                              'Detailed question results not available for synced sessions.'
                            )}
                          </p>
                        )}
                      </Card>
                    </StaggeredItem>
                  );
                })}
              </StaggeredList>
            ) : (
              <FadeIn>
                <Card className="text-center py-12">
                  <p className="text-4xl mb-4">🎤</p>
                  <BilingualHeading
                    text={{
                      en: 'No interview sessions yet',
                      my: 'အင်တာဗျူးများ မရှိသေးပါ',
                    }}
                    level={2}
                    size="lg"
                    centered
                    className="mb-2"
                  />
                  <p className="text-muted-foreground mb-6">
                    Try a mock interview to practice for your USCIS appointment!
                    {showBurmese && (
            <span className="block font-myanmar mt-1">
                        USCIS အင်တာဗျူးအတွက် လေ့ကျင့်မှုစမ်းကြည့်ပါ!
                      </span>
                    )}
                  </p>
                  <BilingualButton
                    label={strings.interview.startInterview}
                    variant="chunky"
                    onClick={() => navigate('/interview')}
                  />
                </Card>
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
                <Card className="p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
                    Attempts
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-1">{history.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total synced tests</p>
                  <p className="text-xs text-muted-foreground font-myanmar">
                    {
                      'စာမေးပွဲ စုစုပေါင်း'
                    }
                  </p>
                </Card>
              </FadeIn>
              <FadeIn delay={100}>
                <Card className="p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
                    Best score
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-1">
                    {bestSession ? `${bestSession.score} / ${bestSession.totalQuestions}` : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Keep chasing perfection</p>
                  <p className="text-xs text-muted-foreground font-myanmar">
                    {
                      'အကောင်းဆုံးအမှတ်'
                    }
                  </p>
                </Card>
              </FadeIn>
              <FadeIn delay={200}>
                <Card className="p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
                    Pass rate
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-1">{passRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">60%+ earns a pass</p>
                  <p className="text-xs text-muted-foreground font-myanmar">
                    {
                      'အောင်မြင်နှုန်း'
                    }
                  </p>
                </Card>
              </FadeIn>
            </section>

            {/* Score trend chart */}
            <section id="trend" className="mt-8" aria-labelledby="history-trend">
              <Card>
                <h2 id="history-trend" className="text-lg font-bold text-foreground mb-1">
                  Score trend
                </h2>
                <p className="font-myanmar text-sm text-muted-foreground mb-4">
                  {
                    'အမှတ်တိုးတက်မှု'
                  }
                </p>
                <div className="h-72 w-full">
                  {chartData.length ? (
                    <ResponsiveContainer>
                      <LineChart
                        data={chartData}
                        margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
                      >
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
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Complete your first test to unlock analytics.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </section>

            {/* Attempt log with staggered list */}
            <section id="attempts" className="mt-8 space-y-6" aria-labelledby="history-attempts">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/15">
                  <Layers3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 id="history-attempts" className="text-lg font-bold text-foreground">
                    Attempt log
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tap any row to review every question you answered.
                    {showBurmese && (
                      <span className="font-myanmar ml-1">
                        {'မှတ်တမ်းဇယား'}
                      </span>
                    )}
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
                              <p className="text-sm font-bold text-foreground">
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
                                  {session.passed ? (
                                    <>
                                      Passed /{' '}
                                      <span className="font-myanmar">
                                        {'အောင်'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      Keep trying /{' '}
                                      <span className="font-myanmar">
                                        {
                                          'ဆက်ကြိုးစားပါ'
                                        }
                                      </span>
                                    </>
                                  )}
                                </span>
                              </div>
                              <ShareButton
                                variant="compact"
                                data={
                                  {
                                    score: session.score,
                                    total: session.totalQuestions,
                                    sessionType: 'test',
                                    streak: 0,
                                    topBadge: null,
                                    categories: Object.entries(
                                      session.results.reduce<
                                        Record<string, { correct: number; total: number }>
                                      >((acc, r) => {
                                        if (!acc[r.category])
                                          acc[r.category] = { correct: 0, total: 0 };
                                        acc[r.category].total += 1;
                                        if (r.isCorrect) acc[r.category].correct += 1;
                                        return acc;
                                      }, {})
                                    ).map(([name, stats]) => ({
                                      name,
                                      correct: stats.correct,
                                      total: stats.total,
                                    })),
                                    date: session.date,
                                  } satisfies ShareCardData
                                }
                              />
                              <button
                                type="button"
                                className={clsx(
                                  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-2 text-sm font-bold text-foreground min-h-[44px]',
                                  'transition-all hover:bg-muted/40 hover:border-primary-300',
                                  'shadow-[0_3px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]'
                                )}
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
                                  <p className="text-sm font-bold text-foreground">
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
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                        Your answer ·{' '}
                                        <span className="font-myanmar">
                                          {'အဖြေ'}
                                        </span>
                                      </p>
                                      <p className="text-sm font-bold text-foreground">
                                        {result.selectedAnswer.text_en}
                                      </p>
                                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                        {result.selectedAnswer.text_my}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                        Official answer ·{' '}
                                        <span className="font-myanmar">
                                          {'အဖြေမှန်'}
                                        </span>
                                      </p>
                                      <p className="text-sm font-bold text-foreground">
                                        {result.correctAnswer.text_en}
                                      </p>
                                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                        {result.correctAnswer.text_my}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                      {result.category}
                                    </span>
                                    <span
                                      className={
                                        result.isCorrect ? 'text-success-500' : 'text-warning-500'
                                      }
                                    >
                                      {result.isCorrect ? (
                                        <>
                                          Correct ·{' '}
                                          <span className="font-myanmar">
                                            {'မှန်'}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          Incorrect ·{' '}
                                          <span className="font-myanmar">
                                            {'မှား'}
                                          </span>
                                        </>
                                      )}
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
                  <Card className="text-center py-12">
                    <p className="text-4xl mb-4">🗽</p>
                    <BilingualHeading
                      text={{
                        en: "You haven't taken any tests yet",
                        my: 'သင်မည်သည့်စာမေးပွဲမှဖြေဆိုရသေးပါ',
                      }}
                      level={2}
                      size="lg"
                      centered
                      className="mb-2"
                    />
                    <p className="text-muted-foreground mb-6">
                      Take your first practice test to start tracking progress!
                      <span className="block font-myanmar mt-1">
                        {
                          'တိုးတက်မှုခြေရာခံဖို့ ပထမဆုံးစာမေးပွဲဖြေပါ!'
                        }
                      </span>
                    </p>
                    <BilingualButton
                      label={strings.actions.startTest}
                      variant="chunky"
                      onClick={() => navigate('/test')}
                    />
                  </Card>
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
