# Phase 19: TTS Core Extraction - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

TTS logic lives in a single shared module so all future TTS improvements apply uniformly across test, practice, interview, and study contexts. Consolidate duplicated TTS hooks (`useInterviewTTS.ts` + `useSpeechSynthesis.ts`) into a shared `ttsCore` module and a unified `useTTS()` hook. Delete old hooks. Zero regressions.

**Current state:**
- `src/hooks/useInterviewTTS.ts` (214 lines) — callback-driven, timeout fallback, rate persistence
- `src/lib/useSpeechSynthesis.ts` (126 lines) — fire-and-forget for SpeechButton
- Identical `findVoice` logic, voice constants, utterance creation in both
- 3 consumers: InterviewSession, InterviewResults, SpeechButton

</domain>

<decisions>
## Implementation Decisions

### Core Module API Surface

**Module design:**
- API shape: **Hybrid** — `createTTSEngine()` factory + standalone exported utility functions
- Module style: **Plain functions** (factory function, not class)
- File location: **`src/lib/ttsCore.ts`** (single file)
- Types location: **`src/lib/ttsTypes.ts`** (dedicated types file)
- Voice constants location: **In `ttsTypes.ts`**

**Engine factory — `createTTSEngine(defaults?)`:**
- Returns object with: `speak`, `cancel`, `pause`, `resume`, `setDefaults`, `getVoices`, `refreshVoices`, `isSupported`, `onStateChange`, `destroy`
- Multiple instances allowed (no singleton enforcement)
- Defaults are **mutable** via `engine.setDefaults()`
- `engine.destroy()` method cleans up event listeners and voice cache

**`speak(text, overrides?)` contract:**
- Returns **`Promise<void>`** that resolves when speech completes
- Rejects with **`TTSCancelledError`** (custom Error subclass) when `cancel()` is called
- Rejects with **`TTSUnsupportedError`** (custom Error subclass) when speechSynthesis is unavailable
- **Auto-cancels** previous active speech before starting new speech
- Duration estimation runs on **every speak() call** (always, not opt-in)
- Timeout fallback formula: `(words / 2.5) / rate * 1000 + 3000ms` buffer (keep current)
- Double-fire guard is **internal to ttsCore** — promise resolves exactly once
- **One automatic retry** on non-cancellation failures (500ms delay)
- Chrome 15-second bug: **handled internally, fully transparent** to consumer

**`pause()` and `resume()`:**
- Exposed in Phase 19 API (ready for Phase 22 UI)

**State observability:**
- `engine.onStateChange(cb: (state: TTSState) => void)` returns unsubscribe function
- State shape is **rich**: `{ isSpeaking: boolean; isPaused: boolean; currentText: string | null }`

**Configuration:**
- Accepts **numeric rates only** — named rate mapping lives in provider
- Accepts both named + numeric through `updateSettings()` (provider handles mapping)
- Default language: **`'en-US'`** with per-call `lang` override parameter
- Per-call overrides via `SpeakOptions`: `{ lang?, rate?, pitch?, voice?, onProgress? }`

**Named TypeScript interface:**
- Export `interface TTSEngine { ... }` — factory returns `TTSEngine`
- TTSSettings rate stored as **named** (`'slow' | 'normal' | 'fast'`), provider maps to numeric

**Standalone exports:**
- `findVoice(voices, lang, preferences)` → voice | null
- `estimateDuration(text, rate)` → number
- `loadVoices()` → `Promise<SpeechSynthesisVoice[]>` (standalone, cached)
- `getPreferredVoice(lang?, preferences?)` → voice | null (convenience: loadVoices + findVoice)
- `safeSpeak(engine, text, options?)` → `Promise<'completed' | 'cancelled' | 'error'>` — configurable error swallowing

**`safeSpeak()` helper:**
- **Exported from ttsCore** (public API, not local helper)
- Returns `Promise<'completed' | 'cancelled' | 'error'>` status string
- Error scope: **configurable** — consumer specifies which error types to swallow

### Hook Restructuring

**Hook architecture:**
- **Single `useTTS()` hook** replaces both old hooks
- Located at **`src/hooks/useTTS.ts`** (separate from core)
- Additional **`src/hooks/useTTSSettings.ts`** — lightweight settings-only hook for future Settings page
- Old hooks **deleted entirely** (no deprecated wrappers)

**`useTTS()` return shape (full engine + state):**
```ts
{
  speak: (text: string, overrides?) => Promise<void>
  cancel: () => void
  pause: () => void
  resume: () => void
  isSpeaking: boolean
  isPaused: boolean
  isSupported: boolean
  error: string | null          // reactive error state
  voices: SpeechSynthesisVoice[]
  refreshVoices: () => Promise<void>
  settings: TTSSettings
  updateSettings: (partial: Partial<TTSSettings>) => void
}
```

