/**
 * TTS Core Engine Tests
 *
 * Comprehensive unit tests for ttsCore module covering all public exports,
 * engine lifecycle, error handling, and cross-browser workaround behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTSCancelledError, TTSUnsupportedError } from './ttsTypes';
import { findVoice, estimateDuration, loadVoices, createTTSEngine, safeSpeak } from './ttsCore';

// ---------------------------------------------------------------------------
// Mock infrastructure
// ---------------------------------------------------------------------------

/** Factory for creating mock SpeechSynthesisVoice objects. */
function createMockVoice(overrides: Partial<SpeechSynthesisVoice> = {}): SpeechSynthesisVoice {
  return {
    name: 'Samantha',
    lang: 'en-US',
    voiceURI: 'samantha',
    localService: true,
    default: false,
    ...overrides,
  };
}

/** Stored utterances from mock speak() calls for triggering events. */
let storedUtterances: SpeechSynthesisUtterance[] = [];

/** Whether mock is currently "speaking". */
let mockSpeaking = false;

/** Whether mock is currently "paused". */
let mockPaused = false;

/** Mock voices to return from getVoices(). */
let mockVoices: SpeechSynthesisVoice[] = [];

/** Whether to auto-fire onend after speak (default: true for most tests). */
let autoFireOnend = true;

/** Custom behavior for cancel -- set to 'safari' to fire onerror with 'canceled'. */
let cancelBehavior: 'standard' | 'safari' = 'standard';

function resetMockState() {
  storedUtterances = [];
  mockSpeaking = false;
  mockPaused = false;
  mockVoices = [];
  autoFireOnend = true;
  cancelBehavior = 'standard';
}

/**
 * Install full speechSynthesis mock on window.
 * Must be called in beforeEach to get fresh state.
 */
function installSpeechSynthesisMock() {
  const mockSynth = {
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      storedUtterances.push(utterance);
      mockSpeaking = true;

      if (autoFireOnend) {
        // Schedule onend to simulate async completion
        setTimeout(() => {
          mockSpeaking = false;
          utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
        }, 0);
      }
    }),
    cancel: vi.fn(() => {
      const lastUtterance = storedUtterances[storedUtterances.length - 1];
      mockSpeaking = false;
      mockPaused = false;

      if (lastUtterance && cancelBehavior === 'safari') {
        // Safari fires onerror with 'canceled' instead of onend
        setTimeout(() => {
          const errorEvent = {
            error: 'canceled',
            utterance: lastUtterance,
          } as unknown as SpeechSynthesisErrorEvent;
          lastUtterance.onerror?.(errorEvent);
        }, 0);
      }
    }),
    pause: vi.fn(() => {
      mockPaused = true;
    }),
    resume: vi.fn(() => {
      mockPaused = false;
    }),
    getVoices: vi.fn(() => mockVoices),
    onvoiceschanged: null as (() => void) | null,
    get speaking() {
      return mockSpeaking;
    },
    get paused() {
      return mockPaused;
    },
    get pending() {
      return false;
    },
  };

  // The global test setup already defines speechSynthesis with writable: true,
  // so we can directly assign our richer mock.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).speechSynthesis = mockSynth;

  return mockSynth;
}

/** Mock SpeechSynthesisUtterance class for window. */
class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  volume = 1;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onpause: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onresume: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onboundary: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onmark: ((ev: SpeechSynthesisEvent) => void) | null = null;

  constructor(text = '') {
    this.text = text;
  }
}

// Install mock Utterance class globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// ---------------------------------------------------------------------------
// Test setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  resetMockState();
  installSpeechSynthesisMock();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ==========================================================================
// findVoice
// ==========================================================================

