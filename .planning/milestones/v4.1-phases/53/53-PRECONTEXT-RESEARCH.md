# Phase 53: Component Decomposition — Precontext Research

## 1. Resolved Assumptions

### Technical Approach
- **State machine pattern**: `useReducer` (not useState). Mirrors proven `quizReducer.ts` and `sortReducer.ts` patterns — phase-guarded actions, pure reducer, independently testable
- **Sub-component strategy**: Extract 4 mid-level containers (InterviewHeader, InterviewChatArea, InterviewRecordingArea, QuitConfirmationDialog) + 1 hook (useInterviewStateMachine)
- **Data flow**: Props only; NO new InterviewContext. Matches TestPage/InterviewPage convention; avoids adding to 10-deep provider hierarchy
- **Audio player ownership**: Players live in hook via lazy getters; cleanup in component unmount effect
- **Session save**: Stays in component (I/O concern), not hook (logic concern)
- **Error boundary**: Single wrapping at parent (InterviewSession) via existing `withSessionErrorBoundary` HOC — no sub-component wrapping

### Scope Boundaries
**IN:**
- InterviewSession.tsx decomposition (1474 lines → <400 parent + <200 children)
- useInterviewStateMachine hook extraction with useReducer
- interviewStateMachine.ts reducer/types module in src/lib/interview/
- Unit tests for reducer (pure function tests)
- QuestionPhase type relocation to src/lib/interview/interviewStateMachine.ts

**OUT:**
- No new Context providers
- No changes to provider hierarchy
- No changes to existing sub-components (ExaminerCharacter, ChatBubble, etc.)
- No changes to E2E tests (they validate after decomposition)
- No changes to audio infrastructure (audioPlayer.ts, audioPrecache.ts)
- No changes to InterviewPage.tsx state machine (setup→countdown→session→results)

### Implementation Order
1. Create `src/lib/interview/interviewStateMachine.ts` (reducer + types + factory)
2. Create `src/hooks/useInterviewStateMachine.ts` (hook wrapping reducer)
3. Extract `InterviewHeader.tsx` sub-component
4. Extract `InterviewChatArea.tsx` sub-component
5. Extract `InterviewRecordingArea.tsx` sub-component
6. Extract `QuitConfirmationDialog.tsx` sub-component
7. Slim InterviewSession.tsx to orchestrator (<400 lines)
8. Unit tests for reducer
9. Verify all E2E tests pass

---

## 2. Realistic Data/Scale Analysis

| Metric | Current | Target |
|--------|---------|--------|
| InterviewSession.tsx lines | 1474 | <400 |
| Sub-component count | 21 imported | 25 imported (4 new) |
| useState hooks in IST | 18 | ~5 (remaining UI state) |
| useRef hooks in IST | 9 | ~3 (remaining cleanup refs) |
| useEffect hooks in IST | 12+ | ~4 (phase effects delegated) |
| Constants | 9 (MAX_REPLAYS, etc.) | Moved to interviewStateMachine.ts |
| Handler callbacks | 16 | Split between hook dispatch + component handlers |
| Unit tests (new) | 0 | ~20-30 reducer tests |
| E2E tests (existing) | 2 | 2 (must pass unchanged) |

---

## 3. Cross-Phase Contract Inventory

### From Phase 48 (Test Infrastructure)
- `renderWithProviders` utility with 3 presets (minimal/core/full) — USE for new tests
- PROVIDER_ORDER array enforces ordering — DO NOT modify
- 26 per-file coverage thresholds on src/lib/ — ADD threshold for new interviewStateMachine.ts
- Global 40% coverage floor — DO NOT lower
- Mock patterns: Supabase, IndexedDB, localStorage, matchMedia, speechSynthesis

### From Phase 49 (Error Handling)
- `withSessionErrorBoundary` HOC wraps InterviewSession — DO NOT remove or bypass
- HOC calls `setLock(false)` on error to release navigation lock
- Session components get page-level AND component-level boundaries (defense-in-depth)
- Error boundaries do NOT re-save sessions (rely on existing 5s auto-save)
- `captureError()` for Sentry reporting — USE in new code
- `sanitizeError()` for user-facing messages — USE if needed

