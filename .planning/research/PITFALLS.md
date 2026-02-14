# Domain Pitfalls: v2.1 Quality & Polish

**Domain:** Adding language mode toggle behavior change (bilingual-to-mode-based), session persistence/resume, TTS quality improvements, test/practice/interview UX overhaul, study guide flashcard overhaul, and accessibility/performance improvements to an existing 40K+ LOC bilingual PWA
**Researched:** 2026-02-13
**Confidence:** HIGH (verified against codebase, React Compiler rules, official docs, and community sources)

---

## Critical Pitfalls

These mistakes cause rewrites, broken user sessions, or data loss.

### Pitfall 1: Language Toggle Behavior Change Has 171 Conditional Render Points Across 48 Files

**What goes wrong:** The current `LanguageContext` exposes a simple `showBurmese` boolean (true when `mode === 'bilingual'`). Changing from "always bilingual with English-only toggle" to a mode-based system (e.g., English-only, Burmese-only, bilingual, or context-dependent modes) requires touching every one of the 171 `showBurmese &&` conditional render points across 48 files. But critically, NOT all Burmese text is gated by `showBurmese`:

- **TestPage.tsx**: Always shows Burmese in answer options (`answer.text_my`), result review, and completion messages -- no `showBurmese` check. 11 instances of `font-myanmar` ungated.
- **Flashcard3D.tsx**: Always displays both English and Burmese -- no `showBurmese` check anywhere. 5 instances of `font-myanmar` ungated.
- **FlashcardStack.tsx**: Progress indicator always shows Burmese (`({currentIndex + 1} မှ {questions.length})`) -- no `showBurmese` check.
- **InterviewSession.tsx**: Uses `showBurmese` in some places (greeting, question text) but NOT in the dialog footer buttons, progress counter, or "Next Question" transition text.

This creates an inconsistent experience: in English-only mode, some screens hide Burmese while others always show it.

**Why it happens:** The v1.0 design treated bilingual as the default and English-only as an "interview simulation mode." The toggle was added late (v1.0 Phase 7) and only applied to components that explicitly imported `useLanguage`. Components written before or outside that pattern show Burmese unconditionally.

**Consequences:**
- Users switch to English-only mode but still see Burmese text on TestPage, StudyGuide flashcards, and other screens -- breaks the mental model
- If the mode becomes "Burmese-only," no component currently supports hiding English text -- the entire BilingualText component assumes English is always primary
- Partial refactoring (fixing some files but not all) creates a worse experience than the current inconsistency because users notice the switching behavior

**Prevention:**
1. **Audit BEFORE coding**: Search for all `font-myanmar` occurrences (334 across 77 files) and `\.my` property accesses. Categorize each as: (a) gated by `showBurmese`, (b) ungated but should be gated, (c) intentionally always shown (e.g., the language toggle label itself)
2. **Create a language display contract**: Define precisely what each mode means:
   - `bilingual`: Both languages shown (current default behavior)
   - `english-only`: English only, no Burmese text (interview simulation)
   - If adding `burmese-primary`: Burmese on top, English smaller below (reverse of current `BilingualText`)
3. **Wrap ALL Burmese text through `BilingualText` or `showBurmese` guard**: No raw `font-myanmar` spans without a language check. This means TestPage, Flashcard3D, and FlashcardStack all need refactoring
4. **Single atomic PR**: Do the language mode refactor as ONE change across all files, not incrementally -- partial migration is worse than no migration

**Detection:** Set language to English-only mode, navigate to every page, and verify zero Burmese text appears. Automated: `grep -c 'font-myanmar' src/ | grep -v ':0'` and cross-reference against `showBurmese` usage in same file.

**Phase to address:** Language Mode phase -- must be completed atomically, not split across phases

---

### Pitfall 2: Session Persistence Creates Stale State Bugs When Question Bank or Schema Changes

**What goes wrong:** Adding session resume (persist mid-session progress to IndexedDB so users can resume after closing the app) introduces a class of stale data bugs unique to PWAs with evolving content. The current codebase has 8 separate IndexedDB stores:

| Store | Database | Key Pattern |
|-------|----------|-------------|
| Questions cache | `civic-prep-questions` | `all-questions` (single key) |
| Sync queue | `civic-prep-sync` | `pending-{timestamp}` |
| Mastery history | `civic-prep-mastery` | `answers` (single array) |
| SRS cards | `civic-prep-srs` | `{questionId}` (per-card) |
| SRS sync | `civic-prep-srs-sync` | Pending reviews |
| Interview history | `civic-prep-interview` | `interview-sessions` (single key) |
| Streak data | `civic-prep-streaks` | Streak records |
| Badge data | `civic-prep-badges` | Badge records |

Adding a 9th store for session state introduces these failure modes:

