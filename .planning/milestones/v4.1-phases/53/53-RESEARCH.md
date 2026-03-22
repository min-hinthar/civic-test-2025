# Phase 53: Component Decomposition - Research

**Researched:** 2026-03-21
**Domain:** React useReducer state machine + monolithic component decomposition
**Confidence:** HIGH

## Summary

Phase 53 decomposes InterviewSession.tsx (1474 lines) into a useReducer-based state machine hook + 4 rendering sub-components. This is a pure refactoring phase -- no new features, no visual changes, no library additions. The project already has two proven reducer patterns (quizReducer.ts, sortReducer.ts) and comprehensive test infrastructure (Vitest 4.x, sortReducer.test.ts as template).

The primary risk is breaking the 9-phase interview flow during extraction. The precontext research (53-PRECONTEXT-RESEARCH.md) already identified 19 gotchas at HIGH/MEDIUM confidence. This research validates those findings, adds implementation-level prescriptions, and maps requirements to test strategies.

**Primary recommendation:** Follow the exact quizReducer/sortReducer pattern (phase-guarded switch, pure function, factory + config). Test the reducer exhaustively as a pure function (no React, no providers). Extract sub-components last, after the reducer and hook are proven stable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: useReducer with phase-guarded transitions -- matches quizReducer.ts and sortReducer.ts project patterns
- D-02: 9-phase state machine (greeting->chime->typing->reading->responding->transcription->grading->feedback->transition) encoded as reducer with `isValidTransition()` guard
- D-03: Invalid actions return state unchanged (no-op) -- prevents race conditions between effects
- D-04: Exhaustive switch with `never` assertion on default case catches unhandled actions at compile time
- D-05: 4 extracted containers: InterviewHeader, InterviewChatArea, InterviewRecordingArea, QuitConfirmationDialog
- D-06: Props-only data flow -- no new Context provider. Only 1 level of nesting; 10-deep provider hierarchy cannot absorb another
- D-07: Single AnimatePresence stays in InterviewChatArea; TypingIndicator, TranscriptionReview, SelfGradeButtons rendered OUTSIDE AnimatePresence boundary
- D-08: chatEndRef (auto-scroll anchor) stays inside InterviewChatArea overflow container as last child
- D-09: Reducer + types + factory + constants in `src/lib/interview/interviewStateMachine.ts` (~200 lines)
- D-10: Hook wrapper in `src/hooks/useInterviewStateMachine.ts` (~80 lines) -- wraps reducer, provides audio lazy getters, message ID generation
- D-11: Sub-components in `src/components/interview/` alongside existing interview components
- D-12: Pure reducer tests in `src/__tests__/lib/interviewStateMachine.test.ts` (~20-30 tests)
- D-13: Per-file coverage threshold on interviewStateMachine.ts added simultaneously with tests (Phase 48 contract)
- D-14: Audio player refs (english, burmese, interview) live in hook via lazy getters; component handles cleanup on unmount
- D-15: Speech recognition hook stays in InterviewSession component (not extracted sub-component) -- ref stability on re-render. Transcript + callbacks passed as props down
- D-16: useSilenceDetection and useAudioRecorder called at same component level -- stream passed to silence detection
- D-17: Error boundary stays on parent (InterviewSession) via existing withSessionErrorBoundary HOC -- no sub-component wrapping
- D-18: Session save stays in component (I/O concern), not hook (logic concern). Hook returns atomic state object for consistent snapshots
- D-19: `getSessionSnapshot(state, mode)` pure helper for atomic persistence
- D-20: Pure reducer unit tests are primary verification -- no React, no providers, no mocking needed
- D-21: Existing E2E tests (interview.spec.ts) must pass unchanged after decomposition
- D-22: No new E2E tests added -- decomposition is invisible to users
- D-23: All 9 constants exported from interviewStateMachine.ts
- D-24: QuestionPhase type relocates to interviewStateMachine.ts with `isValidQuestionPhase()` type guard
- D-25: ChatMessage ID generation via hook-level ref counter

