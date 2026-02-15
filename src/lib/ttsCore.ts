/**
 * TTS Core Engine
 *
 * Factory function + standalone utilities for cross-browser text-to-speech.
 * Handles all known browser quirks (Chrome 15s cutoff, Safari cancel errors,
 * Firefox cancel race condition, utterance GC, Android pause breakage).
 *
 * @see ttsTypes.ts for all type definitions and constants
 */

import type {
  FindVoicePreferences,
  SafeSpeakOptions,
  SpeakOptions,
  TTSEngine,
  TTSEngineDefaults,
  TTSState,
} from './ttsTypes';
import {
  ANDROID_US_VOICES,
  APPLE_US_VOICES,
  EDGE_VOICES,
  ENHANCED_HINTS,
  TTSCancelledError,
  TTSUnsupportedError,
} from './ttsTypes';

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** Global voice cache shared by all engines. */
let voiceCache: SpeechSynthesisVoice[] | null = null;

/** Strong reference to prevent utterance GC (Pitfall 1). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: holds strong ref to prevent browser GC
let currentUtterance: SpeechSynthesisUtterance | null = null;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VOICE_LOAD_RETRIES = 8;
const VOICE_LOAD_INTERVAL = 250;
const CANCEL_DELAY_MS = 100; // Firefox cancel race condition (Pitfall 2)
const KEEP_ALIVE_INTERVAL_MS = 14_000; // Chrome 15s defense (Pitfall 4)
const RETRY_DELAY_MS = 500;
const MAX_WORDS_PER_CHUNK = 30;
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Check if running on Android (only used for pause/resume skip -- Pitfall 5). */
export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

/**
 * Split text into sentence-aware chunks for Chrome 15s defense.
 * If text is under maxWords or has no sentence boundaries, returns [text].
 */
function chunkForSpeech(text: string, maxWords = MAX_WORDS_PER_CHUNK): string[] {
  const wordCount = text.split(/\s+/).length;
  if (wordCount <= maxWords) return [text];

  const sentences = text.split(SENTENCE_BOUNDARY).filter(Boolean);
  if (sentences.length <= 1) return [text];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const combined = current ? `${current} ${sentence}` : sentence;
    const combinedWords = combined.split(/\s+/).length;

    if (combinedWords > maxWords && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = combined;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

/** Wait for a specified number of milliseconds. */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Standalone exports
// ---------------------------------------------------------------------------

/**
 * Load available voices from the browser.
 *
 * Returns cached voices or polls (8 retries x 250ms) + onvoiceschanged
 * property (NOT addEventListener -- Safari compat, Pitfall 7).
 * Resolves with empty array if no voices found.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voiceCache && voiceCache.length > 0) return Promise.resolve(voiceCache);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const synth = window.speechSynthesis;

  // Try immediate load
  const immediate = synth.getVoices();
  if (immediate.length > 0) {
    voiceCache = immediate;
    return Promise.resolve(voiceCache);
  }

  // Poll + onvoiceschanged race
  return new Promise(resolve => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    const done = (voices: SpeechSynthesisVoice[]) => {
      if (resolved) return;
      resolved = true;
      if (timer) clearTimeout(timer);
      // Safari: must use onvoiceschanged property, not addEventListener (Pitfall 7)
      synth.onvoiceschanged = null;
      voiceCache = voices;
      resolve(voices);
    };

    // voiceschanged event via property (Safari compat)
    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) done(voices);
    };

    // Polling fallback
    const poll = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        done(voices);
        return;
      }
      attempts++;
      if (attempts < VOICE_LOAD_RETRIES) {
        timer = setTimeout(poll, VOICE_LOAD_INTERVAL);
      } else {
        // Give up -- resolve with empty
        done([]);
      }
    };

    poll();
  });
}

/**
 * Find the best voice for a given language.
 *
 * Search order: preferred name > Apple voices > Android voices > Edge voices >
 * enhanced hints > local service (if preferLocal) > first lang match > any voice.
 * Normalizes voice.lang underscores to hyphens (Android locale format, Pitfall 9).
 */
export function findVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferences?: FindVoicePreferences
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const normalizedLang = lang.toLowerCase().replace(/_/g, '-');

  // Normalize voice.lang underscores to hyphens for Android (Pitfall 9)
  const matchesLang = voices.filter(voice => {
    const voiceLang = voice.lang?.toLowerCase().replace(/_/g, '-') ?? '';
    return voiceLang.startsWith(normalizedLang);
  });

  const matchesHint = (voice: SpeechSynthesisVoice, hint: string) =>
    voice.name.toLowerCase().includes(hint) || voice.voiceURI.toLowerCase().includes(hint);

  // (a) Preferred voice name match
  if (preferences?.preferredVoiceName) {
    const preferred = matchesLang.find(voice =>
      matchesHint(voice, preferences.preferredVoiceName!.toLowerCase())
    );
    if (preferred) return preferred;
  }

  // (b) Apple voices
  for (const name of APPLE_US_VOICES) {
    const match = matchesLang.find(voice => matchesHint(voice, name));
    if (match) return match;
  }

  // (c) Android voices
  for (const name of ANDROID_US_VOICES) {
    const match = matchesLang.find(voice => matchesHint(voice, name));
    if (match) return match;
  }

  // (d) Edge voices
  for (const name of EDGE_VOICES) {
    const match = matchesLang.find(voice => matchesHint(voice, name));
    if (match) return match;
  }

  // (e) Enhanced hints
  const enhanced = matchesLang.find(voice => ENHANCED_HINTS.some(hint => matchesHint(voice, hint)));
  if (enhanced) return enhanced;

  // (f) Prefer local voices if requested
  if (preferences?.preferLocal) {
    const local = matchesLang.find(voice => voice.localService);
    if (local) return local;
  }

  // (g) First lang match
  if (matchesLang.length > 0) return matchesLang[0];

  // Firefox fallback: try any English voice first, then first available
  const anyEnglish = voices.find(voice => {
    const voiceLang = voice.lang?.toLowerCase().replace(/_/g, '-') ?? '';
    return voiceLang.startsWith('en');
  });
  if (anyEnglish) return anyEnglish;

  // (h) Any voice
  return voices[0] ?? null;
}

/**
 * Estimate speech duration for timeout fallback.
 * Formula: (words / 2.5 words per second) / rate * 1000 + 3000ms buffer
 */
export function estimateDuration(text: string, rate: number): number {
  const wordCount = text.split(/\s+/).length;
  return (wordCount / 2.5 / rate) * 1000 + 3000;
}

/**
 * Convenience: load voices then find the best one.
 */
export async function getPreferredVoice(
  lang = 'en-US',
  preferences?: FindVoicePreferences
): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  return findVoice(voices, lang, preferences);
}

