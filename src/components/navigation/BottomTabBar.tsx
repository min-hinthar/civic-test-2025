'use client';

import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ClipboardCheck, Mic, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BilingualString } from '@/lib/i18n/strings';
import { strings } from '@/lib/i18n/strings';

interface TabItem {
  href: string;
  label: BilingualString;
  icon: typeof Home;
}

const tabs: TabItem[] = [
  { href: '/dashboard', label: strings.nav.dashboard, icon: Home },
  { href: '/study', label: strings.nav.studyGuide, icon: BookOpen },
  { href: '/test', label: strings.nav.mockTest, icon: ClipboardCheck },
  { href: '/interview', label: strings.nav.practiceInterview, icon: Mic },
  { href: '/progress', label: strings.nav.progress, icon: TrendingUp },
];

/** Routes where the bottom tab bar should NOT be shown */
const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed'];

/**
 * Mobile bottom tab bar with 5 tabs (Duolingo-style).
 * Fixed at bottom, hidden on md+ breakpoints.
 * Uses safe-area-inset-bottom for iOS home indicator clearance.
 */
export function BottomTabBar() {
  const location = useLocation();
  const { showBurmese } = useLanguage();

  // Hide on public/auth routes
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/60 bg-card/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1">
        {tabs.map(tab => {
          const isActive =
            location.pathname === tab.href ||
            (tab.href === '/study' && location.pathname.startsWith('/study'));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              to={tab.href}
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
                  }`}
                >
                  {showBurmese ? tab.label.my : tab.label.en}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