### From Phase 50 (PWA + Sync)
- SW update toast deferred during active session via dual-lock check
- `isLocked` (NavigationProvider) AND `history.state.interviewGuard` both checked
- Per-field LWW settings sync — TTS settings changes must call `setFieldTimestamp()`
- IndexedDB cache versioning per-store (STORAGE_VERSIONS)

### From Phase 51 (Unit Tests)
- All 8 context providers have unit tests (94 tests)
- Per-file coverage thresholds added WITH test files — follow same pattern
- `renderWithProviders` "core" preset used in 78% of tests

### From Phase 52 (E2E + Accessibility)
- 7 Playwright E2E tests cover critical flows (interview is TEST-08)
- Interview E2E tests: practice text input + keyword feedback
- 44px min touch targets verified across all components
- Glass-morphism dark mode opacity 0.45 for WCAG AA contrast
- axe-core scans on interview page (structural verified)

### Feeds Into (Future)
- Phase 53 is the LAST phase of v4.1
- No v5.0 roadmapped yet
- Decomposition becomes maintenance foundation for future interview changes

---

## 4. InterviewSession Deep Analysis

### Current Architecture (1474 lines)

**Lines 1-58:** Imports (21 sub-components, 9 hooks, 6 audio utils, 5 interview libs)
**Lines 60-82:** 9 constants (MAX_REPLAYS, PASS_THRESHOLD, etc.)
**Lines 84-113:** Types (QuestionPhase union, ChatMessage interface, local types)
**Lines 115-144:** InterviewSessionProps interface (13 props including resume data)
**Lines 177-254:** 18 useState + 2 useMemo + computed values
**Lines 249-323:** 9 useRef declarations
**Lines 365-495:** Effects (auto-scroll, speech restart, cleanup, greeting, chime, typing, reading)
**Lines 497-945:** Phase handlers (greeting 497-528, chime 530-542, typing 544-555, reading 557-618, feedback 866-945)
**Lines 621-1056:** 16 handler callbacks (submit, timer, toggle, save, check, advance, grade, quit, etc.)
**Lines 1071-1472:** Rendering JSX (~400 lines)

### 9-Phase State Machine

```
greeting → chime → typing → reading → responding → transcription → grading → feedback → transition
  (once)    (per Q)  (per Q)  (per Q)   (per Q)       (per Q)       (per Q)   (per Q)     (per Q)
```

**Phase transitions driven by:** useEffect dependencies on `questionPhase` + `currentIndex`

### Audio System (3 player instances)
- `englishPlayerRef` — English question MP3 (pre-generated)
- `burmesePlayerRef` — Burmese answer MP3 (pre-generated)
- `interviewPlayerRef` — Greetings, feedback, closings (pre-generated)
- Global registry (`_playerRegistry`) ensures mutual exclusion
- `cancelAllPlayers()` called before each play

### Recording/Transcription Chain
```
requestPermission() → startRecording() + startListening()
  → useSilenceDetection(stream, 2000ms)
  → onSilence → stopRecording() + stopListening()
  → transcript → TranscriptionReview → confirm/re-record (max 3)
  → gradeAnswer(transcript, expectedAnswers, threshold=0.35)
```

### Practice vs Realistic Mode Differences

| Aspect | Practice | Realistic |
|--------|----------|-----------|
| Progress bar | Colored segments | Monochrome |
| Score | Visible | Hidden |
| Feedback | Detailed + keywords | Neutral ack |
| Timer | None | 15s per question |
| Burmese audio | If Myanmar mode | Never |
| Exit | Quit button | Long-press only |
| Early termination | Never | 12 correct OR 9 incorrect |
| Speed | User-configurable | Always normal |

---

## 5. Gotcha Inventory

