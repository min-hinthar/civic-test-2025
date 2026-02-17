/**
 * useAutoRead Hook
 *
 * Triggers auto-read when content changes (e.g., question navigation).
 * Supports bilingual auto-read: English MP3, Burmese MP3, or both sequentially.
 * Uses triggerKey-based re-triggering with configurable delay and silent retry.
 *
 * Usage:
 *   useAutoRead({
 *     text: question.text,
 *     enabled: sessionAutoRead,
 *     triggerKey: questionIndex,
 *     autoReadLang: 'both',
 *     englishAudioUrl: '/audio/en-US/ava/GOV-P01-q.mp3',
 *     burmeseAudioUrl: '/audio/my-MM/female/GOV-P01-q.mp3',
 *   });
 */

import { useEffect, useRef } from 'react';

import { createAudioPlayer, type AudioPlayer } from '@/lib/audio/audioPlayer';
import type { AutoReadLang } from '@/lib/ttsTypes';

import { useTTS } from './useTTS';

interface UseAutoReadOptions {
  /** Text to speak (English fallback when no MP3 URL provided) */
  text: string;
  /** Whether auto-read is enabled */
  enabled: boolean;
  /** Language override for English browser TTS fallback (e.g., 'en-US') */
  lang?: string;
  /** Unique key that triggers re-read on change (e.g., question index, card side) */
  triggerKey: string | number;
  /** Delay before speaking in ms (default 300ms to let UI settle) */
  delay?: number;
  /** Which language(s) to auto-read. Defaults to 'english'. */
  autoReadLang?: AutoReadLang;
  /** URL for pre-generated English audio MP3. When provided, uses MP3 instead of browser TTS. */
  englishAudioUrl?: string;
  /** Playback rate for English audio (default 1) */
  englishRate?: number;
  /** URL for pre-generated Burmese audio MP3. Required for 'burmese' or 'both' modes. */
  burmeseAudioUrl?: string;
  /** Playback rate for Burmese audio (default 1) */
  burmeseRate?: number;
}

export function useAutoRead(options: UseAutoReadOptions): void {
  const { speak, cancel } = useTTS();
  const {
    text,
    enabled,
    lang,
    triggerKey,
    delay = 300,
    autoReadLang = 'english',
    englishAudioUrl,
    englishRate = 1,
    burmeseAudioUrl,
    burmeseRate = 1,
  } = options;
  // Lazy-created audio players (ref is safe — only used in effects/callbacks)
  const englishPlayerRef = useRef<AudioPlayer | null>(null);
  const burmesePlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Local variable per effect invocation — not shared across re-renders.
    // This avoids the race condition where a shared ref gets reset by a new
    // effect invocation while the old effect's async chain is still running.
    let cancelled = false;

    if (!enabled || !text?.trim()) return;

    const getEnglishPlayer = (): AudioPlayer => {
      if (!englishPlayerRef.current) {
        englishPlayerRef.current = createAudioPlayer();
      }
      return englishPlayerRef.current;
    };

    const getBurmesePlayer = (): AudioPlayer => {
      if (!burmesePlayerRef.current) {
        burmesePlayerRef.current = createAudioPlayer();
      }
      return burmesePlayerRef.current;
    };

    /**
     * Play English audio. Returns true if completed, false if cancelled/failed.
     * When englishAudioUrl is available, uses MP3 player; otherwise falls back to browser TTS.
     */
    const playEnglish = async (): Promise<boolean> => {
      if (englishAudioUrl) {
        // MP3 mode — retry once on network failure
        try {
          await getEnglishPlayer().play(englishAudioUrl, englishRate);
          return true;
        } catch {
          if (cancelled) return false;
          // Retry once
          try {
            await getEnglishPlayer().play(englishAudioUrl, englishRate);
            return true;
          } catch {
            return false;
          }
        }
      }
      // Browser TTS fallback
      try {
        await speak(text, { lang });
        return true;
      } catch (err) {
        if (err instanceof Error && err.name === 'TTSCancelledError') return false;
        if (cancelled) return false;
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return false;
        try {
          await speak(text, { lang });
          return true;
        } catch {
          return false;
        }
      }
    };

    const playBurmese = async () => {
      if (!burmeseAudioUrl) return;
      try {
        await getBurmesePlayer().play(burmeseAudioUrl, burmeseRate);
      } catch {
        // Burmese audio failure is non-blocking
      }
    };

    const timer = setTimeout(async () => {
      if (cancelled) return;

      if (autoReadLang === 'english') {
        await playEnglish();
      } else if (autoReadLang === 'burmese') {
        await playBurmese();
      } else {
        // 'both': English first, brief pause, then Burmese
        const completed = await playEnglish();
        if (cancelled) return;
        // Small gap between languages (skip if English failed)
        await new Promise(r => setTimeout(r, completed ? 400 : 0));
        if (!cancelled) {
          await playBurmese();
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancel();
      englishPlayerRef.current?.cancel();
      burmesePlayerRef.current?.cancel();
    };
    // Re-trigger on key change, enabled toggle, language mode change, or audio URL change.
    // speak/cancel are stable (useCallback in useTTS); lang/rates rarely change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, enabled, autoReadLang, englishAudioUrl, burmeseAudioUrl]);
}
