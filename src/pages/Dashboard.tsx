'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNextBestAction } from '@/hooks/useNextBestAction';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useStreak } from '@/hooks/useStreak';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { useMasteryMilestones } from '@/hooks/useMasteryMilestones';
import { useBadges } from '@/hooks/useBadges';
import { useOnboarding } from '@/hooks/useOnboarding';
import { NBAHeroCard, NBAHeroSkeleton } from '@/components/dashboard/NBAHeroCard';
import { CompactStatRow } from '@/components/dashboard/CompactStatRow';
import { CategoryPreviewCard } from '@/components/dashboard/CategoryPreviewCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { MasteryMilestone } from '@/components/progress/MasteryMilestone';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
import { BadgeHighlights } from '@/components/social/BadgeHighlights';
import { UnfinishedBanner } from '@/components/sessions/UnfinishedBanner';
import { useSessionPersistence } from '@/lib/sessions/useSessionPersistence';
import { useToast } from '@/components/BilingualToast';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import { calculateCompositeScore, updateCompositeScore } from '@/lib/social';
import type { BadgeCheckData } from '@/lib/social';
import { SPRING_GENTLE } from '@/lib/motion-config';

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const MAX_MANUAL_RETRIES = 3;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { showBurmese } = useLanguage();
  const { shouldShow: isOnboarding } = useOnboarding();
  const { showWarning } = useToast();
  const [dueBannerDismissed, setDueBannerDismissed] = useState(false);

  // Unfinished session banners
  const { sessions } = useSessionPersistence();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const visibleSessions = sessions.filter(s => !dismissedIds.has(s.id));

  // Error recovery state for dashboard data
  const [dataError, setDataError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const isEscalated = retryCount >= MAX_MANUAL_RETRIES;

  // NBA recommendation
  const { nbaState } = useNextBestAction();

  // Category mastery for stat row + preview + badge checks
  const {
    categoryMasteries,
    subCategoryMasteries,
    overallMastery,
    isLoading: masteryLoading,
  } = useCategoryMastery();
  const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);

  // Streak and SRS for stat row + badge checks
  const { currentStreak, longestStreak, isLoading: streakLoading } = useStreak();
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();

  // Unique questions practiced count from IndexedDB (same as HubPage pattern)
  const [uniqueQuestionsCount, setUniqueQuestionsCount] = useState(0);
  const [practiceCountLoading, setPracticeCountLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          const unique = new Set(answers.map(a => a.questionId));
          setUniqueQuestionsCount(unique.size);
          setPracticeCountLoading(false);
          setDataError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPracticeCountLoading(false);
          const error = err instanceof Error ? err : new Error(String(err));
          setDataError(error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchTrigger]);

  // Test history from auth user
  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);

  // Badge check data - derived from dashboard stats
  const badgeCheckData: BadgeCheckData | null = useMemo(() => {
    if (history.length === 0 && currentStreak === 0) return null;

    const bestTestAccuracy = history.reduce((best, session) => {
      const pct = session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
      return Math.max(best, pct);
    }, 0);

    const bestTestScore = history.reduce((best, session) => Math.max(best, session.score), 0);

    const uniqueQIds = new Set<string>();
    for (const session of history) {
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
      totalTestsTaken: history.length,
      uniqueQuestionsAnswered: uniqueQIds.size,
      categoriesMastered: catsMastered,
      totalCategories: catValues.length || 7,
    };
  }, [history, currentStreak, longestStreak, categoryMasteries]);

  // Badge detection and celebration
  const { newlyEarnedBadge, dismissCelebration, earnedBadges } = useBadges(badgeCheckData);

  // Error recovery: retry handler for dashboard data fetch
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setDataError(null);
    setPracticeCountLoading(true);
    setFetchTrigger(prev => prev + 1);
  }, []);

  // Fire toast on first error occurrence
  const [toastFired, setToastFired] = useState(false);
  const [prevDataError, setPrevDataError] = useState<Error | null>(null);
  if (dataError !== prevDataError) {
    setPrevDataError(dataError);
    if (dataError && !toastFired) {
      showWarning({
        en: 'Having trouble loading your data',
        my: '\u101E\u1004\u103A\u1037\u1021\u1001\u103B\u1000\u103A\u1021\u101C\u1000\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1016\u1010\u103A\u101B\u102C\u1010\u103D\u1004\u103A \u1021\u1001\u1000\u103A\u1021\u1001\u1032\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
      });
      setToastFired(true);
    }
  }

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

  // Dashboard-level loading: all async data sources still loading
  const isDashboardLoading =
    authLoading || masteryLoading || streakLoading || srsLoading || practiceCountLoading;

  // Zero-data condition: user has never completed a session and has no mastery
  const isDashboardEmpty =
    !isDashboardLoading &&
    history.length === 0 &&
    uniqueQuestionsCount === 0 &&
    overallMastery === 0;

  // Full-page skeleton while async content loads
  if (isDashboardLoading) {
    return (
      <div className="page-shell">
        <UpdateBanner showBurmese={showBurmese} className="mb-0" />
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state: show ErrorFallback when data fetch failed
  if (dataError) {
    return (
      <div className="page-shell">
        <UpdateBanner showBurmese={showBurmese} className="mb-0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <ErrorFallback onRetry={handleRetry} retryCount={retryCount} isEscalated={isEscalated} />
        </div>
      </div>
    );
  }

  // New user welcome with quick start guide
  if (isDashboardEmpty) {
    return (
      <div className="page-shell">
        <UpdateBanner showBurmese={showBurmese} className="mb-0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <UpdateBanner showBurmese={showBurmese} className="mb-0" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <StaggeredList delay={80} stagger={80}>
          {/* Unfinished Session Banners */}
          {visibleSessions.length > 0 && (
            <StaggeredItem className="mb-6">
              <UnfinishedBanner
                sessions={visibleSessions}
                onDismiss={id => setDismissedIds(prev => new Set([...prev, id]))}
              />
            </StaggeredItem>
          )}

          {/* Due Card Review Banner */}
          <AnimatePresence>
            {srsDueCount > 0 && !dueBannerDismissed && (
              <StaggeredItem className="mb-6">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={SPRING_GENTLE}
                  className="border-l-4 border-warning bg-warning/5 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        You have {srsDueCount} card{srsDueCount !== 1 ? 's' : ''} due for review
                      </p>
                      {showBurmese && (
                        <p className="text-sm text-muted-foreground font-myanmar mt-0.5">
                          {
                            '\u101E\u1004\u103A\u1037\u1010\u103D\u1004\u103A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101E\u102F\u1036\u1038\u101E\u1015\u103A\u101B\u1014\u103A \u1000\u1010\u103A'
                          }{' '}
                          {srsDueCount}{' '}
                          {'\u1001\u102F \u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A'}
                        </p>
                      )}
                      <button
                        onClick={() => navigate('/study#deck')}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-warning hover:text-warning/80 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Review Now
                        {showBurmese && (
                          <span className="font-myanmar ml-1">
                            {
                              '/ \u101A\u1001\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1015\u102B'
                            }
                          </span>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setDueBannerDismissed(true)}
                      className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                      aria-label="Dismiss due card banner"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              </StaggeredItem>
            )}
          </AnimatePresence>

          {/* NBA Hero Card */}
          <StaggeredItem className="mb-6">
            {nbaState ? <NBAHeroCard nbaState={nbaState} /> : <NBAHeroSkeleton />}
          </StaggeredItem>

          {/* Achievements — motivational badge grid right after NBA */}
          <StaggeredItem className="mb-6">
            <BadgeHighlights />
          </StaggeredItem>

          {/* Compact Stat Row */}
          <StaggeredItem className="mb-6">
            <CompactStatRow
              streak={currentStreak}
              mastery={overallMastery}
              srsDue={srsDueCount}
              practiced={uniqueQuestionsCount}
              totalQuestions={totalQuestions}
              isLoading={masteryLoading || streakLoading || srsLoading}
            />
          </StaggeredItem>

          {/* Preview Cards */}
          <StaggeredItem className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryPreviewCard
              categoryMasteries={categoryMasteries}
              subCategoryMasteries={subCategoryMasteries}
              isLoading={masteryLoading}
            />
            <RecentActivityCard testHistory={history} isLoading={authLoading} />
          </StaggeredItem>
        </StaggeredList>

        {/* Milestone celebration modal -- suppressed during onboarding */}
        <MasteryMilestone
          milestone={isOnboarding ? null : currentMilestone}
          onDismiss={dismissMilestone}
        />

        {/* Badge celebration modal -- suppressed during onboarding */}
        <BadgeCelebration
          badge={isOnboarding ? null : newlyEarnedBadge}
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
