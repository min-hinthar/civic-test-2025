'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStreak } from '@/hooks/useStreak';
import { useTestDate } from '@/hooks/useTestDate';
import { useBadges } from '@/hooks/useBadges';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import type { BadgeCheckData } from '@/lib/social/badgeDefinitions';
import { HubTabBar } from '@/components/hub/HubTabBar';
import { OverviewTab } from '@/components/hub/OverviewTab';
import { HistoryTab } from '@/components/hub/HistoryTab';
import { AchievementsTab } from '@/components/hub/AchievementsTab';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
import { useToast } from '@/components/BilingualToast';

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TAB_LIST = ['overview', 'history', 'achievements'] as const;
const TAB_ORDER: Record<string, number> = { overview: 0, history: 1, achievements: 2 };
const VALID_TABS = new Set(Object.keys(TAB_ORDER));

/** Minimum horizontal drag distance (px) to trigger a tab switch */
const SWIPE_THRESHOLD = 50;

const MAX_MANUAL_RETRIES = 3;

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

const tabTransition = SPRING_SNAPPY;

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
interface HubPageProps {
  /** Initial tab from the catch-all route (e.g. 'overview', 'history', 'achievements') */
  initialTab?: string;
}

export default function HubPage({ initialTab }: HubPageProps) {
  const pathname = usePathname() ?? '/hub';
  const router = useRouter();
  const { showBurmese } = useLanguage();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { showWarning } = useToast();
  const { testDate } = useTestDate();

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

  // Unique questions count from answer history (with error recovery)
  const [uniqueQuestionsCount, setUniqueQuestionsCount] = useState(0);
  const [hubDataError, setHubDataError] = useState<Error | null>(null);
  const [hubRetryCount, setHubRetryCount] = useState(0);
  const [hubFetchTrigger, setHubFetchTrigger] = useState(0);
  const hubIsEscalated = hubRetryCount >= MAX_MANUAL_RETRIES;

  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          const unique = new Set(answers.map(a => a.questionId));
          setUniqueQuestionsCount(unique.size);
          setHubDataError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error(String(err));
          setHubDataError(error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hubFetchTrigger]);

  const handleHubRetry = useCallback(() => {
    setHubRetryCount(prev => prev + 1);
    setHubDataError(null);
    setHubFetchTrigger(prev => prev + 1);
  }, []);

  // Fire toast on first hub data error
  const [hubToastFired, setHubToastFired] = useState(false);
  const [prevHubError, setPrevHubError] = useState<Error | null>(null);
  if (hubDataError !== prevHubError) {
    setPrevHubError(hubDataError);
    if (hubDataError && !hubToastFired) {
      showWarning({
        en: 'Having trouble loading your progress data',
        my: '\u101E\u1004\u103A\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1021\u1001\u103B\u1000\u103A\u1021\u101C\u1000\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1016\u1010\u103A\u101B\u102C\u1010\u103D\u1004\u103A \u1021\u1001\u1000\u103A\u1021\u1001\u1032\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
      });
      setHubToastFired(true);
    }
  }

  // Build BadgeCheckData for badge detection
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

  // Use initialTab from catch-all route, or derive from pathname
  const currentTab =
    initialTab && VALID_TABS.has(initialTab) ? initialTab : getTabFromPath(pathname);

  // Redirect bare /hub or invalid tab paths to /hub/overview
  useEffect(() => {
    if (!currentTab) {
      router.replace('/hub/overview');
    }
  }, [currentTab, router]);

  // Track previous tab index and compute slide direction
  // using the "adjust state when props change" pattern (React Compiler safe)
  const [prevTabIndex, setPrevTabIndex] = useState(TAB_ORDER[currentTab] ?? 0);
  const [direction, setDirection] = useState(0);

  const currentIndex = TAB_ORDER[currentTab] ?? 0;
  if (currentTab && currentIndex !== prevTabIndex) {
    setDirection(currentIndex > prevTabIndex ? 1 : -1);
    setPrevTabIndex(currentIndex);
  }

  // -------------------------------------------------------------------------
  // Scroll position memory (useState, not useRef -- React Compiler safe)
  // -------------------------------------------------------------------------

  const [scrollPositions, setScrollPositions] = useState<Map<string, number>>(new Map());

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (tabId !== currentTab) {
        // Save current scroll position before navigating
        setScrollPositions(prev => {
          const next = new Map(prev);
          next.set(currentTab, window.scrollY);
          return next;
        });
        router.push(`/hub/${tabId}`);
      }
    },
    [currentTab, router]
  );

  // Restore scroll position for the active tab after render
  useEffect(() => {
    if (!currentTab) return;
    const savedY = scrollPositions.get(currentTab) ?? 0;
    // Use rAF to wait for layout to settle before restoring scroll
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, savedY);
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentTab, scrollPositions]);

  // -------------------------------------------------------------------------
  // Swipe gestures for tab switching
  // -------------------------------------------------------------------------

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      const { x } = info.offset;
      const idx = TAB_ORDER[currentTab] ?? 0;

      if (x < -SWIPE_THRESHOLD && idx < TAB_LIST.length - 1) {
        // Swiped left -> next tab
        handleTabChange(TAB_LIST[idx + 1]);
      } else if (x > SWIPE_THRESHOLD && idx > 0) {
        // Swiped right -> previous tab
        handleTabChange(TAB_LIST[idx - 1]);
      }
    },
    [currentTab, handleTabChange]
  );

  // -------------------------------------------------------------------------
  // Badge count sync to localStorage for useNavBadges
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isLoadingBadges) {
      try {
        localStorage.setItem('civic-prep-earned-badge-count', String(earnedBadges.length));
      } catch {
        // localStorage not available
      }
    }
  }, [earnedBadges.length, isLoadingBadges]);

  // When Achievements tab is active, mark badges as seen
  useEffect(() => {
    if (currentTab === 'achievements' && !isLoadingBadges) {
      try {
        localStorage.setItem('civic-prep-seen-badge-count', String(earnedBadges.length));
      } catch {
        // localStorage not available
      }
    }
  }, [currentTab, earnedBadges.length, isLoadingBadges]);

  // Don't render content until we have a valid tab (redirect in progress)
  if (!currentTab) {
    return null;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-8">
        {/* Page header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {user?.name ? `${user.name.split(' ')[0]}'s Progress` : strings.hub.pageTitle.en}
              </h1>
              {showBurmese && (
                <p className="font-myanmar mt-0.5 text-2xl text-text-secondary">
                  {user?.name
                    ? `${user.name.split(' ')[0]} ၏ တိုးတက်မှု`
                    : strings.hub.pageTitle.my}
                </p>
              )}
            </div>
            {testDate &&
              (() => {
                const testDateObj = new Date(testDate + 'T00:00:00Z');
                const todayObj = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
                const daysLeft = Math.max(
                  0,
                  Math.round((testDateObj.getTime() - todayObj.getTime()) / (24 * 60 * 60 * 1000))
                );
                if (daysLeft <= 0) return null;
                const urgencyColor =
                  daysLeft <= 7
                    ? 'text-red-600 dark:text-red-400 bg-red-500/10'
                    : daysLeft <= 21
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                      : 'text-green-600 dark:text-green-400 bg-green-500/10';
                return (
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${urgencyColor}`}
                  >
                    <span className="tabular-nums">{daysLeft}</span>
                    <span>days until test</span>
                    {showBurmese && (
                      <span className="font-myanmar ml-0.5">{'\u101B\u1000\u103A'}</span>
                    )}
                  </div>
                );
              })()}
          </div>
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
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
              {currentTab === 'overview' &&
                (hubDataError ? (
                  <ErrorFallback
                    onRetry={handleHubRetry}
                    retryCount={hubRetryCount}
                    isEscalated={hubIsEscalated}
                    className="py-16"
                  />
                ) : (
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
                ))}
              {currentTab === 'history' && (
                <HistoryTab testHistory={history} isLoading={isLoadingAuth} />
              )}
              {currentTab === 'achievements' &&
                (hubDataError ? (
                  <ErrorFallback
                    onRetry={handleHubRetry}
                    retryCount={hubRetryCount}
                    isEscalated={hubIsEscalated}
                    className="py-16"
                  />
                ) : (
                  <AchievementsTab
                    earnedBadges={earnedBadges}
                    lockedBadges={lockedBadges}
                    badgeCheckData={badgeCheckData}
                    isLoading={isLoadingBadges}
                  />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Badge celebration modal rendered outside AnimatePresence to persist across tab switches */}
      {newlyEarnedBadge && (
        <BadgeCelebration
          badge={newlyEarnedBadge}
          onDismiss={() => dismissCelebration(newlyEarnedBadge.id)}
        />
      )}
    </div>
  );
}
