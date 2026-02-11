'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStreak } from '@/hooks/useStreak';
import { useBadges } from '@/hooks/useBadges';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import type { BadgeCheckData } from '@/lib/social/badgeDefinitions';
import { HubTabBar } from '@/components/hub/HubTabBar';
import { OverviewTab } from '@/components/hub/OverviewTab';
import { HistoryTab } from '@/components/hub/HistoryTab';
import { AchievementsTab } from '@/components/hub/AchievementsTab';

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TAB_ORDER: Record<string, number> = { overview: 0, history: 1, achievements: 2 };
const VALID_TABS = new Set(Object.keys(TAB_ORDER));

/** Derive the tab key from the current pathname */
function getTabFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  // Expect ["hub", "overview"] or ["hub"]
  const tab = segments.length >= 2 ? segments[segments.length - 1] : '';
  return VALID_TABS.has(tab) ? tab : '';
}

// ---------------------------------------------------------------------------
// Tab slide animation variants
// ---------------------------------------------------------------------------

const tabVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

const tabTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

// ---------------------------------------------------------------------------
// HubPage component
// ---------------------------------------------------------------------------

/**
 * Progress Hub shell: renders the page title, tab bar, and direction-aware
 * tab content. Handles route-to-tab derivation, redirects for bare/invalid
 * paths, and browser history integration.
 *
 * Tab content is conditionally rendered (NOT using <Outlet>) to ensure
 * AnimatePresence key changes trigger proper enter/exit animations.
 */
export default function HubPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { user, isLoading: isLoadingAuth } = useAuth();

  // -------------------------------------------------------------------------
  // Shared data hooks (lifted to HubPage to avoid waterfall loads)
  // -------------------------------------------------------------------------

  const {
    categoryMasteries,
    subCategoryMasteries,
    overallMastery,
    isLoading: masteryLoading,
  } = useCategoryMastery();
  const { currentStreak, longestStreak, isLoading: streakLoading } = useStreak();
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();

  // Unique questions count from answer history
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

  // Build BadgeCheckData (same pattern as SocialHubPage)
  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);

  const badgeCheckData: BadgeCheckData | null = useMemo(() => {
    if (streakLoading) return null;

    const bestTest = history.reduce<{ accuracy: number; score: number }>(
      (best, session) => {
        const accuracy =
          session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
        return {
          accuracy: Math.max(best.accuracy, accuracy),
          score: Math.max(best.score, session.score),
        };
      },
      { accuracy: 0, score: 0 }
    );

    const catValues = Object.values(categoryMasteries);
    const categoriesMastered = catValues.filter(v => v >= 100).length;

    return {
      currentStreak,
      longestStreak,
      bestTestAccuracy: bestTest.accuracy,
      bestTestScore: bestTest.score,
      totalTestsTaken: history.length,
      uniqueQuestionsAnswered: uniqueQuestionsCount,
      categoriesMastered,
      totalCategories: catValues.length,
    };
  }, [
    streakLoading,
    currentStreak,
    longestStreak,
    history,
    uniqueQuestionsCount,
    categoryMasteries,
  ]);

  // Badge state
  const {
    earnedBadges,
    lockedBadges,
    newlyEarnedBadge,
    dismissCelebration,
    isLoading: isLoadingBadges,
  } = useBadges(badgeCheckData);

  // -------------------------------------------------------------------------
  // Tab navigation
  // -------------------------------------------------------------------------

  const currentTab = getTabFromPath(location.pathname);

  // Redirect bare /hub or invalid tab paths to /hub/overview
  useEffect(() => {
    if (!currentTab) {
      navigate('/hub/overview', { replace: true });
    }
  }, [currentTab, navigate]);

  // Track previous tab index and compute slide direction
  // using the "adjust state when props change" pattern (React Compiler safe)
  const [prevTabIndex, setPrevTabIndex] = useState(TAB_ORDER[currentTab] ?? 0);
  const [direction, setDirection] = useState(0);

  const currentIndex = TAB_ORDER[currentTab] ?? 0;
  if (currentTab && currentIndex !== prevTabIndex) {
    setDirection(currentIndex > prevTabIndex ? 1 : -1);
    setPrevTabIndex(currentIndex);
  }

  const handleTabChange = (tabId: string) => {
    if (tabId !== currentTab) {
      navigate(`/hub/${tabId}`);
    }
  };

  // Don't render content until we have a valid tab (redirect in progress)
  if (!currentTab) {
    return null;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-8">
        {/* Page header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary">My Progress</h1>
          {showBurmese && (
            <p className="font-myanmar mt-0.5 text-sm text-text-secondary">
              {
                '\u1000\u103B\u103D\u1014\u103A\u102F\u1015\u103A\u101B\u1032\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F'
              }
            </p>
          )}
        </div>

        {/* Tab bar */}
        <HubTabBar activeTab={currentTab} onTabChange={handleTabChange} />

        {/* Tab content with direction-aware slide animation */}
        <div role="tabpanel" id={`hub-tabpanel-${currentTab}`} aria-label={currentTab}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentTab}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={tabTransition}
            >
              {currentTab === 'overview' && (
                <OverviewTab
                  overallMastery={overallMastery}
                  categoryMasteries={categoryMasteries}
                  subCategoryMasteries={subCategoryMasteries}
                  currentStreak={currentStreak}
                  srsDueCount={srsDueCount}
                  practicedCount={uniqueQuestionsCount}
                  totalQuestions={totalQuestions}
                  isLoading={masteryLoading || streakLoading || srsLoading}
                />
              )}
              {currentTab === 'history' && (
                <HistoryTab testHistory={history} isLoading={isLoadingAuth} />
              )}
              {currentTab === 'achievements' && (
                <AchievementsTab
                  earnedBadges={earnedBadges}
                  lockedBadges={lockedBadges}
                  badgeCheckData={badgeCheckData}
                  newlyEarnedBadge={newlyEarnedBadge}
                  dismissCelebration={dismissCelebration}
                  isLoading={isLoadingBadges}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