**Engine ownership:**
- **Shared engine in context** by default — provider creates and owns the engine
- `useTTS({ isolated: true })` creates independent engine that still reads settings from provider
- **Global cancel** — any `speak()` cancels any active speech app-wide (browsers only support single speaker anyway)

**Unmount behavior:**
- **Auto-cancel on unmount** — useTTS cleanup cancels active speech. No manual cleanup needed in consumers.

**Error exposure:**
- Reactive `{ error: string | null }` state in useTTS()
- Error auto-clears on next successful speak()

### Provider (TTSContext)

**File:** `src/contexts/TTSContext.tsx` (matches existing pattern: ThemeContext, LanguageContext, etc.)

**Provider placement:** In `_app.tsx`, **after LanguageProvider, before StateProvider**

**Provider props:** Children only (self-contained, no external configuration)

**Provider creates and owns** the shared engine instance

**Initialization sequence:**
1. Migrate localStorage (old key → new key)
2. Create engine with migrated settings
3. Schedule voice loading (deferred via `requestIdleCallback` with `setTimeout(0)` fallback)

**Render behavior:** Render children **immediately** (optimistic). No loading state. isSupported starts true.

**Settings persistence:**
- Provider handles read/write to localStorage internally
- New unified key: **`'civic-prep-tts-settings'`** storing full `{ rate, pitch, lang, preferredVoice }`
- Migration from old `'civic-prep-speech-rate'` key: **silent** (no console output)
- Migration runs on provider mount (one-time)

**Named rate mapping** lives in provider:
- `'slow'` → 0.7, `'normal'` → 0.98, `'fast'` → 1.3
- Provider accepts **both named + numeric** rates

**Expose `updateSettings()` now** (ready for Phase 22 settings page)

**SSR handling:**
- Provider renders **null engine on server**, creates in useEffect (client-only)
- Buttons always render, **disabled when unsupported** (no layout shift, no hydration mismatch)

**Code splitting:** **Lazy-load provider only** (dynamic import)

### Consumer Migration

**Migration approach:** **Single atomic commit** — core, hooks, provider, migration, tests, animation, old file deletion all in one commit

**Full grep + cleanup** of old hook names/paths across entire codebase

**SpeechButton migration:**
- Uses `useTTS()` hook (not ttsCore directly)
- **Keep all current props** (text, lang, pitch, rate, preferredVoiceName, className) — backward compatible
- Props become per-call overrides passed to `speak()`
- **Add isSpeaking visual feedback** — full animation (sound waves + color shift + pulse + rings)
- **Reflects global engine state** (shows active whenever ANY speech is happening)
- **Full ARIA** attributes: `aria-pressed` toggle, dynamic `aria-label`, `aria-live` region
- **Focus management**: Focus stop button when speaking begins

**SpeechButton animation (ship in Phase 19):**
- Animation tech: **Hybrid** — CSS for simple effects (pulse, color), motion/react for complex (SVG waves, rings)
- Sound wave: **Animated SVG** paths
- Ring animation: **Full combo** — expanding/fading concentric rings + pulsing accent border
- Speaking color: **Dedicated TTS color**, adaptive to light/dark mode (not theme accent)

**InterviewSession migration:**
- 4 phase handlers as **separate functions**: `handleGreeting(text)`, `handleReading(question)`, `handleGrading(answer)`, `handleReplay(question)`
- Handlers receive **explicit parameters** (not reading from component state)
- Handlers defined **inside component** (not extracted to custom hook)
- Triggered by **calling handlers from state setters** (not useEffect watching phase)
- Uses **`safeSpeak()` helper** — `const result = await safeSpeak(engine, text); if (result === 'completed') setPhase('next');`
- **useTTS handles all cleanup** — no manual cancel in InterviewSession cleanup effects

**InterviewResults migration:**
- Uses **shared engine** (not isolated)

### Voice Loading Lifecycle

**Load timing:** **Eager but deferred** (`requestIdleCallback` with `setTimeout(0)` fallback)
**Polling strategy:** **Keep current** — 8 retries x 250ms + voiceschanged event listener
**Cache scope:** **Global module-level** — all engines share same voice list
**No voices behavior:** `isSupported = false`, `speak()` rejects with `TTSUnsupportedError`

**`refreshVoices()`:** Re-query once, **fallback to full poll** if empty result
**voiceschanged listener:** Active **during loading only** — removed after successful load
**`loadVoices()`:** Standalone export (usable without engine)
**Constants:** Not tree-shakeable (not worth optimizing — tiny string arrays)

