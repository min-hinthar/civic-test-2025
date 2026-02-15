/**
 * Burmese Audio Adapter
 *
 * HTMLAudioElement-based playback for pre-generated Burmese MP3 files.
 * Provides play/pause/resume/cancel with state subscription following
 * the same subscriber pattern as ttsCore.ts.
 *
 * Audio files are generated via edge-tts and served from /audio/my-MM/.
 */

import type { BurmeseVoice } from '@/lib/ttsTypes';

// ---------------------------------------------------------------------------
// URL Helper
// ---------------------------------------------------------------------------

export type AudioType = 'q' | 'a' | 'e'; // question, answer, explanation

/**
 * Build the URL path for a pre-generated Burmese audio file.
 *
 * @param questionId - e.g. "GOV-P01"
 * @param type - 'q' (question), 'a' (answer), 'e' (explanation)
 * @param voice - 'nilar' (female) or 'thiha' (male)
 * @returns URL path like "/audio/my-MM/female/GOV-P01-q.mp3"
 */
export function getBurmeseAudioUrl(
  questionId: string,
  type: AudioType,
  voice: BurmeseVoice = 'nilar'
): string {
  const gender = voice === 'nilar' ? 'female' : 'male';
  return `/audio/my-MM/${gender}/${questionId}-${type}.mp3`;
}

// ---------------------------------------------------------------------------
// Player State
// ---------------------------------------------------------------------------

export type BurmesePlayerState = {
  isSpeaking: boolean;
  isPaused: boolean;
  currentFile: string | null;
};

type StateCallback = (state: BurmesePlayerState) => void;

// ---------------------------------------------------------------------------
// Player Factory
// ---------------------------------------------------------------------------

export interface BurmesePlayer {
  /** Play audio from URL. Cancels any active playback first. Resolves on ended, rejects on error. */
  play(url: string, rate?: number): Promise<void>;
  /** Pause the current audio. */
  pause(): void;
  /** Resume paused audio. */
  resume(): void;
  /** Cancel playback, reset state. */
  cancel(): void;
  /** Subscribe to state changes. Returns unsubscribe function. */
  onStateChange(cb: StateCallback): () => void;
  /** Get current state snapshot. */
  getState(): BurmesePlayerState;
}

/**
 * Create a Burmese audio player wrapping HTMLAudioElement.
 *
 * - play() creates a new Audio element each time, sets playbackRate, resolves on ended
 * - Retries once on load error before rejecting
 * - State subscription via Set<callback> (same pattern as ttsCore.ts)
 */
export function createBurmesePlayer(): BurmesePlayer {
  let audio: HTMLAudioElement | null = null;
  let state: BurmesePlayerState = { isSpeaking: false, isPaused: false, currentFile: null };
  let cancelledFlag = false; // Prevents retry after explicit cancel()
  const listeners = new Set<StateCallback>();

  function notify() {
    const snapshot = { ...state };
    listeners.forEach(cb => cb(snapshot));
  }

  function resetState() {
    state = { isSpeaking: false, isPaused: false, currentFile: null };
    notify();
  }

  function cleanupAudio() {
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load(); // Reset the element
      audio = null;
    }
  }

  function attemptPlay(url: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const el = new Audio(url);
      el.playbackRate = rate;
      audio = el;

      const onEnded = () => {
        cleanup();
        resetState();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Audio load failed'));
      };

      function cleanup() {
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
      }

      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);

      el.play().catch(onError);
    });
  }

  return {
    async play(url: string, rate = 1): Promise<void> {
      // Cancel any existing playback
      cleanupAudio();
      cancelledFlag = false; // Reset on new play

      // Update state to speaking
      state = { isSpeaking: true, isPaused: false, currentFile: url };
      notify();

      try {
        await attemptPlay(url, rate);
      } catch {
        // Don't retry if explicitly cancelled — prevents zombie playback
        if (cancelledFlag) {
          resetState();
          return;
        }
        // Retry once on load/network failure
        try {
          cleanupAudio();
          state = { isSpeaking: true, isPaused: false, currentFile: url };
          notify();

          await attemptPlay(url, rate);
        } catch {
          resetState();
          throw new Error('Burmese audio unavailable');
        }
      }
    },

    pause() {
      if (audio && state.isSpeaking && !state.isPaused) {
        audio.pause();
        state = { ...state, isPaused: true };
        notify();
      }
    },

    resume() {
      if (audio && state.isPaused) {
        void audio.play();
        state = { ...state, isPaused: false };
        notify();
      }
    },

    cancel() {
      cancelledFlag = true;
      cleanupAudio();
      resetState();
    },

    onStateChange(cb: StateCallback): () => void {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },

    getState(): BurmesePlayerState {
      return { ...state };
    },
  };
}
