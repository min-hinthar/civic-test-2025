'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { gatherCurrentSettings, syncSettingsToSupabase } from '@/lib/settings';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' &&
      window.localStorage.getItem('civic-theme')) as Theme | null;
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate theme from localStorage on mount
    setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Fallback transitioning class for browsers without View Transitions API
    if (!document.startViewTransition) {
      root.classList.add('theme-transitioning');
    }

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.setProperty('color-scheme', theme);
    window.localStorage.setItem('civic-theme', theme);

    // Fire-and-forget sync to Supabase
    if (userRef.current?.id) {
      const settings = gatherCurrentSettings();
      syncSettingsToSupabase(userRef.current.id, settings);
    }

    // Update PWA theme-color meta tag for browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1f36' : '#002868');
    }

    // Remove transitioning class after animation completes (fallback path only)
    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 500);

    return () => clearTimeout(timer);
  }, [theme, mounted]);

  // Listen for system preference changes (only when no manual override is stored)
  useEffect(() => {
    if (!mounted) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const hasManualOverride = window.localStorage.getItem('civic-theme');
      if (!hasManualOverride) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [mounted]);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const newTheme = theme === 'light' ? 'dark' : 'light';

      // Fallback: instant switch for browsers without View Transitions API
      // or when prefers-reduced-motion is active
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || prefersReduced) {
        setTheme(newTheme);
        return;
      }

      // Get toggle button position for circular reveal origin
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? 0;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      try {
        const transition = document.startViewTransition(() => {
          flushSync(() => setTheme(newTheme));
        });

        transition.ready.then(() => {
          // Asymmetric: dark expands as circle, light dissolves
          const clipPathStart =
            newTheme === 'dark'
              ? `circle(0px at ${x}px ${y}px)`
              : `circle(${maxRadius}px at ${x}px ${y}px)`;
          const clipPathEnd =
            newTheme === 'dark'
              ? `circle(${maxRadius}px at ${x}px ${y}px)`
              : `circle(0px at ${x}px ${y}px)`;

          document.documentElement.animate(
            { clipPath: [clipPathStart, clipPathEnd] },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        });
      } catch {
        // Fallback on error: just set theme directly
        setTheme(newTheme);
      }
    },
    [theme]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
};
