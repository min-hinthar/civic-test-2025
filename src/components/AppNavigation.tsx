'use client';

import { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Home,
  BookOpen,
  ClipboardCheck,
  Mic,
  History,
  Users,
  TrendingUp,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { LanguageToggleCompact } from '@/components/ui/LanguageToggle';
import { OnlineStatusIndicator } from '@/components/pwa/OnlineStatusIndicator';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSRS } from '@/contexts/SRSContext';
import { toast } from '@/components/ui/use-toast';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppNavigationProps {
  translucent?: boolean;
  locked?: boolean;
  lockMessage?: string;
}

const navLinks = [
  { href: '/dashboard', label: strings.nav.dashboard, icon: Home },
  { href: '/study', label: strings.nav.studyGuide, icon: BookOpen },
  { href: '/test', label: strings.nav.mockTest, icon: ClipboardCheck },
  { href: '/interview', label: strings.nav.practiceInterview, icon: Mic },
  { href: '/progress', label: strings.nav.progress, icon: TrendingUp },
  { href: '/history', label: strings.nav.testHistory, icon: History },
  { href: '/social', label: strings.nav.socialHub, icon: Users },
];

const AppNavigation = ({
  translucent = false,
  locked = false,
  lockMessage,
}: AppNavigationProps) => {
  const { user, logout } = useAuth();
  const { dueCount } = useSRS();
  const location = useLocation();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();

  const handleGuardedNavigation = (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href?: string
  ) => {
    if (!locked) return;
    if (href && href === '/test') return;
    event.preventDefault();
    toast({
      title: 'Please finish your mock test first!',
      description:
        lockMessage ??
        'Complete the mock test before leaving this page. \u00B7 \u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1015\u103C\u102E\u1038\u1019\u103E \u1011\u103D\u1000\u103A\u1015\u102B',
      variant: 'warning',
    });
  };

  const shellClasses = translucent
    ? 'bg-card/70 shadow-sm'
    : 'bg-gradient-to-r from-primary-50/80 via-background to-primary-50/80 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90 shadow-lg shadow-primary/5';

  return (
    <nav
      className={`hidden md:block nav-safe-area sticky top-0 z-30 border-b border-border/40 backdrop-blur-xl ${shellClasses}`}
    >
      {/* Main nav row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-6 h-14">
        {/* Logo / title area */}
        <Link
          to="/"
          className={`flex items-center gap-2 text-foreground shrink-0 ${locked ? 'cursor-not-allowed opacity-70' : 'hover:opacity-80 transition-opacity'}`}
          onClick={event => locked && handleGuardedNavigation(event)}
          aria-disabled={locked}
        >
          <span className="text-lg font-extrabold tracking-tight">Civic Test Prep</span>
          {showBurmese && (
            <span className="font-myanmar text-xs text-muted-foreground hidden lg:inline">
              \u1021\u1019\u1031\u101B\u102D\u1000\u1014\u103A\u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u101B\u1031\u1038
            </span>
          )}
        </Link>

        {/* Navigation links - centered */}
        <div className="flex items-center gap-0.5 lg:gap-1">
          {navLinks.map(link => {
            const isActive =
              location.pathname === link.href ||
              (link.href === '/study' && location.pathname.startsWith('/study'));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={event => handleGuardedNavigation(event, link.href)}
                className={`relative flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-500/12 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={locked && link.href !== '/test'}
              >
                {/* Active indicator bar at bottom */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary-500" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-500' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="hidden lg:inline whitespace-nowrap">
                  {showBurmese ? link.label.my : link.label.en}
                </span>
                {link.href === '/study' && dueCount > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-warning-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side: utilities */}
        <div className="flex items-center gap-1.5">
          <OnlineStatusIndicator />
          <LanguageToggleCompact />
          <div data-tour="theme-toggle">
            <ThemeToggle />
          </div>
          {user ? (
            <button
              onClick={event => {
                if (locked) {
                  handleGuardedNavigation(event);
                  return;
                }
                logout().then(() => navigate('/'));
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors ${
                locked
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
              }`}
              aria-disabled={locked}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">
                {showBurmese ? strings.nav.signOut.my : strings.nav.signOut.en}
              </span>
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={event => locked && handleGuardedNavigation(event)}
              className={`inline-flex items-center rounded-xl bg-primary-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
                locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-primary-600'
              }`}
              aria-disabled={locked}
            >
              {showBurmese ? strings.nav.signIn.my : strings.nav.signIn.en}
            </Link>
          )}
        </div>
      </div>

      {/* Lock warning bar */}
      {locked && (
        <div className="border-t border-amber-200/60 bg-amber-50/80 px-4 py-1.5 text-center text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {lockMessage ?? 'Complete the mock test before leaving this page.'}
        </div>
      )}
    </nav>
  );
};

export default AppNavigation;
