'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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

    // Add transitioning class for smooth theme switch
    root.classList.add('theme-transitioning');

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.setProperty('color-scheme', theme);
    window.localStorage.setItem('civic-theme', theme);

    // Update PWA theme-color meta tag for browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1a1f36' : '#002868'
      );
    }

    // Remove transitioning class after animation completes
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

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(prev => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme]
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