### Claude's Discretion
- Exact InterviewState/InterviewAction field details (precontext provides initial design)
- Phase transition validation matrix (which transitions are valid)
- Exact prop interfaces for each sub-component
- Whether to add dev-mode reducer action logging
- Animation variant extraction to named constants
- JSDoc level on new types

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope. Phase 53 is the final v4.1 phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-04 | InterviewSession.tsx decomposed into sub-components (<400 line parent, <200 line children) | Architecture Patterns section: 4 sub-component extraction with prop interfaces; File Map from precontext; line budget enforcement via verification |
| ARCH-05 | `useInterviewStateMachine` hook extracted for shared interview state | Standard Stack section: reducer + hook pattern matching quizReducer/sortReducer; Code Examples section: reducer factory, phase guards, hook wrapper |
</phase_requirements>

## Standard Stack

### Core (NO new dependencies -- all already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | useReducer, useCallback, useRef, useMemo | Built-in state machine primitive |
| TypeScript | ~5.9.3 | Discriminated union actions, exhaustive switch, `never` assertion | Compile-time action/phase safety |
| motion | ^12.34.3 | AnimatePresence in InterviewChatArea | Existing animation library -- no changes |
| Vitest | ^4.0.18 | Pure reducer unit tests | Existing test framework |

### Supporting (existing, no changes)

| Library | Version | Purpose | When Used |
|---------|---------|---------|-----------|
| clsx | existing | Conditional classNames in sub-components | JSX extraction |
| lucide-react | existing | Icons (RotateCcw, LogOut, Mic, etc.) | Sub-component imports |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer | XState | 30KB+ bundle; overkill for 9-phase linear flow; no project precedent |
| useReducer | Multiple useState | Current pattern -- exactly what we're replacing; race conditions, untestable |
| Props drilling | New InterviewContext | Adds to 10-deep provider hierarchy; only 4 sub-components at 1 level deep |

**Installation:** None. All dependencies already in project.

## Architecture Patterns

### Recommended Project Structure (matches existing conventions)
```
src/
  lib/
    interview/
      interviewStateMachine.ts     # NEW: reducer, types, factory, constants, helpers
      answerGrader.ts              # READ ONLY
      interviewGreetings.ts        # READ ONLY
      interviewFeedback.ts         # READ ONLY
      audioChime.ts                # READ ONLY
  hooks/
    useInterviewStateMachine.ts    # NEW: hook wrapping reducer
  components/
    interview/
      InterviewSession.tsx         # MODIFY: slim to <400 lines (orchestrator)
      InterviewHeader.tsx          # NEW: <150 lines
      InterviewChatArea.tsx        # NEW: <180 lines
      InterviewRecordingArea.tsx   # NEW: <160 lines
      QuitConfirmationDialog.tsx   # NEW: <80 lines
  __tests__/
    lib/
      interviewStateMachine.test.ts  # NEW: ~20-30 pure reducer tests
```

### Pattern 1: Phase-Guarded Reducer (project convention)

**What:** Every action checks current phase before executing. Invalid actions return state unchanged.
**When to use:** Always in this project's reducers. Prevents race conditions between useEffect chains.
**Source:** quizReducer.ts (lines 102-104), sortReducer.ts (lines 93-96)

```typescript
// Pattern from quizReducer.ts -- replicate exactly
export function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'ADVANCE_PHASE': {
      if (!isValidTransition(state.questionPhase, action.phase)) return state;
      return { ...state, questionPhase: action.phase };
    }
    // ... more actions, each phase-guarded
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
```

### Pattern 2: Factory + Config Initialization (project convention)

**What:** `initialInterviewState(config)` creates initial state from config object.
**When to use:** useReducer's third argument (lazy initializer).
**Source:** `initialQuizState(config)` in quizReducer.ts, `initialSortState(config)` in sortReducer.ts

```typescript
// Factory pattern -- matches quizReducer.ts line 34
export function initialInterviewState(config: InterviewConfig): InterviewState {
  return {
    questionPhase: config.isResuming ? 'chime' : 'greeting',
    currentIndex: config.initialIndex ?? 0,
    questions: config.questions,
    results: config.initialResults ?? [],
    correctCount: config.initialCorrectCount ?? 0,
    incorrectCount: config.initialIncorrectCount ?? 0,
    // ... remaining fields
  };
}

// Hook usage:
const [state, dispatch] = useReducer(interviewReducer, config, initialInterviewState);
```

### Pattern 3: Transition Validation Matrix

**What:** Explicit allowed-transitions map for the 9-phase interview state machine.
**When to use:** In `isValidTransition()` called by `ADVANCE_PHASE` action.