1. **Question ID drift**: User starts a practice session with question IDs from version A. App updates to version B which changes/removes question IDs. User resumes session with stale question references that no longer resolve. `allQuestions.find(q => q.id === savedId)` returns `undefined`.
2. **Answer shuffle desync**: TestPage and PracticeSession shuffle answers with `fisherYatesShuffle` using no seed. If the session is restored but answers are re-shuffled, the `selectedAnswer` reference (stored as an object reference or answer text) won't match the re-shuffled order.
3. **Schema evolution**: `idb-keyval` uses `createStore()` which has NO built-in schema versioning. Each store is a separate IndexedDB database. Adding fields to a persisted session object (e.g., adding `languageMode` to saved state) has no migration path -- old persisted sessions lack the field and cause runtime errors.
4. **Cross-tab corruption**: Two tabs open the same IndexedDB stores. User starts a session in tab A, opens tab B which also starts a session. Both tabs write to the same session store. idb-keyval has no locking mechanism.

**Why it happens:** `idb-keyval` is deliberately minimal (~600B) and trades schema management for simplicity. The current codebase uses it correctly for append-only data (mastery history, interview sessions). But session resume requires read-modify-write cycles on mutable state, which is a fundamentally different access pattern.

**Consequences:**
- User resumes a session and sees "Question not found" or a blank card
- Resumed session shows wrong answer highlighted as "selected" because answer objects don't match
- After app update, resumed sessions crash with `TypeError: Cannot read properties of undefined`
- Data corruption from multi-tab writes (less likely but possible on desktop)

**Prevention:**
1. **Version-stamp persisted sessions**: Include `appVersion` and `questionBankHash` in the persisted session. On resume, if version mismatches, discard the session with a user-friendly message ("Your session was from an older version -- starting fresh")
2. **Serialize answer selection by index, not object reference**: Store `selectedAnswerIndex: number` not `selectedAnswer: Answer`. Reconstruct the answer from the question + index on resume
3. **Store the shuffled question order**: Persist the actual `questionId[]` array in shuffled order, not just the current index. This eliminates the need to re-shuffle and preserves the exact session
4. **Add a TTL**: Auto-expire persisted sessions after 24-48 hours. A civic test practice session from 3 days ago is not useful to resume
5. **Add a session store version**: Use a wrapper around `idb-keyval` that checks a `schemaVersion` field in persisted data and runs migrations or discards incompatible data
6. **Use Web Locks API for multi-tab safety**: `navigator.locks.request('session-write', ...)` prevents concurrent writes (supported in all modern browsers as of 2024)

**Detection:** Start a session, close the tab, change one question's ID in the question bank, reopen -- verify graceful handling. Start a session in two tabs simultaneously -- verify no corruption.

**Phase to address:** Session Persistence phase -- must define the persistence schema upfront, not retrofit

---

### Pitfall 3: TTS Improvements Break the Interview Session's Phase State Machine

**What goes wrong:** `InterviewSession.tsx` implements a fragile state machine with 6 phases: `greeting -> chime -> reading -> responding -> grading -> transition`. Each phase transition is triggered by TTS callbacks (`speakWithCallback` with `onEnd`). The `useInterviewTTS` hook has FOUR ref values (`synthesisRef`, `voicesRef`, `timeoutRef`, `callbackFiredRef`) and a timeout fallback for Chrome's unreliable `onend` event.

Improving TTS quality (e.g., adding voice selection UI, Burmese TTS support, rate/pitch controls, or queue-based utterance management) risks breaking the phase machine because:

1. **Double-firing guard is per-utterance**: `callbackFiredRef` prevents double-firing of `onEnd` (from both the browser event and the timeout fallback). But if TTS improvements add utterance queuing (speak English, then Burmese), the guard must be per-queue-item, not per-hook-instance
2. **`synth.cancel()` is called on every `speakWithCallback` call**: This clears ANY pending speech, not just the previous utterance. If a TTS improvement adds pre-buffering or warm-up speech, `cancel()` will kill it
3. **Timeout fallback estimation is English-only**: `estimateDuration` uses `wordCount / 2.5 words per second`. Burmese text has a completely different word boundary model (syllable-based, no spaces). Adding Burmese TTS reading without updating the estimator produces timeouts that fire mid-speech or 10+ seconds after speech ends
4. **Two separate TTS hooks exist**: `useSpeechSynthesis.ts` (general, used by `SpeechButton`) and `useInterviewTTS.ts` (interview-specific). They duplicate voice-finding logic with slightly different implementations. A TTS quality improvement must update BOTH, and any behavior divergence causes inconsistent voice selection

**Why it happens:** The interview TTS was built as a specialized fork of the general TTS hook because it needed `onEnd` callbacks. This duplication means improvements to one don't propagate to the other. The phase state machine uses `useEffect` chains where each effect watches `questionPhase` -- this is a "derived state machine" pattern that becomes fragile when side effects (TTS) have unreliable timing.

