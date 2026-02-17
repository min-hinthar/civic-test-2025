/**
 * useAutoRead Hook
 *
 * Triggers TTS speech automatically when content changes (e.g., question navigation).
 * Supports bilingual auto-read: English TTS, Burmese MP3, or both sequentially.
 * Uses triggerKey-based re-triggering with configurable delay and silent retry.
 *
 * Usage:
 *   useAutoRead({
 *     text: question.text,
 *     enabled: sessionAutoRead,
 *     triggerKey: questionIndex,
 *     lang: 'en-US',
 *     autoReadLang: 'both',
 *     burmeseAudioUrl: '/audio/my-MM/female/GOV-P01-q.mp3',
 *   });
 */

import { useEffect, useRef } from 'react';

import { createBurmesePlayer, type BurmesePlayer } from '@/lib/audio/burmeseAudio';
import type { AutoReadLang } from '@/lib/ttsTypes';

import { useTTS } from './useTTS';

interface UseAutoReadOptions {
  /** Text to speak (English) */
  text: string;
  /** Whether auto-read is enabled */
  enabled: boolean;
  /** Language override for English TTS (e.g., 'en-US') */
  lang?: string;
  /** Unique key that triggers re-read on change (e.g., question index, card side) */
  triggerKey: string | number;
  /** Delay before speaking in ms (default 300ms to let UI settle) */
  delay?: number;
  /** Which language(s) to auto-read. Defaults to 'english'. */
  autoReadLang?: AutoReadLang;
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
    burmeseAudioUrl,
    burmeseRate = 1,
  } = options;
  // Lazy-created Burmese audio player (ref is safe — only used in effects/callbacks)
  const burmesePlayerRef = useRef<BurmesePlayer | null>(null);

  useEffect(() => {
    // Local variable per effect invocation — not shared across re-renders.
    // This avoids the race condition where a shared ref gets reset by a new
    // effect invocation while the old effect's async chain is still running.
    let cancelled = false;

    if (!enabled || !text?.trim()) return;

    const getBurmesePlayer = (): BurmesePlayer => {
      if (!burmesePlayerRef.current) {
        burmesePlayerRef.current = createBurmesePlayer();
      }
      return burmesePlayerRef.current;
    };

    /**
     * Speak English text. Returns true if completed, false if cancelled.
     * Retries once on transient TTS errors (not on cancellation).
     */
    const speakEnglish = async (): Promise<boolean> => {
      try {
        await speak(text, { lang });
        return true;
      } catch (err) {
        // Cancellation = user/system stopped speech — don't retry, signal caller
        if (err instanceof Error && err.name === 'TTSCancelledError') return false;
        // Transient error — retry once after delay
        if (cancelled) return false;
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return false;
        try {
          await speak(text, { lang });
          return true;
        } catch {
          // Give up — report failure so chain can adapt
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
        await speakEnglish();
      } else if (autoReadLang === 'burmese') {
        await playBurmese();
      } else {
        // 'both': English first, brief pause, then Burmese
        const completed = await speakEnglish();
        // Only stop chain on cancellation (user pressed stop / navigated away),
        // NOT on English TTS failure — Burmese should still play
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
      burmesePlayerRef.current?.cancel();
    };
    // Re-trigger on key change, enabled toggle, language mode change, or Burmese URL change.
    // speak/cancel are stable (useCallback in useTTS); lang/burmeseRate rarely change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, enabled, autoReadLang, burmeseAudioUrl]);
}