```typescript
const VALID_TRANSITIONS: Record<QuestionPhase, readonly QuestionPhase[]> = {
  greeting:       ['chime'],
  chime:          ['typing'],
  typing:         ['reading'],
  reading:        ['responding'],
  responding:     ['transcription', 'grading'],  // transcription (speech) OR grading (self-grade/timer)
  transcription:  ['responding', 'grading'],     // re-record OR confirm -> grade
  grading:        ['feedback'],
  feedback:       ['transition'],
  transition:     ['chime'],                     // next question cycle
} as const;

export function isValidTransition(from: QuestionPhase, to: QuestionPhase): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### Pattern 4: Hook Wrapping Reducer (project convention)

**What:** Thin hook that wraps useReducer, provides audio player getters, message ID generation, computed values.
**When to use:** Always separate hook from reducer in this project.
**Source:** TestPage uses quizReducer via a component-level useReducer; this hook adds interview-specific concerns.

```typescript
export function useInterviewStateMachine(config: InterviewConfig) {
  const [state, dispatch] = useReducer(interviewReducer, config, initialInterviewState);

  // Audio player lazy getters (refs live here, not in component)
  const englishPlayerRef = useRef<AudioPlayer | null>(null);
  // ... two more player refs

  const getEnglishPlayer = useCallback((): AudioPlayer => {
    if (!englishPlayerRef.current) englishPlayerRef.current = createAudioPlayer();
    return englishPlayerRef.current;
  }, []);

  // Message ID counter (survives error boundary re-wrapping)
  const msgIdCounter = useRef(0);
  const getNextMessageId = useCallback(() => {
    msgIdCounter.current += 1;
    return `msg-${msgIdCounter.current}`;
  }, []);

  return {
    state,
    dispatch,
    getEnglishPlayer,
    getBurmesePlayer,
    getInterviewPlayer,
    getNextMessageId,
  };
}
```

### Pattern 5: Sub-Component Props Interface

**What:** Each sub-component receives only what it renders. No state mutation -- dispatch or callbacks from parent.
**When to use:** All 4 extracted sub-components.

```typescript
// InterviewChatArea props -- receive data + callbacks, never dispatch directly
interface InterviewChatAreaProps {
  chatMessages: ChatMessage[];
  questionPhase: QuestionPhase;
  mode: InterviewMode;
  showBurmese: boolean;
  usingTTSFallback: boolean;
  effectiveSpeed: 'slow' | 'normal' | 'fast';
  // Phase-specific rendering state
  showTranscriptionReview: boolean;
  showSelfGradeButtons: boolean;
  // Callbacks
  onTranscriptConfirm: () => void;
  onReRecord: () => void;
  onSelfGrade: (grade: 'correct' | 'incorrect') => void;
  // ... remaining props
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  shouldReduceMotion: boolean;
}
```

### Pattern 6: AnimatePresence Boundary Preservation

**What:** AnimatePresence wraps chat message list. Direct children must have unique keys. Elements rendered OUTSIDE AnimatePresence (TypingIndicator, TranscriptionReview, SelfGradeButtons) stay outside.
**When to use:** InterviewChatArea extraction. CRITICAL: do not split or move the AnimatePresence boundary.

```typescript
// In InterviewChatArea.tsx -- preserves exact boundary from InterviewSession.tsx lines 1169-1220
<div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
  <AnimatePresence>
    {chatMessages.map(msg => (
      <div key={msg.id}>
        <ChatBubble sender={msg.sender} isCorrect={msg.isCorrect}>
          {msg.text}
        </ChatBubble>
        {/* TTS badge, Burmese replay, KeywordHighlight -- all inside the keyed div */}
      </div>
    ))}
  </AnimatePresence>

  {/* OUTSIDE AnimatePresence -- per D-07 */}
  {questionPhase === 'typing' && <TypingIndicator />}
  {showTranscriptionReview && <TranscriptionReview ... />}
  {showSelfGradeButtons && <SelfGradeButtons ... />}

  <div ref={chatEndRef} />  {/* Scroll anchor INSIDE overflow container -- per D-08 */}