**Consequences:**
- Phase machine gets stuck in `reading` because the TTS callback fires before `questionPhase` is set, and the effect's `if (questionPhase !== 'reading') return` guard skips it
- Adding Burmese TTS to the greeting causes `cancel()` to kill the English greeting mid-sentence
- Timeout fallback fires early for Burmese text, advancing to the next phase while TTS is still speaking
- Voice selection changes in `useSpeechSynthesis` don't propagate to `useInterviewTTS`, causing different voices in study vs. interview

**Prevention:**
1. **Consolidate TTS hooks**: Extract shared voice-finding and utterance management into a single `ttsEngine.ts` module. Both hooks import from it. Voice selection changes propagate automatically
2. **Use a proper state machine for interview**: Replace the `questionPhase` useState + useEffect chain with an explicit transition function: `transition(from, to, sideEffect)`. This makes the valid transitions explicit and prevents impossible states
3. **Add Burmese duration estimation**: For Burmese text, estimate based on character count (Myanmar script), not word count. Approximate: `charCount / 8 characters per second` at normal rate
4. **Test the timeout fallback independently**: Add a test that mocks `speechSynthesis.speak` to never fire `onend`, verifying the timeout fallback advances the phase correctly
5. **Never add `synth.cancel()` in the middle of a planned utterance sequence**: Use an utterance queue with explicit `isQueued` flag that prevents cancellation of upcoming items

**Detection:** Run the interview flow with Chrome DevTools throttled to "Slow 3G" (makes TTS loading/firing more unreliable). Run with Web Speech API mocked to never fire `onend`. Verify both scenarios complete gracefully.

**Phase to address:** TTS Improvements phase -- consolidate hooks BEFORE adding features

---

### Pitfall 4: React Compiler ESLint Rules Block Common Session Persistence Patterns

**What goes wrong:** The project enforces React Compiler ESLint rules (documented in MEMORY.md). Session persistence and resume features typically use patterns that violate these rules:

1. **`react-hooks/set-state-in-effect`**: Restoring persisted state on mount requires reading from IndexedDB (async) then calling `setState`. This is the canonical "set state in effect" pattern that the React Compiler lint flags:
   ```typescript
   // VIOLATION: setState in effect
   useEffect(() => {
     getPersistedSession().then(session => {
       if (session) setResumedSession(session); // Flagged!
     });
   }, []);
   ```

2. **`react-hooks/refs`**: Tracking "has session been saved" with a ref (as TestPage does with `hasSavedSessionRef`) and reading it during render to show a "Resuming..." indicator violates the refs rule:
   ```typescript
   // VIOLATION: ref.current in render
   if (hasSavedRef.current) return <ResumeBanner />;
   ```

3. **Timer management for auto-save**: Auto-saving session state every N seconds requires an interval that accesses current state -- closures over stale state or ref.current access during cleanup both violate compiler rules

**Why it happens:** React Compiler rules enforce that components are pure functions of their props and state. Side effects (IndexedDB reads, timer management) must be explicitly sequenced through hooks, not smuggled via refs or effects that set state. The session persistence pattern is inherently a side effect that needs to sync external storage with React state.

**Consequences:**
- Developers write natural-feeling persistence code, ESLint rejects it, and the "fix" introduces subtle bugs (e.g., using `useSyncExternalStore` incorrectly, or wrapping IndexedDB reads in `use()` which causes Suspense waterfalls)
- Workarounds that suppress lint rules (`// eslint-disable-next-line`) bypass the compiler's optimization guarantees, potentially causing stale renders

**Prevention:**
1. **Use `useState` with lazy initializer for synchronous data**: For localStorage-based state (like `LanguageContext` already does), `useState(() => localStorage.getItem(...))` is compiler-safe
2. **Use the "loading state" pattern for async persistence**: Instead of setting state in an effect, use a `status` state machine:
   ```typescript
   const [status, setStatus] = useState<'loading' | 'fresh' | 'resumed'>('loading');
   const [sessionData, setSessionData] = useState<SessionData | null>(null);
   // Effect sets BOTH status and data together via a single state update
   ```
3. **Use `useSyncExternalStore` for IndexedDB subscription**: If session state needs to sync across components, wrap IndexedDB in a store with `subscribe`/`getSnapshot` interface
4. **Auto-save with event handlers, not intervals**: Save session state on every user action (answer select, page navigate) rather than on a timer. This avoids the interval + stale closure problem entirely
5. **Follow existing patterns**: `LanguageContext.tsx` line 49-55 shows the accepted pattern for syncing persisted state on mount -- use the `eslint-disable-next-line react-hooks/set-state-in-effect` comment with the `-- intentional:` justification pattern already used in `useSpeechSynthesis.ts` line 29

**Detection:** Run `npx eslint src/` after any session persistence code. Zero violations required.

