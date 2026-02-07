'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { LanguageToggleCompact } from '@/components/ui/LanguageToggle';
import { OnlineStatusIndicator } from '@/components/pwa/OnlineStatusIndicator';
import { SyncStatusIndicator } from '@/components/pwa/SyncStatusIndicator';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSRS } from '@/contexts/SRSContext';
import { toast } from '@/components/ui/use-toast';
import { strings } from '@/lib/i18n/strings';
import { BilingualText } from '@/components/bilingual/BilingualText';

interface AppNavigationProps {
  translucent?: boolean;
  locked?: boolean;
  lockMessage?: string;
}

const navLinks = [
  { href: '/dashboard', label: strings.nav.dashboard },
  { href: '/study', label: strings.nav.studyGuide },
  { href: '/test', label: strings.nav.mockTest },
  { href: '/history', label: strings.nav.testHistory },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: close menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

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
        'Complete the mock test before leaving this page. · စမ်းသပ်စာမေးပွဲပြီးမှ ထွက်ပါ',
      variant: 'destructive',
    });
  };

  const shellClasses = translucent
    ? 'bg-card/70 shadow-sm'
    : 'bg-gradient-to-r from-primary/10 via-background/70 to-accent/10 dark:from-slate-900/70 dark:via-slate-950 dark:to-slate-900 shadow-lg shadow-primary/10';

  return (
    <nav
      className={`nav-safe-area sticky top-0 z-30 border-b border-border/60 backdrop-blur-xl ${shellClasses}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-2 sm:px-4 py-3 sm:py-4">
        <Link
          to="/"
          className={`text-lg font-semibold text-foreground ${locked ? 'cursor-not-allowed opacity-70' : ''}`}
          onClick={event => locked && handleGuardedNavigation(event)}
          aria-disabled={locked}
        >
          U.S Citizenship Civic Test Prep App -{' '}
          <span className="font-myanmar text-sm text-muted-foreground">
            {' '}
            အမေရိကန်နိုင်ငံသားရေးရာစာမေးပွဲသင်ရိုးညွှန်း
          </span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={event => handleGuardedNavigation(event, link.href)}
                className={`rounded-full px-4 py-2 text-left transition flex items-center ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-muted-foreground hover:bg-muted/40'
                }`}
                aria-disabled={locked && link.href !== '/test'}
              >
                <BilingualText text={link.label} size="sm" equalSize />
                {link.href === '/study' && dueCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-warning-500 text-white text-xs font-bold min-w-[20px] h-5 px-1.5">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <OnlineStatusIndicator />
          <SyncStatusIndicator />
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
              className={`hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground transition md:inline-flex ${
                locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/40'
              }`}
              aria-disabled={locked}
            >
              <LogOut className="h-4 w-4" />
              <BilingualText text={strings.nav.signOut} size="sm" />
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={event => locked && handleGuardedNavigation(event)}
              className={`hidden rounded-full border border-border px-4 py-2 text-foreground transition md:inline-flex ${
                locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/40'
              }`}
              aria-disabled={locked}
            >
              <BilingualText text={strings.nav.signIn} size="sm" />
            </Link>
          )}
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground md:hidden ${
              locked ? 'cursor-not-allowed opacity-60' : ''
            }`}
            onClick={() => !locked && setIsMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-disabled={locked}
            disabled={locked}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="card-edge-safe border-t border-border/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={event => handleGuardedNavigation(event, link.href)}
                className={`rounded-full px-4 py-3 text-left flex items-center ${
                  location.pathname === link.href
                    ? 'bg-primary-500 text-white shadow'
                    : 'bg-card/80 text-foreground shadow-sm'
                } ${locked && link.href !== '/test' ? 'cursor-not-allowed opacity-60' : ''}`}
                aria-disabled={locked && link.href !== '/test'}
              >
                <BilingualText text={link.label} size="sm" equalSize />
                {link.href === '/study' && dueCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-warning-500 text-white text-xs font-bold min-w-[20px] h-5 px-1.5">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </Link>
            ))}
            {user ? (
              <button
                className={`flex items-center justify-center gap-2 rounded-full bg-destructive px-4 py-3 text-destructive-foreground ${
                  locked ? 'cursor-not-allowed opacity-70' : ''
                }`}
                onClick={event => {
                  if (locked) {
                    handleGuardedNavigation(event);
                    return;
                  }
                  logout().then(() => navigate('/'));
                }}
                aria-disabled={locked}
              >
                <LogOut className="h-4 w-4" />
                <BilingualText text={strings.nav.signOut} size="sm" />
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={event => locked && handleGuardedNavigation(event)}
                className={`rounded-full bg-primary-500 px-4 py-3 text-center text-white ${
                  locked ? 'cursor-not-allowed opacity-60' : ''
                }`}
                aria-disabled={locked}
              >
                <BilingualText text={strings.nav.signIn} size="sm" centered />
              </Link>
            )}
          </div>
        </div>
      )}
      {locked && (
        <div className="border-t border-amber-200/60 bg-amber-50/80 px-4 py-2 text-center text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {lockMessage ?? 'Complete the mock test before leaving this page.'}
        </div>
      )}
    </nav>
  );
};

export default AppNavigation;
