'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate, type To } from 'react-router-dom';
import { BookOpenCheck, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { QuestionResult } from '@/types';
import { BilingualHeading, SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressWithLabel } from '@/components/ui/Progress';
import { StaggeredGrid, FadeIn } from '@/components/animations/StaggeredList';
import { ReadinessIndicator } from '@/components/dashboard/ReadinessIndicator';
import { CategoryGrid } from '@/components/progress/CategoryGrid';
import { MasteryMilestone } from '@/components/progress/MasteryMilestone';
import { SuggestedFocus } from '@/components/nudges/SuggestedFocus';
import { SRSWidget } from '@/components/srs/SRSWidget';
import { InterviewDashboardWidget } from '@/components/interview/InterviewDashboardWidget';
import { StreakWidget } from '@/components/social/StreakWidget';
import { BadgeHighlights } from '@/components/social/BadgeHighlights';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useMasteryMilestones } from '@/hooks/useMasteryMilestones';
import { getAnswerHistory } from '@/lib/mastery';
import type { StoredAnswer } from '@/lib/mastery';
import { strings } from '@/lib/i18n/strings';

const historyLink = (section: string): To => ({ pathname: '/history', hash: `#${section}` });
const studyCardsLink = (category?: string): To => ({
  pathname: '/study',
  search: category ? `?category=${encodeURIComponent(category)}` : undefined,
  hash: '#cards',
});

