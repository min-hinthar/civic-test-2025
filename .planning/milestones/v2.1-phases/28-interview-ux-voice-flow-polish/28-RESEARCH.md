# Phase 28: Interview UX & Voice Flow Polish - Research

**Researched:** 2026-02-18
**Domain:** Browser audio pre-caching, mobile UX patterns, speech input fallback, Screen Orientation API
**Confidence:** HIGH

## Summary

Phase 28 polishes the existing interview simulation (built in Phase 21, enhanced in Phases 22/26) with four pillars: audio pre-caching for reliability, Real/Practice mode visual differentiation, text input fallback with keyword grading, and mobile/error edge case handling. The existing codebase already has all foundational pieces: `audioPlayer.ts` with play/pause/cancel, `interviewGreetings.ts` with audio filename mappings, `answerGrader.ts` with keyword matching, and interview audio files in `public/audio/en-US/ava/interview/`. The work is primarily wiring new capabilities into existing components and adding error handling.

**Primary recommendation:** Build an audio pre-cache module that fetches all interview audio URLs into the browser Cache API during the countdown, then modify `audioPlayer.ts` to check cache before network. All other features (text input, mode differentiation, mobile edge cases) layer on top of existing patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Voice Flow Reliability
- Pre-cache ALL audio before interview starts: questions (20), greetings, closing statements, and feedback phrases
- Pre-cache includes both English and Burmese MP3s when user is in bilingual mode
- All examiner speech is pre-generated MP3 (questions, greetings, closings, AND feedback phrases like "Correct!"/"That's not quite right...")
- Show "Loading audio..." progress bar during the 5-4-3-2-1 countdown -- interview only starts when all audio is cached
- If pre-caching partially fails (network issues), start with whatever was cached; for uncached audio, fall back to browser TTS on the fly
- Subtle badge/icon indicates when browser TTS fallback is being used instead of pre-cached MP3
- Keep random greeting pool (current behavior) -- varied greetings feel more natural
- Keep MAX_REPLAYS = 2 per question (matches USCIS interview reality)
- Keep current voice speed behavior: Real mode = fixed normal speed, Practice mode = respects user's speed setting
- Single examiner voice (Ava) -- no male/female option
- Keep English-first then Burmese audio order in Practice bilingual mode

#### Real vs Practice Mode UX
- Same dark interview aesthetic for both modes; small 'REAL' or 'PRACTICE' badge in corner indicates mode
- Practice mode reads correct answer aloud (pre-generated audio) after grading -- helps auditory learners
- Practice exit uses confirmation dialog: "Are you sure? Your progress will be saved." with Continue/Exit options
- Real mode has hidden long-press exit (3 seconds on exit button) for emergencies -- session discarded, not obvious
- Keep typing indicator at 1.2 seconds before each question
- Interview setup screen shows last 3 interview scores and best score below mode selector
- Real mode 15-second timer: amber at 5s, red at 3s with gentle pulse animation for urgency
- Keep transition delay at 1.5 seconds between grading and next question for both modes
- Real mode hides running score -- no score shown during interview (hidden until results)
- Real mode progress bar uses monochrome segments (no green/red coloring) -- matches "hidden until results" decision
- Practice mode shows colored segments (green/red) as normal
- Practice mode: always move on after incorrect answer (no "Try Again" option)
- Progress indicator shows both question number (Q3/20) AND progress bar

#### Speech Input & Grading
- Text input fallback when speech recognition unavailable (Firefox, Safari iOS) -- multi-line textarea with placeholder text
- Auto-grade typed answers using the same gradeAnswer() keyword matcher
- Text submit via explicit Send button only (no Enter key submit) -- better for mobile
- Keyboard/text toggle only appears when speech recognition IS available; if no speech support, text input is the only mode (no toggle needed)
- Same grading tolerance for both Real and Practice modes (current lenient keyword matching)
- Keep current TranscriptionReview behavior for low-confidence transcriptions
- Keep current AudioWaveform for mic input visualization
- Keep current mic permission request timing
- Keep current silence detection timeout (fixed value, not mode-dependent)
- Show previous transcription when re-recording (up to 3 attempts) so user can see what was misheard
- Practice mode: highlight matched keywords in green in the user's answer, show missing keywords -- educational feedback
- Real mode results transcript: also show keyword highlights (both modes get keyword analysis in transcript)
- iOS Safari users: show "For voice input, try Chrome" suggestion message, then fall back to text input