### CRITICAL

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|------------|
| G-01 | AnimatePresence boundary in chat area MUST NOT move or split | Keep single AnimatePresence wrapping message list in InterviewChatArea; pass chatMessages as prop | Wave2 Animation agent | HIGH |
| G-02 | Audio player registry mutual exclusion spans all 3 players | Keep all player refs in hook; cancelAllPlayers() before each play() | Wave2 Core Domain agent | HIGH |
| G-03 | TTS engine null → throw, not silent return | Hook's greeting/reading effects must handle throw from speak(); advance on error with 0ms delay | Wave2 Learnings agent; git history dab1de0 | HIGH |
| G-04 | Timer ref separation prevents cleanup race conditions | Keep `transitionTimerRef` AND `advanceTimerRef` as separate refs; one effect's cleanup must not cancel the other's | Wave2 Animation agent | HIGH |
| G-05 | State snapshot atomicity on session save | Hook returns state object; component serializes atomically; no fragmented saves across extracted hooks | Wave1 Prior Phase agent | HIGH |
| G-06 | Provider ordering immutable — AuthProvider above Language/Theme/TTS | No provider changes during decomposition; ProviderOrderGuard validates in dev | Wave1 Prior Phase agent | HIGH |

### HIGH

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|------------|
| G-07 | Speech recognition ref stability on re-render | Keep speech hook in component (not extracted sub-component); pass transcript + callbacks as props down | Wave1 Learnings agent | HIGH |
| G-08 | Silence detection requires MediaStream from recorder hook | Both hooks must be called at same component level; stream passed to useSilenceDetection | Wave2 Core Domain agent | HIGH |
| G-09 | Burmese audio cancel-retry zombie | Set cancelledFlag when cancelling; retry-on-error checks flag before restarting | Wave2 Learnings agent | HIGH |
| G-10 | Myanmar text min 12px + line-height 1.6 + no letter-spacing | Audit all extracted components for font-myanmar class; 3-pass sweep | Wave2 Learnings agent | HIGH |
| G-11 | ExaminerCharacter state changes are CSS class swaps, not React transitions | Safe to extract; CSS keyframes scoped via inline style tag | Wave2 Animation agent | HIGH |
| G-12 | Message key stability (counter-based IDs) | Keep msgIdCounter ref in hook; keys must never change or be reused | Wave2 Animation agent | HIGH |

### MEDIUM

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|------------|
| G-13 | Reduced motion check at render time, not effect time | Call useReducedMotion() once in InterviewSession; pass as prop to subs | Wave2 Animation agent | MEDIUM |
| G-14 | CSS specificity: prismatic-border overrides position:fixed | If extracted header uses prismatic-border + fixed, verify CSS rule exists | Wave2 Learnings agent | MEDIUM |
| G-15 | Auto-scroll anchor must remain inside overflow container | chatEndRef div stays inside InterviewChatArea as last child | Wave2 Animation agent | HIGH |
| G-16 | Typing indicator is OUTSIDE AnimatePresence | Keep TypingIndicator rendering outside AnimatePresence boundary in ChatArea | Wave2 Animation agent | HIGH |
| G-17 | Audio player timeout (30s MAX_FALLBACK_MS) prevents hang | Existing pattern; no change needed during decomposition | Wave2 Core Domain agent | MEDIUM |
| G-18 | Constants (MAX_REPLAYS, PASS_THRESHOLD, etc.) must move with reducer | Export from interviewStateMachine.ts | Wave2 Gray Areas agent | HIGH |
| G-19 | QuestionPhase type validated on session restore | Add type guard: `isValidQuestionPhase(phase)` for persisted sessions | Wave1 Specs agent | MEDIUM |

---

## 6. Data Contracts

### InterviewState (new — for useReducer)
```typescript
interface InterviewState {
  questionPhase: QuestionPhase;
  currentIndex: number;
  questions: Question[];
  results: InterviewResult[];
  correctCount: number;
  incorrectCount: number;
  replaysUsed: number;
  recordAttempt: number;
  chatMessages: ChatMessage[];
  examinerState: 'idle' | 'speaking' | 'nodding' | 'listening';
  startTime: number;
  isComplete: boolean;
  endReason: InterviewEndReason | null;
}
```