**Phase to address:** ALL phases that touch state persistence -- reference this pattern library

---

## Moderate Pitfalls

### Pitfall 5: UX Overhaul of Test/Practice/Interview Breaks Navigation Lock Behavior

**What goes wrong:** All three session types (Test, Practice, Interview) implement navigation locking to prevent accidental abandonment:

- **TestPage**: Uses `setLock(shouldLock, lockMessage)` via `useNavigation()` context + `beforeunload` event + `popstate` event with `history.pushState` guard (with browser rate-limit `try/catch`)
- **PracticePage**: Uses `setLock(phase === 'session', ...)` via `useNavigation()` + `beforeunload` in PracticeSession
- **InterviewPage**: Likely uses similar pattern (based on InterviewSession structure)

A UX overhaul that restructures component hierarchy (e.g., lifting session state to a parent, adding a session resume wrapper, or introducing a shared session layout) can break lock behavior:

1. **Lock/unlock timing**: If the session component unmounts during a UX transition animation, the cleanup `useEffect(() => () => setLock(false))` fires and unlocks navigation while the session is still conceptually "active"
2. **Double locking**: A session resume wrapper and the session component both call `setLock(true)`, but only one calls `setLock(false)` on cleanup
3. **`history.pushState` rate limit**: TestPage's `popstate` handler has a `try/catch` around `pushState` because browsers limit to 100 calls per 10 seconds. A UX overhaul that adds more route transitions can exhaust this limit, making the navigation guard silently fail

**Prevention:**
1. **Lock ownership**: Only ONE component per page should own the navigation lock. If adding a session wrapper, move lock management to the wrapper, not the session component
2. **Test lock lifecycle**: After any component restructuring, verify: (a) lock engages when session starts, (b) lock releases when session completes, (c) lock releases when component unmounts unexpectedly, (d) browser back button is blocked during active session
3. **Preserve the `popstate` rate-limit guard**: The existing `try/catch` around `pushState` in TestPage is battle-tested. Don't remove it during refactoring

**Detection:** Start a test, press browser back button, verify the warning toast appears. Start a test, close the tab, verify the `beforeunload` dialog appears.

**Phase to address:** Test/Practice/Interview UX Overhaul phase

---

### Pitfall 6: Flashcard Overhaul Breaks 3D Flip Card Pointer Event Management

**What goes wrong:** `Flashcard3D.tsx` implements a complex pointer event management system to prevent card flips when interacting with child elements (TTS buttons, ExplanationCard). The current approach:

- `backfaceVisibility: 'hidden'` on both faces
- `pointerEvents: isFlipped ? 'none' : 'auto'` on front face (line 255)
- `pointerEvents: isFlipped ? 'auto' : 'none'` on back face (line 302)
- `stopPropagation` on TTS button clicks (line 191-193, plus `stopPropagation` prop)
- `stopPropagation` on ExplanationCard's `onClick`, `onKeyDown`, and `onPointerDown` (lines 333-334)

This is documented in MEMORY.md: "backfaceVisibility hidden does NOT block pointer events -- must toggle pointerEvents via state." Overhauling the flashcard (new layout, new interactive elements, swipe gestures) without preserving this exact pointer event model causes:

1. Clicking a TTS button on the back face flips the card to the front
2. Expanding an explanation on the back face flips the card
3. The front face remains clickable through the flipped back face, causing phantom interactions

**Why it happens:** CSS `backface-visibility: hidden` only controls visual rendering, not event targets. The card's `onClick={handleFlip}` is on the outermost container and captures ALL clicks that aren't explicitly stopped. Any new interactive element added to the card MUST stop propagation.

**Prevention:**
1. **Propagation audit**: Every interactive element inside the flashcard (buttons, links, expandable sections, inputs) MUST call `e.stopPropagation()` on click, keydown, and pointerdown
2. **Pointer event contract**: Maintain the `pointerEvents` toggle on both face divs. If restructuring the card layout, ensure `isFlipped` state still correctly controls which face accepts events
3. **Test matrix**: After any flashcard change, test: (a) tap to flip, (b) tap TTS on front -- no flip, (c) flip to back, (d) tap TTS on back -- no flip, (e) expand explanation on back -- no flip, (f) scroll inside explanation on back -- no flip

**Detection:** On a touch device, rapidly tap the TTS button on the back face of a flipped card. If the card flips, propagation is leaking.

**Phase to address:** Study Guide Flashcard Overhaul phase

---

### Pitfall 7: Accessibility Retrofitting Conflicts with motion/react Spring Animations

**What goes wrong:** The codebase uses motion/react extensively (68 files) with spring physics animations (`SPRING_BOUNCY`, `SPRING_SNAPPY`, `SPRING_GENTLE`). The `useReducedMotion` hook correctly checks `prefers-reduced-motion` and returns a boolean used to disable animations. But accessibility retrofitting introduces new conflicts:

1. **`aria-live` regions + AnimatePresence**: Adding `aria-live="polite"` to announce content changes (e.g., question transitions, score updates) conflicts with `AnimatePresence` exit animations. Screen readers announce the NEW content while the OLD content is still animating out, creating a confusing double-announcement
2. **Focus management + spring animations**: Adding focus trapping to dialogs or auto-focus to newly revealed elements (answer feedback, explanation cards) conflicts with spring animations that take 200-400ms to settle. Focus moves to an element that's still bouncing/sliding, and screen readers announce its position before it reaches the final location
3. **Reduced motion + opacity**: The `reducedItemVariants` in StaggeredList set `opacity: 1` for reduced motion users, meaning items appear instantly. But this also means `FadeIn` component's `delay` prop has no visible effect -- elements that should appear sequentially all appear at once, potentially overwhelming screen reader users with simultaneous announcements
4. **WAAPI constraint**: MEMORY.md documents "WAAPI only supports 2-keyframe arrays." The `useReducedMotion` hook returns a boolean from motion/react, but WAAPI animations (used in some components) need separate handling

**Why it happens:** motion/react's `useReducedMotion` is a blanket toggle that disables transform/layout animations but doesn't address screen reader timing, focus management, or announcement sequencing. Accessibility is not just "disable animations" -- it requires coordinating announcements, focus, and visual state.

**Prevention:**
1. **Separate animation accessibility from screen reader accessibility**: `useReducedMotion` handles visual animations. Screen reader announcements need their own timing logic, independent of animation state
2. **Delay `aria-live` announcements until after exit animations complete**: Use `AnimatePresence`'s `onExitComplete` callback to trigger screen reader announcements, not the state change itself
3. **Focus after animation settles**: Use `onAnimationComplete` callback from motion/react before calling `.focus()` on newly revealed elements
4. **Don't set `aria-hidden` on animating elements**: `AnimatePresence` exit animations leave elements in the DOM temporarily. Setting `aria-hidden="true"` on them during exit can cause screen readers to lose focus context
5. **Test with VoiceOver/NVDA**: Automated accessibility tools cannot detect timing-related screen reader issues. Manual testing required

**Detection:** Enable VoiceOver (macOS) or NVDA (Windows), navigate through a test/practice session. Verify announcements match visible state transitions. Enable reduced motion in OS settings and verify no visual jarring.

**Phase to address:** Accessibility Improvements phase

---

### Pitfall 8: Performance Optimization Can Cause IndexedDB Read Waterfall

**What goes wrong:** The current architecture loads data from 8 separate IndexedDB databases on app startup. Each `createStore()` call creates a separate `IDBDatabase` connection. When multiple components mount simultaneously (Dashboard loads mastery, streaks, badges, SRS cards, interview history), each triggers an independent IndexedDB read:

```
Mount: Dashboard
  -> useCategoryMastery() -> getAnswerHistory() [civic-prep-mastery]
  -> useStreak() -> getStreakData() [civic-prep-streaks]
  -> useBadges() -> getAllBadges() [civic-prep-badges]
  -> useSRSCards() -> getAllSRSCards() [civic-prep-srs]
  -> useInterviewHistory() -> getInterviewHistory() [civic-prep-interview]
```

Performance optimization that adds more IndexedDB reads (e.g., session resume check, cached preferences, analytics) or adds memoization that depends on IndexedDB data will:

1. **Create a waterfall**: Each read is independent and sequential within its hook. 5+ concurrent database opens can take 50-200ms each on mobile
2. **Break React Compiler optimizations**: If hooks that read from IndexedDB trigger re-renders at different times (one resolves at 50ms, another at 150ms), the component renders 5 times during initial load instead of once
3. **IndexedDB in service worker + main thread conflict**: If a service worker sync is writing to the same store while the main thread reads, reads can return stale data (IndexedDB transactions are FIFO per database, but cross-context ordering is undefined)

**Prevention:**
1. **Batch IndexedDB reads**: Create a `loadAllStores()` function that reads from all stores in parallel (`Promise.all`) and returns a single combined result. Components consume from a shared cache instead of individual reads
2. **Use a data loading context**: Wrap initial data loading in a context provider with a `status` field (`loading | ready | error`). Render a skeleton until all stores are loaded, then render once with all data
3. **Don't add IndexedDB reads to the critical rendering path**: Session resume checks should happen BEFORE the session component mounts, not inside a `useEffect` that causes a re-render
4. **Profile before optimizing**: Use Chrome DevTools Performance tab to measure actual IndexedDB read times on the target device (mobile, not desktop) before adding optimization complexity

**Detection:** Open Chrome DevTools > Performance > Record page load. Check for multiple "IndexedDB" entries in the flame chart. If total IndexedDB time exceeds 500ms, optimization is needed.