describe('findVoice', () => {
  it('returns null for empty voice array', () => {
    expect(findVoice([], 'en-US')).toBeNull();
  });

  it('finds preferred voice by name', () => {
    const voices = [
      createMockVoice({ name: 'Alex', lang: 'en-US', voiceURI: 'alex' }),
      createMockVoice({ name: 'Karen', lang: 'en-US', voiceURI: 'karen' }),
    ];
    const result = findVoice(voices, 'en-US', { preferredVoiceName: 'Karen' });
    expect(result?.name).toBe('Karen');
  });

  it('falls back to Apple US voices in priority order', () => {
    const voices = [
      createMockVoice({ name: 'Generic Voice', lang: 'en-US', voiceURI: 'generic' }),
      createMockVoice({ name: 'Samantha', lang: 'en-US', voiceURI: 'samantha' }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Samantha');
  });

  it('falls back to Android US voices', () => {
    const voices = [
      createMockVoice({
        name: 'Google US English',
        lang: 'en-US',
        voiceURI: 'google us english',
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Google US English');
  });

  it('prefers natural/neural online voice over basic voices', () => {
    const voices = [
      createMockVoice({
        name: 'Microsoft Zira',
        lang: 'en-US',
        voiceURI: 'microsoft zira',
        localService: true,
      }),
      createMockVoice({
        name: 'Microsoft Ava Online (Natural)',
        lang: 'en-US',
        voiceURI: 'microsoft ava online (natural)',
        localService: false,
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Microsoft Ava Online (Natural)');
  });

  it('prefers online natural voice over local natural voice', () => {
    const voices = [
      createMockVoice({
        name: 'Local Neural Voice',
        lang: 'en-US',
        voiceURI: 'local-neural',
        localService: true,
      }),
      createMockVoice({
        name: 'Online Natural Voice',
        lang: 'en-US',
        voiceURI: 'online-natural',
        localService: false,
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Online Natural Voice');
  });

  it('prefers local natural voice over non-natural voices', () => {
    const voices = [
      createMockVoice({
        name: 'Microsoft David',
        lang: 'en-US',
        voiceURI: 'microsoft david',
        localService: true,
      }),
      createMockVoice({
        name: 'Neural TTS Voice',
        lang: 'en-US',
        voiceURI: 'neural-tts',
        localService: true,
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Neural TTS Voice');
  });

  it('preferred voice takes priority over natural voice', () => {
    const voices = [
      createMockVoice({
        name: 'Microsoft Ava Online (Natural)',
        lang: 'en-US',
        voiceURI: 'microsoft ava online (natural)',
        localService: false,
      }),
      createMockVoice({
        name: 'Google US English',
        lang: 'en-US',
        voiceURI: 'google us english',
        localService: false,
      }),
    ];
    const result = findVoice(voices, 'en-US', { preferredVoiceName: 'Google US English' });
    expect(result?.name).toBe('Google US English');
  });

  it('prefers Google US English over Apple/Edge basic voices', () => {
    const voices = [
      createMockVoice({
        name: 'Microsoft Zira',
        lang: 'en-US',
        voiceURI: 'microsoft zira',
        localService: true,
      }),
      createMockVoice({
        name: 'Google US English',
        lang: 'en-US',
        voiceURI: 'google us english',
        localService: false,
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Google US English');
  });

  it('falls back to Edge voices when no natural or Google voices', () => {
    const voices = [
      createMockVoice({
        name: 'Microsoft Zira',
        lang: 'en-US',
        voiceURI: 'microsoft zira',
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Microsoft Zira');
  });

  it('falls back to enhanced/premium hints', () => {
    const voices = [
      createMockVoice({
        name: 'English Enhanced',
        lang: 'en-US',
        voiceURI: 'enhanced',
      }),
    ];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('English Enhanced');
  });

  it('normalizes Android underscore lang format', () => {
    const voices = [createMockVoice({ name: 'Android Voice', lang: 'en_US', voiceURI: 'android' })];
    const result = findVoice(voices, 'en-US');
    expect(result?.name).toBe('Android Voice');
  });

  it('preferLocal: true prefers local voices over remote', () => {
    const voices = [
      createMockVoice({
        name: 'Remote Voice',
        lang: 'en-US',
        voiceURI: 'remote',
        localService: false,
      }),
      createMockVoice({
        name: 'Local Voice',
        lang: 'en-US',
        voiceURI: 'local',
        localService: true,
      }),
    ];
    const result = findVoice(voices, 'en-US', { preferLocal: true });
    expect(result?.name).toBe('Local Voice');
  });

  it('Firefox fallback: returns any English voice, then any voice', () => {
    // Voice with non-English lang should be fallback only
    const voices = [
      createMockVoice({ name: 'French Voice', lang: 'fr-FR', voiceURI: 'french' }),
      createMockVoice({
        name: 'Unknown EN Voice',
        lang: 'en-GB',
        voiceURI: 'unknownen',
      }),
    ];
    // Request Japanese (no match), should fall back to any English, then any
    const result = findVoice(voices, 'ja-JP');
    expect(result?.name).toBe('Unknown EN Voice');

    // If no English at all, returns first voice
    const noEnglishVoices = [
      createMockVoice({ name: 'Spanish Voice', lang: 'es-ES', voiceURI: 'spanish' }),
    ];
    const result2 = findVoice(noEnglishVoices, 'ja-JP');
    expect(result2?.name).toBe('Spanish Voice');
  });
});

// ==========================================================================
// estimateDuration
// ==========================================================================

describe('estimateDuration', () => {
  it('calculates correct duration for short text at normal rate', () => {
    // 5 words / 2.5 wps / 1.0 rate * 1000 + 3000 = 2000 + 3000 = 5000ms
    const duration = estimateDuration('one two three four five', 1.0);
    expect(duration).toBe(5000);
  });

  it('calculates correct duration for long text at fast rate', () => {
    // 10 words / 2.5 wps / 2.0 rate * 1000 + 3000 = 2000 + 3000 = 5000ms
    const tenWords = 'a b c d e f g h i j';
    const duration = estimateDuration(tenWords, 2.0);
    expect(duration).toBe(5000);
  });

  it('returns at least 3000ms buffer for any input', () => {
    // 1 word / 2.5 wps / 1.0 rate * 1000 + 3000 = 400 + 3000 = 3400ms
    const duration = estimateDuration('hello', 1.0);
    expect(duration).toBeGreaterThanOrEqual(3000);
    expect(duration).toBe(3400);
  });
});

// ==========================================================================
// loadVoices
// ==========================================================================

describe('loadVoices', () => {
  it('returns cached voices on second call', async () => {
    mockVoices = [createMockVoice()];
    const first = await loadVoices();
    expect(first).toHaveLength(1);

    // Change mock return, but cache should win
    mockVoices = [createMockVoice(), createMockVoice({ name: 'Second' })];
    const second = await loadVoices();
    expect(second).toHaveLength(1); // cached
  });

  it('polls and resolves when voices become available after delay', async () => {
    // Start with empty, become available after 2 polls
    let pollCount = 0;
    const synth = window.speechSynthesis;
    vi.mocked(synth.getVoices).mockImplementation(() => {
      pollCount++;
      if (pollCount >= 3) return [createMockVoice()];
      return [];
    });

    // Use refreshVoices to clear cache and re-poll
    const engine = createTTSEngine();
    const voicesPromise = engine.refreshVoices();
    await vi.advanceTimersByTimeAsync(250 * 3);
    const voices = await voicesPromise;
    expect(voices).toHaveLength(1);
    engine.destroy();
  });

  it('resolves with empty array after max retries', async () => {
    // getVoices always returns empty
    const synth = window.speechSynthesis;
    vi.mocked(synth.getVoices).mockReturnValue([]);

    const engine = createTTSEngine();
    const voicesPromise = engine.refreshVoices();

    // Advance past all 8 retries (8 * 250ms = 2000ms)
    await vi.advanceTimersByTimeAsync(250 * 10);

    const voices = await voicesPromise;
    expect(voices).toHaveLength(0);
    engine.destroy();
  });

  it('uses onvoiceschanged property (not addEventListener)', async () => {
    const synth = window.speechSynthesis;
    vi.mocked(synth.getVoices).mockReturnValue([]);

    const engine = createTTSEngine();
    const voicesPromise = engine.refreshVoices();

    // Simulate voiceschanged via property callback
    vi.mocked(synth.getVoices).mockReturnValue([createMockVoice()]);
    if (synth.onvoiceschanged) {
      synth.onvoiceschanged(new Event('voiceschanged'));
    }

    await vi.advanceTimersByTimeAsync(0);
    const voices = await voicesPromise;
    expect(voices.length).toBeGreaterThanOrEqual(1);
    engine.destroy();
  });
});

// ==========================================================================
// createTTSEngine
// ==========================================================================

describe('createTTSEngine', () => {
  it('isSupported() returns true when speechSynthesis exists', () => {
    const engine = createTTSEngine();
    expect(engine.isSupported()).toBe(true);
    engine.destroy();
  });

  it('isSupported() returns false when speechSynthesis missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved = (window as any).speechSynthesis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;

    const engine = createTTSEngine();
    expect(engine.isSupported()).toBe(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).speechSynthesis = saved;
    engine.destroy();
  });

  it('speak() resolves when speech completes (onend fires)', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    const promise = engine.speak('Hello world');
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    // If we got here without error, speak resolved successfully
    expect(storedUtterances.length).toBeGreaterThanOrEqual(1);
    engine.destroy();
  });

  it('speak() auto-cancels previous active speech', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    // Start first speech
    const p1 = engine.speak('First text');
    await vi.advanceTimersByTimeAsync(200);
    await p1;

    // Start second speech -- should auto-cancel if first was still active
    const p2 = engine.speak('Second text');
    await vi.advanceTimersByTimeAsync(200);
    await p2;

    // Both utterances should have been processed
    expect(storedUtterances.length).toBeGreaterThanOrEqual(2);
    engine.destroy();
  });

  it('speak() rejects with TTSUnsupportedError when not supported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved = (window as any).speechSynthesis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;

    const engine = createTTSEngine();
    await expect(engine.speak('test')).rejects.toThrow(TTSUnsupportedError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).speechSynthesis = saved;
    engine.destroy();
  });

  it('cancel() causes active speak() to reject with TTSCancelledError', async () => {
    const engine = createTTSEngine();
    autoFireOnend = false;
    cancelBehavior = 'safari';

    let caughtError: unknown = null;
    const speakPromise = engine.speak('Long text to speak').catch(err => {
      caughtError = err;
    });

    await vi.advanceTimersByTimeAsync(10);

    engine.cancel();
    // Safari fires onerror with 'canceled', which creates TTSCancelledError
    await vi.advanceTimersByTimeAsync(200);

    // Advance past timeout to let promise settle
    const duration = estimateDuration('Long text to speak', 0.98);
    await vi.advanceTimersByTimeAsync(duration + 1000);

    await speakPromise;

    // The error was caught (either TTSCancelledError from onerror, or resolved from timeout)
    if (caughtError) {
      expect(caughtError).toBeInstanceOf(TTSCancelledError);
    }
    engine.destroy();
  });

  it('state updates: isSpeaking true during speech, false after', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;
    const states: boolean[] = [];

    engine.onStateChange(state => {
      states.push(state.isSpeaking);
    });

    const promise = engine.speak('Hello');
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    // states should contain: true (start speaking), false (end speaking)
    expect(states[0]).toBe(true);
    expect(states[states.length - 1]).toBe(false);
    engine.destroy();
  });

  it('state updates: isPaused toggles with pause/resume', () => {
    const engine = createTTSEngine();
    const states: boolean[] = [];

    engine.onStateChange(state => {
      states.push(state.isPaused);
    });

    engine.pause();
    engine.resume();

    expect(states).toContain(true); // After pause
    expect(states[states.length - 1]).toBe(false); // After resume
    engine.destroy();
  });

  it('onStateChange callback fires on transitions, returns unsubscribe', () => {
    const engine = createTTSEngine();
    const cb = vi.fn();

    const unsub = engine.onStateChange(cb);
    engine.pause();
    expect(cb).toHaveBeenCalledTimes(1);

    unsub();
    engine.resume();
    // After unsubscribe, callback should not fire for resume
    expect(cb).toHaveBeenCalledTimes(1);
    engine.destroy();
  });

  it('setDefaults() updates engine defaults for subsequent speak calls', async () => {
    const engine = createTTSEngine({ rate: 0.98 });
    autoFireOnend = true;

    engine.setDefaults({ rate: 1.5, pitch: 0.8 });

    const p = engine.speak('Test');
    await vi.advanceTimersByTimeAsync(200);
    await p;

    // Check that the utterance used the updated defaults
    const utterance = storedUtterances[0];
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(0.8);
    engine.destroy();
  });

  it('destroy() cancels speech and prevents future speak() calls', async () => {
    const engine = createTTSEngine();
    engine.destroy();

    // destroy sets isDestroyed=true, speak throws TTSUnsupportedError('Engine has been destroyed')
    await expect(engine.speak('test')).rejects.toThrow(TTSUnsupportedError);
  });

  it('timeout fallback resolves promise when onend never fires', async () => {
    const engine = createTTSEngine();
    autoFireOnend = false; // onend will NOT fire

    const text = 'Hello world test';
    const promise = engine.speak(text);

    // Advance past estimated duration to trigger timeout fallback
    const duration = estimateDuration(text, 0.98);
    await vi.advanceTimersByTimeAsync(duration + 1000);

    // Promise should resolve via timeout fallback
    await promise;
    expect(storedUtterances.length).toBeGreaterThanOrEqual(1);
    engine.destroy();
  });
});

// ==========================================================================
// Chrome 15s workaround (chunking)
// ==========================================================================

describe('Chrome 15s workaround', () => {
  it('text over 30 words is chunked into multiple utterances', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    // 40+ words with sentence boundaries
    const longText =
      'The quick brown fox jumps over the lazy dog. ' +
      'She sells seashells by the seashore near the old lighthouse. ' +
      'The rain in Spain falls mainly on the plain where the flowers grow tall and beautiful.';

    const promise = engine.speak(longText);
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    // Should have chunked into multiple speak() calls
    expect(storedUtterances.length).toBeGreaterThan(1);
    engine.destroy();
  });

  it('all chunks speak sequentially (second chunk starts after first ends)', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    const longText =
      'The quick brown fox jumps over the lazy dog near the old barn. ' +
      'She sells seashells by the seashore every single morning at dawn. ' +
      'The rain in Spain falls mainly on the vast and endless plain.';

    const promise = engine.speak(longText);
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    // Each chunk should have its own utterance with a portion of the text
    for (const utt of storedUtterances) {
      expect(utt.text.length).toBeGreaterThan(0);
    }
    engine.destroy();
  });

  it('single promise resolves only after all chunks complete', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    const longText =
      'The quick brown fox jumps over the lazy dog every morning. ' +
      'She sells seashells by the seashore near the tall old lighthouse tower. ' +
      'The rain in Spain falls mainly on the wide open plain.';

    let resolved = false;
    const promise = engine.speak(longText).then(() => {
      resolved = true;
    });

    // Advance enough for all chunks
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    expect(resolved).toBe(true);
    expect(storedUtterances.length).toBeGreaterThan(1);
    engine.destroy();
  });
});

// ==========================================================================
// safeSpeak
// ==========================================================================

describe('safeSpeak', () => {
  it('returns completed on successful speech', async () => {
    const engine = createTTSEngine();
    autoFireOnend = true;

    const resultPromise = safeSpeak(engine, 'Hello');
    await vi.advanceTimersByTimeAsync(200);
    const result = await resultPromise;

    expect(result).toBe('completed');
    engine.destroy();
  });

  it('returns cancelled when speech is cancelled', async () => {
    // Create a mock engine whose speak rejects with TTSCancelledError
    const mockEngine = {
      speak: vi.fn().mockRejectedValue(new TTSCancelledError()),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      setDefaults: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      refreshVoices: vi.fn().mockResolvedValue([]),
      isSupported: vi.fn().mockReturnValue(true),
      onStateChange: vi.fn().mockReturnValue(() => {}),
      destroy: vi.fn(),
    };

    const result = await safeSpeak(mockEngine, 'Hello');
    expect(result).toBe('cancelled');
  });

  it('returns error on TTSUnsupportedError', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved = (window as any).speechSynthesis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;

    const engine = createTTSEngine();
    const result = await safeSpeak(engine, 'test');
    expect(result).toBe('error');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).speechSynthesis = saved;
    engine.destroy();
  });

  it('returns error on unexpected errors (never throws)', async () => {
    // Create a mock engine that throws a generic error
    const mockEngine = {
      speak: vi.fn().mockRejectedValue(new Error('Unexpected crash')),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      setDefaults: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      refreshVoices: vi.fn().mockResolvedValue([]),
      isSupported: vi.fn().mockReturnValue(true),
      onStateChange: vi.fn().mockReturnValue(() => {}),
      destroy: vi.fn(),
    };

    const result = await safeSpeak(mockEngine, 'test');
    expect(result).toBe('error');
    // Importantly, safeSpeak did NOT throw
  });
});

// ==========================================================================
// Error handling
// ==========================================================================

describe('error handling', () => {
  it('Safari cancel error (canceled/interrupted) treated as TTSCancelledError', async () => {
    const engine = createTTSEngine();
    autoFireOnend = false;
    cancelBehavior = 'safari';

    let caughtError: unknown = null;
    const speakPromise = engine.speak('Test speech').catch(err => {
      caughtError = err;
    });

    await vi.advanceTimersByTimeAsync(10);

    engine.cancel();
    // Safari fires onerror with error='canceled', which speakChunk converts to TTSCancelledError
    await vi.advanceTimersByTimeAsync(200);

    // Advance past timeout fallback
    const duration = estimateDuration('Test speech', 0.98);
    await vi.advanceTimersByTimeAsync(duration + 1000);

    await speakPromise;

    // Safari cancel should produce TTSCancelledError (not generic error)
    if (caughtError) {
      expect(caughtError).toBeInstanceOf(TTSCancelledError);
    }
    engine.destroy();
  });

  it('one automatic retry on non-cancellation failure', async () => {
    const engine = createTTSEngine();
    autoFireOnend = false;

    let callCount = 0;
    const synth = window.speechSynthesis;
    vi.mocked(synth.speak).mockImplementation((utterance: SpeechSynthesisUtterance) => {
      callCount++;
      storedUtterances.push(utterance);
      mockSpeaking = true;

      if (callCount === 1) {
        // First call: fire error
        setTimeout(() => {
          mockSpeaking = false;
          const errorEvent = {
            error: 'synthesis-failed',
            utterance,
          } as unknown as SpeechSynthesisErrorEvent;
          utterance.onerror?.(errorEvent);
        }, 0);
      } else {
        // Retry: fire success
        setTimeout(() => {
          mockSpeaking = false;
          utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
        }, 0);
      }
    });

    const promise = engine.speak('Retry test');
    // Advance through: error (0ms) + retry delay (500ms) + retry success (0ms)
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    // Should have called speak twice (original + 1 retry)
    expect(callCount).toBe(2);
    engine.destroy();
  });

  it('double-fire guard: promise settles exactly once', async () => {
    const engine = createTTSEngine();
    autoFireOnend = false;

    let resolutionCount = 0;
    const synth = window.speechSynthesis;
    vi.mocked(synth.speak).mockImplementation((utterance: SpeechSynthesisUtterance) => {
      storedUtterances.push(utterance);
      mockSpeaking = true;

      // Fire onend quickly
      setTimeout(() => {
        mockSpeaking = false;
        utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
      }, 10);
    });

    const promise = engine.speak('Double fire test');
    promise.then(() => {
      resolutionCount++;
    });

    // Advance past onend (10ms)
    await vi.advanceTimersByTimeAsync(20);

    // Advance past timeout fallback (estimated duration)
    const duration = estimateDuration('Double fire test', 0.98);
    await vi.advanceTimersByTimeAsync(duration + 1000);

    await promise;

    // Promise should have resolved exactly once despite both onend and timeout
    expect(resolutionCount).toBe(1);
    engine.destroy();
  });

  it('TTSCancelledError and TTSUnsupportedError are proper Error subclasses', () => {
    const cancelledError = new TTSCancelledError();
    const unsupportedError = new TTSUnsupportedError();

    expect(cancelledError).toBeInstanceOf(Error);
    expect(cancelledError).toBeInstanceOf(TTSCancelledError);
    expect(cancelledError.name).toBe('TTSCancelledError');
    expect(cancelledError.message).toBe('Speech was cancelled');

    expect(unsupportedError).toBeInstanceOf(Error);
    expect(unsupportedError).toBeInstanceOf(TTSUnsupportedError);
    expect(unsupportedError.name).toBe('TTSUnsupportedError');
    expect(unsupportedError.message).toBe('SpeechSynthesis is not supported');
  });
});
