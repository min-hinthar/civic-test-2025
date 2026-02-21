/**
 * useAutoPlay Hook
 *
 * Hands-free study mode: reads question, pauses, flips card, reads answer,
 * pauses, then advances to the next card. Loops until paused or end of deck.
 *
 * Supports bilingual mode: when showBurmese is true, plays Burmese audio
 * after English for both question and answer phases.
 *
 * Uses TTS for speech and createAudioPlayer for pre-generated MP3 playback.
 * Effect cleanup uses closure-local `let cancelled = false` per CLAUDE.md
 * convention to prevent race conditions.
 *
 * Usage:
 *   const { isPlaying, toggle } = useAutoPlay({
 *     enabled: autoPlayActive,
 *     currentIndex,
 *     totalCards: questions.length,
 *     questionText: question.question_en,
 *     answerText: answer.en,
 *     questionId: question.id,
 *     showBurmese: true,
 *     onFlip: setFlipped,
 *     onAdvance: goToNext,
 *   });
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createAudioPlayer,
  getBurmeseAudioUrl,
  getEnglishAudioUrl,
  type AudioPlayer,
} from '@/lib/audio/audioPlayer';

import { useTTS } from './useTTS';

interface UseAutoPlayOptions {
  /** Whether auto-play mode is enabled (user toggled it on) */
  enabled: boolean;
  /** Current card index */
  currentIndex: number;
  /** Total number of cards */
  totalCards: number;
  /** English question text for TTS fallback */
  questionText: string;
  /** English answer text for TTS fallback */
  answerText: string;
  /** Question ID for MP3 audio URLs */
  questionId: string;
  /** Whether Burmese/Myanmar mode is active — plays Burmese audio after English */
  showBurmese?: boolean;
  /** Callback to flip the card (true = show answer) */
  onFlip: (flipped: boolean) => void;
  /** Callback to advance to next card */
  onAdvance: () => void;
  /** Pause between reading question and flipping (ms) */
  questionPause?: number;
  /** Pause between reading answer and advancing (ms) */
  answerPause?: number;
}

interface UseAutoPlayReturn {
  /** Whether auto-play is currently active */
  isPlaying: boolean;
  /** Start auto-play */
  play: () => void;
  /** Pause auto-play */
  pause: () => void;
  /** Toggle play/pause */
  toggle: () => void;
}

export function useAutoPlay({
  enabled,
  currentIndex,
  totalCards,
  questionText,
  answerText,
  questionId,
  showBurmese = false,
  onFlip,
  onAdvance,
  questionPause = 2000,
  answerPause = 3000,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const { speak, cancel: cancelTTS } = useTTS({ isolated: true });

  // Persistent audio players for MP3 playback (ref safe — only used in effects/handlers)
  const playerRef = useRef<AudioPlayer | null>(null);
  const burmesePlayerRef = useRef<AudioPlayer | null>(null);

  const getPlayer = useCallback((): AudioPlayer => {
    if (!playerRef.current) {
      playerRef.current = createAudioPlayer();
    }
    return playerRef.current;
  }, []);

  const getBurmesePlayer = useCallback((): AudioPlayer => {
    if (!burmesePlayerRef.current) {
      burmesePlayerRef.current = createAudioPlayer();
    }
    return burmesePlayerRef.current;
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    cancelTTS();
    playerRef.current?.cancel();
    burmesePlayerRef.current?.cancel();
  }, [cancelTTS]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Main auto-play effect — runs one cycle per card
  useEffect(() => {
    if (!enabled || !isPlaying) return;

    // Closure-local cancellation flag (not shared ref — per CLAUDE.md convention)
    let cancelled = false;

    const wait = (ms: number): Promise<void> =>
      new Promise(resolve => {
        const timer = setTimeout(resolve, ms);
        // Cleanup on cancel: clear the pending timer
        const check = setInterval(() => {
          if (cancelled) {
            clearTimeout(timer);
            clearInterval(check);
            resolve();
          }
        }, 100);
        // Also clean up the interval when timer fires naturally
        setTimeout(() => clearInterval(check), ms + 50);
      });

    /**
     * Try English MP3 first, fall back to browser TTS.
     * Returns true if completed, false if cancelled/failed.
     */
    const playEnglishAudio = async (text: string, audioUrl: string): Promise<boolean> => {
      if (cancelled) return false;

      // Try MP3 first
      try {
        await getPlayer().play(audioUrl);
        return !cancelled;
      } catch {
        if (cancelled) return false;
      }

      // Fall back to browser TTS
      try {
        await speak(text, { lang: 'en-US' });
        return !cancelled;
      } catch {
        return false;
      }
    };

    /**
     * Play Burmese MP3 audio. Non-blocking: failures are silently ignored.
     */
    const playBurmeseAudio = async (audioUrl: string): Promise<void> => {
      if (cancelled || !showBurmese) return;
      try {
        await getBurmesePlayer().play(audioUrl);
      } catch {
        // Burmese audio failure is non-blocking
      }
    };

    const run = async () => {
      // Step 1: Ensure card shows question side
      onFlip(false);

      if (cancelled) return;

      // Brief settling delay
      await wait(300);
      if (cancelled) return;

      // Step 2: Read the question (English)
      const qUrl = getEnglishAudioUrl(questionId, 'q');
      await playEnglishAudio(questionText, qUrl);
      if (cancelled) return;

      // Step 2b: Read the question (Burmese) — bilingual mode
      if (showBurmese) {
        await wait(400); // Brief gap between languages
        if (cancelled) return;
        const qUrlMy = getBurmeseAudioUrl(questionId, 'q');
        await playBurmeseAudio(qUrlMy);
        if (cancelled) return;
      }

      // Step 3: Pause after question
      await wait(questionPause);
      if (cancelled) return;

      // Step 4: Flip to answer
      onFlip(true);
      if (cancelled) return;

      // Brief delay for flip animation
      await wait(500);
      if (cancelled) return;

      // Step 5: Read the answer (English)
      const aUrl = getEnglishAudioUrl(questionId, 'a');
      await playEnglishAudio(answerText, aUrl);
      if (cancelled) return;

      // Step 5b: Read the answer (Burmese) — bilingual mode
      if (showBurmese) {
        await wait(400); // Brief gap between languages
        if (cancelled) return;
        const aUrlMy = getBurmeseAudioUrl(questionId, 'a');
        await playBurmeseAudio(aUrlMy);
        if (cancelled) return;
      }

      // Step 6: Pause after answer
      await wait(answerPause);
      if (cancelled) return;

      // Step 7: Advance or stop at end
      if (currentIndex >= totalCards - 1) {
        // End of deck — stop auto-play
        setIsPlaying(false);
        return;
      }

      // Reset card to question side before advancing
      onFlip(false);
      await wait(200);
      if (cancelled) return;

      onAdvance();
      // Effect re-runs with new currentIndex, continuing the cycle
    };

    run();

    return () => {
      cancelled = true;
      cancelTTS();
      playerRef.current?.cancel();
      burmesePlayerRef.current?.cancel();
    };
    // Re-trigger on index change, bilingual mode change, or play state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isPlaying, currentIndex, showBurmese]);

  return { isPlaying, play, pause, toggle };
}