**Phase to address:** Performance Improvements phase

---

### Pitfall 9: BilingualText Component Refactor Cascades Through 63+ Consumer Components

**What goes wrong:** `BilingualText` and `BilingualTextInline` are used across the entire application. The `BilingualString` type (`{ en: string; my: string }`) is the universal bilingual text contract. Changing the language mode system requires modifying how `BilingualText` decides what to render. Any signature change cascades:

- `BilingualText` currently accepts `text: BilingualString` and reads `showBurmese` from context
- If adding a "Burmese-primary" mode, `BilingualText` needs to swap which text is primary/secondary
- If adding per-component language override (e.g., "always bilingual in flashcards even in English-only mode"), the component needs a `forceMode` prop
- The `BilingualHeading`, `BilingualButton`, `SectionHeading` components all wrap `BilingualText` patterns -- changes propagate through all of them

Additionally, many components bypass `BilingualText` entirely and render Burmese text directly:
```tsx
// Pattern seen in 20+ components:
<p className="font-myanmar text-muted-foreground">{strings.someKey.my}</p>
```
These raw renders will NOT respond to any `BilingualText` behavior changes.

**Prevention:**
1. **Add mode to context, not to component props**: The new language mode should be consumed via `useLanguage()` context, not passed as props through 63 components. `BilingualText` reads the mode from context and adjusts rendering
2. **Keep BilingualString type unchanged**: Do NOT add `mode` or `primary` fields to the string type. The type should remain `{ en: string; my: string }` -- rendering logic belongs in the component, not the data
3. **Centralize all bilingual rendering through components**: Before changing behavior, find and wrap all raw `{strings.someKey.my}` renders in `BilingualText` or a `showBurmese &&` guard. This is a prerequisite, not part of the feature
4. **Add `forceMode` as an optional prop**: For specific components that need to override the global mode (e.g., flashcards always bilingual), add `forceMode?: LanguageMode` to `BilingualText`

**Detection:** Search for `\.my\}` and `\.my\)` patterns not inside a `BilingualText` component or a `showBurmese &&` guard. Each match is a raw Burmese render that won't respond to mode changes.

**Phase to address:** Language Mode phase -- prerequisite step before changing toggle behavior

---

## Minor Pitfalls

### Pitfall 10: Speech Rate Preference Stored in localStorage, Not IndexedDB

**What goes wrong:** `useInterviewTTS.ts` reads speech rate from `localStorage.getItem('civic-prep-speech-rate')`. All other user data is in IndexedDB. Adding TTS quality settings (voice selection, pitch, rate for different contexts) creates a split storage situation:

- User clears "site data" expecting to reset preferences: IndexedDB is cleared but localStorage may not be (behavior varies by browser)
- A "Reset All Settings" feature must clear BOTH localStorage AND IndexedDB
- The TTS settings don't participate in any sync mechanism (the app has Supabase sync for other data)

**Prevention:** When adding TTS settings, consider migrating speech rate to IndexedDB alongside other user preferences, or at minimum document the localStorage dependency so a settings reset feature knows to clear both.

**Phase to address:** TTS Improvements phase

---

### Pitfall 11: Interview Session Has No Partial Result Persistence

**What goes wrong:** `InterviewSession.tsx` stores results in `useState<InterviewResult[]>([])`. If the user navigates away accidentally (despite the navigation lock), crashes, or the tab is killed by the OS, all mid-session results are lost. The session is only saved to IndexedDB via `saveInterviewSession()` AFTER `onComplete` fires.

Adding session persistence to Test and Practice without adding it to Interview creates inconsistent resume behavior: "I can resume tests and practice, why not interviews?"

**Prevention:** If adding session persistence to any session type, add it to ALL session types, or explicitly document why Interview is excluded (e.g., "interviews are meant to be completed in one sitting to simulate real conditions").

**Phase to address:** Session Persistence phase

---

### Pitfall 12: TTS Voice Availability Varies by OS Version and Can Regress

**What goes wrong:** The voice-finding logic in both TTS hooks prioritizes specific voices (`APPLE_US_VOICES`, `ANDROID_US_VOICES`, `ENHANCED_HINTS`). Adding a voice quality dropdown UI that shows available voices creates a UX problem:

- iOS 17+ removed some previously available voices and added new ones
- Android OEMs pre-install different TTS engines (Google TTS, Samsung TTS, device-specific)
- The `voiceschanged` event fires multiple times on some browsers as voices lazy-load
- A voice the user selected may not be available on their next device or after an OS update

**Prevention:** Store voice preference as a "hint" (name substring), not an exact match. Fall back gracefully to the priority chain. Show "Recommended" badge on voices that match the existing priority lists.