#### Error & Edge Cases (including mobile)
- Offline mid-interview: continue with pre-cached audio (since all audio is pre-cached, interview can proceed offline)
- Mobile keyboard: auto-scroll chat view so input area and latest question are visible above virtual keyboard
- Mic permission denied: block and explain how to enable mic permission; user must grant mic OR explicitly choose text mode to proceed
- Android TTS: use existing cancel/restart workaround pattern (no pause, cancel and re-speak)
- Audio focus loss (phone call, app switch): auto-pause interview; resume when focus returns
- Network quality check before start: test connection speed, show warning if slow ("Slow connection detected. Audio may take longer to load.")
- Browser back swipe on mobile: intercept back navigation with "Leave interview? Progress will be saved." confirmation
- Storage full (IndexedDB): graceful degradation -- show toast "Couldn't save progress" but let interview continue
- Screen rotation: lock to portrait orientation during interview using Screen Orientation API
- Low battery: no special handling (existing reduced motion support is sufficient)

### Claude's Discretion
- Chime audio: Claude decides whether to keep synthesized Web Audio chime or switch to pre-generated MP3
- Tab backgrounding behavior: Claude picks best approach per mode (Real vs Practice may differ)
- Pre-cache timing: Claude decides whether to start on interview page load or during countdown
- Feedback phrase set: Claude determines appropriate phrases based on what USCIS officers actually say
- Examiner character animation expressiveness: Claude decides if subtle eye/mouth animation tweaks are worth adding
- Interview-specific screen reader a11y: Claude determines what's missing from existing Phase 24 a11y work

### Deferred Ideas (OUT OF SCOPE)
- Male/female examiner voice choice -- could be its own enhancement phase if users request it
- Adjustable silence detection timeout -- keep fixed for now, revisit if users struggle with timing
- "Try Again" option for incorrect answers in Practice mode -- could add to a future learning-enhancement phase
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Purpose | Why Standard |
|---------|---------|--------------|
| motion/react | Animations (pulse timer, badge, mode indicator) | Already used in InterviewSession, reduced motion support built-in |
| lucide-react | Icons (Keyboard, Type, Wifi/WifiOff, RotateCw) | Already used across all interview components |
| clsx | Conditional class merging | Already used in every interview component |
| idb-keyval | IndexedDB storage for session persistence | Already used via offlineDb.ts |

### Supporting (Browser APIs - No Libraries Needed)
| API | Purpose | Browser Support |
|-----|---------|----------------|
| Cache API (`caches.open()`) | Pre-cache audio files for offline reliability | All modern browsers (Chrome, Firefox, Safari 11.1+, Edge) |
| Page Visibility API | Detect tab backgrounding for auto-pause | Universal support |
| Screen Orientation API | Lock portrait during interview | Chrome/Edge/Samsung: full, Firefox: partial, Safari: NO |
| `navigator.connection` (Network Information API) | Network quality check before start | Chrome/Edge only, progressive enhancement |
| `history.pushState` + `popstate` | Intercept browser back button | Universal support |
| `visualViewport` API | Detect virtual keyboard for auto-scroll | Chrome 61+, Safari 13+, Firefox: limited |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cache API | Service Worker `cache.addAll()` | Cache API works from main thread; SW already caches on first fetch via CacheFirst strategy |
| `navigator.connection` | `fetch` timing test | fetch timing works cross-browser but adds network request; connection API is instant but Chrome-only |
| Screen Orientation API | CSS `orientation` media query | CSS can't lock orientation, only detect it; API lock has limited Safari support |

## Architecture Patterns

