'use client';

import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  Mic,
  TrendingUp,
  Clock,
  Users,
  Settings,
  Sun,
  Moon,
  LogOut,
  Languages,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { BilingualString } from '@/lib/i18n/strings';
import { strings } from '@/lib/i18n/strings';
import { useScrollDirection } from '@/lib/useScrollDirection';
import { useScrollSnapCenter } from '@/lib/useScrollSnapCenter';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TabItem {
  href: string;
  label: BilingualString;
  icon: typeof Home;
}

/** All nav tabs shown in the scrollable bottom bar */
const allTabs: TabItem[] = [
  { href: '/dashboard', label: strings.nav.dashboard, icon: Home },
  { href: '/study', label: strings.nav.studyGuide, icon: BookOpen },
  { href: '/test', label: strings.nav.mockTest, icon: ClipboardCheck },
  { href: '/interview', label: strings.nav.practiceInterview, icon: Mic },
  { href: '/progress', label: strings.nav.progress, icon: TrendingUp },
  { href: '/history', label: strings.nav.testHistory, icon: Clock },
  { href: '/social', label: strings.nav.socialHub, icon: Users },
  { href: '/settings', label: strings.nav.settings, icon: Settings },
];

/** Routes where the bottom tab bar should NOT be shown */
const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed'];

/** Single-line nav label — Myanmar when bilingual mode, English otherwise */
function NavLabel({
  en,
  my,
  isActive,
  showBurmese,
}: {
  en: string;
  my: string;
  isActive: boolean;
  showBurmese: boolean;
}) {
  return (
    <span
      className={`text-[10px] whitespace-nowrap transition-colors ${
        showBurmese ? 'font-myanmar' : ''
      } ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
    >
      {showBurmese ? my : en}
    </span>
  );
}

/**
 * Mobile bottom tab bar with all nav items + theme toggle + sign out
 * in a horizontally scrollable row.
 * Hides on scroll down, shows on scroll up.
 */
export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const { showBurmese, toggleMode } = useLanguage();
  const navVisible = useScrollDirection();
  const scrollRef = useScrollSnapCenter(location.pathname);

  const handleSignOut = useCallback(() => {
    logout().then(() => navigate('/'));
  }, [logout, navigate]);

  // Hide on public/auth routes
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-300 ${navVisible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div ref={scrollRef} className="flex items-center overflow-x-auto scrollbar-hide px-1">
        {allTabs.map(tab => {
          const isActive =
            location.pathname === tab.href ||
            (tab.href === '/study' && location.pathname.startsWith('/study'));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-all ${
                  isActive ? 'bg-primary/20 shadow-sm shadow-primary/15' : 'active:bg-primary/10'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <NavLabel
                  en={tab.label.en}
                  my={tab.label.my}
                  isActive={isActive}
                  showBurmese={showBurmese}
                />
              </motion.div>
            </Link>
          );
        })}

        {/* Separator */}
        <div className="shrink-0 mx-1 h-8 w-px bg-border/40" />

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleMode}
          className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
          aria-label={showBurmese ? 'Switch to English' : 'Switch to Myanmar'}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-all active:bg-primary/10"
          >
            <Languages className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            <NavLabel en="မြန်မာ" my="English" isActive={false} showBurmese={showBurmese} />
          </motion.div>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
          data-tour="theme-toggle"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-all active:bg-primary/10"
          >
            <ThemeIcon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            <NavLabel
              en={theme === 'dark' ? 'Light' : 'Dark'}
              my={theme === 'dark' ? 'အလင်း' : 'အမှာင်'}
              isActive={false}
              showBurmese={showBurmese}
            />
          </motion.div>
        </button>

        {/* Sign out */}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-all active:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 text-destructive/70" strokeWidth={2} />
              <NavLabel
                en={strings.nav.signOut.en}
                my={strings.nav.signOut.my}
                isActive={false}
                showBurmese={showBurmese}
              />
            </motion.div>
          </button>
        )}
      </div>
    </nav>
  );
}
