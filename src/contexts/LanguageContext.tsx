'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type LanguageMode = 'bilingual' | 'english-only';

interface LanguageContextValue {
  /** Current language mode */
  mode: LanguageMode;
  /** Whether to show Burmese text */
  showBurmese: boolean;
  /** Toggle between bilingual and english-only */
  toggleMode: () => void;
  /** Set specific mode */
  setMode: (mode: LanguageMode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'civic-test-language-mode';

/**
 * Language preference provider.
 *
 * Features:
 * - Persists preference to localStorage
 * - English-only mode for USCIS interview simulation
 * - SSR-safe with lazy initialization
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') return 'bilingual';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as LanguageMode) || 'bilingual';
  });

  const showBurmese = mode === 'bilingual';

  const setMode = useCallback((newMode: LanguageMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'bilingual' ? 'english-only' : 'bilingual');
  }, [mode, setMode]);

  // Sync with localStorage on mount (SSR hydration fix)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== mode) {
      setModeState(stored as LanguageMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageContext.Provider value={{ mode, showBurmese, toggleMode, setMode }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language preferences.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
