'use client';

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HubTabBar } from '@/components/hub/HubTabBar';

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
                <div className="rounded-2xl border border-border/30 bg-surface/50 p-8 text-center">
                  <p className="text-lg font-medium text-text-secondary">
                    Overview Tab Coming Soon
                  </p>
                </div>
              )}
              {currentTab === 'history' && (
                <div className="rounded-2xl border border-border/30 bg-surface/50 p-8 text-center">
                  <p className="text-lg font-medium text-text-secondary">History Tab Coming Soon</p>
                </div>
              )}
              {currentTab === 'achievements' && (
                <div className="rounded-2xl border border-border/30 bg-surface/50 p-8 text-center">
                  <p className="text-lg font-medium text-text-secondary">
                    Achievements Tab Coming Soon
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
