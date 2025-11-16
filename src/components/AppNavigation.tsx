'use client';

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface AppNavigationProps {
  translucent?: boolean;
}

const navLinks = [
  { href: '/dashboard', labelEn: 'Dashboard', labelMy: 'ဒိုင်ခွက်' },
  { href: '/study', labelEn: 'Study guide', labelMy: 'လေ့လာမှုအညွှန်း' },
  { href: '/test', labelEn: 'Mock test', labelMy: 'စမ်းသပ်မေးခွန်း' },
  { href: '/history', labelEn: 'History', labelMy: 'မှတ်တမ်း' },
];

const AppNavigation = ({ translucent = false }: AppNavigationProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const shellClasses = translucent
    ? 'bg-card/70 shadow-sm'
    : 'bg-gradient-to-r from-primary/10 via-background/70 to-accent/10 dark:from-slate-900/70 dark:via-slate-950 dark:to-slate-900 shadow-lg shadow-primary/10';

  return (
    <nav className={`sticky top-0 z-30 border-b border-border/60 backdrop-blur-xl ${shellClasses}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-foreground">
          Civic Test Prep · <span className="font-myanmar text-sm text-muted-foreground">နိုင်ငံသားသင်ခန်းစာ</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-2xl px-4 py-2 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <span>{link.labelEn}</span>
                <span className="block text-xs font-normal text-muted-foreground font-myanmar">
                  {link.labelMy}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <button
              onClick={() => logout().then(() => navigate('/'))}
              className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground md:hidden"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                  location.pathname === link.href
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow'
                    : 'bg-card/80 text-foreground shadow-sm'
                }`}
              >
                <span>{link.labelEn}</span>
                <span className="block text-xs font-normal text-muted-foreground font-myanmar">{link.labelMy}</span>
              </Link>
            ))}
            {user ? (
              <button
                className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground"
                onClick={() => logout().then(() => navigate('/'))}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppNavigation;