### Existing Codebase Structure
```
src/
├── lib/audio/audioPlayer.ts       # AudioPlayer factory (play/pause/cancel + state subscription)
├── lib/interview/
│   ├── answerGrader.ts            # gradeAnswer() keyword matcher
│   ├── answerGrader.test.ts       # Grader tests
│   ├── audioChime.ts              # playChime() Web Audio synthesizer
│   ├── interviewGreetings.ts      # Greeting/closing text+audio mappings
│   └── interviewStore.ts          # Interview history persistence
├── hooks/
│   ├── useSpeechRecognition.ts    # Web Speech API wrapper
│   ├── useSilenceDetection.ts     # Silence detection for auto-submit
│   ├── useAutoRead.ts             # Auto-read hook for TTS
│   ├── useTTS.ts                  # TTS engine hook
│   └── useTTSSettings.ts          # TTS settings hook
├── components/interview/
│   ├── InterviewSession.tsx       # Main interview orchestrator (1337 lines)
│   ├── InterviewResults.tsx       # Results screen (871 lines)
│   ├── InterviewSetup.tsx         # Setup screen with mode selection (515 lines)
│   ├── InterviewCountdown.tsx     # 5-4-3-2-1 countdown overlay
│   ├── InterviewTimer.tsx         # 15-second per-question timer
│   ├── ExaminerCharacter.tsx      # SVG examiner with animations
│   ├── ChatBubble.tsx             # Chat message bubbles
│   ├── TypingIndicator.tsx        # "..." typing animation
│   ├── TranscriptionReview.tsx    # Review/re-record transcription
│   ├── AudioWaveform.tsx          # Mic input visualization
│   ├── SelfGradeButtons.tsx       # Manual correct/incorrect buttons
│   └── AnswerReveal.tsx           # Show correct answer after grading
│   └── InterviewerAvatar.tsx      # Decorative avatar (setup screen)
├── pages/InterviewPage.tsx        # Page orchestrator (209 lines)
└── public/audio/en-US/ava/interview/
    ├── greeting-01.mp3 ... greeting-03.mp3
    ├── closing-pass-01.mp3 ... closing-pass-02.mp3
    ├── closing-fail-01.mp3 ... closing-fail-02.mp3
    ├── correct-prefix.mp3
    ├── incorrect-prefix.mp3
    ├── pass-announce.mp3
    └── fail-announce.mp3
```

### Pattern 1: Audio Pre-Cache Module
**What:** Standalone async function that builds a URL list and fetches them into Cache API storage.
**When to use:** During countdown before interview starts.
**Approach:**

```typescript
// src/lib/audio/audioPrecache.ts
export interface PrecacheProgress {
  loaded: number;
  total: number;
  failed: string[];
}

export async function precacheInterviewAudio(
  questionIds: string[],
  options: { includeBurmese: boolean },
  onProgress?: (progress: PrecacheProgress) => void
): Promise<PrecacheProgress> {
  const urls: string[] = [];

  // Question audio (English)
  for (const id of questionIds) {
    urls.push(getEnglishAudioUrl(id, 'q'));  // question reading
    urls.push(getEnglishAudioUrl(id, 'a'));  // answer reading (for Practice feedback)
  }

  // Burmese audio (if bilingual mode)
  if (options.includeBurmese) {
    for (const id of questionIds) {
      urls.push(getBurmeseAudioUrl(id, 'q'));
      urls.push(getBurmeseAudioUrl(id, 'a'));
    }
  }

  // Interview-specific audio (greetings, closings, feedback)
  const interviewAudio = [
    'greeting-01', 'greeting-02', 'greeting-03',
    'closing-pass-01', 'closing-pass-02',
    'closing-fail-01', 'closing-fail-02',
    'correct-prefix', 'incorrect-prefix',
    'pass-announce', 'fail-announce',
  ];
  for (const name of interviewAudio) {
    urls.push(getInterviewAudioUrl(name));
  }

  const cache = await caches.open('interview-precache-v1');
  const progress: PrecacheProgress = { loaded: 0, total: urls.length, failed: [] };

  // Fetch in parallel batches of 6
  const BATCH_SIZE = 6;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(url => cache.add(url))
    );
    results.forEach((r, j) => {
      if (r.status === 'fulfilled') progress.loaded++;
      else progress.failed.push(batch[j]);
    });
    onProgress?.({ ...progress });
  }

  return progress;
}
```