/**
 * Safe speak wrapper -- never throws.
 *
 * Wraps engine.speak() in try/catch. Returns status string.
 * The `swallow` option controls which error types are silently handled
 * (default: all -- never throws regardless of error type).
 */
export async function safeSpeak(
  engine: TTSEngine,
  text: string,
  options?: SafeSpeakOptions
): Promise<'completed' | 'cancelled' | 'error'> {
  try {
    // Separate swallow config from speak options
    let speakOptions: SpeakOptions | undefined;
    if (options) {
      const { swallow, ...rest } = options;
      // swallow is reserved for future per-type error handling
      void swallow;
      speakOptions = rest;
    }
    await engine.speak(text, speakOptions);
    return 'completed';
  } catch (err) {
    if (err instanceof TTSCancelledError) return 'cancelled';
    return 'error';
  }
}

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

/**
 * Create a new TTS engine instance.
 *
 * Uses closure-based factory (not class). Multiple instances allowed.
 * All cross-browser workarounds run universally except pause/resume
 * cycling which skips Android (Pitfall 5).
 */
export function createTTSEngine(defaults?: TTSEngineDefaults): TTSEngine {
  // Internal mutable state
  let isSpeaking = false;
  let isPaused = false;
  let currentText: string | null = null;
  let isDestroyed = false;
  let cancelRequested = false;

  // Mutable defaults
  let engineDefaults: TTSEngineDefaults = {
    lang: defaults?.lang ?? 'en-US',
    rate: defaults?.rate ?? 0.98,
    pitch: defaults?.pitch ?? 1.02,
  };

  // State change subscribers
  const subscribers = new Set<(state: TTSState) => void>();

  // Active timers/intervals for cleanup
  let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  let timeoutFallback: ReturnType<typeof setTimeout> | null = null;

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  function getState(): TTSState {
    return { isSpeaking, isPaused, currentText };
  }

  function notifySubscribers() {
    const state = getState();
    subscribers.forEach(cb => cb(state));
  }

  function clearTimers() {
    if (keepAliveInterval !== null) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    if (timeoutFallback !== null) {
      clearTimeout(timeoutFallback);
      timeoutFallback = null;
    }
  }

  function updateState(speaking: boolean, paused: boolean, text: string | null) {
    isSpeaking = speaking;
    isPaused = paused;
    currentText = text;
    notifySubscribers();
  }

  /**
   * Speak a single chunk as a Promise.
   * Sets up utterance events, timeout fallback, keep-alive interval.
   */
  function speakChunk(
    text: string,
    overrides: SpeakOptions | undefined,
    isRetry: boolean
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new TTSUnsupportedError());
        return;
      }

      if (cancelRequested || isDestroyed) {
        reject(new TTSCancelledError());
        return;
      }

      const synth = window.speechSynthesis;

      // Create NEW utterance for each speak (never reuse -- Pitfall 10)
      const utterance = new SpeechSynthesisUtterance(text);

      // Determine voice
      const voice =
        overrides?.voice ??
        findVoice(voiceCache ?? [], overrides?.lang ?? engineDefaults.lang ?? 'en-US');
      if (voice) utterance.voice = voice;

      // Apply settings: overrides > defaults
      utterance.lang = overrides?.lang ?? engineDefaults.lang ?? 'en-US';
      utterance.rate = overrides?.rate ?? engineDefaults.rate ?? 0.98;
      utterance.pitch = overrides?.pitch ?? engineDefaults.pitch ?? 1.02;

      // Strong reference to prevent GC (Pitfall 1)
      currentUtterance = utterance;

      // Double-fire guard (Pitfall 4 -- Chrome/Android can fire onend twice)
      let settled = false;

      const settle = (outcome: 'resolve' | 'reject', error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimers();
        if (outcome === 'resolve') {
          resolve();
        } else {
          reject(error);
        }
      };

      // Progress callback
      if (overrides?.onProgress) {
        utterance.onboundary = overrides.onProgress;
      }

      utterance.onend = () => {
        settle('resolve');
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        // Safari fires 'canceled'/'interrupted' on cancel() (Pitfall 3)
        if (event.error === 'canceled' || event.error === 'interrupted') {
          settle('reject', new TTSCancelledError());
          return;
        }

        // One automatic retry on non-cancellation failures
        if (!isRetry && !cancelRequested && !isDestroyed) {
          settled = true; // prevent further handling on this utterance
          clearTimers();
          wait(RETRY_DELAY_MS)
            .then(() => speakChunk(text, overrides, true))
            .then(resolve, reject);
          return;
        }

        settle('reject', new Error(`Speech synthesis error: ${event.error}`));
      };

      // Timeout fallback -- resolve if onend never fires (Pitfall 4)
      const duration = estimateDuration(text, utterance.rate);
      timeoutFallback = setTimeout(() => {
        settle('resolve');
      }, duration);

      // Chrome 15s keep-alive: pause/resume cycling, but NOT on Android (Pitfall 5)
      if (!isAndroid()) {
        keepAliveInterval = setInterval(() => {
          if (!synth.speaking) {
            if (keepAliveInterval !== null) {
              clearInterval(keepAliveInterval);
              keepAliveInterval = null;
            }
          } else {
            synth.pause();
            synth.resume();
          }
        }, KEEP_ALIVE_INTERVAL_MS);
      }

      synth.speak(utterance);
    });
  }

  // ---------------------------------------------------------------------------
  // Engine methods
  // ---------------------------------------------------------------------------

  async function speak(text: string, overrides?: SpeakOptions): Promise<void> {
    if (isDestroyed) {
      throw new TTSUnsupportedError('Engine has been destroyed');
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      throw new TTSUnsupportedError();
    }

    // Auto-cancel previous speech
    cancelRequested = false;
    clearTimers();

    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      // Firefox needs delay after cancel (Pitfall 2)
      await wait(CANCEL_DELAY_MS);
    }

    if (cancelRequested || isDestroyed) {
      throw new TTSCancelledError();
    }

    // Chunk text for Chrome 15s defense (Pitfall 4)
    const chunks = chunkForSpeech(text);

    updateState(true, false, text);

    try {
      // Chain chunks sequentially
      for (const chunk of chunks) {
        if (cancelRequested || isDestroyed) {
          throw new TTSCancelledError();
        }
        await speakChunk(chunk, overrides, false);
      }
      updateState(false, false, null);
    } catch (err) {
      updateState(false, false, null);
      throw err;
    }
  }

  function cancel(): void {
    cancelRequested = true;
    clearTimers();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    updateState(false, false, null);
  }

  function pause(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      isPaused = true;
      notifySubscribers();
    }
  }

  function resume(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      isPaused = false;
      notifySubscribers();
    }
  }

  function setDefaults(partial: Partial<TTSEngineDefaults>): void {
    engineDefaults = { ...engineDefaults, ...partial };
  }

  function getVoices(): SpeechSynthesisVoice[] {
    return voiceCache ?? [];
  }

  async function refreshVoices(): Promise<SpeechSynthesisVoice[]> {
    voiceCache = null;
    return loadVoices();
  }

  function isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  function onStateChange(cb: (state: TTSState) => void): () => void {
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }

  function destroy(): void {
    if (isDestroyed) return;
    isDestroyed = true;
    cancel();
    subscribers.clear();
    currentUtterance = null;
  }

  return {
    speak,
    cancel,
    pause,
    resume,
    setDefaults,
    getVoices,
    refreshVoices,
    isSupported,
    onStateChange,
    destroy,
  };
}
