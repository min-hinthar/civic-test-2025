# Phase 19: TTS Core Extraction - Research

**Researched:** 2026-02-14
**Domain:** Web Speech API (SpeechSynthesis) cross-browser abstraction, React context/hook integration
**Confidence:** HIGH

## Summary

The Web Speech API SpeechSynthesis interface is notoriously buggy across browsers. The 15-second Chrome cutoff, Safari cancel() event misfires, Android pause/resume breakage, Firefox cancel-wipes-next-speak, utterance garbage collection, and voice loading timing differences are all well-documented, persistent issues -- many open for 8+ years in browser bug trackers. The decision to build a custom `ttsCore` module (rather than using a library like EasySpeech) is sound because: (a) the app's TTS needs are narrow (English US civic questions, short texts), (b) the existing codebase already handles most quirks, and (c) EasySpeech adds ~5KB for features not needed here.

The critical implementation challenges are: (1) the Chrome 15-second bug workaround (pause/resume cycling vs chunking -- both have tradeoffs), (2) holding strong references to utterances to prevent garbage collection, (3) the Firefox cancel()-then-speak() race condition requiring a setTimeout gap, and (4) Safari firing error events on cancel() instead of end events. All of these have proven workarounds documented below.

**Primary recommendation:** Use the pause/resume cycling approach (every 10-14 seconds) as the primary Chrome long-text defense, with sentence-aware chunking as a secondary fallback. Keep strong utterance references. Add a 100ms delay after cancel() before new speak() calls (Firefox). Treat Safari cancel error events as non-errors.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Core module: `src/lib/ttsCore.ts` with `createTTSEngine()` factory + standalone utilities
- Types: `src/lib/ttsTypes.ts`
- Hook: Single `useTTS()` hook at `src/hooks/useTTS.ts` replacing both old hooks
- Additional `src/hooks/useTTSSettings.ts` for lightweight settings-only access
- Provider: `TTSContext.tsx` in `src/contexts/`
- Provider placement: In `_app.tsx`, after LanguageProvider, before StateProvider
- SpeechButton animation: Hybrid CSS + motion/react (SVG sound waves, expanding rings, pulse)
- Interview migration: `safeSpeak()` helper with async/await sequencing, 4 separate handler functions inside component
- Cross-browser: Chrome 15s bug (sentence-aware chunking), Safari cancel bug, mobile autoplay, Firefox fallback
- Testing: Full unit + integration tests via Vitest
- Single atomic commit for entire migration
- Old hooks deleted entirely (no deprecated wrappers)
- Voice loading: eager but deferred (`requestIdleCallback` with `setTimeout(0)` fallback)
- Polling: 8 retries x 250ms + voiceschanged event listener
- Voice cache: global module-level, shared by all engines
- Named rate mapping: `'slow'` -> 0.7, `'normal'` -> 0.98, `'fast'` -> 1.3
- Settings key: `'civic-prep-tts-settings'`, migration from `'civic-prep-speech-rate'`
- `speak()` returns `Promise<void>`, auto-cancels previous, one automatic retry on failure
- `TTSCancelledError` and `TTSUnsupportedError` custom error subclasses
- `safeSpeak()` returns `Promise<'completed' | 'cancelled' | 'error'>`
- All workarounds always applied (no user-agent sniffing)
- Edge voices: new `EDGE_VOICES` constant (Microsoft Zira, David, Mark, Jenny)

### Claude's Discretion
- Exact SVG path animation for sound waves
- Specific color values for TTS dedicated color (light/dark variants)
- Internal chunking algorithm implementation details
- Test case specifics and assertion patterns
- Exact ring animation timing and easing curves
- Internal state machine for engine lifecycle
- TypeScript type details beyond the interfaces specified above