**Key insight:** The SW already uses CacheFirst for `/audio/` paths. Pre-caching into any cache named `audio-v2` (matching SW) or a dedicated cache means the SW will serve from cache on subsequent requests. However, since `audioPlayer.ts` uses `new Audio(url)` which goes through the SW, we can pre-populate the SW's cache directly.

### Pattern 2: Text Input Fallback
**What:** Multi-line textarea with Send button that feeds into existing `gradeAnswer()`.
**When to use:** When `SpeechRecognition` API unavailable (Firefox, Safari iOS) or user toggles to keyboard mode.
**Approach:**

The existing `InterviewSession.tsx` already has a `Keyboard` icon imported and speech recognition detection. The text input should:
1. Replace the mic/waveform area with a textarea + Send button
2. On send, call `gradeAnswer(typedText, question)` (same as speech path)
3. Clear textarea after submission

### Pattern 3: Keyword Highlighting in Grading Feedback
**What:** Render user's answer with matched keywords in green, missing keywords listed separately.
**When to use:** Practice mode feedback and both mode results transcripts.
**Approach:**

`gradeAnswer()` already returns `GradeResult` with `matchedKeywords` and `missingKeywords`. The highlighting component wraps each matched keyword occurrence in the answer text with a `<mark>` element styled green, then lists missing keywords below.

### Pattern 4: Long-Press Exit for Real Mode
**What:** Exit button requires 3-second press-and-hold to activate.
**When to use:** Real mode only -- hidden emergency exit.
**Approach:**