/** localStorage key for category progress collapse state */
const COLLAPSE_KEY = 'civic-prep-dashboard-category-collapsed';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Category mastery data
  const {
    categoryMasteries,
    subCategoryMasteries,
    isLoading: masteryLoading,
  } = useCategoryMastery();
  const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);

  // Answer history for SuggestedFocus stale detection
  const [answerHistory, setAnswerHistory] = useState<StoredAnswer[]>([]);
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(history => {
        if (!cancelled) setAnswerHistory(history);
      })
      .catch(() => {
        // IndexedDB not available
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Collapsible category progress section
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  });

  const toggleCategoryCollapse = () => {
    setIsCategoryCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        // localStorage not available
      }
      return next;
    });
  };

  // Compute average mastery for collapsed summary
  const categoryValues = Object.values(categoryMasteries);
  const avgMastery =
    categoryValues.length > 0
      ? Math.round(categoryValues.reduce((s, v) => s + v, 0) / categoryValues.length)
      : 0;
  const history = user?.testHistory ?? [];
  const latestAttempt = history[0];
  const totalQuestionsAnswered = history.reduce((sum, session) => sum + session.totalQuestions, 0);
  const accuracy = totalQuestionsAnswered
    ? Math.round(
        (history.reduce((sum, session) => sum + session.score, 0) / totalQuestionsAnswered) * 100
      )
    : 0;

  const categoryBreakdown = history.reduce<Record<string, { correct: number; total: number }>>(
    (acc, session) => {
      session.results.forEach((result: QuestionResult) => {
        if (!acc[result.category]) {
          acc[result.category] = { correct: 0, total: 0 };
        }
        acc[result.category].total += 1;
        if (result.isCorrect) acc[result.category].correct += 1;
      });
      return acc;
    },
    {}
  );

  const trackedCategories = Object.keys(categoryBreakdown).length;
  const masteredCategories = Object.values(categoryBreakdown).filter(
    stats => stats.total > 0 && stats.correct === stats.total
  ).length;

  // Compute mastered count (unique correctly answered questions)
  const masteredCount = Object.values(categoryBreakdown).reduce(
    (sum, stats) => sum + stats.correct,
    0
  );

  // Compute recent accuracy from last 5 tests
  const recentTests = history.slice(0, 5);
  const recentAccuracy =
    recentTests.length > 0
      ? recentTests.reduce((sum, session) => {
          const pct =
            session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
          return sum + pct;
        }, 0) / recentTests.length
      : 0;

  // Compute study streak (consecutive days with test activity)
  const streakDays = (() => {
    if (history.length === 0) return 0;
    const uniqueDays = [...new Set(history.map(s => new Date(s.date).toDateString()))];
    uniqueDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diffMs = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  const detailTiles: Array<{
    to: To;
    title: string;
    titleMy: string;
    stat: string;
    description: string;
  }> = [
    {
      to: historyLink('trend'),
      title: 'Analytics Snapshot',
      titleMy: '\u1006\u1014\u103A\u1038\u1005\u1005\u103A\u1001\u103B\u1000\u103A',
      stat: history.length ? `${accuracy}% avg accuracy` : 'Need data',
      description: history.length
        ? 'Based on all completed mock tests.'
        : 'Complete a mock test to unlock insights.',
    },
    {
      to: studyCardsLink(),
      title: 'Master Categories',
      titleMy:
        '\u1000\u100f\u103a\u1039\u100b\u1021\u101C\u102D\u102F\u1000\u103A\u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F',
      stat: trackedCategories
        ? `${masteredCategories}/${trackedCategories} mastered`
        : '0 categories tracked',
      description: trackedCategories
        ? 'Tap to revisit bilingual flip-cards by category.'
        : 'Review flip-cards to start tracking mastery.',
    },
    {
      to: latestAttempt ? historyLink('attempts') : '/test',
      title: 'Latest Test Summary',
      titleMy:
        '\u1014\u1031\u102C\u1000\u103A\u1006\u102F\u1036\u1038\u1016\u103C\u1031\u1006\u102D\u102F\u1001\u1032\u1037\u101E\u100A\u103A\u1037 \u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1021\u1000\u103B\u1025\u103A\u1038\u1001\u103B\u102F\u1036\u1038',
      stat: latestAttempt
        ? `${latestAttempt.score} / ${latestAttempt.totalQuestions}`
        : 'No attempts yet',
      description: latestAttempt
        ? `Finished in ${Math.round(latestAttempt.durationSeconds / 60)} mins on ${new Date(latestAttempt.date).toLocaleDateString()}`
        : 'Start a mock test to save your first report.',
    },
  ];

  return (
    <div className="page-shell" data-tour="dashboard">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome header with bilingual heading */}
        <header className="mb-8">
          <FadeIn>
            <BilingualHeading
              text={{
                en: `Welcome back, ${user?.name?.split(' ')[0] ?? 'Learner'}!`,
                my: `\u1015\u103C\u1014\u103A\u101C\u102C\u1010\u102C\u1000\u102D\u102F \u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u1010\u101A\u103A\u104D ${user?.name?.split(' ')[0] ?? '\u101E\u1004\u103A\u101A\u1030\u101E\u1030'}!`,
              }}
              level={1}
              size="2xl"
            />
            <p className="mt-2 text-muted-foreground">
              Track your bilingual U.S civics study journey, jump into a new mock test, or brush up
              with flip-cards.
            </p>
          </FadeIn>
        </header>

        {/* Quick action buttons */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <BilingualButton
            label={strings.actions.startStudying}
            variant="outline"
            icon={<BookOpenCheck className="h-4 w-4" />}
            onClick={() => navigate('/study')}
          />
          <BilingualButton
            label={strings.actions.startTest}
            variant="primary"
            onClick={() => navigate('/test')}
          />
        </div>

        {/* ANXR-05: Readiness confidence indicator */}
        <section className="mb-8">
          <ReadinessIndicator
            correctCount={masteredCount}
            totalQuestions={100}
            recentAccuracy={recentAccuracy}
            streakDays={streakDays}
            onStartTest={() => navigate('/test')}
          />
        </section>

        {/* Streak Widget */}
        <section className="mb-8">
          <FadeIn delay={25}>
            <StreakWidget />
          </FadeIn>
        </section>

        {/* Badge Highlights */}
        <section className="mb-8">
          <FadeIn delay={40}>
            <BadgeHighlights />
          </FadeIn>
        </section>

        {/* SRS Review Widget */}
        <section className="mb-8">
          <FadeIn delay={50}>
            <SRSWidget />
          </FadeIn>
        </section>

        {/* Interview Simulation Widget */}
        <section className="mb-8">
          <FadeIn delay={75}>
            <InterviewDashboardWidget />
          </FadeIn>
        </section>

        {/* Category Progress - collapsible section */}
        <section className="mb-8">
          <FadeIn delay={100}>
            <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {/* Collapsible header */}
              <button
                type="button"
                className="flex w-full items-center justify-between p-5 text-left min-h-[44px] hover:bg-muted/20 transition-colors"
                onClick={toggleCategoryCollapse}
                aria-expanded={!isCategoryCollapsed}
              >
                <SectionHeading text={strings.progress.categoryProgress} className="mb-0" />
                <div className="flex items-center gap-3">
                  {isCategoryCollapsed && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {categoryValues.length} categories, {avgMastery}% avg
                    </span>
                  )}
                  <ChevronDown
                    className={clsx(
                      'h-5 w-5 text-muted-foreground transition-transform',
                      !isCategoryCollapsed && 'rotate-180'
                    )}
                  />
                </div>
              </button>

              {/* Expanded content */}
              {!isCategoryCollapsed && (
                <div className="px-5 pb-5">
                  {masteryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <CategoryGrid
                        categoryMasteries={categoryMasteries}
                        subCategoryMasteries={subCategoryMasteries}
                        onCategoryClick={() => navigate('/progress')}
                      />

                      {/* View Full Progress link */}
                      <div className="mt-4 flex justify-center">
                        <BilingualButton
                          label={{
                            en: 'View Full Progress',
                            my: '\u1021\u1015\u103C\u100A\u103A\u1037\u1021\u1005\u102F\u1036\u1038\u1000\u103C\u100A\u103A\u1037\u1015\u102B',
                          }}
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/progress')}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </FadeIn>
        </section>

        {/* Suggested Focus - weak area nudges */}
        {!masteryLoading && (
          <SuggestedFocus categoryMasteries={categoryMasteries} answerHistory={answerHistory} />
        )}

        {/* Overall accuracy */}
        {history.length > 0 && (
          <section className="mb-8">
            <ProgressWithLabel
              value={accuracy}
              labelEn="Overall Accuracy"
              labelMy="\u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1019\u103E\u102F"
              variant="success"
              size="lg"
            />
          </section>
        )}

        {/* Data analytics tiles in staggered grid */}
        <section id="deep-dive" className="mb-8" aria-labelledby="deep-dive-title">
          <SectionHeading
            text={{
              en: 'Personalized Data Analytics',
              my: '\u1012\u1031\u1010\u102C\u1015\u102D\u102F\u1004\u103A\u1038\u1001\u103C\u102C\u1038\u1005\u102D\u1010\u103A\u1016\u103C\u102C\u1019\u103E\u102F',
            }}
          />
          <StaggeredGrid columns={3}>
            {detailTiles.map((tile, index) => (
              <Link
                key={index}
                to={tile.to}
                className="block min-h-[44px]"
                aria-label={`${tile.title} \u2013 ${tile.titleMy}`}
              >
                <Card interactive elevated>
                  <CardHeader>
                    <BilingualHeading
                      text={{ en: tile.title, my: tile.titleMy }}
                      level={3}
                      size="sm"
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{tile.stat}</p>
                    <p className="text-sm text-muted-foreground mt-1">{tile.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </StaggeredGrid>
        </section>

        {/* Category accuracy breakdown */}
        <section
          id="category-accuracy"
          className="rounded-3xl border border-border/60 bg-card p-6 shadow-lg"
          aria-labelledby="category-accuracy-title"
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeading
              text={{
                en: 'Category Accuracy',
                my: '\u1000\u100f\u103a\u1039\u100b\u1021\u101C\u102D\u102F\u1000\u103A\u1010\u102D\u1000\u103B\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1019\u103E\u102F',
              }}
              className="mb-0"
            />
            <Link
              to="/history"
              className="text-sm font-semibold text-primary min-h-[44px] inline-flex items-center"
            >
              View full analytics
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {Object.entries(categoryBreakdown).map(([category, stats]) => {
              const rate = Math.round((stats.correct / stats.total) * 100);
              return (
                <Link
                  key={category}
                  to={studyCardsLink(category)}
                  className="group rounded-2xl border border-border/60 p-4 min-h-[44px] transition hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Review ${category}`}
                >
                  <p className="text-sm font-semibold text-foreground">{category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.correct} correct out of {stats.total} questions
                  </p>
                  <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                    Go to flip-cards
                  </span>
                </Link>
              );
            })}
            {!Object.keys(categoryBreakdown).length && (
              <p className="text-muted-foreground">Complete a mock test to unlock insights.</p>
            )}
          </div>
        </section>

        {/* Milestone celebration modal */}
        <MasteryMilestone milestone={currentMilestone} onDismiss={dismissMilestone} />
      </div>
    </div>
  );
};

export default Dashboard;
