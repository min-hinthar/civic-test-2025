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

    const speakEnglish = async () => {
      try {
        await speak(text, { lang });
      } catch {
        // Retry once
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;
        try {
          await speak(text, { lang });
        } catch {
          // Give up silently
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
        // 'both': English first, then Burmese
        await speakEnglish();
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
    // Dependencies: re-trigger only on key change and enabled toggle
    // speak/cancel are stable (useCallback in useTTS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, enabled]);
}