Use `onPointerDown`/`onPointerUp` with a `setTimeout(3000)`. Show a subtle fill animation during the hold. On complete, discard session (don't save) and navigate back.

### Pattern 5: Browser Back Interception
**What:** Intercept `popstate` event with confirmation dialog.
**When to use:** During active interview.
**Approach:**

Push a dummy history entry on interview start. Listen for `popstate`. When fired, show confirmation dialog. If user confirms, navigate away. If cancelled, push dummy entry again.

### Anti-Patterns to Avoid
- **Don't use `beforeunload` for in-app navigation:** `beforeunload` only fires on page close/refresh, not hash routing. Use `popstate` for hash-based navigation interception.
- **Don't pre-cache synchronously:** All audio fetch must be `Promise.allSettled` (not `Promise.all`) to handle partial failures gracefully.
- **Don't block on Screen Orientation API:** Safari doesn't support `screen.orientation.lock()`. Always wrap in try/catch with graceful fallback.
- **Don't add `keydown` Enter listener on textarea:** User decision says Send button only, no Enter key submit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio caching | Custom fetch + blob store | Browser Cache API (`caches.open()`) | Automatic cleanup, SW integration, proven API |
| Network speed test | Custom bandwidth calculator | `navigator.connection.downlink` + fetch timing fallback | Connection API is instant on Chrome; fetch timing is simple cross-browser fallback |
| Orientation lock | Manual resize listeners | Screen Orientation API `screen.orientation.lock('portrait')` | Native API handles all edge cases; graceful degradation via try/catch |
| Back button interception | Manual hash tracking | `history.pushState` + `popstate` listener | Standard browser pattern, works with hash routing |
| Virtual keyboard detection | Manual window resize tracking | `visualViewport` API | Provides exact keyboard height on supporting browsers |

## Common Pitfalls

### Pitfall 1: Cache API vs Service Worker Cache Naming
**What goes wrong:** Pre-caching into a cache named `interview-precache-v1` but the SW uses `audio-v2`. The audioPlayer fetches via `new Audio(url)` which goes through SW, but SW looks in `audio-v2`, not the pre-cache.
**Why it happens:** Cache API and SW use separate named caches.
**How to avoid:** Either pre-cache into the same `audio-v2` cache the SW uses, or add the pre-cache name to SW runtime caching. Simplest: use `audio-v2` for pre-caching since SW already serves from it with CacheFirst.
**Warning signs:** Audio plays but requires network fetch despite pre-caching.

### Pitfall 2: Screen Orientation API Safari Fallback
**What goes wrong:** `screen.orientation.lock('portrait')` throws on Safari (not supported) and some Android WebViews.
**Why it happens:** Safari has never implemented the lock() method.
**How to avoid:** Always wrap in try/catch. Use CSS `@media (orientation: landscape)` to show a "Please rotate your device" overlay as fallback.
**Warning signs:** Uncaught promise rejection on iOS.

### Pitfall 3: popstate Fires on Hash Change
**What goes wrong:** Hash routing (react-router-dom) changes trigger `popstate`, conflicting with the back interception logic.
**How to avoid:** Check if the `popstate` event corresponds to our dummy entry (use a unique `state` object). Only show the confirmation dialog when our marker state is detected.
**Warning signs:** Confirmation dialog appears on normal navigation within the app.

### Pitfall 4: Mobile Virtual Keyboard Push
**What goes wrong:** On iOS Safari, the virtual keyboard pushes the viewport up, potentially hiding the chat area or exam question.
**Why it happens:** iOS Safari resizes the visual viewport, not the layout viewport.
**How to avoid:** Use `visualViewport.addEventListener('resize')` to detect keyboard open/close. Scroll the chat container to keep the input and latest message visible. Use `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.
**Warning signs:** User can't see the question while typing on mobile.

### Pitfall 5: Audio Focus Loss Race Condition
**What goes wrong:** Phone call interrupts audio. After call ends, auto-resume tries to play from a stale audio element.
**Why it happens:** `visibilitychange` fires but `audioPlayer.cancel()` may have already cleaned up the element.
**How to avoid:** Track the interview phase state. On visibility return, check current phase and re-trigger audio for that phase (re-play question if in `reading` phase, skip if in `responding` phase).
**Warning signs:** Silent audio after returning from background.

### Pitfall 6: React Compiler Safety with Event Handlers
**What goes wrong:** Long-press handler uses `useRef` for timeout tracking but accesses `.current` during render.
**Why it happens:** React Compiler strict mode disallows ref access during render.
**How to avoid:** Use `useRef` for timeout IDs accessed only inside event handlers (not render). Use `useState` for any value that affects render output (like fill animation progress).
**Warning signs:** React Compiler ESLint errors on ref access.

## Code Examples

### Cache API Pre-caching
```typescript
// Pre-populate the SW's audio cache
const cache = await caches.open('audio-v2'); // Same name as SW
const urls = ['/audio/en-US/ava/interview/greeting-01.mp3', ...];

// Batch with progress tracking
const results = await Promise.allSettled(
  urls.map(url => cache.add(url))
);
const failed = results
  .map((r, i) => r.status === 'rejected' ? urls[i] : null)
  .filter(Boolean);
```

### Screen Orientation Lock with Fallback
```typescript
async function lockPortrait(): Promise<boolean> {
  try {
    await screen.orientation.lock('portrait');
    return true;
  } catch {
    // Safari, some Android WebViews -- show CSS overlay instead
    return false;
  }
}

function unlockOrientation() {
  try {
    screen.orientation.unlock();
  } catch {
    // Ignore -- may not have been locked
  }
}
```

### Page Visibility for Auto-Pause
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Auto-pause: stop audio, pause timer
      audioPlayerRef.current?.pause();
      setInterviewPaused(true);
    } else {
      // Auto-resume: show "Resuming..." then continue
      setInterviewPaused(false);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### History Back Interception
```typescript
useEffect(() => {
  // Push a dummy state to detect back navigation
  window.history.pushState({ interviewGuard: true }, '');

  const handlePopState = (e: PopStateEvent) => {
    if (e.state?.interviewGuard !== true) {
      // User pressed back -- show confirmation
      setShowExitConfirmation(true);
      // Re-push the guard
      window.history.pushState({ interviewGuard: true }, '');
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => {
    window.removeEventListener('popstate', handlePopState);
    // Clean up the dummy entry if still on stack
  };
}, []);
```

### Network Quality Check
```typescript
async function checkNetworkQuality(): Promise<'fast' | 'slow' | 'offline'> {
  // Try navigator.connection first (Chrome only)
  const conn = (navigator as any).connection;
  if (conn?.downlink !== undefined) {
    if (conn.downlink < 1) return 'slow'; // < 1 Mbps
    return 'fast';
  }

  // Fallback: time a small fetch
  try {
    const start = Date.now();
    await fetch('/audio/en-US/ava/interview/greeting-01.mp3', { method: 'HEAD' });
    const elapsed = Date.now() - start;
    return elapsed > 2000 ? 'slow' : 'fast';
  } catch {
    return 'offline';
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch audio on demand | Pre-cache via Cache API | Standard since 2020 | Eliminates audio load failures mid-session |
| `window.onbeforeunload` for SPA nav | `history.pushState` + `popstate` | Always for hash routing | Correct interception for in-app navigation |
| Window resize for keyboard | `visualViewport` API | Safari 13+ (2019) | Accurate keyboard height detection |
| `screen.lockOrientation()` (old) | `screen.orientation.lock()` | Screen Orientation API v2 | Standardized API, but Safari still unsupported |

## Existing Audio Assets Inventory

### Interview-Specific Audio (public/audio/en-US/ava/interview/)
- 3 greetings: `greeting-01.mp3` through `greeting-03.mp3`
- 2 pass closings: `closing-pass-01.mp3`, `closing-pass-02.mp3`
- 2 fail closings: `closing-fail-01.mp3`, `closing-fail-02.mp3`
- 1 correct prefix: `correct-prefix.mp3`
- 1 incorrect prefix: `incorrect-prefix.mp3`
- 1 pass announce: `pass-announce.mp3`
- 1 fail announce: `fail-announce.mp3`
**Total: 11 files**

### Question Audio (public/audio/en-US/ava/)
- 128 questions with `-q.mp3` (question), `-a.mp3` (answer), `-e.mp3` (explanation)
- Pattern: `{questionId}-{type}.mp3` e.g., `GOV-P01-q.mp3`

### Burmese Audio (public/audio/my-MM/female/)
- Same 128 questions with `-q.mp3` and `-a.mp3`

### Missing Audio (needs generation)
- Feedback phrases for Practice mode (e.g., "That's correct!", "Not quite, the answer is...")
- These need to be generated via edge-tts or kept as browser TTS fallback

## Open Questions

1. **Feedback phrase audio generation**
   - What we know: CONTEXT.md says "all examiner speech is pre-generated MP3" including feedback phrases
   - What's unclear: Only `correct-prefix.mp3` and `incorrect-prefix.mp3` exist; need full feedback phrases
   - Recommendation: Generate 3-4 feedback phrase variations via edge-tts (same Ava voice) as a task in this phase. Use `correct-prefix` + answer audio for Practice mode "read correct answer aloud" flow.

2. **Cache name strategy**
   - What we know: SW uses `audio-v2` cache name with CacheFirst
   - What's unclear: Whether to add to `audio-v2` or create separate `interview-precache`
   - Recommendation: Use `audio-v2` directly -- the SW already manages this cache with proper expiration. Pre-caching into the same cache means no additional configuration needed.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/audio/audioPlayer.ts`, `src/components/interview/InterviewSession.tsx`, `src/lib/pwa/sw.ts`
- Cache API: MDN Web Docs (standard specification, universal support)
- Screen Orientation API: MDN Web Docs (Chrome/Edge full support, Safari unsupported)
- Page Visibility API: MDN Web Docs (universal support)

### Secondary (MEDIUM confidence)
- `navigator.connection` Network Information API: Chrome-only, progressive enhancement
- `visualViewport` API: Good support but Firefox limited

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all existing libraries, no new dependencies
- Architecture: HIGH -- extends existing patterns (audioPlayer, interviewGreetings, answerGrader)
- Pitfalls: HIGH -- well-documented browser API limitations
- Audio pre-caching: HIGH -- Cache API is mature and well-supported

**Research date:** 2026-02-18
**Valid until:** 2026-04-18 (stable browser APIs, no fast-moving dependencies)
