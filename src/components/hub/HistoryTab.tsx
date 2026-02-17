'use client';

/**
 * HistoryTab
 *
 * Displays mock test and interview session history in two sections.
 * Consolidated test and interview history into the unified Hub.
 *
 * Features:
 * - Mock Tests section (top) with expandable per-question results, share buttons
 * - Interviews section (below) with mode badge, stage info, expandable detail
 * - Pagination: last 20 entries initially, "Load more" for 20 more
 * - Relative date formatting (Today, Yesterday, X days ago, MMM D)
 * - Empty states with bilingual CTAs
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, ClipboardList, Mic2 } from 'lucide-react';
import clsx from 'clsx';

import { SPRING_BOUNCY } from '@/lib/motion-config';
import SpeechButton from '@/components/ui/SpeechButton';
import type { TestSession, TestEndReason, InterviewSession } from '@/types';
import { getInterviewHistory } from '@/lib/interview';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { StaggeredList, StaggeredItem, FadeIn } from '@/components/animations/StaggeredList';
import { Progress } from '@/components/ui/Progress';
import { ShareButton } from '@/components/social/ShareButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import { GlassCard } from '@/components/hub/GlassCard';
import { formatRelativeDate } from '@/lib/formatRelativeDate';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HistoryTabProps {
  testHistory: TestSession[];
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const reasonCopy: Record<TestEndReason, string> = {
  passThreshold: 'Ended early after 12 correct answers',
  failThreshold: 'Stopped after 9 incorrect answers',
  time: 'Time limit reached',
  complete: 'Completed all 20 questions',
};

const interviewEndReasonCopy: Record<string, string> = {
  passThreshold: 'Ended early after passing threshold',
  failThreshold: 'Stopped after too many incorrect answers',
  complete: 'Completed all questions',
  quit: 'Ended by user',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HistoryTab({ testHistory, isLoading }: HistoryTabProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();

  // Track which entry is expanded (shared across both sections)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Pagination state
  const [testPage, setTestPage] = useState(1);
  const [interviewPage, setInterviewPage] = useState(1);

  // Interview sessions (loaded internally)
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getInterviewHistory()
      .then(sessions => {
        if (!cancelled) {
          setInterviewSessions(sessions);
          setInterviewLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setInterviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sort test history newest first (they come from Supabase newest first already, but be safe)
  const sortedTests = useMemo(
    () => [...testHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [testHistory]
  );

  const sortedInterviews = useMemo(
    () =>
      [...interviewSessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [interviewSessions]
  );

  // Paginated slices
  const visibleTests = useMemo(
    () => sortedTests.slice(0, testPage * PAGE_SIZE),
    [sortedTests, testPage]
  );
  const hasMoreTests = visibleTests.length < sortedTests.length;

  const visibleInterviews = useMemo(
    () => sortedInterviews.slice(0, interviewPage * PAGE_SIZE),
    [sortedInterviews, interviewPage]
  );
  const hasMoreInterviews = visibleInterviews.length < sortedInterviews.length;

  const toggleSession = useCallback((id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        {/* Simple skeleton placeholders */}
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card animate-pulse p-6">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
            <div className="mt-3 h-2 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10 py-2">
      {/* ================================================================= */}
      {/* MOCK TESTS SECTION                                                */}
      {/* ================================================================= */}
      <section aria-label="Mock Tests">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{strings.hub.mockTests.en}</h2>
            {showBurmese && (
              <p className="text-sm text-muted-foreground font-myanmar">
                {strings.hub.mockTests.my}
              </p>
            )}
          </div>
        </div>

        {sortedTests.length > 0 ? (
          <>
            <StaggeredList className="space-y-4">
              {visibleTests.map(session => {
                const sessionId = session.id ?? session.date;
                const isExpanded = expandedSessionId === sessionId;
                const scorePercent = Math.round((session.score / session.totalQuestions) * 100);

                return (
                  <StaggeredItem key={sessionId}>
                    <GlassCard
                      interactive
                      className="cursor-pointer p-4"
                      onClick={() => toggleSession(sessionId)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">
                              {formatRelativeDate(session.date)}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(session.durationSeconds / 60)} min
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Score {session.score} / {session.totalQuestions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reasonCopy[session.endReason]}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={clsx(
                                'text-2xl font-bold',
                                session.passed ? 'text-success' : 'text-warning'
                              )}
                            >
                              {scorePercent}%
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              {session.passed ? (
                                <>
                                  Passed
                                  {showBurmese && (
                                    <span className="font-myanmar ml-1">
                                      {'\u1021\u1031\u102C\u1004\u103A'}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  Keep trying
                                  {showBurmese && (
                                    <span className="font-myanmar ml-1">
                                      {
                                        '\u1006\u1000\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B'
                                      }
                                    </span>
                                  )}
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
                            onClick={e => {
                              e.stopPropagation();
                              toggleSession(sessionId);
                            }}
                            className={clsx(
                              'inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-border px-3 py-1.5 text-sm font-bold text-foreground min-h-[44px]',
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

                      {/* Expanded detail: per-question results with spring animation */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={SPRING_BOUNCY}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                              {session.results.map(result => (
                                <div
                                  key={`${sessionId}-${result.questionId}`}
                                  className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-muted/50 p-4 shadow-sm"
                                >
                                  <p className="text-sm font-bold text-foreground">
                                    {result.questionText_en}
                                  </p>
                                  {showBurmese && (
                                    <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                      {result.questionText_my}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <SpeechButton
                                      text={result.questionText_en}
                                      questionId={result.questionId}
                                      audioType="q"
                                      label="Question"
                                      ariaLabel={`Play English question audio for ${result.questionText_en}`}
                                      stopPropagation
                                    />
                                    <SpeechButton
                                      text={result.correctAnswer.text_en}
                                      questionId={result.questionId}
                                      audioType="a"
                                      label="Answer"
                                      ariaLabel={`Play official English answer for ${result.questionText_en}`}
                                      stopPropagation
                                    />
                                  </div>
                                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                        Your answer
                                        {showBurmese && (
                                          <span className="font-myanmar ml-1">
                                            {'\u1021\u1016\u103C\u1031'}
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-sm font-bold text-foreground">
                                        {result.selectedAnswer.text_en}
                                      </p>
                                      {showBurmese && (
                                        <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                          {result.selectedAnswer.text_my}
                                        </p>
                                      )}
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                        Official answer
                                        {showBurmese && (
                                          <span className="font-myanmar ml-1">
                                            {'\u1021\u1016\u103C\u1031\u1019\u103E\u1014\u103A'}
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-sm font-bold text-foreground">
                                        {result.correctAnswer.text_en}
                                      </p>
                                      {showBurmese && (
                                        <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                                          {result.correctAnswer.text_my}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                      {result.category}
                                    </span>
                                    <span
                                      className={result.isCorrect ? 'text-success' : 'text-warning'}
                                    >
                                      {result.isCorrect ? (
                                        <>
                                          Correct
                                          {showBurmese && (
                                            <span className="font-myanmar ml-1">
                                              {'\u1019\u103E\u1014\u103A'}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          Incorrect
                                          {showBurmese && (
                                            <span className="font-myanmar ml-1">
                                              {'\u1019\u103E\u102C\u1038'}
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </StaggeredItem>
                );
              })}
            </StaggeredList>

            {hasMoreTests && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setTestPage(p => p + 1)}
                  className={clsx(
                    'inline-flex items-center justify-center rounded-xl border-2 border-border px-6 py-2.5 text-sm font-bold text-foreground min-h-[44px]',
                    'transition-all hover:bg-muted/40 hover:border-primary-300',
                    'shadow-[0_3px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]'
                  )}
                >
                  {strings.hub.loadMore.en}
                  {showBurmese && (
                    <span className="font-myanmar ml-2">{strings.hub.loadMore.my}</span>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <FadeIn>
            <GlassCard className="py-12 text-center">
              <p className="mb-4 text-4xl">{'\uD83D\uDDFD'}</p>
              <BilingualHeading
                text={{
                  en: "You haven't taken any tests yet",
                  my: '\u101E\u1004\u103A\u1019\u100A\u103A\u101E\u100A\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103E\u1016\u103C\u1031\u1006\u102D\u102F\u101B\u101E\u1031\u1038\u1015\u102B',
                }}
                level={2}
                size="lg"
                centered
                className="mb-2"
              />
              <p className="text-muted-foreground mb-6">
                Take your first mock test to start tracking progress!
                {showBurmese && (
                  <span className="block font-myanmar mt-1">
                    {
                      '\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1001\u103C\u1031\u101B\u102C\u1001\u103E\u1014\u103A\u1016\u102D\u102F\u1037 \u1015\u1011\u1019\u1006\u102F\u1036\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1016\u103C\u1031\u1015\u102B\u0021'
                    }
                  </span>
                )}
              </p>
              <BilingualButton
                label={strings.actions.startTest}
                variant="chunky"
                onClick={() => navigate('/test')}
              />
            </GlassCard>
          </FadeIn>
        )}
      </section>

      {/* ================================================================= */}
      {/* INTERVIEWS SECTION                                                */}
      {/* ================================================================= */}
      <section aria-label="Interviews">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
            <Mic2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{strings.hub.interviews.en}</h2>
            {showBurmese && (
              <p className="text-sm text-muted-foreground font-myanmar">
                {strings.hub.interviews.my}
              </p>
            )}
          </div>
        </div>

        {interviewLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="glass-card animate-pulse p-6">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-2 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : sortedInterviews.length > 0 ? (
          <>
            <StaggeredList className="space-y-4">
              {visibleInterviews.map((session, idx) => {
                const sessionId = session.id ?? `interview-${idx}`;
                const isExpanded = expandedSessionId === sessionId;
                const scorePercent =
                  session.totalQuestions > 0
                    ? Math.round((session.score / session.totalQuestions) * 100)
                    : 0;

                return (
                  <StaggeredItem key={sessionId}>
                    <GlassCard
                      interactive
                      className="cursor-pointer p-4"
                      onClick={() => toggleSession(sessionId)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">
                              {formatRelativeDate(session.date)}
                            </p>
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                                session.mode === 'realistic'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {session.mode === 'realistic'
                                ? showBurmese
                                  ? strings.interview.realisticMode.my
                                  : 'Realistic'
                                : showBurmese
                                  ? strings.interview.practiceMode.my
                                  : 'Practice'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Score {session.score} / {session.totalQuestions} ·{' '}
                            {Math.round(session.durationSeconds / 60)} min
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {interviewEndReasonCopy[session.endReason] ?? session.endReason}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={clsx(
                                'text-2xl font-bold',
                                session.passed ? 'text-success' : 'text-warning'
                              )}
                            >
                              {scorePercent}%
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              {session.passed
                                ? showBurmese
                                  ? strings.interview.passed.my
                                  : 'Passed'
                                : showBurmese
                                  ? strings.interview.failed.my
                                  : 'Keep trying'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleSession(sessionId);
                            }}
                            className={clsx(
                              'inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-border px-3 py-1.5 text-sm font-bold text-foreground min-h-[44px]',
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

                      {/* Score progress bar */}
                      <div className="mt-3">
                        <Progress
                          value={scorePercent}
                          variant={session.passed ? 'success' : 'warning'}
                          size="sm"
                        />
                      </div>

                      {/* Expanded detail: per-question results with spring animation */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={SPRING_BOUNCY}
                            className="overflow-hidden"
                          >
                            {session.results.length > 0 ? (
                              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                                {session.results.map((result, rIdx) => (
                                  <div
                                    key={`${sessionId}-${rIdx}`}
                                    className={clsx(
                                      'rounded-xl border p-3 text-sm',
                                      result.selfGrade === 'correct'
                                        ? 'border-success/20 bg-success-subtle/50'
                                        : 'border-warning/20 bg-warning-subtle/50'
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
                                            ? 'text-success'
                                            : 'text-warning'
                                        )}
                                      >
                                        {result.selfGrade === 'correct'
                                          ? showBurmese
                                            ? strings.interview.correct.my
                                            : 'Correct'
                                          : showBurmese
                                            ? strings.interview.incorrect.my
                                            : 'Incorrect'}
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
                            ) : (
                              <p className="mt-4 text-xs text-muted-foreground italic">
                                {showBurmese
                                  ? '\u1021\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A\u1019\u103B\u102C\u1038 \u1019\u101B\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1034'
                                  : 'Detailed question results not available for synced sessions.'}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </StaggeredItem>
                );
              })}
            </StaggeredList>

            {hasMoreInterviews && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setInterviewPage(p => p + 1)}
                  className={clsx(
                    'inline-flex items-center justify-center rounded-xl border-2 border-border px-6 py-2.5 text-sm font-bold text-foreground min-h-[44px]',
                    'transition-all hover:bg-muted/40 hover:border-primary-300',
                    'shadow-[0_3px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]'
                  )}
                >
                  {strings.hub.loadMore.en}
                  {showBurmese && (
                    <span className="font-myanmar ml-2">{strings.hub.loadMore.my}</span>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <FadeIn>
            <GlassCard className="py-12 text-center">
              <p className="mb-4 text-4xl">{'\uD83C\uDFA4'}</p>
              <BilingualHeading
                text={{
                  en: 'No interview sessions yet',
                  my: '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1019\u103B\u102C\u1038 \u1019\u101B\u103E\u102D\u101E\u1031\u1038\u1015\u102B',
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
                    USCIS{' '}
                    {
                      '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1021\u1010\u103D\u1000\u103A \u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1019\u103E\u102F\u1005\u1019\u103A\u1038\u1000\u103C\u100A\u103A\u1037\u1015\u102B\u0021'
                    }
                  </span>
                )}
              </p>
              <BilingualButton
                label={strings.interview.startInterview}
                variant="chunky"
                onClick={() => navigate('/interview')}
              />
            </GlassCard>
          </FadeIn>
        )}
      </section>
    </div>
  );
}
