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
  Settings,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSRS } from '@/contexts/SRSContext';
import { useToast } from '@/components/BilingualToast';
import { strings } from '@/lib/i18n/strings';
import { useScrollDirection } from '@/lib/useScrollDirection';
import { useScrollSnapCenter } from '@/lib/useScrollSnapCenter';
import { useThemeContext } from '@/contexts/ThemeContext';
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
  { href: '/settings', label: strings.nav.settings, icon: Settings },
];

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
      className={`text-[11px] whitespace-nowrap transition-colors ${
        showBurmese ? 'font-myanmar' : ''
      } ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
    >
      {showBurmese ? my : en}
    </span>
  );
}

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
  const { theme, toggleTheme } = useThemeContext();
  const { showBurmese, toggleMode } = useLanguage();
  const navVisible = useScrollDirection();
  const scrollRef = useScrollSnapCenter(location.pathname);

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

  const handleSignOut = (event: MouseEvent<HTMLButtonElement>) => {
    if (locked) {
      handleGuardedNavigation(event);
      return;
    }
    logout().then(() => navigate('/'));
  };

  const shellClasses = translucent ? 'bg-card/70 shadow-sm' : 'bg-card/95 shadow-sm';

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <nav
      className={`hidden md:block nav-safe-area sticky top-0 z-30 border-b border-border/40 backdrop-blur-xl transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${shellClasses}`}
    >
      {/* Main nav row */}
      <div className="mx-auto flex max-w-7xl items-center px-4 lg:px-6 h-16">
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 text-foreground shrink-0 mr-4 ${locked ? 'cursor-not-allowed opacity-70' : 'hover:opacity-80 transition-opacity'}`}
          onClick={event => locked && handleGuardedNavigation(event)}
          aria-disabled={locked}
        >
          <span className="text-lg font-extrabold tracking-tight">Civic Test Prep</span>
        </Link>

        {/* Scrollable tabs — nav links + theme + signout */}
        <div ref={scrollRef} className="flex items-center overflow-x-auto scrollbar-hide min-w-0">
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
                className={`relative flex shrink-0 flex-col items-center justify-center py-1 px-2 min-w-[64px] min-h-[52px] transition-all duration-150 ${
                  locked && link.href !== '/test' ? 'cursor-not-allowed opacity-60' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={locked && link.href !== '/test'}
              >
                <div
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition-all ${
                    isActive
                      ? 'bg-primary/20 shadow-sm shadow-primary/15'
                      : 'hover:bg-primary/10 active:bg-primary/15'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <NavLabel
                    en={link.label.en}
                    my={link.label.my}
                    isActive={isActive}
                    showBurmese={showBurmese}
                  />
                  {link.href === '/study' && dueCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center rounded-full bg-warning text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5">
                      {dueCount > 99 ? '99+' : dueCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Separator */}
          <div className="shrink-0 mx-1.5 h-8 w-px bg-border/40" />

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleMode}
            className="flex shrink-0 flex-col items-center justify-center py-1 px-2 min-w-[64px] min-h-[52px]"
            aria-label={showBurmese ? 'Switch to English' : 'Switch to Myanmar'}
          >
            <div className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition-all hover:bg-primary/10 active:bg-primary/15">
              <Languages className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              <NavLabel en="မြန်မာ" my="English" isActive={false} showBurmese={showBurmese} />
            </div>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex shrink-0 flex-col items-center justify-center py-1 px-2 min-w-[64px] min-h-[52px]"
            data-tour="theme-toggle"
          >
            <div className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition-all hover:bg-primary/10 active:bg-primary/15">
              <ThemeIcon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              <NavLabel
                en={theme === 'dark' ? 'Light' : 'Dark'}
                my={theme === 'dark' ? 'အလင်း' : 'အမှာင်'}
                isActive={false}
                showBurmese={showBurmese}
              />
            </div>
          </button>

          {/* Sign out / Sign in */}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={`flex shrink-0 flex-col items-center justify-center py-1 px-2 min-w-[64px] min-h-[52px] ${
                locked ? 'cursor-not-allowed opacity-60' : ''
              }`}
              aria-disabled={locked}
            >
              <div className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition-all hover:bg-destructive/10 active:bg-destructive/15">
                <LogOut className="h-4 w-4 text-destructive/70" strokeWidth={2} />
                <NavLabel
                  en={strings.nav.signOut.en}
                  my={strings.nav.signOut.my}
                  isActive={false}
                  showBurmese={showBurmese}
                />
              </div>
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={event => locked && handleGuardedNavigation(event)}
              className="flex shrink-0 flex-col items-center justify-center py-1 px-2 min-w-[64px] min-h-[52px]"
              aria-disabled={locked}
            >
              <div className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition-all hover:bg-primary/10 active:bg-primary/15">
                <LogOut className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                <NavLabel
                  en={strings.nav.signIn.en}
                  my={strings.nav.signIn.my}
                  isActive={false}
                  showBurmese={showBurmese}
                />
              </div>
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
