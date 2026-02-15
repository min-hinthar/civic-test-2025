/**
 * TTS Type System
 *
 * All type definitions, error classes, voice constants, and interfaces
 * for the TTS engine. No implementation code -- pure types and constants.
 */

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

/** Thrown when cancel() interrupts active speech. */
export class TTSCancelledError extends Error {
  constructor(message = 'Speech was cancelled') {
    super(message);
    this.name = 'TTSCancelledError';
  }
}

/** Thrown when speechSynthesis is unavailable. */
export class TTSUnsupportedError extends Error {
  constructor(message = 'SpeechSynthesis is not supported') {
    super(message);
    this.name = 'TTSUnsupportedError';
  }
}

// ---------------------------------------------------------------------------
// Voice Constants (all lowercase for case-insensitive matching)
// ---------------------------------------------------------------------------

export const APPLE_US_VOICES = ['samantha', 'siri', 'ava', 'allison', 'alex', 'victoria', 'karen'];

export const ANDROID_US_VOICES = ['google us english', 'google en-us', 'english united states'];

export const EDGE_VOICES = [
  'microsoft zira',
  'microsoft david',
  'microsoft mark',
  'microsoft jenny',
];

export const ENHANCED_HINTS = ['enhanced', 'premium'];

// ---------------------------------------------------------------------------
// Interfaces & Types
// ---------------------------------------------------------------------------

/** Observable TTS engine state. */
export type TTSState = {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string | null;
};

/** Language options for auto-read feature. */
export type AutoReadLang = 'english' | 'burmese' | 'both';

/** Pre-generated Burmese voice options (edge-tts). */
export type BurmeseVoice = 'nilar' | 'thiha';

/** User-facing settings with named rate. */
export type TTSSettings = {
  rate: 'slow' | 'normal' | 'fast';
  pitch: number;
  lang: string;
  preferredVoice: string | null;
  autoRead: boolean;
  autoReadLang: AutoReadLang;
  burmeseVoice: BurmeseVoice;
};

/** Per-call overrides for speak(). */
export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice;
  onProgress?: (event: SpeechSynthesisEvent) => void;
};

/** Defaults provided to createTTSEngine(). */
export type TTSEngineDefaults = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

/** Preferences for findVoice(). */
export type FindVoicePreferences = {
  preferredVoiceName?: string;
  preferLocal?: boolean;
};

/** safeSpeak() options -- extends SpeakOptions with swallow configuration. */
export type SafeSpeakOptions = SpeakOptions & {
  swallow?: Array<'cancelled' | 'unsupported' | 'error'>;
};

/** TTS engine interface returned by createTTSEngine(). */
export interface TTSEngine {
  /** Speak text. Resolves on completion, rejects with typed errors. */
  speak(text: string, overrides?: SpeakOptions): Promise<void>;

  /** Cancel active speech immediately. */
  cancel(): void;

  /** Pause active speech. */
  pause(): void;

  /** Resume paused speech. */
  resume(): void;

  /** Update engine defaults (mutable). */
  setDefaults(defaults: Partial<TTSEngineDefaults>): void;

  /** Return cached voices (synchronous). */
  getVoices(): SpeechSynthesisVoice[];

  /** Clear cache and reload voices from browser. */
  refreshVoices(): Promise<SpeechSynthesisVoice[]>;

  /** Check if SpeechSynthesis API is available. */
  isSupported(): boolean;

  /** Subscribe to state changes. Returns unsubscribe function. */
  onStateChange(cb: (state: TTSState) => void): () => void;

  /** Clean up all intervals, listeners, and active speech. Safe to call multiple times. */
  destroy(): void;
}