### Deferred Ideas (OUT OF SCOPE)
- Voice selection picker UI -- Phase 22
- Speech rate control UI (settings page) -- Phase 22
- Animated speaking indicator (beyond SpeechButton) -- Phase 22
- Burmese audio support -- Phase 22
- TTS error feedback UI ("No voices available" message) -- Phase 22
- Pause/resume UI (tap to pause, tap to resume) -- Phase 22
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Speech API (SpeechSynthesis) | Browser built-in | Text-to-speech synthesis | Only browser-native TTS option; no external API needed |
| React | 18.x (existing) | Component framework | Project standard |
| TypeScript | 5.x (existing) | Type safety | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react | Existing in project | SpeechButton SVG animation | Sound wave + ring animation during speaking state |
| Vitest | Existing in project | Unit + integration testing | ttsCore unit tests, provider integration tests |
| @testing-library/react | Existing in project | Component testing | Integration tests for provider + SpeechButton |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom ttsCore | [EasySpeech](https://github.com/leaonline/easy-speech) ~5KB | Handles many browser quirks but adds dependency, less control over promise-based API, no React integration |
| Custom ttsCore | [react-speech-kit](https://github.com/MikeyParton/react-speech-kit) | Provides React hooks but unmaintained (last update 2021), no chunking, no error recovery |
| Custom chunking | [textchunk](https://www.npmjs.com/package/textchunk) | Sentence boundary detection via `sbd` module; overkill for short civic questions (max ~40 words) |

**Installation:** No new dependencies needed. All required libraries already in project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ttsCore.ts          # Engine factory + standalone utilities
│   └── ttsTypes.ts          # Types, interfaces, constants, error classes
├── hooks/
│   ├── useTTS.ts            # Main hook (engine + state + settings)
│   └── useTTSSettings.ts   # Lightweight settings-only hook
├── contexts/
│   └── TTSContext.tsx        # Provider (creates engine, manages settings, context)
└── components/ui/
    └── SpeechButton.tsx      # Migrated to use useTTS()
```

### Pattern 1: Factory + Promise-Based Speak
**What:** `createTTSEngine()` returns an engine object where `speak()` returns a Promise that resolves on completion and rejects on error/cancellation.
**When to use:** Always -- this is the core API.
**Example:**
```typescript
// Source: Architecture decision from CONTEXT.md
const engine = createTTSEngine({ rate: 0.98, lang: 'en-US' });

// Simple usage
await engine.speak("Hello world");

// With overrides
await engine.speak("Question text", { rate: 1.3 });

// Cancellation-safe via safeSpeak
const result = await safeSpeak(engine, "Hello");
if (result === 'completed') {
  // proceed to next step
}
```

### Pattern 2: Strong Utterance Reference
**What:** Keep a module-level or closure-level reference to the current `SpeechSynthesisUtterance` object to prevent garbage collection.
**When to use:** Always -- every speak() call must maintain reference.
**Why critical:** Browsers (especially Chrome) can garbage-collect utterances before they finish speaking, causing `onend` to never fire.
**Example:**
```typescript
// Source: MDN docs + talkrapp.com/speechSynthesis.html
let currentUtterance: SpeechSynthesisUtterance | null = null;

function speak(text: string) {
  // Hold strong reference -- prevents GC
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.onend = () => { /* resolve promise */ };
  currentUtterance.onerror = (e) => { /* reject promise */ };
  speechSynthesis.speak(currentUtterance);
}
```

### Pattern 3: Chrome Pause/Resume Cycling
**What:** Set an interval that calls `speechSynthesis.pause()` then `speechSynthesis.resume()` every ~10-14 seconds during speech to prevent Chrome's 15-second cutoff.
**When to use:** On every speak() call as a defensive measure.
**Why:** Chrome (all platforms except potentially Android) silently stops speaking after ~15 seconds with Google voices. No error events fire. The pause/resume cycle resets the internal timer.
**Critical caveat:** This workaround **completely breaks on Android Chrome** -- pause causes the utterance to end permanently. Must NOT run on Android.
**Example:**
```typescript
// Source: caktusgroup.com/blog/2025/11/03/the-halting-problem/
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

utterance.onstart = () => {
  // Only on desktop Chrome (NOT Android -- pause kills speech there)
  keepAliveInterval = setInterval(() => {
    if (!speechSynthesis.speaking) {
      clearInterval(keepAliveInterval!);
    } else {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 14_000);
};

utterance.onend = () => {
  if (keepAliveInterval) clearInterval(keepAliveInterval);
};
```

### Pattern 4: Sentence-Aware Chunking (Secondary Defense)
**What:** Split long text at sentence boundaries (~30 word max per chunk), chain utterances sequentially via `onend` callbacks.
**When to use:** As a secondary defense for texts that might exceed 15 seconds. Given civic questions are short (typically under 30 words), this is primarily future-proofing.
**Example:**
```typescript
// Source: gist.github.com/woollsta/2d146f13878a301b36d7 (adapted)
function chunkText(text: string, maxWords = 30): string[] {
  // Split on sentence boundaries first
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const combined = current + sentence;
    if (combined.split(/\s+/).length > maxWords && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = combined;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
```

### Pattern 5: Context Provider with Shared Engine
**What:** React context creates and owns a single engine instance. All consumers share it via `useTTS()`.
**When to use:** Default pattern. Matches existing ThemeContext/LanguageContext patterns in the codebase.
**Example:**
```typescript
// Source: Matches existing project patterns (ThemeContext.tsx, LanguageContext.tsx)
const TTSContext = createContext<TTSContextValue | null>(null);

export function TTSProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<TTSEngine | null>(null);
  const [state, setState] = useState<TTSState>(initialState);

  useEffect(() => {
    const eng = createTTSEngine({ rate: getStoredRate() });
    const unsub = eng.onStateChange(setState);
    setEngine(eng);

    // Deferred voice loading
    const ric = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 0);
    ric(() => { loadVoices(); });

    return () => { unsub(); eng.destroy(); };
  }, []);

  return (
    <TTSContext.Provider value={{ engine, state, /* ... */ }}>
      {children}
    </TTSContext.Provider>
  );
}
```

### Anti-Patterns to Avoid
- **Creating new utterance on each render:** Always create utterances inside event handlers or effects, never during render
- **Not holding utterance references:** Leads to garbage collection and `onend` never firing
- **User-agent sniffing for workarounds:** Apply all workarounds universally (the CONTEXT.md decision is correct)... **EXCEPT the pause/resume cycling which genuinely breaks Android** -- this is the one case where platform detection is necessary
- **Reusing SpeechSynthesisUtterance objects:** Firefox Bug 1523920 -- utterances are NOT reusable. Create a new one for each speak() call
- **Calling speak() immediately after cancel():** Firefox Bug 1522074 -- cancel wipes out speak calls following directly after. Need ~100ms delay
- **Setting state in effect bodies:** React Compiler ESLint rule `react-hooks/set-state-in-effect` -- use callbacks/refs to avoid

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG animation | Raw DOM manipulation for wave paths | `motion/react` `<motion.path>` with `pathLength` | motion handles interpolation, performance, reduced-motion, cleanup |
| Sentence boundary detection for chunking | Complex NLP-based sentence splitting | Simple regex: `/[^.!?]+[.!?]+[\s]*/g` with word-count guard | Civic questions are short English text; NLP is overkill |
| Voice quality database | Full voice capability database | Known-name arrays (`APPLE_US_VOICES`, `ANDROID_US_VOICES`, `EDGE_VOICES`) + heuristic fallback | The existing pattern in the codebase works well for en-US |
| Cross-browser voice loading | Custom polling from scratch | Keep existing 8-retry x 250ms pattern + `voiceschanged` event | Already battle-tested in production |

**Key insight:** The scope of this phase is consolidation, not invention. The existing hooks already handle most quirks. The main value-add is: (1) promise-based API, (2) shared engine via context, (3) the Chrome 15s defense, and (4) proper error typing.

## Common Pitfalls

### Pitfall 1: Utterance Garbage Collection
**What goes wrong:** Event handlers (`onend`, `onerror`) never fire because the browser garbage-collects the `SpeechSynthesisUtterance` object before speech completes.
**Why it happens:** If no strong JS reference exists to the utterance, the browser's GC can reclaim it.
**How to avoid:** Store the current utterance in a module-level variable or engine closure. Clear it only after `onend`/`onerror` fires.
**Warning signs:** `onend` callbacks silently never execute; speech completes but promise never resolves.
**Confidence:** HIGH -- documented in MDN, confirmed by multiple production reports.

### Pitfall 2: Firefox cancel()-then-speak() Race Condition
**What goes wrong:** Calling `speechSynthesis.cancel()` followed immediately by `speechSynthesis.speak(newUtterance)` causes the new utterance to also be cancelled.
**Why it happens:** Firefox Bug 1522074 -- cancel() dequeues the current utterance asynchronously on the `end` event, which wipes the newly-queued utterance.
**How to avoid:** Insert a small delay (50-100ms) between `cancel()` and the next `speak()`. Or call `speechSynthesis.resume()` after `cancel()` and `speak()`.
**Warning signs:** New speech never starts after cancelling previous speech.
**Confidence:** HIGH -- confirmed Mozilla bug tracker (Bug 1522074), documented workaround.

### Pitfall 3: Safari cancel() Fires Error Event Instead of End
**What goes wrong:** On Safari 14+, calling `speechSynthesis.cancel()` triggers the `onerror` handler on the current utterance with error type `'interrupted'` or `'canceled'` instead of (or in addition to) `onend`.
**Why it happens:** Safari implementation fires error events for programmatic cancellation.
**How to avoid:** In the error handler, check `event.error === 'canceled' || event.error === 'interrupted'` and treat these as successful cancellation, not errors. Resolve with `TTSCancelledError` (or swallow in `safeSpeak`).
**Warning signs:** Cancel operations being logged as errors; error states being set when user deliberately cancels.
**Confidence:** HIGH -- Apple Developer Forums thread, confirmed in Safari 14+ and Safari 18.3 release notes.

### Pitfall 4: Chrome 15-Second Silent Death
**What goes wrong:** Speech stops after ~15 seconds on Chrome (Windows, Ubuntu, macOS) with Google-provided voices. No `onend` or `onerror` fires. `speechSynthesis.speaking` remains `true`.
**Why it happens:** Long-standing Chromium bug (Issue 679437, filed 2017, still affects latest versions). Affects Google TTS voices specifically.
**How to avoid:** Use pause/resume cycling every 10-14 seconds on desktop. For Android (where pause kills speech), rely on the timeout fallback already in the existing code. The decision to use sentence-aware chunking is a good secondary defense.
**Warning signs:** Speech stops mid-sentence with no events; app appears frozen in speaking state.
**Confidence:** HIGH -- Chromium bug tracker, Caktus Group blog (Nov 2025), PhET project (GitHub), multiple Stack Overflow threads.

### Pitfall 5: Android Chrome Pause/Resume Breaks Speech
**What goes wrong:** Calling `speechSynthesis.pause()` on Android Chrome causes the current utterance to end permanently. `resume()` is a no-op.
**Why it happens:** Android Chrome's TTS implementation does not support pause/resume properly.
**How to avoid:** Do NOT use the pause/resume cycling workaround on Android. Detect mobile Android via `navigator.userAgent` check for `'Android'`. Fall back to the timeout-based completion detection (which the existing `useInterviewTTS` already uses).
**Warning signs:** Speech cuts off early on Android devices.
**Confidence:** HIGH -- MDN browser-compat-data Issue 4500, codersblock.com blog, confirmed by multiple developers.

**IMPORTANT NOTE on "no UA sniffing" decision:** The CONTEXT.md says "no user-agent sniffing -- apply all workarounds on every browser." However, the pause/resume cycling workaround **actively breaks Android Chrome**. This is the one case where platform detection is necessary. Recommendation: Use `navigator.userAgent` check for Android only for the pause/resume cycling. All OTHER workarounds (strong references, timeout fallback, cancel delay, error filtering) should run universally.

### Pitfall 6: Voice Loading Timing Across Browsers
**What goes wrong:** `speechSynthesis.getVoices()` returns empty array on first call in Chrome (voices load asynchronously from Google servers). Firefox returns voices immediately on first domain visit but may return empty on subsequent page loads.
**Why it happens:** Chrome fetches cloud voices asynchronously. Firefox uses system voices with lazy loading.
**How to avoid:** Use both polling (8 retries x 250ms) AND the `voiceschanged` event listener. Safari does NOT support `addEventListener` on `speechSynthesis` for `voiceschanged` -- must use `onvoiceschanged` property instead.
**Warning signs:** Empty voice list; default browser voice used instead of preferred voice.
**Confidence:** HIGH -- MDN docs, confirmed in existing codebase behavior.

### Pitfall 7: Safari voiceschanged addEventListener Unsupported
**What goes wrong:** `speechSynthesis.addEventListener('voiceschanged', handler)` throws or silently fails in Safari.
**Why it happens:** Safari's implementation does not extend EventTarget for SpeechSynthesis.
**How to avoid:** Use `speechSynthesis.onvoiceschanged = handler` instead of `addEventListener`. Or feature-detect: `if ('onvoiceschanged' in speechSynthesis)`.
**Warning signs:** Voice loading fails silently on Safari; only default voice available.
**Confidence:** HIGH -- codersblock.com blog, confirmed by multiple sources.

### Pitfall 8: Android Voice Selection Ignored
**What goes wrong:** Setting `utterance.voice` on Android has no effect. Android uses the system-configured default voice regardless.
**Why it happens:** Android's TTS implementation delegates to the system TTS engine which has its own voice selection.
**How to avoid:** Accept this limitation. The `findVoice()` utility should still run (it won't cause errors) but the selected voice may not be used on Android. Ensure `utterance.lang` is set explicitly as Android Chrome requires it.
**Warning signs:** Voice sounds different on Android than expected from `findVoice()` result.
**Confidence:** HIGH -- talkrapp.com, codersblock.com, confirmed by multiple developers.

### Pitfall 9: Android lang Property Underscore Format
**What goes wrong:** Android returns voice `lang` properties using underscore format (`en_US`) instead of standard BCP 47 hyphens (`en-US`).
**Why it happens:** Android's TTS system uses Java locale format internally.
**How to avoid:** Normalize `voice.lang` by replacing underscores with hyphens before comparison: `voice.lang.replace(/_/g, '-')`.
**Warning signs:** Language matching fails on Android; `findVoice()` returns no match.
**Confidence:** MEDIUM -- talkrapp.com, single source but consistent with known Android locale behavior.

### Pitfall 10: SpeechSynthesisUtterance Not Reusable (Firefox)
**What goes wrong:** Reusing a `SpeechSynthesisUtterance` object (speaking the same utterance twice) fails silently in Firefox.
**Why it happens:** Firefox Bug 1523920 -- internal state of the utterance is not reset after use.
**How to avoid:** Always create a new `SpeechSynthesisUtterance` for each `speak()` call. Never cache and reuse utterance objects.
**Warning signs:** Second speak of same text produces no audio in Firefox.
**Confidence:** HIGH -- Mozilla bug tracker (Bug 1523920).

### Pitfall 11: iOS Soft Mute Switch Silences TTS
**What goes wrong:** On iOS Safari, TTS produces no sound when the physical mute switch is on, even with volume at max.
**Why it happens:** iOS respects the silent mode switch for web audio including SpeechSynthesis.
**How to avoid:** Cannot be worked around in code. This is an OS-level behavior. Ensure `isSupported` still returns `true` (the API IS available, just muted). Note: Chrome on iOS bypasses this limitation.
**Warning signs:** Users on iOS report "TTS not working" when their mute switch is on.
**Confidence:** HIGH -- talkrapp.com, Apple developer forums.

### Pitfall 12: React Strict Mode Double Effect
**What goes wrong:** In development, React 18 Strict Mode runs effects twice. This could create two engines, start speech twice, or register double event listeners.
**Why it happens:** React 18 intentionally remounts components in development to surface cleanup bugs.
**How to avoid:** Ensure proper cleanup in useEffect return function. The engine's `destroy()` method must cancel speech and remove all listeners. The provider's useEffect must clean up the previous engine before creating a new one.
**Warning signs:** Double speech on page load in development mode.
**Confidence:** HIGH -- React 18 documented behavior.

## Code Examples

### Example 1: Sentence-Aware Text Chunking
```typescript
// For civic test questions, most texts are under 30 words.
// This chunker is primarily future-proofing for longer texts.
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/;
const MAX_WORDS_PER_CHUNK = 30;

function chunkForSpeech(text: string): string[] {
  const sentences = text.split(SENTENCE_BOUNDARY).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const combined = current ? `${current} ${sentence}` : sentence;
    const wordCount = combined.split(/\s+/).length;

    if (wordCount > MAX_WORDS_PER_CHUNK && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = combined;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}
```

### Example 2: Promise-Wrapping a SpeechSynthesisUtterance
```typescript
// Core pattern for speak() -> Promise<void>
function speakPromise(
  text: string,
  options: SpeakOptions
): { promise: Promise<void>; utterance: SpeechSynthesisUtterance } {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? 'en-US';
  utterance.rate = options.rate ?? 0.98;
  utterance.pitch = options.pitch ?? 1.02;

  if (options.voice) utterance.voice = options.voice;

  let settled = false; // double-fire guard

  const promise = new Promise<void>((resolve, reject) => {
    utterance.onend = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    utterance.onerror = (event) => {
      if (settled) return;
      settled = true;

      // Safari fires 'canceled'/'interrupted' on cancel() -- not a real error
      if (event.error === 'canceled' || event.error === 'interrupted') {
        reject(new TTSCancelledError());
        return;
      }

      reject(new TTSSpeechError(event.error));
    };
  });

  return { promise, utterance };
}
```

### Example 3: Voice Loading with Cross-Browser Support
```typescript
// Source: MDN docs + existing codebase pattern
const VOICE_LOAD_RETRIES = 8;
const VOICE_LOAD_INTERVAL = 250;

let voiceCache: SpeechSynthesisVoice[] | null = null;

async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voiceCache?.length) return voiceCache;

  const synth = window.speechSynthesis;

  // Try immediate load
  const immediate = synth.getVoices();
  if (immediate.length) {
    voiceCache = immediate;
    return voiceCache;
  }

  // Poll + event listener race
  return new Promise((resolve) => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const done = (voices: SpeechSynthesisVoice[]) => {
      if (timer) clearTimeout(timer);
      // Safari: must use onvoiceschanged, not addEventListener
      synth.onvoiceschanged = null;
      voiceCache = voices;
      resolve(voices);
    };

    // voiceschanged event (use property, NOT addEventListener -- Safari compat)
    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      if (voices.length) done(voices);
    };

    // Polling fallback
    const poll = () => {
      const voices = synth.getVoices();
      if (voices.length) {
        done(voices);
        return;
      }
      attempts++;
      if (attempts < VOICE_LOAD_RETRIES) {
        timer = setTimeout(poll, VOICE_LOAD_INTERVAL);
      } else {
        // Give up -- resolve with empty (isSupported will be set to false)
        done([]);
      }
    };

    poll();
  });
}
```

### Example 4: Timeout Fallback for Unreliable Events
```typescript
// Source: Existing useInterviewTTS.ts pattern (proven in production)
function estimateDuration(text: string, rate: number): number {
  const wordCount = text.split(/\s+/).length;
  return ((wordCount / 2.5) * 1000) / rate + 3000;
}

// Usage inside speak():
const timeout = estimateDuration(text, rate);
const timer = setTimeout(() => {
  if (!settled) {
    settled = true;
    resolve(); // Assume speech completed even though onend didn't fire
  }
}, timeout);

// Clear on actual end/error:
utterance.onend = () => {
  clearTimeout(timer);
  // ... resolve
};
```

### Example 5: SpeechButton SVG Sound Wave Animation
```typescript
// Source: motion.dev/docs/react-svg-animation (adapted)
// Using motion/react for the animated sound wave bars
import { motion } from 'motion/react';

function SoundWaveIcon({ isSpeaking }: { isSpeaking: boolean }) {
  // 3-bar equalizer-style wave
  const bars = [
    { delay: 0, height: { idle: 4, active: 12 } },
    { delay: 0.1, height: { idle: 8, active: 16 } },
    { delay: 0.2, height: { idle: 4, active: 10 } },
  ];

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={2 + i * 5}
          width={3}
          rx={1.5}
          animate={{
            height: isSpeaking ? [bar.height.idle, bar.height.active, bar.height.idle] : bar.height.idle,
            y: isSpeaking ? [8 - bar.height.idle / 2, 8 - bar.height.active / 2, 8 - bar.height.idle / 2] : 8 - bar.height.idle / 2,
          }}
          transition={isSpeaking ? {
            repeat: Infinity,
            duration: 0.6,
            delay: bar.delay,
            ease: 'easeInOut',
          } : { duration: 0.2 }}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
```

### Example 6: safeSpeak Helper Pattern
```typescript
// Source: CONTEXT.md decision -- configurable error swallowing
async function safeSpeak(
  engine: TTSEngine,
  text: string,
  options?: SpeakOptions
): Promise<'completed' | 'cancelled' | 'error'> {
  try {
    await engine.speak(text, options);
    return 'completed';
  } catch (err) {
    if (err instanceof TTSCancelledError) return 'cancelled';
    if (err instanceof TTSUnsupportedError) return 'error';
    return 'error';
  }
}

// Usage in InterviewSession:
const handleGreeting = async (text: string) => {
  const result = await safeSpeak(engine, text);
  if (result === 'completed') {
    setTimeout(() => setQuestionPhase('chime'), 1000);
  }
};
```

### Example 7: requestIdleCallback with Fallback
```typescript
// Source: MDN docs - requestIdleCallback not supported in Safari
// The CONTEXT.md decision is correct: use rIC with setTimeout(0) fallback
const scheduleIdle = typeof requestIdleCallback !== 'undefined'
  ? requestIdleCallback
  : (cb: () => void) => setTimeout(cb, 0);

// In provider initialization:
useEffect(() => {
  const eng = createTTSEngine(defaults);
  // ... setup ...

  scheduleIdle(() => {
    loadVoices().then(voices => {
      // voices available for findVoice()
    });
  });

  return () => eng.destroy();
}, []);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Avoid Google voices entirely | Pause/resume cycling every 14s | ~2023-2025 | Can use higher-quality Google voices on Chrome |
| Single long utterance | Sentence-aware chunking | ~2020+ | Prevents 15s cutoff; enables progress tracking |
| onvoiceschanged event only | Polling + onvoiceschanged + onvoiceschanged property (not addEventListener) | Ongoing | Handles Safari + Firefox + Chrome voice loading |
| navigator.userAgent for all workarounds | Universal workarounds (except Android pause/resume) | Best practice | Simpler code, future-proof |
| Callback-based TTS hooks | Promise-based with async/await | Current trend | Cleaner sequencing, better error handling |
| Library per hook | Shared engine via context | React patterns | Single source of truth, shared state |

**Deprecated/outdated:**
- **Chrome M71+ autoplay restriction**: Not new, but still enforced. `speak()` requires user activation. This is already handled by the fact that all TTS in this app is triggered by user clicks (button press, interview start).
- **Safari `addEventListener` for voiceschanged**: Use `.onvoiceschanged` property instead. This is a persistent Safari limitation, not deprecated per se.

## Open Questions

1. **Pause/resume cycling vs chunking as primary Chrome defense**
   - What we know: Pause/resume is simpler and proven (Caktus Group Nov 2025). Chunking is more robust but creates micro-gaps between sentences.
   - What's unclear: Whether Chrome has partially fixed the 15s bug in versions 130+. The PhET project reported the issue resolved in Chrome 100+, but Caktus Group still hit it in 2025.
   - Recommendation: Use **both** -- pause/resume cycling as primary (cheap, transparent), chunking as secondary for texts over ~40 words. For this app's civic questions (typically under 30 words), the pause/resume alone should suffice. The timeout fallback in the existing code serves as the ultimate safety net.

2. **Android platform detection necessity**
   - What we know: The CONTEXT.md says "no user-agent sniffing." But pause/resume cycling genuinely breaks Android Chrome.
   - What's unclear: Whether there's a feature-detection approach that avoids UA sniffing. Testing `speechSynthesis.pause()` behavior isn't reliable because it "works" (just ends speech instead of pausing).
   - Recommendation: Add a narrow `navigator.userAgent` check for `'Android'` ONLY for the pause/resume cycling workaround. Document this as an exception to the no-sniffing rule. All other workarounds run universally.

3. **Chrome 130 SpeechSynthesis regression**
   - What we know: Reports of SpeechSynthesis instability in Chrome 130 (Oct 2024). Separate from the 15s bug -- appears to be a general instability issue.
   - What's unclear: Whether this is fixed in current Chrome versions (134+). The issue may have been a transient regression.
   - Recommendation: The one-automatic-retry on failure (already decided) handles this gracefully. No special workaround needed.

4. **Safari getVoices() returning empty**
   - What we know: Some reports of Safari returning zero voices from `getVoices()`. Possibly related to first-load or extension conflicts.
   - What's unclear: How common this is in current Safari versions (18.x).
   - Recommendation: The existing polling + fallback pattern handles this. If no voices load after 8 retries, `isSupported = false` and buttons disable gracefully. The CONTEXT.md decision is correct.

## SpeechSynthesisErrorEvent.error Values Reference

For the error handler implementation, these are the defined error codes (from MDN):

| Error Code | Meaning | How to Handle |
|------------|---------|---------------|
| `canceled` | cancel() removed utterance before it started | Treat as TTSCancelledError |
| `interrupted` | cancel() stopped utterance mid-speech | Treat as TTSCancelledError |
| `audio-busy` | Audio output device in use | Retry once after 500ms |
| `audio-hardware` | No audio output device found | Set isSupported = false |
| `network` | Network communication failed | Retry once after 500ms |
| `synthesis-unavailable` | No synthesis engine available | Set isSupported = false |
| `synthesis-failed` | Synthesis engine error | Retry once after 500ms |
| `language-unavailable` | No voice for requested language | Fall back to any English voice |
| `voice-unavailable` | Specified voice not available | Fall back to findVoice() result |
| `text-too-long` | Text exceeds synthesis limit | Chunk and retry |
| `invalid-argument` | Bad rate/pitch/volume value | Clamp to safe ranges (0.1-2) |
| `not-allowed` | No user activation | Queue until next user gesture |

## Sources

### Primary (HIGH confidence)
- [MDN Web Docs - SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) -- API reference, methods, properties
- [MDN Web Docs - SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) -- Events, error codes
- [MDN Web Docs - SpeechSynthesisErrorEvent.error](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error) -- Complete error code list
- [MDN Web Docs - SpeechSynthesis.cancel()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel) -- Cancel behavior spec
- [MDN Web Docs - voiceschanged event](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event) -- Voice loading event
- [Motion docs - SVG Animation](https://motion.dev/docs/react-svg-animation) -- SVG path animation patterns
- [Chromium Issue 679437](https://bugs.chromium.org/p/chromium/issues/detail?id=679437) -- 15-second speech stop bug
- [Chromium Issue 41294170](https://issues.chromium.org/issues/41294170) -- Speech stops abruptly
- [Mozilla Bug 1522074](https://bugzilla.mozilla.org/show_bug.cgi?id=1522074) -- cancel wipes out subsequent speak calls
- [Mozilla Bug 1523920](https://bugzilla.mozilla.org/show_bug.cgi?id=1523920) -- Utterances not reusable

### Secondary (MEDIUM confidence)
- [Caktus Group - The Halting Problem (Nov 2025)](https://www.caktusgroup.com/blog/2025/11/03/the-halting-problem/) -- Pause/resume workaround for Chrome 15s bug
- [Coder's Block - JavaScript TTS Quirks](https://codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/) -- Comprehensive cross-browser quirk catalog
- [Lessons Learned Using speechSynthesis API (talkrapp.com)](https://talkrapp.com/speechSynthesis.html) -- Production experience, Android quirks, iOS quirks
- [PhET utterance-queue Issue #60](https://github.com/phetsims/utterance-queue/issues/60) -- Chrome time limit investigation
- [EasySpeech (GitHub)](https://github.com/leaonline/easy-speech) -- Cross-browser TTS library reference
- [Chrome Speech Synthesis Chunking Gist (woollsta)](https://gist.github.com/woollsta/2d146f13878a301b36d7) -- Text chunking implementation
- [MDN browser-compat-data Issue #4500](https://github.com/mdn/browser-compat-data/issues/4500) -- Pause/resume Android compat
- [Web Speech Recommended Voices (GitHub)](https://github.com/HadrienGardeur/web-speech-recommended-voices) -- Voice quality database

### Tertiary (LOW confidence)
- [WebOutLoud - Speech Synthesis in Safari](https://weboutloud.io/bulletin/speech_synthesis_in_safari/) -- Safari-specific issues (extension context, may differ from web)
- [Apple Developer Forums Thread 660405](https://developer.apple.com/forums/thread/660405) -- Safari cancel error event
- [Chrome 130 instability reports](https://support.google.com/chrome/a/thread/303329396) -- Transient regression, unclear if still relevant

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new libraries needed; all browser-native APIs well-documented
- Architecture: HIGH -- Factory + context pattern well-established in React ecosystem and existing codebase
- Pitfalls: HIGH -- 12 pitfalls identified, all from multiple verified sources (browser bug trackers, MDN, production blogs)
- Chrome 15s workaround: MEDIUM -- Pause/resume works per Caktus Group (Nov 2025), but PhET reported fix in Chrome 100+; reality is likely version/voice/OS dependent
- Animation: MEDIUM -- motion/react SVG animation well-documented, but exact sound wave design is discretionary

**Research date:** 2026-02-14
**Valid until:** 2026-04-14 (60 days -- SpeechSynthesis bugs are long-lived; browser workarounds change slowly)