**Phase to address:** TTS Improvements phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| Language Mode Change | 171 conditional renders + 163 ungated Burmese renders (Pitfall 1) | CRITICAL | Full audit before coding, atomic migration |
| Language Mode Change | BilingualText cascade through 63+ consumers (Pitfall 9) | HIGH | Context-based mode, not prop-based |
| Session Persistence | Stale data after app update (Pitfall 2) | CRITICAL | Version-stamp sessions, TTL expiry |
| Session Persistence | React Compiler blocks common patterns (Pitfall 4) | HIGH | Follow established eslint-disable patterns |
| Session Persistence | Inconsistent resume across session types (Pitfall 11) | MODERATE | All-or-nothing approach |
| TTS Improvements | Interview phase machine breaks (Pitfall 3) | CRITICAL | Consolidate TTS hooks first |
| TTS Improvements | Dual TTS hook divergence (Pitfall 3) | HIGH | Extract shared engine module |
| TTS Improvements | Speech rate in localStorage (Pitfall 10) | LOW | Migrate to IndexedDB |
| TTS Improvements | Voice availability varies by OS (Pitfall 12) | LOW | Store voice as hint, not exact |
| Test/Practice/Interview UX | Navigation lock breaks (Pitfall 5) | HIGH | Single lock owner per page |
| Flashcard Overhaul | Pointer event management breaks (Pitfall 6) | HIGH | Propagation audit, test matrix |
| Accessibility | Animation + screen reader timing (Pitfall 7) | HIGH | Separate animation and a11y concerns |
| Performance | IndexedDB read waterfall (Pitfall 8) | MODERATE | Batch reads, profile first |
| ALL phases | React Compiler rule violations (Pitfall 4) | HIGH | Follow MEMORY.md patterns |

---

## Cross-Cutting Concerns

### Concern 1: The "Always Bilingual" Assumption Is Baked Into Data, Not Just UI

The question bank itself has bilingual structure: every `Question` object has `question_en`, `question_my`, `answers[].text_en`, `answers[].text_my`, `studyAnswers[].text_en`, `studyAnswers[].text_my`. The mastery store records `questionText_en` AND `questionText_my` in every result. The sync queue stores both language versions of answers.

A language mode change that hides Burmese from the UI does NOT need to touch data storage -- but developers might mistakenly "optimize" by not recording `_my` fields in English-only mode, which would corrupt data if the user switches back to bilingual.

**Rule:** ALWAYS store both language versions in data, regardless of display mode. Language mode is a VIEW concern, never a DATA concern.

### Concern 2: Two TTS Implementations Must Converge Before Either Is Improved

`useSpeechSynthesis.ts` and `useInterviewTTS.ts` share ~70% of their code (voice finding, voice loading, cancellation) but diverge on callbacks, timeout handling, and rate configuration. Any improvement to one (better voice selection, Burmese support, queue management) must be duplicated in the other -- OR they must be consolidated first.

**Recommended order:**
1. Extract shared TTS engine (`ttsEngine.ts`) with voice finding, loading, rate config
2. `useSpeechSynthesis` becomes a thin wrapper for fire-and-forget speech
3. `useInterviewTTS` becomes a thin wrapper adding callbacks, timeout fallback, and phase integration
4. THEN add improvements to the shared engine

### Concern 3: Session Persistence Must Be Designed as a Cross-Feature Schema

If Test, Practice, and Interview sessions all get persistence, they need a shared schema pattern:

```typescript
interface PersistedSession {
  type: 'test' | 'practice' | 'interview';
  version: number;           // Schema version for migration
  appVersion: string;        // App version for compatibility check
  startedAt: string;         // ISO timestamp
  expiresAt: string;         // TTL for auto-cleanup
  questionIds: string[];     // Ordered question IDs (preserves shuffle)
  currentIndex: number;      // Where the user left off
  results: SessionResult[];  // Completed answers
  config: SessionConfig;     // Mode-specific config (timer, language, etc.)
}
```

Designing this upfront prevents three separate incompatible schemas emerging from three separate implementation phases.

---

## "Looks Done But Isn't" Checklist for v2.1