</div>
```

### Anti-Patterns to Avoid

- **Splitting AnimatePresence:** Never put part of the message list in one component and part in another. AnimatePresence tracks its direct children for exit animations -- splitting breaks this.
- **Dispatch in sub-components:** Sub-components receive callbacks, not the dispatch function. This prevents coupling sub-components to action types.
- **Moving speech hooks to sub-components:** useSpeechRecognition and useAudioRecorder MUST stay in InterviewSession parent (D-15, D-16). Ref stability breaks if hooks are called in extracted children that remount.
- **Timer ref sharing:** transitionTimerRef and advanceTimerRef are SEPARATE refs (G-04). One effect's cleanup must not cancel the other's timer.
- **New Context provider:** No InterviewContext. Props-only. The 10-deep provider hierarchy cannot absorb another provider.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine library | XState integration | useReducer + phase-guarded switch | Project convention; proven pattern; zero bundle impact |
| Transition validation | Ad-hoc if/else chains | VALID_TRANSITIONS lookup table | Exhaustive; self-documenting; testable as data |
| Message ID generation | Random IDs or timestamp-based | Monotonic counter ref in hook | Stable keys for AnimatePresence; survives error boundary remount |
| Component testing | renderWithProviders for reducer | Pure function tests (no React) | Reducer is pure; testing as function is simpler and faster |
| Audio player lifecycle | Manual HTMLAudioElement management | Existing createAudioPlayer() + lazy getters | Registry-based mutual exclusion already handles edge cases |
| Session snapshot | Scattered useState reads | getSessionSnapshot(state, mode) pure helper | Atomic -- single useReducer state object eliminates race |

**Key insight:** This phase creates NO new abstractions. It reorganizes existing code into the same patterns already proven in the codebase. The reducer pattern, the hook wrapper pattern, the sub-component props pattern -- all exist in quizReducer/sortReducer/TestPage.

## Common Pitfalls

### Pitfall 1: AnimatePresence Boundary Violation
**What goes wrong:** Moving AnimatePresence wrapping or its direct children into a different component tree level breaks exit animations. Messages disappear instantly instead of animating out.
**Why it happens:** AnimatePresence tracks unmounting of its direct children. If the wrapping moves to a parent or the children get wrapped in an extra div, the tracking breaks.
**How to avoid:** Keep the exact `<AnimatePresence>{chatMessages.map(...)}</AnimatePresence>` structure in InterviewChatArea. The keyed `<div key={msg.id}>` must be a direct child of AnimatePresence.
**Warning signs:** Exit animations stop working; messages "pop" out instead of fading.

### Pitfall 2: Timer Ref Cross-Cancellation
**What goes wrong:** A phase-transition effect cleanup cancels both `transitionTimerRef` and `advanceTimerRef`, preventing the next question from loading.
**Why it happens:** If both refs share a single timer variable, clearing one clears the other. The FEEDBACK effect cleanup runs when questionPhase changes, but advanceToNext's timer (on advanceTimerRef) must survive that cleanup.
**How to avoid:** Maintain two separate refs in the hook. Only clear transitionTimerRef in phase effect cleanup. advanceTimerRef is only cleared on unmount.
**Warning signs:** Interview freezes after feedback -- next question never appears.

### Pitfall 3: Speech Recognition Hook in Sub-Component
**What goes wrong:** Moving useInterviewSpeech or useAudioRecorder to InterviewRecordingArea causes the speech recognition ref to lose stability on re-render. Transcript resets mid-dictation.
**Why it happens:** When InterviewRecordingArea conditionally renders (only during 'responding' phase), the hook mounts/unmounts with the component. Speech recognition state is lost on unmount.
**How to avoid:** Keep speech/recording hooks in InterviewSession parent. Pass transcript, isListening, callbacks as props to sub-components.
**Warning signs:** Transcript is always empty; recording restarts unexpectedly.

### Pitfall 4: Stale Closure in Phase Effects
**What goes wrong:** useEffect callbacks capture stale state values because the reducer state is read inside callbacks that depend on the old useState pattern.
**Why it happens:** During migration from 18 useState hooks to useReducer, some effects may still read local state variables instead of `state.fieldName`.
**How to avoid:** After reducer migration, grep for all direct useState variable names (questionPhase, currentIndex, correctCount, etc.) and verify they now read from `state.*`. Only UI-local state (showQuitDialog, typedAnswer, interviewPaused) should remain as useState.
**Warning signs:** Effects use stale values; early termination checks wrong counts; progress shows wrong index.

### Pitfall 5: Session Save Reads Stale Reducer State
**What goes wrong:** saveSessionSnapshot creates a snapshot using React state from the previous render because dispatch is async (state updates on next render).
**Why it happens:** After `dispatch({ type: 'RECORD_RESULT', ... })`, the state object still has the OLD results until next render.
**How to avoid:** Pass the new values explicitly to saveSessionSnapshot (D-18, D-19). Use `getSessionSnapshot()` with computed values, not `state` directly after dispatch. The processGradeResult and handleSelfGrade callbacks compute newResults/newCorrect/newIncorrect locally and pass them to save.
**Warning signs:** Last answered question missing from persisted session; off-by-one on correctCount.

### Pitfall 6: Missing Phase Guard on New Actions
**What goes wrong:** Adding a new action type without phase guards allows it to fire from any phase. Effects that dispatch this action from multiple phases create subtle state corruption.
**Why it happens:** Exhaustive switch default (`never`) catches unhandled action types but not missing phase guards within handled cases.
**How to avoid:** Every action handler starts with a phase guard: `if (state.questionPhase !== 'expected') return state;`. Code review checklist item.
**Warning signs:** Random phase jumps; reducer tests pass but E2E tests show weird transitions.

### Pitfall 7: Constants Not Exported
**What goes wrong:** Sub-components and tests import constants from InterviewSession.tsx (where they were originally defined) instead of from interviewStateMachine.ts.
**Why it happens:** During extraction, it's easy to forget to update import paths. InterviewSession.tsx should no longer export these constants.
**How to avoid:** Move all 9 constants to interviewStateMachine.ts first. Update all imports. Delete originals from InterviewSession.tsx. TypeScript compiler will catch any remaining references.
**Warning signs:** "Module has no exported member" errors; duplicate constant definitions.

## Code Examples

### 1. InterviewState and InterviewAction Types

```typescript
// Source: project convention from quizTypes.ts + precontext data contracts