### InterviewAction (new — for useReducer)
```typescript
type InterviewAction =
  | { type: 'START_GREETING' }
  | { type: 'ADVANCE_PHASE'; phase: QuestionPhase }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_EXAMINER_STATE'; state: ExaminerState }
  | { type: 'RECORD_RESULT'; result: InterviewResult }
  | { type: 'INCREMENT_REPLAY' }
  | { type: 'INCREMENT_RECORD_ATTEMPT' }
  | { type: 'RESET_QUESTION_STATE' }
  | { type: 'COMPLETE_SESSION'; reason: InterviewEndReason };
```

### Existing Contracts (IMMUTABLE)

**InterviewResult:**
```typescript
{ questionId, question, selfGrade, transcript, confidence?, matchedKeywords?, missingKeywords?, duration? }
```

**ChatMessage:**
```typescript
{ id, sender: 'examiner'|'user', text, isCorrect?, confidence?, questionId?, gradeResult? }
```

**InterviewSnapshot (session persistence):**
```typescript
{ type: 'interview', questions, results, currentIndex, correctCount, incorrectCount, mode, startTime }
```

**GradeResult:**
```typescript
{ isCorrect, confidence, matchedKeywords, missingKeywords, bestMatchAnswer }
```

---

## 7. Design Compliance Matrix

| Principle | Status | Evidence |
|-----------|--------|----------|
| 44px min touch targets | VERIFIED | Phase 52 audit; all interview buttons ≥44px |
| Glass-morphism contrast | VERIFIED | Dark mode opacity 0.45 → ~5.2:1 AA |
| Myanmar font rendering | VERIFIED | font-myanmar class on all Burmese text |
| Reduced motion | VERIFIED | useReducedMotion gates all animations |
| Bilingual text | VERIFIED | All user-facing text has en/my pairs |
| Error sanitization | VERIFIED | sanitizeError() before display; captureError() to Sentry |
| Provider ordering | VERIFIED | ProviderOrderGuard validates in dev mode |
| Session persistence | VERIFIED | 5s auto-save; 24h expiry; version check |

---

## 8. Ethical Framework Compliance

- **PII sanitization**: No changes to errorSanitizer.ts; all error paths maintained
- **Bilingual accessibility**: No user-facing text changes; all subs receive bilingual props
- **Privacy-first**: No new data collection; existing session persistence unchanged
- **Anxiety-reducing**: No UX tone changes; feedback patterns preserved exactly

---

## 9. Architectural Decisions

### Decision 1: useReducer over useState
- **Options**: (A) Keep useState pattern, (B) useReducer with phase guards, (C) XState/state machine library
- **Chosen**: (B) useReducer
- **Rationale**: Proven project pattern (quizReducer, sortReducer); pure function testability; no external dependency; phase guards prevent invalid transitions

### Decision 2: Props over Context
- **Options**: (A) Props drilling, (B) New InterviewContext, (C) Zustand store
- **Chosen**: (A) Props
- **Rationale**: Only 4 sub-components with 1 level of nesting; 10-deep provider hierarchy can't absorb another; TestPage convention; simpler testing

### Decision 3: 4 sub-components (not more, not fewer)
- **Options**: (A) 2 large subs, (B) 4 focused subs, (C) 6+ granular subs
- **Chosen**: (B) 4 focused subs
- **Rationale**: Meets <200 line target per sub; natural JSX region boundaries; keeps orchestrator under 400 lines; avoids over-extraction

### Decision 4: Reducer in src/lib/interview/ (not src/hooks/)
- **Options**: (A) Inline in hook file, (B) Separate src/lib/interview/ module
- **Chosen**: (B) Separate module
- **Rationale**: Mirrors quizReducer/sortReducer location pattern; enables pure function tests without hook wrapper; clean separation of logic from React

---

## 10. File Map

### CREATE
| File | Purpose | Size |
|------|---------|------|
| `src/lib/interview/interviewStateMachine.ts` | Reducer, types, factory, constants | ~200 lines |
| `src/hooks/useInterviewStateMachine.ts` | Hook wrapper for reducer + audio getters | ~80 lines |
| `src/components/interview/InterviewHeader.tsx` | Timer, progress, exit, mode badge | <150 lines |
| `src/components/interview/InterviewChatArea.tsx` | Messages, typing, transcription, highlights | <180 lines |
| `src/components/interview/InterviewRecordingArea.tsx` | Waveform, controls, input toggle | <160 lines |
| `src/components/interview/QuitConfirmationDialog.tsx` | Exit confirmation dialog | <80 lines |
| `src/__tests__/lib/interviewStateMachine.test.ts` | Pure reducer unit tests | ~150 lines |

