/**
 * Generic Audio Player
 *
 * HTMLAudioElement-based playback for pre-generated MP3 files.
 * Provides play/pause/resume/cancel with state subscription following
 * the same subscriber pattern as ttsCore.ts.
 *
 * Supports both English (Ava) and Burmese (Nilar) pre-generated audio.
 */

// ---------------------------------------------------------------------------
// Audio URL Helpers
// ---------------------------------------------------------------------------

export type AudioType = 'q' | 'a' | 'e'; // question, answer, explanation

/**
 * Build the URL path for a pre-generated English audio file.
 *
 * @param questionId - e.g. "GOV-P01"
 * @param type - 'q' (question), 'a' (answer), 'e' (explanation)
 * @returns URL path like "/audio/en-US/ava/GOV-P01-q.mp3"
 */
export function getEnglishAudioUrl(questionId: string, type: AudioType): string {
  return `/audio/en-US/ava/${questionId}-${type}.mp3`;
}

/**
 * Build the URL path for a pre-generated Burmese audio file.
 *
 * @param questionId - e.g. "GOV-P01"
 * @param type - 'q' (question), 'a' (answer), 'e' (explanation)
 * @returns URL path like "/audio/my-MM/female/GOV-P01-q.mp3"
 */
export function getBurmeseAudioUrl(questionId: string, type: AudioType): string {
  return `/audio/my-MM/female/${questionId}-${type}.mp3`;
}

/**
 * Build the URL path for a pre-generated interview audio file.
 *
 * @param name - e.g. "greeting-01", "pass-announce", "correct-prefix"
 * @returns URL path like "/audio/en-US/ava/interview/greeting-01.mp3"
 */
export function getInterviewAudioUrl(name: string): string {
  return `/audio/en-US/ava/interview/${name}.mp3`;
}

// ---------------------------------------------------------------------------
// Player State
// ---------------------------------------------------------------------------

export type AudioPlayerState = {
  isSpeaking: boolean;
  isPaused: boolean;
  currentFile: string | null;
};

type StateCallback = (state: AudioPlayerState) => void;

// ---------------------------------------------------------------------------
// Player Interface
// ---------------------------------------------------------------------------

export interface AudioPlayer {
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
  getState(): AudioPlayerState;
}

// ---------------------------------------------------------------------------
// Player Factory
// ---------------------------------------------------------------------------

/** Fixed ceiling if metadata never loads (covers longest interview clips). */
const MAX_FALLBACK_MS = 30_000;
/** Buffer added to known duration to account for playback jitter. */
const TIMEOUT_BUFFER_MS = 3_000;

/**
 * Create an audio player wrapping HTMLAudioElement.
 *
 * - play() creates a new Audio element each time, sets playbackRate, resolves on ended
 * - Retries once on load error before rejecting
 * - Timeout fallback auto-resolves if `ended` event never fires (browser quirk safety net)
 * - State subscription via Set<callback> (same pattern as ttsCore.ts)
 */
export function createAudioPlayer(): AudioPlayer {
  let audio: HTMLAudioElement | null = null;
  let state: AudioPlayerState = { isSpeaking: false, isPaused: false, currentFile: null };
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

      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

      function startFallbackTimer(ms: number) {
        if (fallbackTimer !== null) clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(() => {
          cleanup();
          resetState();
          resolve();
        }, ms);
      }

      const onEnded = () => {
        cleanup();
        resetState();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Audio load failed'));
      };

      // When metadata loads, tighten the fallback to actual duration + buffer
      const onMetadata = () => {
        if (el.duration && isFinite(el.duration)) {
          const durationMs = (el.duration / (rate || 1)) * 1000 + TIMEOUT_BUFFER_MS;
          startFallbackTimer(durationMs);
        }
      };

      function cleanup() {
        if (fallbackTimer !== null) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        el.removeEventListener('loadedmetadata', onMetadata);
      }

      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);
      el.addEventListener('loadedmetadata', onMetadata);

      // Start with fixed ceiling — tightened to real duration once metadata arrives
      startFallbackTimer(MAX_FALLBACK_MS);

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
          throw new Error('Audio unavailable');
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

    getState(): AudioPlayerState {
      return { ...state };
    },
  };
}