export type QuestionPhase =
  | 'greeting'
  | 'chime'
  | 'typing'
  | 'reading'
  | 'responding'
  | 'transcription'
  | 'grading'
  | 'feedback'
  | 'transition';

export type ExaminerState = 'idle' | 'speaking' | 'nodding' | 'listening';

export interface InterviewState {
  questionPhase: QuestionPhase;
  currentIndex: number;
  questions: Question[];
  results: InterviewResult[];
  correctCount: number;
  incorrectCount: number;
  replaysUsed: number;
  recordAttempt: number;
  chatMessages: ChatMessage[];
  examinerState: ExaminerState;
  startTime: number;
  isComplete: boolean;
  endReason: InterviewEndReason | null;
}

export type InterviewAction =
  | { type: 'ADVANCE_PHASE'; phase: QuestionPhase }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_EXAMINER_STATE'; examinerState: ExaminerState }
  | { type: 'RECORD_RESULT'; result: InterviewResult }
  | { type: 'INCREMENT_REPLAY' }
  | { type: 'INCREMENT_RECORD_ATTEMPT' }
  | { type: 'RESET_QUESTION_STATE' }
  | { type: 'COMPLETE_SESSION'; reason: InterviewEndReason };
```

### 2. Pure Reducer Test Pattern

```typescript
// Source: sortReducer.test.ts pattern (project convention)
import { describe, it, expect } from 'vitest';
import {
  interviewReducer,
  initialInterviewState,
  isValidTransition,
  isValidQuestionPhase,
  VALID_TRANSITIONS,
} from '@/lib/interview/interviewStateMachine';

// Helper: create test config
function makeTestConfig(overrides = {}) {
  return {
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `q${i + 1}`,
      question_en: `Question ${i + 1}`,
      /* ... minimum fields */
    })),
    isResuming: false,
    ...overrides,
  };
}