### MODIFY
| File | Change |
|------|--------|
| `src/components/interview/InterviewSession.tsx` | Slim to orchestrator (<400 lines); import new subs + hook |

### READ (no changes)
| File | Reason |
|------|--------|
| `src/lib/interview/answerGrader.ts` | gradeAnswer() contract |
| `src/lib/interview/interviewGreetings.ts` | Greeting data |
| `src/lib/interview/interviewFeedback.ts` | Feedback phrases |
| `src/lib/interview/audioChime.ts` | Chime sound |
| `src/lib/interview/interviewStore.ts` | Session persistence |
| `src/lib/audio/audioPlayer.ts` | Player registry |
| `src/hooks/useInterviewGuard.ts` | Navigation guard |
| `src/hooks/useOrientationLock.ts` | Portrait lock |
| `src/hooks/useVisibilityPause.ts` | Tab backgrounding |
| `src/hooks/useSilenceDetection.ts` | Silence auto-stop |
| `src/hooks/useAudioRecorder.ts` | Recording |
| `src/hooks/useSpeechRecognition.ts` | Speech API |
| `e2e/interview.spec.ts` | E2E validation |

### REUSE
| File | What |
|------|------|
| `src/lib/quiz/quizReducer.ts` | Pattern reference for phase-guarded reducer |
| `src/lib/quiz/quizTypes.ts` | Pattern reference for state/action types |
| `src/__tests__/utils/renderWithProviders.tsx` | Test utility for component tests |

---

## 11. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence |
|---|-----------|-----------|------------|
| 1 | useReducer vs useState | useReducer — matches quizReducer/sortReducer precedent | HIGH |
| 2 | Sub-component boundaries | 4 containers: Header, ChatArea, RecordingArea, QuitDialog | HIGH |
| 3 | Audio player ownership | Hook with lazy getters; component cleanup | HIGH |
| 4 | Props vs Context | Props only; no new providers | HIGH |
| 5 | File organization | Reducer in lib/interview/; hook in hooks/; subs in components/interview/ | HIGH |
| 6 | Test strategy | Pure reducer tests + existing E2E | HIGH |
| 7 | QuestionPhase location | src/lib/interview/interviewStateMachine.ts | HIGH |
| 8 | Error boundary scope | Parent only; no sub-component wrapping | HIGH |
| 9 | Session save ownership | Component, not hook | HIGH |
| 10 | v4.1 completion | Phase 53 is final; no v5.0 roadmapped | HIGH |

---

## 12. Animation/Ceremony Patterns

### AnimatePresence Contract
- Single AnimatePresence wraps message list in chat area
- Message keys: counter-based (`msg-1`, `msg-2`), NEVER reused
- Entry: `{ opacity: 0, y: 8, scale: 0.95 }` → `{ opacity: 1, y: 0, scale: 1 }` with SPRING_GENTLE
- TypingIndicator, TranscriptionReview, SelfGradeButtons: OUTSIDE AnimatePresence
- Scroll anchor (chatEndRef): INSIDE overflow container after last message

### ExaminerCharacter States
- 4 CSS-class-driven states: idle, speaking, nodding, listening
- CSS keyframes scoped via inline `<style>` tag (safe to extract)
- Nodding uses `forwards` (single cycle); breathing/speaking infinite
- Reduced motion: force 'idle' state

### Timing Constants
| Phase | Duration | Mechanism |
|-------|----------|-----------|
| Greeting audio | ~800ms + delay | setTimeout via transitionTimerRef |
| Chime | 200ms | setTimeout |
| Typing indicator | 1200ms | TYPING_INDICATOR_MS constant |
| Reading | Audio duration | Player onended event |
| Responding | Manual/15s timer | User action or REALISTIC_TIMER_SECONDS |
| Feedback nod | 600ms | CSS animation forwards |
| Transition delay | 1500ms | TRANSITION_DELAY_MS via advanceTimerRef |

