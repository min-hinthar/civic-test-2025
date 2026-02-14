'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type LanguageMode = 'bilingual' | 'english-only';

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

/** Map language mode to HTML lang attribute value */
function langAttrForMode(mode: LanguageMode): string {
  return mode === 'bilingual' ? 'en-my' : 'en';
}

/**
 * Language preference provider.
 *
 * Features:
 * - Persists preference to localStorage
 * - English-only mode for USCIS interview simulation
 * - SSR-safe with lazy initialization
 * - Multi-tab sync via storage event
 * - Updates document.documentElement.lang
 * - Alt+L keyboard shortcut to toggle
 * - Analytics stubs for future integration
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
    document.documentElement.lang = langAttrForMode(newMode);
    console.debug('[analytics] language_mode_changed', { mode: newMode });
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'bilingual' ? 'english-only' : 'bilingual');
  }, [mode, setMode]);

  // Sync with localStorage on mount (SSR hydration fix) + set initial HTML lang
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== mode) {
      setModeState(stored as LanguageMode);
    }
    // Set HTML lang attribute on mount
    document.documentElement.lang = langAttrForMode(stored ? (stored as LanguageMode) : mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-tab sync: listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as LanguageMode;
        setModeState(newMode);
        document.documentElement.lang = langAttrForMode(newMode);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Keyboard shortcut: Alt+L to toggle language mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'l') {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

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
