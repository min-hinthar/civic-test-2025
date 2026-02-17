'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createTTSEngine, loadVoices } from '../lib/ttsCore';
import type { TTSEngine, TTSSettings, TTSState } from '../lib/ttsTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SETTINGS_KEY = 'civic-prep-tts-settings';
const OLD_RATE_KEY = 'civic-prep-speech-rate';

const RATE_MAP: Record<'slow' | 'normal' | 'fast', number> = {
  slow: 0.7,
  normal: 0.98,
  fast: 1.3,
};

const DEFAULT_SETTINGS: TTSSettings = {
  rate: 'normal',
  pitch: 1.02,
  lang: 'en-US',
  autoRead: false,
  autoReadLang: 'both',
};

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface TTSContextValue {
  engine: TTSEngine | null;
  state: TTSState;
  voices: SpeechSynthesisVoice[];
  isSupported: boolean;
  error: string | null;
  settings: TTSSettings;
  updateSettings: (partial: Partial<TTSSettings>) => void;
  rateToNumeric: (rate: 'slow' | 'normal' | 'fast') => number;
}

export const TTSContext = createContext<TTSContextValue | null>(null);

// ---------------------------------------------------------------------------
// Settings initialization (runs once in useState initializer)
// ---------------------------------------------------------------------------

function loadInitialSettings(): TTSSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TTSSettings;
      // Validate rate is one of the named values
      if (parsed.rate === 'slow' || parsed.rate === 'normal' || parsed.rate === 'fast') {
        // Merge with defaults so existing users get new fields automatically
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    }

    // Migration from old key (silent -- no console output)
    const oldRate = localStorage.getItem(OLD_RATE_KEY);
    if (oldRate) {
      const validRates: Array<TTSSettings['rate']> = ['slow', 'normal', 'fast'];
      const rate = validRates.includes(oldRate as TTSSettings['rate'])
        ? (oldRate as TTSSettings['rate'])
        : 'normal';
      const migrated: TTSSettings = { ...DEFAULT_SETTINGS, rate };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
      localStorage.removeItem(OLD_RATE_KEY);
      return migrated;
    }
  } catch {
    // localStorage unavailable or corrupted -- use defaults
  }

  return DEFAULT_SETTINGS;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TTSProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TTSSettings>(loadInitialSettings);
  const [engine, setEngine] = useState<TTSEngine | null>(null);
  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    isPaused: false,
    currentText: null,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Engine creation -- client-side only, runs once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eng = createTTSEngine({
      rate: RATE_MAP[settings.rate],
      pitch: settings.pitch,
      lang: settings.lang,
    });

    const unsub = eng.onStateChange(setState);
    setEngine(eng);

    // Deferred voice loading via requestIdleCallback (with setTimeout fallback)
    const scheduleVoiceLoad =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 0);

    const idleId = scheduleVoiceLoad(() => {
      loadVoices().then(loadedVoices => {
        setVoices(loadedVoices);
      });
    });

    // Listen for late-arriving voices (Chrome loads online voices async after local ones)
    const handleVoicesChanged = () => {
      eng.refreshVoices().then(newVoices => {
        if (newVoices.length > 0) {
          setVoices(newVoices);
        }
      });
    };

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    }

    return () => {
      unsub();
      eng.destroy();
      // Cancel idle callback if it hasn't fired yet
      if (typeof cancelIdleCallback === 'function' && typeof idleId === 'number') {
        cancelIdleCallback(idleId);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engine creation runs once on mount
  }, []);

  // updateSettings -- merges partial, persists, and syncs engine defaults
  const updateSettings = useCallback(
    (partial: Partial<TTSSettings>) => {
      setSettings(prev => {
        const next = { ...prev, ...partial };
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } catch {
          // localStorage full or unavailable
        }
        // Sync numeric rate to engine
        if (engine) {
          engine.setDefaults({
            rate: RATE_MAP[next.rate],
            pitch: next.pitch,
            lang: next.lang,
          });
        }
        return next;
      });
    },
    [engine]
  );

  // rateToNumeric -- exposed for consumers that need numeric rate
  const rateToNumeric = useCallback((rate: 'slow' | 'normal' | 'fast'): number => {
    return RATE_MAP[rate];
  }, []);

  // Optimistic default: assume supported until engine says otherwise (avoids hydration mismatch)
  const isSupported = engine?.isSupported() ?? true;

  const value: TTSContextValue = useMemo(
    () => ({
      engine,
      state,
      voices,
      isSupported,
      error: null,
      settings,
      updateSettings,
      rateToNumeric,
    }),
    [engine, state, voices, isSupported, settings, updateSettings, rateToNumeric]
  );

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
}
