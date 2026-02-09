'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, type To } from 'react-router-dom';
import { BookOpenCheck, ChevronDown, Flag, Mic, Settings, Sparkles, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { QuestionResult } from '@/types';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { ProgressWithLabel } from '@/components/ui/Progress';
import { ReadinessIndicator } from '@/components/dashboard/ReadinessIndicator';
import { CategoryGrid } from '@/components/progress/CategoryGrid';
import { MasteryMilestone } from '@/components/progress/MasteryMilestone';
import { SuggestedFocus } from '@/components/nudges/SuggestedFocus';
import { SRSWidget } from '@/components/srs/SRSWidget';
import { InterviewDashboardWidget } from '@/components/interview/InterviewDashboardWidget';
import { StreakWidget } from '@/components/social/StreakWidget';
import { BadgeHighlights } from '@/components/social/BadgeHighlights';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
import { LeaderboardWidget } from '@/components/social/LeaderboardWidget';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useMasteryMilestones } from '@/hooks/useMasteryMilestones';
import { useStreak } from '@/hooks/useStreak';
import { useBadges } from '@/hooks/useBadges';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import type { StoredAnswer } from '@/lib/mastery';
import { calculateCompositeScore, updateCompositeScore } from '@/lib/social';
import type { BadgeCheckData } from '@/lib/social';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

const studyCardsLink = (category?: string): To => ({
  pathname: '/study',
  search: category ? `?category=${encodeURIComponent(category)}` : undefined,
  hash: '#cards',
});

/** localStorage key for category progress collapse state */
const COLLAPSE_KEY = 'civic-prep-dashboard-category-collapsed';

