'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeContext } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted"
    >
      <Sun className={`h-5 w-5 text-amber-500 transition ${theme === 'light' ? 'opacity-100' : 'opacity-0 -rotate-90'}`} />
      <Moon className={`absolute h-5 w-5 text-slate-500 transition ${theme === 'dark' ? 'opacity-100' : 'opacity-0 rotate-90'}`} />
    </button>
  );
};

export default ThemeToggle;
