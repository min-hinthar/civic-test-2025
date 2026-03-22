# Phase 53: Component Decomposition - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

InterviewSession.tsx (1474 lines) decomposed into state machine hook + rendering sub-components. Parent <400 lines, children <200 lines each. Full E2E safety net from Phase 52 validates no regressions. This is the final phase of v4.1.

</domain>

<decisions>
## Implementation Decisions

### State Management Architecture
- **D-01:** useReducer with phase-guarded transitions — matches quizReducer.ts and sortReducer.ts project patterns
- **D-02:** 9-phase state machine (greeting→chime→typing→reading→responding→transcription→grading→feedback→transition) encoded as reducer with `isValidTransition()` guard
- **D-03:** Invalid actions return state unchanged (no-op) — prevents race conditions between effects
- **D-04:** Exhaustive switch with `never` assertion on default case catches unhandled actions at compile time

### Sub-Component Boundaries
- **D-05:** 4 extracted containers: InterviewHeader, InterviewChatArea, InterviewRecordingArea, QuitConfirmationDialog
- **D-06:** Props-only data flow — no new Context provider. Only 1 level of nesting; 10-deep provider hierarchy cannot absorb another
- **D-07:** Single AnimatePresence stays in InterviewChatArea; TypingIndicator, TranscriptionReview, SelfGradeButtons rendered OUTSIDE AnimatePresence boundary
- **D-08:** chatEndRef (auto-scroll anchor) stays inside InterviewChatArea overflow container as last child

### File Organization
- **D-09:** Reducer + types + factory + constants in `src/lib/interview/interviewStateMachine.ts` (~200 lines)
- **D-10:** Hook wrapper in `src/hooks/useInterviewStateMachine.ts` (~80 lines) — wraps reducer, provides audio lazy getters, message ID generation
- **D-11:** Sub-components in `src/components/interview/` alongside existing interview components (InterviewHeader.tsx, InterviewChatArea.tsx, InterviewRecordingArea.tsx, QuitConfirmationDialog.tsx)
- **D-12:** Pure reducer tests in `src/__tests__/lib/interviewStateMachine.test.ts` (~20-30 tests)
- **D-13:** Per-file coverage threshold on interviewStateMachine.ts added simultaneously with tests (Phase 48 contract)

### Audio & Recording Ownership
- **D-14:** Audio player refs (english, burmese, interview) live in hook via lazy getters; component handles cleanup on unmount
- **D-15:** Speech recognition hook stays in InterviewSession component (not extracted sub-component) — ref stability on re-render. Transcript + callbacks passed as props down
- **D-16:** useSilenceDetection and useAudioRecorder called at same component level — stream passed to silence detection

### Error & Session Handling
- **D-17:** Error boundary stays on parent (InterviewSession) via existing withSessionErrorBoundary HOC — no sub-component wrapping
- **D-18:** Session save stays in component (I/O concern), not hook (logic concern). Hook returns atomic state object for consistent snapshots
- **D-19:** `getSessionSnapshot(state, mode)` pure helper for atomic persistence — eliminates fragmented reads across multiple useState

### Test Strategy
- **D-20:** Pure reducer unit tests are primary verification — no React, no providers, no mocking needed
- **D-21:** Existing E2E tests (interview.spec.ts) must pass unchanged after decomposition — serves as integration regression gate
- **D-22:** No new E2E tests added — decomposition is invisible to users

### Constants & Types
- **D-23:** All 9 constants (MAX_REPLAYS, PASS_THRESHOLD, FAIL_THRESHOLD, QUESTIONS_PER_SESSION, TYPING_INDICATOR_MS, TRANSITION_DELAY_MS, REALISTIC_TIMER_SECONDS, RATE_MAP, MAX_RECORD_ATTEMPTS) exported from interviewStateMachine.ts
- **D-24:** QuestionPhase type relocates to interviewStateMachine.ts with `isValidQuestionPhase()` type guard for session restore
- **D-25:** ChatMessage ID generation via hook-level ref counter — survives error boundary re-wrapping (G-12)

### Claude's Discretion
- Exact InterviewState/InterviewAction field details (precontext provides initial design)
- Phase transition validation matrix (which transitions are valid)
- Exact prop interfaces for each sub-component
- Whether to add dev-mode reducer action logging
- Animation variant extraction to named constants
- JSDoc level on new types

</decisions>

<specifics>
## Specific Ideas