describe('interviewReducer', () => {
  describe('ADVANCE_PHASE', () => {
    it('greeting -> chime is valid', () => {
      const state = initialInterviewState(makeTestConfig());
      const next = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'chime' });
      expect(next.questionPhase).toBe('chime');
    });

    it('greeting -> feedback is rejected (no-op)', () => {
      const state = initialInterviewState(makeTestConfig());
      const next = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'feedback' });
      expect(next.questionPhase).toBe('greeting'); // unchanged
      expect(next).toBe(state); // referential equality -- same object
    });
  });

  describe('COMPLETE_SESSION', () => {
    it('sets isComplete and endReason', () => {
      const state = initialInterviewState(makeTestConfig());
      const next = interviewReducer(state, { type: 'COMPLETE_SESSION', reason: 'passThreshold' });
      expect(next.isComplete).toBe(true);
      expect(next.endReason).toBe('passThreshold');
    });
  });

  describe('isValidTransition', () => {
    it.each(Object.entries(VALID_TRANSITIONS))('from %s allows %j', (from, allowed) => {
      for (const to of allowed) {
        expect(isValidTransition(from as QuestionPhase, to)).toBe(true);
      }
    });
  });
});
```

### 3. Atomic Session Snapshot Helper

```typescript
// Source: D-19 decision; eliminates G-05 (fragmented state reads)
export function getSessionSnapshot(
  state: InterviewState,
  mode: InterviewMode,
  sessionId: string
): InterviewSnapshot {
  return {
    id: sessionId,
    type: 'interview',
    savedAt: new Date().toISOString(),
    version: SESSION_VERSION,
    questions: state.questions,
    results: state.results,
    currentIndex: state.currentIndex,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    mode,
    startTime: state.startTime,
  };
}
```

### 4. QuestionPhase Type Guard

```typescript
// Source: D-24; runtime validation for persisted sessions
const VALID_PHASES: readonly QuestionPhase[] = [
  'greeting', 'chime', 'typing', 'reading', 'responding',
  'transcription', 'grading', 'feedback', 'transition',
];

