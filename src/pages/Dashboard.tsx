'use client';

import { useState, useEffect, useMemo } from 'react';

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
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { MasteryMilestone } from '@/components/progress/MasteryMilestone';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
import { BadgeHighlights } from '@/components/social/BadgeHighlights';
import { UnfinishedBanner } from '@/components/sessions/UnfinishedBanner';
import { useSessionPersistence } from '@/lib/sessions/useSessionPersistence';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import { calculateCompositeScore, updateCompositeScore } from '@/lib/social';
import type { BadgeCheckData } from '@/lib/social';

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { showBurmese } = useLanguage();
  const { shouldShow: isOnboarding } = useOnboarding();

  // Unfinished session banners
  const { sessions } = useSessionPersistence();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const visibleSessions = sessions.filter(s => !dismissedIds.has(s.id));

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
        }
      })
      .catch(() => {
        if (!cancelled) setPracticeCountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
