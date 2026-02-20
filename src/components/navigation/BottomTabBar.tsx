'use client';

/**
 * Mobile bottom tab bar -- 6 tabs + 3 utility controls.
 *
 * Consumes the shared nav foundation (navConfig, NavItem, NavigationProvider)
 * for consistent rendering with the Sidebar. Applies glass-morphism styling,
 * horizontal scroll with snap-center, and scroll-hide/show behavior.
 */

import { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { NAV_TABS, HIDDEN_ROUTES } from './navConfig';
import { NavItem } from './NavItem';
import { useNavigation } from './NavigationProvider';
import { useScrollSnapCenter } from '@/lib/useScrollSnapCenter';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FlagToggle } from '@/components/ui/FlagToggle';
import { hapticLight } from '@/lib/haptics';

const TOOLTIP_KEY = 'civic-test-lang-tooltip-shown';

/**
 * Mobile bottom tab bar with 6 nav items + utility controls
 * in a horizontally scrollable row.
 * Hides on scroll down, shows on scroll up.
 */
export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const { showBurmese } = useLanguage();
  const { isLocked, navVisible, badges } = useNavigation();
  const scrollRef = useScrollSnapCenter(location.pathname);

  // --- First-time tooltip (shared key with Sidebar) ---
  const [showTooltip, setShowTooltip] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(TOOLTIP_KEY);
  });

  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => {
      setShowTooltip(false);
      localStorage.setItem(TOOLTIP_KEY, 'true');
    }, 5000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const handleSignOut = useCallback(() => {
    hapticLight();
    logout().then(() => navigate('/'));
  }, [logout, navigate]);

  const handleLockedTap = useCallback(() => {
    // NavItem handles the shake animation; we could show a toast here
    // but the lock message is available from NavigationProvider if needed.
  }, []);

  // Hide on public/auth routes
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden glass-heavy prismatic-border glass-nav rounded-none transition-transform duration-300 ${navVisible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div ref={scrollRef} className="flex items-center overflow-x-auto scrollbar-hide px-1">
        {NAV_TABS.map(tab => {
          const isActive =
            location.pathname === tab.href ||
            (tab.href === '/study' && location.pathname.startsWith('/study')) ||
            (tab.href === '/hub' && location.pathname.startsWith('/hub'));

          return (
            <NavItem
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isLocked={isLocked}
              showBurmese={showBurmese}
              variant="mobile"
              badges={badges}
              onLockedTap={handleLockedTap}
            />
          );
        })}

        {/* Separator */}
        <div className="shrink-0 mx-1.5 h-8 w-px bg-border/40" />

        {/* Language toggle -- dual flag */}
        <div className="relative flex shrink-0 items-center justify-center min-w-[60px] min-h-[56px]">
          <FlagToggle compact />
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium shadow-lg"
            >
              Switch language
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
            </motion.div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={e => {
            hapticLight();
            toggleTheme(e);
          }}
          className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
          data-tour="theme-toggle"
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary/10">
              <ThemeIcon className="h-6 w-6 text-muted-foreground" strokeWidth={2} />
            </span>
            <span
              className={`text-xs whitespace-nowrap transition-colors ${
                showBurmese ? 'font-myanmar' : ''
              } text-muted-foreground`}
            >
              {showBurmese
                ? theme === 'dark'
                  ? '\u1021\u101C\u1004\u103A\u1038'
                  : '\u1021\u1019\u103E\u102C\u1004\u103A'
                : theme === 'dark'
                  ? 'Light'
                  : 'Dark'}
            </span>
          </div>
        </button>

        {/* Sign out */}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200 hover:bg-destructive/10">
                <LogOut className="h-6 w-6 text-destructive/70" strokeWidth={2} />
              </span>
              <span
                className={`text-xs whitespace-nowrap transition-colors ${
                  showBurmese ? 'font-myanmar' : ''
                } text-muted-foreground`}
              >
                {showBurmese ? '\u1011\u103D\u1000\u103A\u101B\u1014\u103A' : 'Sign Out'}
              </span>
            </div>
          </button>
        )}
      </div>
    </nav>
  );
}