- Reducer pattern mirrors quizReducer.ts (lines 103-104 phase guards) — familiar to anyone who's read the codebase
- Timer ref separation (transitionTimerRef AND advanceTimerRef) must survive decomposition — one effect's cleanup must not cancel the other's (G-04)
- Burmese audio cancel-retry zombie prevention: cancelledFlag checked before restart (G-09)
- useReducedMotion() called once in InterviewSession parent, passed as prop to subs (G-13)
- Practice vs Realistic mode differences (8 behavioral axes) encoded in reducer config, not scattered across components

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 53 precontext research
- `.planning/phases/53/53-PRECONTEXT-RESEARCH.md` — Full 15-section research: architecture analysis, gotcha inventory (19 items), data contracts, animation patterns, design compliance matrix, file map
- `.planning/phases/53/53-ENHANCEMENT-RECOMMENDATIONS.md` — 12 ranked recommendations with implementation hints (4 MUST-HAVE, 4 SHOULD-HAVE, 4 NICE-TO-HAVE)

### Target file
- `src/components/interview/InterviewSession.tsx` — 1474-line monolith to decompose. Lines 60-82 constants, 84-113 types, 177-254 state, 365-495 effects, 497-945 phase handlers, 621-1056 callbacks, 1071-1472 JSX

### Reducer pattern precedents
- `src/lib/quiz/quizReducer.ts` — Phase-guarded reducer pattern to follow (lines 103-104 guards)
- `src/lib/quiz/quizTypes.ts` — State/action type organization pattern
- `src/lib/flashcard/sortReducer.ts` — Alternative reducer pattern reference

### Audio infrastructure (READ ONLY — no changes)
- `src/lib/audio/audioPlayer.ts` — Player registry, mutual exclusion, lazy creation, 30s timeout
- `src/lib/interview/audioChime.ts` — Chime sound generation
- `src/lib/interview/interviewGreetings.ts` — Greeting phrases and audio URLs
- `src/lib/interview/interviewFeedback.ts` — Feedback phrases per mode

### Hook contracts (READ ONLY — no changes)
- `src/hooks/useAudioRecorder.ts` — Recording start/stop, MediaStream
- `src/hooks/useSpeechRecognition.ts` — Speech API wrapper, transcript
- `src/hooks/useSilenceDetection.ts` — Silence auto-stop from MediaStream
- `src/hooks/useInterviewGuard.ts` — Navigation lock during session
- `src/hooks/useOrientationLock.ts` — Portrait lock
- `src/hooks/useVisibilityPause.ts` — Tab backgrounding auto-pause

### E2E safety net
- `e2e/interview.spec.ts` — E2E interview test (Phase 52). Must pass unchanged after decomposition

### Phase contracts consumed
- `src/__tests__/utils/renderWithProviders.tsx` — Phase 48 test utility
- `vitest.config.ts` — Per-file coverage thresholds (add new one for interviewStateMachine.ts)
- `src/components/shared/ErrorBoundary.tsx` — Phase 49 withSessionErrorBoundary HOC

### Requirements
- `.planning/REQUIREMENTS.md` — ARCH-04, ARCH-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `quizReducer.ts`: Phase-guarded reducer with pure function tests — exact pattern to replicate
- `renderWithProviders` (Phase 48): Use "core" preset for any component tests
- `withSessionErrorBoundary` HOC (Phase 49): Already wraps InterviewSession — no changes needed
- 20 existing interview sub-components (ExaminerCharacter, ChatBubble, etc.): All stay unchanged

### Established Patterns
- Reducer in `src/lib/` + types co-located: quizReducer.ts, sortReducer.ts
- Hook in `src/hooks/` wrapping reducer: useQuiz wraps quizReducer
- Sub-components receive props, not context: TestPage convention
- Per-file coverage thresholds added WITH tests (Phase 48/51 pattern)
- `captureError()` for Sentry, `sanitizeError()` for user-facing (Phase 49)

### Integration Points
- `InterviewSession.tsx`: Slim from 1474 to <400 lines; import new hook + 4 sub-components
- `src/lib/interview/interviewStateMachine.ts`: New file — reducer, types, constants, factory
- `src/hooks/useInterviewStateMachine.ts`: New file — hook wrapping reducer
- `vitest.config.ts`: Add per-file threshold for interviewStateMachine.ts
- `e2e/interview.spec.ts`: Run unchanged as regression gate

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Phase 53 is the final v4.1 phase.

</deferred>

---

*Phase: 53-component-decomposition*
*Context gathered: 2026-03-21*