### Cleanup Pattern
```typescript
// Component unmount (lines 482-495):
cleanupRecorder();
englishPlayerRef.current?.cancel();
burmesePlayerRef.current?.cancel();
interviewPlayerRef.current?.cancel();
clearTimeout(transitionTimerRef.current);
clearTimeout(advanceTimerRef.current);
```

---

## 13. Core Domain Architecture

### Answer Grading Pipeline
```
transcript → normalize(text) → extractKeywords() → match against expectedAnswers
  → GradeResult { isCorrect, confidence, matchedKeywords, missingKeywords }
```
- Threshold: 0.35 (lenient for speech recognition noise)
- Synonym expansion + stem matching (strip -ing/-ed/-ies/-ly/-es/-s)
- Pure function; no side effects

### Audio Playback Architecture
```
unlockAudioSession() [user gesture, called at Start button]
  → createAudioPlayer() [3 instances: english, burmese, interview]
  → player.play(url, rate) [calls cancelAllPlayers() first]
  → onended/onerror → state notification → phase advance
  → player.destroy() [deregister from registry on unmount]
```
- Global registry prevents overlapping audio
- Retry once on load/network error (unless cancelled flag set)
- 30s MAX_FALLBACK_MS timeout as safety net

### Session Persistence
```
InterviewSnapshot → saveSession(snapshot) [IndexedDB, 1-per-type]
  → syncInterviewSession(session, userId) [Supabase, fire-and-forget]
```
- SESSION_VERSION = 1; auto-delete on version mismatch
- 24-hour expiry; garbage collected on startup
- Interview sessions do NOT auto-save via error boundaries (rely on 5s interval)

---

## 14. Expanded Gotcha Inventory (Wave 2 Merged)

### From Git History Analysis
| ID | Bug Found | Fix Applied | Phase 53 Risk |
|----|-----------|-------------|---------------|
| GH-01 | Greeting race condition: TTS null engine → silent advance | Throw on null; force error handling | If hook's greeting effect doesn't handle throw → greeting skips |
| GH-02 | TTS failure hanging interview indefinitely | Always advance (0ms on error, 800ms on success) | If reducer doesn't have error → advance path → hangs |
| GH-03 | Audio playback codec stall | 30s timeout fallback | No change needed; audioPlayer.ts handles this |
| GH-04 | WAAPI 3+ keyframe arrays breaking in browsers | Use 2-frame initial/animate pairs | ChatBubble already uses 2-frame; safe |
| GH-05 | Scroll-on-focus page jump after TTS | preventScroll flag on focus() | If ChatArea calls focus() without flag → jumps |

### From Design Token Audit
| ID | Gap | Severity | Impact |
|----|-----|----------|--------|
| DT-01 | Interview bypasses semantic color tokens (uses hardcoded slate-*) | LOW | No change during decomposition; existing behavior preserved |
| DT-02 | Glass classes not used (custom bg-slate-900/80) | LOW | No change during decomposition |
| DT-03 | amber-400/700 not in tailwind config (Tailwind defaults) | LOW | Stable; no action needed |

---

## 15. Design Token Audit Results

### Matches (No Action)
- Typography scale: text-caption through text-4xl used correctly
- font-myanmar: 40+ usages verified for Burmese text
- Spacing: Standard Tailwind 4px grid
- Border radius: rounded-full/xl/2xl/lg per component type
- Touch targets: min-h-[44px] on all interactive elements
- Opacity utilities: Standard Tailwind /5 through /95

### Gaps (Document Only — No Action During Decomposition)
- Interview uses hardcoded dark theme (bg-slate-900/80) instead of semantic --color-* tokens
- Glass-morphism: custom dark glass effects instead of .glass-* system classes
- amber-400/700, red-400: Tailwind defaults only (not in project config)

### Extraction Safe
- All Tailwind utilities used in interview are standard or extended in config
- No interview-specific CSS files that would need splitting
- Spring physics via motion/react (not CSS custom properties) — safe to extract

---

*Research completed: 2026-03-21*
*12 parallel agents across 2 waves*
*All assumptions resolved to HIGH confidence*