export function isValidQuestionPhase(phase: string): phase is QuestionPhase {
  return VALID_PHASES.includes(phase as QuestionPhase);
}
```

### 5. Orchestrator Pattern (slimmed InterviewSession)

```typescript
// Source: architectural pattern -- InterviewSession becomes orchestrator
export function InterviewSession(props: InterviewSessionProps) {
  const { state, dispatch, getEnglishPlayer, ... } = useInterviewStateMachine(config);

  // Speech/recording hooks stay HERE (D-15, D-16)
  const { transcript, isListening, ... } = useInterviewSpeech();
  const { startRecording, stopRecording, stream, ... } = useAudioRecorder();

  // Phase effects dispatch to reducer
  useGreetingEffect(state, dispatch, ...);
  useChimeEffect(state, dispatch);
  // ... etc

  // Session save uses atomic snapshot
  const saveSessionSnapshot = useCallback(() => {
    const snapshot = getSessionSnapshot(state, mode, sessionId);
    saveSession(snapshot).catch(() => {});
  }, [state, mode, sessionId]);

  return (
    <div>
      <InterviewHeader mode={mode} currentIndex={state.currentIndex} ... />
      <InterviewChatArea chatMessages={state.chatMessages} ... />
      <InterviewRecordingArea stream={stream} isRecording={isRecording} ... />
      <QuitConfirmationDialog open={showQuitDialog} ... />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 18 individual useState hooks | Single useReducer with typed actions | This phase | Atomic state updates; testable; phase-guarded |
| Inline QuestionPhase type | Exported type + isValidQuestionPhase guard | This phase | Runtime validation for session restore |
| Scattered constants in component | Exported from interviewStateMachine.ts | This phase | Single source of truth; testable |
| 1474-line monolith | <400 orchestrator + 4 sub-components | This phase | Maintainability; focused responsibilities |

**No deprecated/outdated patterns to note.** The project uses motion/react (current name for framer-motion's React package), React 19, TypeScript 5.9 -- all current as of March 2026.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + React Testing Library |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `pnpm test:run -- --reporter=verbose` |
| Full suite command | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-05 | Reducer phase transitions are guarded | unit | `pnpm test:run -- src/__tests__/lib/interviewStateMachine.test.ts` | Wave 0 |
| ARCH-05 | Invalid transitions return state unchanged | unit | Same as above | Wave 0 |
| ARCH-05 | All 9 phase transitions are valid | unit | Same as above | Wave 0 |
| ARCH-05 | COMPLETE_SESSION sets end state | unit | Same as above | Wave 0 |
| ARCH-05 | RECORD_RESULT updates counts | unit | Same as above | Wave 0 |
| ARCH-05 | RESET_QUESTION_STATE clears per-question state | unit | Same as above | Wave 0 |
| ARCH-05 | isValidQuestionPhase type guard | unit | Same as above | Wave 0 |
| ARCH-05 | getSessionSnapshot atomicity | unit | Same as above | Wave 0 |
| ARCH-04 | InterviewSession.tsx < 400 lines | manual-only | `wc -l src/components/interview/InterviewSession.tsx` | N/A |
| ARCH-04 | Each sub-component < 200 lines | manual-only | `wc -l src/components/interview/Interview{Header,ChatArea,RecordingArea}.tsx src/components/interview/QuitConfirmationDialog.tsx` | N/A |
| ARCH-04 | Full E2E interview flow unbroken | e2e | `pnpm exec playwright test e2e/interview.spec.ts` | Exists (Phase 52) |
| ARCH-04 | Build succeeds (no type errors) | build | `pnpm typecheck && pnpm build` | Exists |

### Sampling Rate
- **Per task commit:** `pnpm typecheck && pnpm test:run`
- **Per wave merge:** `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/interviewStateMachine.test.ts` -- covers ARCH-05 (pure reducer tests)
- [ ] Per-file coverage threshold in `vitest.config.ts` for `src/lib/interview/interviewStateMachine.ts`

## Open Questions

1. **Exact useState hooks remaining in InterviewSession after extraction**
   - What we know: 18 useState currently. State machine fields (~10) move to reducer. UI-only state stays.
   - What's unclear: Exact boundary -- `showQuitDialog`, `typedAnswer`, `inputMode`, `interviewPaused`, `usingTTSFallback`, `responseStartTime`, `previousTranscription`, `lastGradeResult` are candidates to stay as useState (UI-local, not phase-machine).
   - Recommendation: Keep ~8 useState in InterviewSession for UI-local state. If a field is never tested in reducer tests and only affects rendering, it stays as useState. Planner decides exact list.

2. **Phase effects extraction strategy**
   - What we know: 7 phase effects (greeting, chime, typing, reading, feedback + 2 auto-handlers). These dispatch to reducer but also call audio players and speech APIs.
   - What's unclear: Whether to extract as named custom hooks (useGreetingEffect, etc.) or keep inline in InterviewSession.
   - Recommendation: Keep phase effects inline in InterviewSession for now. They depend on audio players, speech APIs, and callbacks that would require many parameters if extracted. The parent stays under 400 lines regardless.

3. **Dev-mode reducer action logging**
   - What we know: Discretion item from CONTEXT.md. ProviderOrderGuard sets precedent for dev-mode-only validation.
   - What's unclear: Whether the overhead is worth it for a linear 9-phase machine.
   - Recommendation: Add it. Low effort (5 lines in hook), high debugging value for future developers. Gate with `process.env.NODE_ENV === 'development'`.

## Sources

### Primary (HIGH confidence)
- `src/lib/quiz/quizReducer.ts` -- Phase-guarded reducer pattern (303 lines, comprehensive JSDoc)
- `src/lib/quiz/quizTypes.ts` -- State/action type organization (98 lines)
- `src/lib/sort/sortReducer.ts` -- Alternative reducer pattern with factory (313 lines)
- `src/lib/sort/sortReducer.test.ts` -- Pure reducer test template (~200 lines)
- `src/components/interview/InterviewSession.tsx` -- Target file (1474 lines, fully analyzed)
- `vitest.config.ts` -- Per-file coverage threshold pattern (249 lines)
- [React useRef docs](https://react.dev/reference/react/useRef) -- Ref identity stability
- [AnimatePresence docs](https://motion.dev/docs/react-animate-presence) -- Direct children key requirement

### Secondary (MEDIUM confidence)
- [Kyle Shevlin: useReducer as FSM](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) -- useReducer state machine pattern
- [Ben Ilegbodu: Type-checking useReducer](https://www.benmvp.com/blog/type-checking-react-usereducer-typescript/) -- TypeScript discriminated union patterns
- [Redux docs: Writing Tests](https://redux.js.org/usage/writing-tests) -- Pure reducer testing strategy

### Tertiary (LOW confidence)
- None. All findings verified against project codebase or official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies; all patterns verified in existing codebase
- Architecture: HIGH -- 4 sub-components, reducer+hook pattern match quizReducer/sortReducer exactly
- Pitfalls: HIGH -- 19 gotchas from precontext research validated; 7 implementation pitfalls documented above
- Test strategy: HIGH -- sortReducer.test.ts provides exact template; Vitest infrastructure exists

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable refactoring phase; no external dependency changes)
