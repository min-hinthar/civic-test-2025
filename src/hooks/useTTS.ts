/**
 * useTTS Hook
 *
 * Main TTS hook wrapping the shared engine from TTSContext with reactive state.
 * Provides speak/cancel/pause/resume, auto-cancels on unmount.
 *
 * Usage:
 *   const { speak, cancel, isSpeaking, isSupported } = useTTS();
 *   await speak("Hello world");
 *
 * For an independent engine (not sharing cancel state):
 *   const { speak } = useTTS({ isolated: true });
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { TTSContext } from '../contexts/TTSContext';
import { cancelAllPlayers } from '../lib/audio/audioPlayer';
import { createTTSEngine } from '../lib/ttsCore';
import type { SpeakOptions, TTSEngine, TTSSettings, TTSState } from '../lib/ttsTypes';

interface UseTTSOptions {
  /** Create an independent engine that doesn't share cancel state with other consumers. */
  isolated?: boolean;
}

interface UseTTSReturn {
  speak: (text: string, overrides?: SpeakOptions) => Promise<void>;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  /** The text currently being spoken (null when idle). For per-button matching. */
  currentText: string | null;
  isSupported: boolean;
  error: string | null;
  voices: SpeechSynthesisVoice[];
  refreshVoices: () => Promise<void>;
  settings: TTSSettings;
  updateSettings: (partial: Partial<TTSSettings>) => void;
}

export function useTTS(options?: UseTTSOptions): UseTTSReturn {
  const ctx = useContext(TTSContext);
  if (!ctx) {
    throw new Error('useTTS must be used within TTSProvider');
  }

  const {
    engine: sharedEngine,
    voices,
    isSupported,
    settings,
    updateSettings,
    rateToNumeric,
  } = ctx;

  // Local error state -- auto-clears on next successful speak
  const [error, setError] = useState<string | null>(null);

  // Isolated engine support: create a local engine in a ref (accessed only in effects/handlers)
  const isolatedEngineRef = useRef<TTSEngine | null>(null);
  const [isolatedState, setIsolatedState] = useState<TTSState>({
    isSpeaking: false,
    isPaused: false,
    currentText: null,
  });

  // Create isolated engine on mount if requested
  useEffect(() => {
    if (!options?.isolated) return;

    const eng = createTTSEngine({
      rate: rateToNumeric(settings.rate),
      pitch: settings.pitch,
      lang: settings.lang,
    });

    const unsub = eng.onStateChange(setIsolatedState);
    isolatedEngineRef.current = eng;

    return () => {
      unsub();
      eng.destroy();
      isolatedEngineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isolated engine created once on mount
  }, []);

  // Determine which state to use
  const state = options?.isolated ? isolatedState : ctx.state;

  // Wrap speak with error handling and rate conversion
  const speak = useCallback(
    async (text: string, overrides?: SpeakOptions) => {
      const eng = options?.isolated ? isolatedEngineRef.current : sharedEngine;
      if (!eng) throw new Error('TTS engine not initialized');

      try {
        // Cancel all MP3 audio players before starting browser TTS
        // This prevents overlapping audio from SpeechButton/auto-read/auto-play players
        cancelAllPlayers();

        // Apply numeric rate from settings if no rate override provided
        const resolvedOverrides: SpeakOptions = {
          rate: rateToNumeric(settings.rate),
          pitch: settings.pitch,
          lang: settings.lang,
          ...overrides,
        };
        setError(null);
        await eng.speak(text, resolvedOverrides);
      } catch (err) {
        // Always re-throw so callers can detect cancellation and handle errors.
        // Set error state for UI display (skip for cancellation — that's user-initiated).
        if (!(err instanceof Error && err.name === 'TTSCancelledError')) {
          const message = err instanceof Error ? err.message : 'Speech synthesis failed';
          setError(message);
        }
        throw err;
      }
    },
    [sharedEngine, options?.isolated, rateToNumeric, settings.rate, settings.pitch, settings.lang]
  );

  // Cancel wrapper
  const cancel = useCallback(() => {
    const eng = options?.isolated ? isolatedEngineRef.current : sharedEngine;
    eng?.cancel();
  }, [sharedEngine, options?.isolated]);

  // Pause wrapper
  const pause = useCallback(() => {
    const eng = options?.isolated ? isolatedEngineRef.current : sharedEngine;
    eng?.pause();
  }, [sharedEngine, options?.isolated]);

  // Resume wrapper
  const resume = useCallback(() => {
    const eng = options?.isolated ? isolatedEngineRef.current : sharedEngine;
    eng?.resume();
  }, [sharedEngine, options?.isolated]);

  // refreshVoices wrapper
  const refreshVoices = useCallback(async () => {
    const eng = options?.isolated ? isolatedEngineRef.current : sharedEngine;
    if (eng) {
      await eng.refreshVoices();
    }
  }, [sharedEngine, options?.isolated]);

  // Auto-cancel on unmount
  useEffect(() => {
    return () => {
      if (options?.isolated) {
        isolatedEngineRef.current?.cancel();
      } else {
        sharedEngine?.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup only runs on unmount
  }, []);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    currentText: state.currentText,
    isSupported,
    error,
    voices,
    refreshVoices,
    settings,
    updateSettings,
  };
}