/** Bilingual motivational messages based on readiness level */
const MOTIVATIONAL_MESSAGES = {
  ready: {
    en: 'You are ready to pass! Keep up the amazing work!',
    my: 'သင်အောင်မြင်ဖို့အဆင်သင့်ဖြစ်ပါပြီ!',
  },
  almostReady: {
    en: 'Almost there! A few more study sessions and you will be confident.',
    my: 'နီးပါပြီ! နည်းနည်းလေ့လာရင် ယုံကြည်မှုရပါမယ်။',
  },
  gettingThere: {
    en: 'Great progress! Every question brings you closer to citizenship.',
    my: 'ကောင်းမွန်စွာတိုးတက်နေပါတယ်! မေးခွန်းတိုင်းက သင့်ကို နီးစေပါတယ်။',
  },
  notReady: {
    en: 'Welcome! Start studying and you will be ready in no time.',
    my: 'ကြိုဆိုပါတယ်! လေ့လာစတင်ရင် မကြာခင်မှာ အဆင်သင့်ဖြစ်လာပါမယ်။',
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Category mastery data
  const {
    categoryMasteries,
    subCategoryMasteries,
    isLoading: masteryLoading,
  } = useCategoryMastery();
  const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);

  // Streak data for badge checks and composite score
  const { currentStreak, longestStreak } = useStreak();

  // Badge check data - derived from dashboard stats
  const badgeCheckData: BadgeCheckData | null = useMemo(() => {
    const testHistory = user?.testHistory ?? [];
    if (testHistory.length === 0 && currentStreak === 0) return null;

    const bestTestAccuracy = testHistory.reduce((best, session) => {
      const pct = session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
      return Math.max(best, pct);
    }, 0);

    const bestTestScore = testHistory.reduce((best, session) => Math.max(best, session.score), 0);

    const uniqueQIds = new Set<string>();
    for (const session of testHistory) {
      for (const result of session.results) {
        uniqueQIds.add(result.questionId);
      }
    }

    const catValues = Object.values(categoryMasteries);
    const catsMastered = catValues.filter(v => v >= 100).length;

    return {
      currentStreak,
      longestStreak,
      bestTestAccuracy,
      bestTestScore,
      totalTestsTaken: testHistory.length,
      uniqueQuestionsAnswered: uniqueQIds.size,
      categoriesMastered: catsMastered,
      totalCategories: catValues.length || 7,
    };
  }, [user?.testHistory, currentStreak, longestStreak, categoryMasteries]);

  // Badge detection and celebration
  const { newlyEarnedBadge, dismissCelebration, earnedBadges } = useBadges(badgeCheckData);

  // Composite score sync to Supabase on mount
  useEffect(() => {
    if (!user?.id || !badgeCheckData) return;

    const testHistory = user.testHistory ?? [];
    const bestAccuracy = testHistory.reduce((best, session) => {
      const pct = session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
      return Math.max(best, pct);
    }, 0);

    const uniqueQIds = new Set<string>();
    for (const session of testHistory) {
      for (const result of session.results) {
        uniqueQIds.add(result.questionId);
      }
    }
    const coveragePercent = (uniqueQIds.size / totalQuestions) * 100;

    const composite = calculateCompositeScore({
      currentStreak,
      bestTestAccuracy: bestAccuracy,
      coveragePercent,
    });

    const topBadge = earnedBadges.length > 0 ? earnedBadges[0].id : null;

    updateCompositeScore(user.id, composite, currentStreak, topBadge).catch(() => {
      // Sync failure is non-critical
    });
  }, [user?.id, user?.testHistory, badgeCheckData, currentStreak, earnedBadges]);

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
  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);
  const totalQuestionsAnswered = history.reduce((sum, session) => sum + session.totalQuestions, 0);
  const accuracy = totalQuestionsAnswered
    ? Math.round(
        (history.reduce((sum, session) => sum + session.score, 0) / totalQuestionsAnswered) * 100
      )
    : 0;

  const categoryBreakdown = useMemo(
    () =>
      history.reduce<Record<string, { correct: number; total: number }>>((acc, session) => {
        session.results.forEach((result: QuestionResult) => {
          if (!acc[result.category]) {
            acc[result.category] = { correct: 0, total: 0 };
          }
          acc[result.category].total += 1;
          if (result.isCorrect) acc[result.category].correct += 1;
        });
        return acc;
      }, {}),
    [history]
  );

  // Compute mastered count (unique correctly answered questions)
  const masteredCount = useMemo(
    () => Object.values(categoryBreakdown).reduce((sum, stats) => sum + stats.correct, 0),
    [categoryBreakdown]
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

  // Determine readiness level for motivational message
  const readinessScore = useMemo(() => {
    const coveragePercent = masteredCount > 0 ? (masteredCount / totalQuestions) * 100 : 0;
    const accuracyWeight = recentAccuracy * 0.4;
    const coverageWeight = coveragePercent * 0.5;
    const streakBonus = Math.min(streakDays * 2, 10);
    return Math.min(100, Math.round(accuracyWeight + coverageWeight + streakBonus));
  }, [masteredCount, recentAccuracy, streakDays]);

  const motivationalMessage = useMemo(() => {
    if (readinessScore >= 80) return MOTIVATIONAL_MESSAGES.ready;
    if (readinessScore >= 60) return MOTIVATIONAL_MESSAGES.almostReady;
    if (readinessScore >= 30) return MOTIVATIONAL_MESSAGES.gettingThere;
    return MOTIVATIONAL_MESSAGES.notReady;
  }, [readinessScore]);

  // Stagger animation delay helper
  const stagger = (index: number) => {
    if (shouldReduceMotion) {
      return {};
    }
    return {
      initial: { opacity: 0, y: 16 } as const,
      animate: { opacity: 1, y: 0 } as const,
      transition: { delay: index * 0.08, duration: 0.4, ease: 'easeOut' as const },
    };
  };

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome header with patriotic emojis */}
        <motion.header className="mb-6" {...stagger(0)}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {showBurmese ? (
                  <>
                    <span className="font-myanmar">
                      {`ပြန်လာတာကို ကြိုဆိုပါတယ်၍ ${user?.name?.split(' ')[0] ?? 'သင်ယူသူ'}!`}
                    </span>
                    <span className="ml-2" aria-hidden="true">
                      {'🗽'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{`Welcome back, ${user?.name?.split(' ')[0] ?? 'Learner'}!`}</span>
                    <span className="ml-2" aria-hidden="true">
                      {'🗽'}
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                {motivationalMessage.en}
                {showBurmese && (
                  <span className="block font-myanmar mt-0.5">{motivationalMessage.my}</span>
                )}
              </p>
            </div>
            <Link
              to="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              aria-label="Settings · ဆက်တင်များ"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </motion.header>

        {/* HERO: Readiness Score - The most prominent element */}
        <motion.section className="mb-6" {...stagger(1)}>
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-subtle via-surface to-primary-subtle shadow-xl shadow-primary/20">
            {/* Patriotic decorative stars */}
            <div
              className="absolute top-3 right-3 text-2xl opacity-30 select-none"
              aria-hidden="true"
            >
              {'⭐️'}
            </div>
            <div
              className="absolute bottom-3 left-3 text-lg opacity-20 select-none"
              aria-hidden="true"
            >
              {'🗽'}
            </div>
            <div className="p-5 sm:p-6">
              <ReadinessIndicator
                correctCount={masteredCount}
                totalQuestions={totalQuestions}
                recentAccuracy={recentAccuracy}
                streakDays={streakDays}
                onStartTest={() => navigate('/test')}
              />
            </div>
          </div>
        </motion.section>

        {/* Quick Action Buttons - 3D Chunky Style */}
        <motion.div className="mb-6 grid grid-cols-3 gap-3" {...stagger(2)}>
          <div data-tour="study-action">
            <button
              type="button"
              onClick={() => navigate('/study')}
              className={clsx(
                'w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-4',
                'bg-primary text-white font-bold text-sm',
                'shadow-[0_4px_0_0] shadow-primary-700',
                'active:translate-y-[3px] active:shadow-[0_1px_0_0] active:shadow-primary-700',
                'transition-all duration-150',
                'hover:bg-primary',
                'min-h-[72px]'
              )}
            >
              <BookOpenCheck className="h-5 w-5" />
              <span>Study</span>
              {showBurmese && <span className="font-myanmar text-xs opacity-80">{'လေ့လာပါ'}</span>}
            </button>
          </div>
          <div data-tour="test-action">
            <button
              type="button"
              onClick={() => navigate('/test')}
              className={clsx(
                'w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-4',
                'bg-success-500 text-white font-bold text-sm',
                'shadow-[0_4px_0_0] shadow-success-600',
                'active:translate-y-[3px] active:shadow-[0_1px_0_0] active:shadow-success-600',
                'transition-all duration-150',
                'hover:bg-success-600',
                'min-h-[72px]'
              )}
            >
              <Flag className="h-5 w-5" />
              <span>Test</span>
              {showBurmese && <span className="font-myanmar text-xs opacity-80">{'စာမေးပွဲ'}</span>}
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate('/interview')}
              className={clsx(
                'w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-4',
                'bg-accent text-white font-bold text-sm',
                'shadow-[0_4px_0_0] shadow-accent-700',
                'active:translate-y-[3px] active:shadow-[0_1px_0_0] active:shadow-accent-700',
                'transition-all duration-150',
                'hover:bg-accent-600',
                'min-h-[72px]'
              )}
            >
              <Mic className="h-5 w-5" />
              <span>Interview</span>
              {showBurmese && (
                <span className="font-myanmar text-xs opacity-80">{'အင်တာဗျူး'}</span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Card Hierarchy: SRS Widget -> Streak -> Interview -> rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* SRS Review Widget */}
          <motion.section data-tour="srs-deck" {...stagger(3)}>
            <SRSWidget />
          </motion.section>

          {/* Streak Widget */}
          <motion.section {...stagger(4)}>
            <StreakWidget />
          </motion.section>
        </div>

        {/* Interview Widget - Full width */}
        <motion.section className="mb-6" data-tour="interview-sim" {...stagger(5)}>
          <InterviewDashboardWidget />
        </motion.section>

        {/* Badge Highlights + Leaderboard in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.section {...stagger(6)}>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-warning" />
                <h3 className="font-bold text-foreground text-sm">
                  Badges
                  {showBurmese && (
                    <span className="font-myanmar text-xs text-muted-foreground ml-2">
                      {'ဘက်ချများ'}
                    </span>
                  )}
                </h3>
              </div>
              <BadgeHighlights />
            </div>
          </motion.section>

          <motion.section {...stagger(7)}>
            <LeaderboardWidget />
          </motion.section>
        </div>

        {/* Category Progress - collapsible section */}
        <motion.section className="mb-6" {...stagger(8)}>
          <div className="rounded-2xl border border-border/60 bg-card shadow-lg shadow-primary/10 overflow-hidden">
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
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
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
                      <button
                        type="button"
                        onClick={() => navigate('/progress')}
                        className={clsx(
                          'inline-flex items-center gap-2 rounded-xl px-5 py-2.5',
                          'border-2 border-primary text-primary font-bold text-sm',
                          'shadow-[0_3px_0_0] shadow-primary-200',
                          'active:translate-y-[2px] active:shadow-[0_1px_0_0]',
                          'transition-all duration-150',
                          'hover:bg-primary-subtle',
                          'min-h-[44px]'
                        )}
                      >
                        <Sparkles className="h-4 w-4" />
                        {showBurmese ? (
                          <span className="font-myanmar">{'အပြည့်အစုံးကြည့်ပါ'}</span>
                        ) : (
                          'View Full Progress'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.section>

        {/* Suggested Focus - weak area nudges */}
        {!masteryLoading && (
          <motion.div {...stagger(9)}>
            <SuggestedFocus categoryMasteries={categoryMasteries} answerHistory={answerHistory} />
          </motion.div>
        )}

        {/* Overall accuracy */}
        {history.length > 0 && (
          <motion.section className="mb-6" {...stagger(10)}>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10">
              <ProgressWithLabel
                value={accuracy}
                labelEn="Overall Accuracy"
                labelMy="စုစုပေါင်းမှန်ကန်မှု"
                variant="success"
                size="lg"
              />
            </div>
          </motion.section>
        )}

        {/* Category accuracy breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <motion.section
            className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10"
            aria-labelledby="category-accuracy-title"
            {...stagger(11)}
          >
            <div className="flex items-center justify-between mb-4">
              <SectionHeading
                text={{
                  en: 'Category Accuracy',
                  my: 'ကဏ်္ဋအလိုက်တိကျမှန်ကန်မှု',
                }}
                className="mb-0"
              />
              <Link
                to="/history"
                className="text-sm font-bold text-primary min-h-[44px] inline-flex items-center"
              >
                View full analytics
              </Link>
            </div>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {Object.entries(categoryBreakdown).map(([category, stats]) => {
                const rate = Math.round((stats.correct / stats.total) * 100);
                return (
                  <Link
                    key={category}
                    to={studyCardsLink(category)}
                    className="group rounded-2xl border border-border/60 p-4 min-h-[44px] transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`Review ${category}`}
                  >
                    <p className="text-sm font-bold text-foreground">{category}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 overflow-hidden rounded-full bg-muted/60 h-2.5">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {rate}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.correct} correct out of {stats.total} questions
                    </p>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Empty state when no tests taken */}
        {history.length === 0 && (
          <motion.section className="mb-6" {...stagger(10)}>
            <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card/50 p-8 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">
                {'🗽 📚'}
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">
                {showBurmese ? (
                  <span className="font-myanmar">{'သင့်ခရီးစတင်လိုက်ပါ!'}</span>
                ) : (
                  'Start your citizenship journey!'
                )}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {showBurmese ? (
                  <span className="font-myanmar">
                    {'စာမေးပွဲတစ်ခုဖြေဆိုပြီး သင့်တိုးတက်မှုကို ချက်ချင်းကြည့်ပါ။'}
                  </span>
                ) : (
                  'Take a mock test to track your progress and see personalized insights.'
                )}
              </p>
              <button
                type="button"
                onClick={() => navigate('/test')}
                className={clsx(
                  'mt-4 inline-flex items-center gap-2 rounded-2xl px-6 py-3',
                  'bg-primary text-white font-bold',
                  'shadow-[0_4px_0_0] shadow-primary-700',
                  'active:translate-y-[3px] active:shadow-[0_1px_0_0] active:shadow-primary-700',
                  'transition-all duration-150',
                  'hover:bg-primary',
                  'min-h-[48px]'
                )}
              >
                <Flag className="h-4 w-4" />
                {showBurmese ? (
                  <span className="font-myanmar">{'စာမေးပွဲစတင်ပါ'}</span>
                ) : (
                  'Take Your First Test'
                )}
              </button>
            </div>
          </motion.section>
        )}

        {/* Milestone celebration modal */}
        <MasteryMilestone milestone={currentMilestone} onDismiss={dismissMilestone} />

        {/* Badge celebration modal */}
        <BadgeCelebration
          badge={newlyEarnedBadge}
          onDismiss={() => {
            if (newlyEarnedBadge) {
              dismissCelebration(newlyEarnedBadge.id);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
