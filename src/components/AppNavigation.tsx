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
import { useToast } from '@/components/BilingualToast';
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
  const { showWarning } = useToast();
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
    showWarning({
      en: lockMessage ?? 'Please finish your mock test first!',
      my: 'စမ်းသပ်စာမေးပွဲပြီးဆုံးစွာ ဖြေဆိုပြီးမှ ထွက်ပါ',
    });
  };

  const shellClasses = translucent
    ? 'bg-card/70 shadow-sm'
    : 'bg-gradient-to-r from-primary-subtle/80 via-background to-primary-subtle/80 shadow-lg shadow-primary/5';

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
              အမေရိကန်နိုင်ငံသားရေး
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
                    ? 'bg-primary/20 text-primary font-semibold shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/15'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={locked && link.href !== '/test'}
              >
                {/* Active indicator bar at bottom */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="hidden lg:inline whitespace-nowrap">
                  {showBurmese ? (
                    <span className="font-myanmar">{link.label.my}</span>
                  ) : (
                    link.label.en
                  )}
                </span>
                {link.href === '/study' && dueCount > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-warning text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
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
                {showBurmese ? (
                  <span className="font-myanmar">{strings.nav.signOut.my}</span>
                ) : (
                  strings.nav.signOut.en
                )}
              </span>
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={event => locked && handleGuardedNavigation(event)}
              className={`inline-flex items-center rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
                locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-primary'
              }`}
              aria-disabled={locked}
            >
              {showBurmese ? (
                <span className="font-myanmar">{strings.nav.signIn.my}</span>
              ) : (
                strings.nav.signIn.en
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Lock warning bar */}
      {locked && (
        <div className="border-t border-warning/60 bg-warning-subtle/80 px-4 py-1.5 text-center text-xs font-semibold text-warning">
          {lockMessage ?? 'Complete the mock test before leaving this page.'}
        </div>
      )}
    </nav>
  );
};

export default AppNavigation;