- [ ] **Language mode**: Zero `font-myanmar` renders visible in English-only mode on ALL pages
- [ ] **Language mode**: TestPage answer options respect language mode (currently ungated)
- [ ] **Language mode**: Flashcard3D front and back respect language mode (currently ungated)
- [ ] **Language mode**: FlashcardStack progress indicator respects language mode (currently ungated)
- [ ] **Session persistence**: Resumed session works after app version update (version check)
- [ ] **Session persistence**: Resumed session expires after 24-48 hours (TTL)
- [ ] **Session persistence**: Two tabs don't corrupt session data (Web Locks or last-write-wins)
- [ ] **Session persistence**: ESLint passes with zero violations
- [ ] **TTS**: Interview phase machine completes all 6 phases without getting stuck
- [ ] **TTS**: Voice selection is consistent between SpeechButton and InterviewSession
- [ ] **TTS**: Timeout fallback still works for long utterances (>10 seconds)
- [ ] **UX overhaul**: Navigation lock blocks browser back button during Test session
- [ ] **UX overhaul**: `beforeunload` dialog appears when closing tab during Practice session
- [ ] **Flashcard overhaul**: TTS button on back face does NOT flip card
- [ ] **Flashcard overhaul**: Explanation card interaction on back face does NOT flip card
- [ ] **Accessibility**: Screen reader announces question transitions after animation completes
- [ ] **Accessibility**: Reduced motion users see instant transitions (no spring physics)
- [ ] **Accessibility**: All interactive elements have minimum 48px touch target
- [ ] **Performance**: Dashboard initial load IndexedDB reads < 500ms on mobile
- [ ] **React Compiler**: `npx eslint src/` passes with zero violations after every phase

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Partial language mode migration | HIGH | Must complete the migration -- partial is worse than none |
| Stale session resume crash | LOW | Add version check + discard with user message |
| Broken interview phase machine | MEDIUM | Revert TTS changes, re-implement with consolidated hook |
| React Compiler violations | LOW | Follow established patterns, add eslint-disable with justification |
| Broken navigation lock | LOW | Restore per-page lock ownership pattern |
| Flashcard pointer event leak | LOW | Add stopPropagation to new interactive elements |
| Accessibility + animation timing | MEDIUM | Add onAnimationComplete-gated focus/announcements |
| IndexedDB waterfall | LOW | Wrap in Promise.all, add loading context |
| BilingualText cascade | HIGH | Keep changes in context, not in component signature |

---

## Sources

**Language Mode & i18n:**
- [Implementing Internationalization in React Components (2026)](https://thelinuxcode.com/implementing-internationalization-in-react-components-2026-a-practical-component-first-guide/) - Component-first i18n (MEDIUM confidence)
- [Making React Apps Multilingual Without Rewriting](https://ainativedev.io/news/making-react-apps-multilingual-without-rewriting-existing-components) - Zero-refactor approaches (MEDIUM confidence)
- Codebase analysis: `LanguageContext.tsx`, `BilingualText.tsx`, 171 `showBurmese` usages across 48 files, 334 `font-myanmar` across 77 files (HIGH confidence)

**IndexedDB & Session Persistence:**
- [IndexedDB Best Practices for App State - web.dev](https://web.dev/articles/indexeddb-best-practices-app-state) - Official Google guide (HIGH confidence)
- [IndexedDB Pain Points - GitHub Gist](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) - Comprehensive bug catalog (HIGH confidence)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb) - Library documentation (HIGH confidence)
- Codebase analysis: 8 separate IndexedDB stores via `createStore()` (HIGH confidence)

**Web Speech API TTS:**
- [Taming the Web Speech API - Andrea Giammarchi](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1) - Cross-browser pitfalls (MEDIUM confidence)
- [Lessons Learned Using speechSynthesis](https://talkrapp.com/speechSynthesis.html) - Production experience report (MEDIUM confidence)
- [easy-speech Library](https://github.com/leaonline/easy-speech) - Cross-browser TTS wrapper with documented pitfalls (MEDIUM confidence)
- Codebase analysis: `useInterviewTTS.ts`, `useSpeechSynthesis.ts` duplicate voice logic (HIGH confidence)

**Animation & Accessibility:**
- [Motion Accessibility Guide](https://motion.dev/docs/react-accessibility) - Official motion/react accessibility docs (HIGH confidence)
- [Framer Motion Accessibility Guide](https://www.framer.com/motion/guide-accessibility/) - ReducedMotion implementation (HIGH confidence)
- [ARIA Attributes for Animated Elements](https://app.studyraid.com/en/read/7850/206081/aria-attributes-for-animated-elements) - Screen reader + animation coordination (MEDIUM confidence)

**React Compiler:**
- [React Compiler v1.0 Blog Post](https://react.dev/blog/2025/10/07/react-compiler-1) - Official rules (HIGH confidence)
- [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks) - Official lint rules (HIGH confidence)
- MEMORY.md documented pitfalls: set-state-in-effect, refs, useMemo generics (HIGH confidence)

**Stale State & Session Resume:**
- [Avoiding Async State Manager Pitfalls - Evil Martians](https://evilmartians.com/chronicles/how-to-avoid-tricky-async-state-manager-pitfalls-react) - State synchronization patterns (MEDIUM confidence)
- [React State Persistence - UXPin](https://www.uxpin.com/studio/blog/how-to-use-react-for-state-persistence/) - Persistence strategies (MEDIUM confidence)

---

*Pitfalls research for: Civic Test Prep 2025 v2.1 Quality & Polish*
*Researched: 2026-02-13*
*Previous version: v2.0 pitfalls in .planning/research/PITFALLS.md (archived)*
