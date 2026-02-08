'use client';

import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  MoreHorizontal,
  Mic,
  TrendingUp,
  Clock,
  Users,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { BilingualString } from '@/lib/i18n/strings';
import { strings } from '@/lib/i18n/strings';

interface TabItem {
  href: string;
  label: BilingualString;
  icon: typeof Home;
}

/** Primary tabs shown in the bottom bar (4 items + More) */
const primaryTabs: TabItem[] = [
  { href: '/dashboard', label: strings.nav.dashboard, icon: Home },
  { href: '/study', label: strings.nav.studyGuide, icon: BookOpen },
  { href: '/test', label: strings.nav.mockTest, icon: ClipboardCheck },
];

/** Additional items accessible through the "More" menu */
const moreNavItems: TabItem[] = [
  { href: '/interview', label: strings.nav.practiceInterview, icon: Mic },
  { href: '/progress', label: strings.nav.progress, icon: TrendingUp },
  { href: '/history', label: strings.nav.testHistory, icon: Clock },
  { href: '/social', label: strings.nav.socialHub, icon: Users },
];

/** Routes where the bottom tab bar should NOT be shown */
const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed'];

/** All routes from the More menu (used to highlight the More tab) */
const MORE_ROUTES = moreNavItems.map(item => item.href);

/**
 * Mobile bottom tab bar with 3 primary tabs + "More" menu.
 * Fixed at bottom, hidden on md+ breakpoints.
 * Uses safe-area-inset-bottom for iOS home indicator clearance.
 *
 * The "More" tab opens a slide-up sheet with:
 * - Interview, Progress, History, Community navigation
 * - Theme toggle
 * - Sign out button
 */
export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const closeMore = useCallback(() => setIsMoreOpen(false), []);

  const handleMoreNavigation = useCallback(
    (href: string) => {
      setIsMoreOpen(false);
      navigate(href);
    },
    [navigate]
  );

  const handleSignOut = useCallback(() => {
    setIsMoreOpen(false);
    logout().then(() => navigate('/'));
  }, [logout, navigate]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Hide on public/auth routes
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  // Check if current route is one of the "More" sub-routes
  const isMoreRouteActive = MORE_ROUTES.some(route => location.pathname === route);

  return (
    <>
      {/* More menu sheet overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={closeMore}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl border-t border-border/60 bg-card/98 backdrop-blur-xl shadow-2xl"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              role="dialog"
              aria-modal="true"
              aria-label={
                showBurmese ? '\u1014\u1031\u102C\u1000\u103A\u1011\u1015\u103A' : 'More options'
              }
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Close button */}
              <div className="flex justify-end px-4 pb-1">
                <button
                  type="button"
                  onClick={closeMore}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation items */}
              <div className="px-4 pb-2">
                <div className="grid grid-cols-4 gap-2">
                  {moreNavItems.map(item => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleMoreNavigation(item.href)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 min-h-[72px] transition-colors ${
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900/30'
                            : 'hover:bg-muted/50 active:bg-muted/70'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isActive ? 'text-primary-500' : 'text-muted-foreground'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span
                          className={`text-[11px] leading-tight text-center ${
                            isActive ? 'font-semibold text-primary-500' : 'text-muted-foreground'
                          } ${showBurmese ? 'font-myanmar' : ''}`}
                        >
                          {showBurmese ? item.label.my : item.label.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-border/40" />

              {/* Utility actions */}
              <div className="px-4 py-3 flex flex-col gap-1">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-left hover:bg-muted/50 active:bg-muted/70 transition-colors w-full"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {theme === 'dark' ? (
                      showBurmese ? (
                        <span className="font-myanmar">
                          {'\u1021\u101C\u1004\u103A\u1038\u1019\u102F\u1012\u103A'}
                        </span>
                      ) : (
                        'Light Mode'
                      )
                    ) : showBurmese ? (
                      <span className="font-myanmar">
                        {'\u1021\u1019\u103E\u102C\u1004\u103A\u1019\u102F\u1012\u103A'}
                      </span>
                    ) : (
                      'Dark Mode'
                    )}
                  </span>
                </button>

                {/* Sign out - only if authenticated */}
                {user && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px] text-left hover:bg-destructive/10 active:bg-destructive/15 transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5 text-destructive" />
                    <span
                      className={`text-sm font-medium text-destructive ${showBurmese ? 'font-myanmar' : ''}`}
                    >
                      {showBurmese ? strings.nav.signOut.my : strings.nav.signOut.en}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/60 bg-card/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-1">
          {/* Primary tabs */}
          {primaryTabs.map(tab => {
            const isActive =
              location.pathname === tab.href ||
              (tab.href === '/study' && location.pathname.startsWith('/study'));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                to={tab.href}
                onClick={closeMore}
                className="flex flex-1 flex-col items-center justify-center py-1.5 min-h-[56px] tap-highlight-none"
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                    isActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-primary-500' : 'text-muted-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={`text-[10px] leading-tight transition-colors ${
                      isActive ? 'font-semibold text-primary-500' : 'text-muted-foreground'
                    } ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? tab.label.my : tab.label.en}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(prev => !prev)}
            className="flex flex-1 flex-col items-center justify-center py-1.5 min-h-[56px] tap-highlight-none"
            aria-expanded={isMoreOpen}
            aria-haspopup="dialog"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                isMoreOpen || isMoreRouteActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''
              }`}
            >
              <MoreHorizontal
                className={`h-5 w-5 transition-colors ${
                  isMoreOpen || isMoreRouteActive ? 'text-primary-500' : 'text-muted-foreground'
                }`}
                strokeWidth={isMoreOpen || isMoreRouteActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] leading-tight transition-colors ${
                  isMoreOpen || isMoreRouteActive
                    ? 'font-semibold text-primary-500'
                    : 'text-muted-foreground'
                }`}
              >
                {showBurmese ? (
                  <span className="font-myanmar">
                    {'\u1014\u1031\u102C\u1000\u103A\u1011\u1015\u103A'}
                  </span>
                ) : (
                  'More'
                )}
              </span>
            </motion.div>
          </button>
        </div>
      </nav>
    </>
  );
}