**`findVoice()` strategy:**
- **Hybrid: known names + heuristic fallback**
- Known quality voice lists: `APPLE_US_VOICES`, `ANDROID_US_VOICES`, `ENHANCED_HINTS`, **`EDGE_VOICES`** (new)
- `preferLocal` option: **configurable** via `findVoice({ preferLocal: true })`
- Firefox fallback: **try any English voice first, then browser default**

### Testing Strategy

**Test infrastructure:** Vitest (already set up with 14 existing test files)

**Scope:** Full unit tests + integration tests — part of atomic commit

**Unit tests:** `src/lib/ttsCore.test.ts` (co-located)
- Cover: core functions + engine lifecycle + error paths (~35-40 test cases)
- Mock: **Manual mock speechSynthesis** object on globalThis
- Mock fidelity: **Async by default** — simulates delayed voiceschanged event
- Chrome 15s bug: **Dedicated test case** verifying chunking workaround
- Test `findVoice`, `estimateDuration`, `loadVoices`, `createTTSEngine` (speak/cancel/pause/resume), `safeSpeak`, error types

**Integration tests:** `src/__tests__/tts.integration.test.tsx`
- Cover: provider setup + consumer component test
- Render SpeechButton inside TTSSettingsProvider, verify speak() plumbing

### Cross-browser Compatibility

**Target browsers:** All mainstream — Chrome, Firefox, Safari, Edge (Chromium), plus mobile variants (Chrome Mobile, Safari iOS, Samsung Internet)

**Workaround strategy:** **Always apply all workarounds** — no user-agent sniffing. Every workaround runs on every browser for safety.

**Autoplay policy (mobile):**
- **Handle internally** in ttsCore
- Queue speak() calls until user gesture
- **Only keep latest** queued call (earlier calls resolve as cancelled)

**Safari cancel() bug:**
- **Workaround internally** — detect failure and force-stop with empty utterance

**iOS Safari inactivity timeout (speech stops after 15-30s idle):**
- **Re-initialize on failure** — auto-retry speak() once after failure

**Android Chrome double-fire:**
- **Already handled** by internal promise guard (resolves exactly once)

**Chrome 15-second speech cutoff:**
- **Handle internally** — chunk by default, pause/resume fallback
- Chunk strategy: **Sentence-aware with ~30 word max** per chunk
- **Fully transparent** to consumer — single speak() call, single promise

**Speech rate normalization:** **No normalization** — pass rate directly to browser

**Edge voices:** Add **`EDGE_VOICES`** constant (Microsoft Zira, David, Mark, Jenny)

### Error Recovery

- **One automatic retry** on non-cancellation speech failures (500ms delay)
- **Device disconnect** → reject promise with error, update error state
- **TTSCancelledError** → swallowed by `safeSpeak()`, consumers use status return
- **TTSUnsupportedError** → explicit rejection, consumer handles

### Performance

- **Code splitting:** Lazy-load provider only via dynamic import
- **Voice constants:** Not worth tree-shaking (tiny arrays)
- ttsCore module is small (~300-400 lines estimated)

### Accessibility

- **Full ARIA** on SpeechButton: `aria-pressed`, dynamic `aria-label` ('Listen'/'Stop'), `aria-live` announcements
- **Focus management:** Focus shifts to stop button when speaking begins
- Buttons always render (disabled if unsupported) — no layout shift on hydration

### Claude's Discretion

- Exact SVG path animation for sound waves
- Specific color values for TTS dedicated color (light/dark variants)
- Internal chunking algorithm implementation details
- Test case specifics and assertion patterns
- Exact ring animation timing and easing curves
- Internal state machine for engine lifecycle
- TypeScript type details beyond the interfaces specified above

</decisions>

<specifics>
## Specific Ideas

- Interview sequencing should use clean async/await: `const result = await safeSpeak(engine, greeting); if (result === 'completed') setPhase('reading');`
- SpeechButton animation should be rich and polished: animated SVG sound waves + concentric expanding/fading rings + pulsing accent border + dedicated TTS color shift — all shipping in Phase 19
- The API should feel like a well-designed library: named TypeScript interfaces, clear error hierarchy, composable primitives alongside convenience functions
- Provider follows existing context patterns exactly (ThemeContext, LanguageContext in `src/contexts/`)

</specifics>

<deferred>
## Deferred Ideas

- Voice selection picker UI — Phase 22 (TTS Quality)
- Speech rate control UI (settings page) — Phase 22
- Animated speaking indicator (beyond SpeechButton) — Phase 22
- Burmese audio support — Phase 22
- TTS error feedback UI ("No voices available" message) — Phase 22
- Pause/resume UI (tap to pause, tap to resume) — Phase 22

</deferred>

---

*Phase: 19-tts-core-extraction*
*Context gathered: 2026-02-14*
