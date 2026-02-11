'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNextBestAction } from '@/hooks/useNextBestAction';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useStreak } from '@/hooks/useStreak';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { useMasteryMilestones } from '@/hooks/useMasteryMilestones';
import { useBadges } from '@/hooks/useBadges';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useOnboarding } from '@/hooks/useOnboarding';
import { NBAHeroCard, NBAHeroSkeleton } from '@/components/dashboard/NBAHeroCard';
import { CompactStatRow } from '@/components/dashboard/CompactStatRow';
import { CategoryPreviewCard } from '@/components/dashboard/CategoryPreviewCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { MasteryMilestone } from '@/components/progress/MasteryMilestone';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
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
  const shouldReduceMotion = useReducedMotion();
  const { shouldShow: isOnboarding } = useOnboarding();

  // NBA recommendation
  const { nbaState } = useNextBestAction();

  // Category mastery for stat row + preview + badge checks
  const { categoryMasteries, overallMastery, isLoading: masteryLoading } = useCategoryMastery();
  const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);

  // Streak and SRS for stat row + badge checks
  const { currentStreak, longestStreak, isLoading: streakLoading } = useStreak();
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();

  // Unique questions practiced count from IndexedDB (same as HubPage pattern)
  const [uniqueQuestionsCount, setUniqueQuestionsCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          const unique = new Set(answers.map(a => a.questionId));
          setUniqueQuestionsCount(unique.size);
        }
      })
      .catch(() => {
        // IndexedDB not available
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
      <UpdateBanner showBurmese={showBurmese} className="mb-0" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* NBA Hero Card */}
        <motion.section className="mb-6" {...stagger(0)}>
          {nbaState ? <NBAHeroCard nbaState={nbaState} /> : <NBAHeroSkeleton />}
        </motion.section>

        {/* Compact Stat Row */}
        <motion.section className="mb-6" {...stagger(1)}>
          <CompactStatRow
            streak={currentStreak}
            mastery={overallMastery}
            srsDue={srsDueCount}
            practiced={uniqueQuestionsCount}
            totalQuestions={totalQuestions}
            isLoading={masteryLoading || streakLoading || srsLoading}
          />
        </motion.section>

        {/* Preview Cards */}
        <motion.div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" {...stagger(2)}>
          <CategoryPreviewCard categoryMasteries={categoryMasteries} isLoading={masteryLoading} />
          <RecentActivityCard testHistory={history} isLoading={authLoading} />
        </motion.div>

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
