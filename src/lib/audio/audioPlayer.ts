/**
 * Generic Audio Player
 *
 * HTMLAudioElement-based playback for pre-generated MP3 files.
 * Provides play/pause/resume/cancel with state subscription following
 * the same subscriber pattern as ttsCore.ts.
 *
 * Supports both English (Ava) and Burmese (Nilar) pre-generated audio.
 *
 * Mobile autoplay: Uses persistent Audio elements + unlockAudioSession()
 * to bypass mobile autoplay restrictions. Call unlockAudioSession() from
 * a user gesture handler before any audio needs to play.
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
// Mobile Autoplay Unlock
// ---------------------------------------------------------------------------

/**
 * Pool of HTMLAudioElements pre-unlocked from a user gesture.
 * Elements are consumed by createAudioPlayer() in FIFO order.
 */
const _unlockedPool: HTMLAudioElement[] = [];

/** Cached blob URL for a minimal silent WAV file. */
let _silenceUrl: string | null = null;

function getSilenceUrl(): string {
  if (_silenceUrl) return _silenceUrl;

  // Minimal WAV: 44-byte header + 2 bytes of silence (1 sample, 16-bit mono, 44100 Hz)
  const buf = new ArrayBuffer(46);
  const v = new DataView(buf);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  v.setUint32(4, 38, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true); // fmt chunk size
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, 44100, true); // sample rate
  v.setUint32(28, 88200, true); // byte rate
  v.setUint16(32, 2, true); // block align
  v.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  v.setUint32(40, 2, true); // data size
  v.setInt16(44, 0, true); // one silent sample

  _silenceUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  return _silenceUrl;
}

/**
 * Unlock audio playback on mobile browsers.
 *
 * Must be called from a user gesture handler (click/tap) BEFORE any audio
 * needs to play. Pre-creates Audio elements that bypass autoplay restrictions
 * and unlocks the Web Audio API context.
 *
 * Call once per interview session (e.g., on "Start Interview" button click).
 */
export function unlockAudioSession(): void {
  // Pre-create 3 Audio elements (English, Burmese, Interview) and play silence
  // to "bless" them with user gesture context. createAudioPlayer() will consume
  // these from the pool instead of creating new (restricted) elements.
  const silenceUrl = getSilenceUrl();
  for (let i = 0; i < 3; i++) {
    const el = new Audio();
    el.src = silenceUrl;
    el.volume = 0.01;
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = 1;
      })
      .catch(() => {
        el.volume = 1;
      });
    _unlockedPool.push(el);
  }

  // Also unlock AudioContext (belt-and-suspenders for Chrome MEI scoring)
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      if (ctx.state === 'suspended') void ctx.resume();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  } catch {
    // AudioContext unlock failed — non-critical
  }
}

// ---------------------------------------------------------------------------
// Player Factory
// ---------------------------------------------------------------------------

/** Fixed ceiling if metadata never loads (covers longest interview clips). */
const MAX_FALLBACK_MS = 30_000;
/** Buffer added to known duration to account for playback jitter. */
const TIMEOUT_BUFFER_MS = 3_000;

/**
 * Create an audio player wrapping a persistent HTMLAudioElement.
 *
 * Uses a single Audio element per player instance (reused across plays by
 * changing src) rather than creating new elements. This allows mobile
 * browsers to reuse the "gesture-blessed" element from unlockAudioSession().
 *
 * - play() sets src on the persistent element, resolves on ended
 * - Retries once on load error before rejecting
 * - Timeout fallback auto-resolves if `ended` event never fires (browser quirk safety net)
 * - State subscription via Set<callback> (same pattern as ttsCore.ts)
 */
export function createAudioPlayer(): AudioPlayer {
  // Consume a pre-unlocked element from the pool, or create a new one
  const el: HTMLAudioElement | null =
    _unlockedPool.shift() ?? (typeof window !== 'undefined' ? new Audio() : null);

  let state: AudioPlayerState = { isSpeaking: false, isPaused: false, currentFile: null };
  let cancelledFlag = false; // Prevents retry after explicit cancel()
  let playId = 0; // Monotonic counter to invalidate stale callbacks
  let activeReject: ((reason: Error) => void) | null = null;
  const listeners = new Set<StateCallback>();

  function notify() {
    const snapshot = { ...state };
    listeners.forEach(cb => cb(snapshot));
  }

  function resetState() {
    state = { isSpeaking: false, isPaused: false, currentFile: null };
    notify();
  }

  function stopPlayback() {
    if (el) {
      el.pause();
      el.onended = null;
      el.onerror = null;
      el.onloadedmetadata = null;
    }
  }

  function attemptPlay(url: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!el) return reject(new Error('No audio element'));

      const thisPlayId = ++playId;
      activeReject = reject;

      // Clear any leftover handlers from previous play
      el.onended = null;
      el.onerror = null;
      el.onloadedmetadata = null;

      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

      function startFallbackTimer(ms: number) {
        if (fallbackTimer !== null) clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(() => {
          if (playId !== thisPlayId) return;
          cleanup();
          resetState();
          resolve();
        }, ms);
      }

      function cleanup() {
        if (fallbackTimer !== null) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        if (el) {
          el.onended = null;
          el.onerror = null;
          el.onloadedmetadata = null;
        }
        if (activeReject === reject) activeReject = null;
      }

      el.onended = () => {
        if (playId !== thisPlayId) return;
        cleanup();
        resetState();
        resolve();
      };

      el.onerror = () => {
        if (playId !== thisPlayId) return;
        cleanup();
        reject(new Error('Audio load failed'));
      };

      el.onloadedmetadata = () => {
        if (playId !== thisPlayId) return;
        if (el!.duration && isFinite(el!.duration)) {
          const durationMs = (el!.duration / (rate || 1)) * 1000 + TIMEOUT_BUFFER_MS;
          startFallbackTimer(durationMs);
        }
      };

      // Set source and play (reusing persistent element)
      el.src = url;
      el.playbackRate = rate;

      // Start with fixed ceiling — tightened to real duration once metadata arrives
      startFallbackTimer(MAX_FALLBACK_MS);

      el.play().catch(err => {
        if (playId !== thisPlayId) return;
        cleanup();
        reject(err);
      });
    });
  }

  return {
    async play(url: string, rate = 1): Promise<void> {
      // Cancel any existing playback
      stopPlayback();
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
          stopPlayback();
          state = { isSpeaking: true, isPaused: false, currentFile: url };
          notify();

          await attemptPlay(url, rate);
        } catch {
          if (cancelledFlag) {
            resetState();
            return;
          }
          resetState();
          throw new Error('Audio unavailable');
        }
      }
    },

    pause() {
      if (el && state.isSpeaking && !state.isPaused) {
        el.pause();
        state = { ...state, isPaused: true };
        notify();
      }
    },

    resume() {
      if (el && state.isPaused) {
        void el.play();
        state = { ...state, isPaused: false };
        notify();
      }
    },

    cancel() {
      cancelledFlag = true;
      playId++; // Invalidate any pending callbacks
      stopPlayback();
      // Reject any pending attemptPlay promise so callers don't hang
      if (activeReject) {
        activeReject(new Error('Cancelled'));
        activeReject = null;
      }
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
