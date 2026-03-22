# Phase 53: Enhancement Recommendations

## Priority Matrix

| # | Enhancement | Priority | Effort | Impact |
|---|-------------|----------|--------|--------|
| 1 | Phase-guarded reducer with exhaustive action validation | MUST-HAVE | Medium | High |
| 2 | Pure reducer unit tests (20-30 tests) | MUST-HAVE | Medium | High |
| 3 | Per-file coverage threshold on interviewStateMachine.ts | MUST-HAVE | Low | Medium |
| 4 | QuestionPhase type guard for session restore | MUST-HAVE | Low | Medium |
| 5 | Atomic state snapshot helper for session persistence | SHOULD-HAVE | Low | High |
| 6 | InterviewAction exhaustiveness check in reducer | SHOULD-HAVE | Low | Medium |
| 7 | ChatMessage ID generation via hook (not component ref) | SHOULD-HAVE | Low | Medium |
| 8 | Constants barrel export from interviewStateMachine.ts | SHOULD-HAVE | Low | Low |
| 9 | Audio player getter memoization in hook | NICE-TO-HAVE | Low | Low |
| 10 | JSDoc on InterviewState/InterviewAction types | NICE-TO-HAVE | Low | Low |
| 11 | Reducer action logging in dev mode | NICE-TO-HAVE | Low | Low |
| 12 | Animation variant extraction to shared config | NICE-TO-HAVE | Low | Low |

---

## Detailed Recommendations

### 1. Phase-Guarded Reducer with Exhaustive Action Validation
**Priority:** MUST-HAVE

**What:** Implement interviewReducer using the same phase-guard pattern as quizReducer — every action checks current questionPhase before executing. Invalid actions return state unchanged (no-op).

**Why:** Current useState pattern allows any state change at any time. Race conditions between effects can set questionPhase to 'reading' while currentIndex is still from previous question. Phase guards make invalid transitions impossible.

**Design compliance:** Matches project convention (quizReducer.ts lines 103-104, sortReducer.ts lines 81-90). Pure function enables exhaustive testing without React.

**Implementation hint:**
```typescript
function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'ADVANCE_PHASE':
      // Phase guard: only valid transitions
      if (!isValidTransition(state.questionPhase, action.phase)) return state;
      return { ...state, questionPhase: action.phase };
    // ...
  }
}
```

---

### 2. Pure Reducer Unit Tests (20-30 Tests)
**Priority:** MUST-HAVE

**What:** Create `src/__tests__/lib/interviewStateMachine.test.ts` with pure function tests covering all action types, phase transitions, and edge cases (invalid actions, boundary conditions, early termination).

**Why:** Phase 53 success criteria #2: "useInterviewStateMachine hook is independently unit-testable." Pure reducer tests are the highest-value tests — no React, no providers, no mocking.

**Design compliance:** Follows saveSession.test.ts pattern (pure function tests). Adds per-file coverage threshold simultaneously.

**Implementation hint:**
```typescript
describe('interviewReducer', () => {
  it('greeting → chime transition', () => {
    const state = initialInterviewState(config);
    const next = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'chime' });
    expect(next.questionPhase).toBe('chime');
  });
  it('rejects invalid transition greeting → feedback', () => {
    const state = initialInterviewState(config);
    const next = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'feedback' });
    expect(next.questionPhase).toBe('greeting'); // unchanged
  });
});
```

---

### 3. Per-File Coverage Threshold on interviewStateMachine.ts
**Priority:** MUST-HAVE

**What:** Add per-file coverage threshold in vitest.config.ts for `src/lib/interview/interviewStateMachine.ts` — set to actual achieved coverage (likely 80%+).

**Why:** Phase 48 contract: "Per-file coverage thresholds are added simultaneously with each new test file — no speculative thresholds on untested code." Phase 53 creates a new testable module; threshold must accompany it.

**Design compliance:** Matches Phase 51 pattern where 8 provider tests each got per-file thresholds.

**Implementation hint:** Add to vitest.config.ts coverageConfigDefaults alongside existing 26 src/lib/ thresholds.

---

### 4. QuestionPhase Type Guard for Session Restore
**Priority:** MUST-HAVE

**What:** Add `isValidQuestionPhase(phase: string): phase is QuestionPhase` type guard function. Use when restoring persisted sessions to validate the saved phase value.

**Why:** If a future change adds/removes phases, old persisted sessions may contain invalid phase values. Without validation, the reducer receives an unknown phase and behavior is undefined. Type guard provides runtime safety.

**Design compliance:** SESSION_VERSION exists but doesn't validate individual fields. Type guard adds field-level validation.

**Implementation hint:**
```typescript
const VALID_PHASES: readonly QuestionPhase[] = ['greeting', 'chime', 'typing', ...];
export function isValidQuestionPhase(phase: string): phase is QuestionPhase {
  return VALID_PHASES.includes(phase as QuestionPhase);
}
```

---

### 5. Atomic State Snapshot Helper for Session Persistence
**Priority:** SHOULD-HAVE

**What:** Add `getSessionSnapshot(state: InterviewState, mode: InterviewMode): InterviewSnapshot` pure function that creates an atomic snapshot from reducer state.

**Why:** Current pattern scatters snapshot creation across multiple useState reads. If state changes between reads, snapshot is inconsistent. With useReducer, state is a single object — snapshot is always atomic.

**Design compliance:** Eliminates gotcha G-05 (state snapshot atomicity). Pure function is testable.

**Implementation hint:**
```typescript
export function getSessionSnapshot(state: InterviewState, mode: InterviewMode): InterviewSnapshot {
  return {
    type: 'interview',
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

---

### 6. InterviewAction Exhaustiveness Check in Reducer
**Priority:** SHOULD-HAVE

**What:** Add exhaustive switch check in reducer using `never` type assertion on default case.

**Why:** TypeScript won't catch missing action handlers without exhaustive check. If a new action type is added but not handled, the reducer silently returns unchanged state — a subtle bug.

**Design compliance:** Standard TypeScript exhaustiveness pattern. quizReducer doesn't have this but should.

**Implementation hint:**
```typescript
default: {
  const _exhaustive: never = action;
  return state;
}
```

---

### 7. ChatMessage ID Generation via Hook
**Priority:** SHOULD-HAVE

**What:** Move `msgIdCounter` ref from component to hook. Hook provides `getNextMessageId()` function. Ensures message IDs are stable and never reused even across re-renders.

**Why:** Message keys drive AnimatePresence tracking. If counter resets (e.g., due to component remount during error recovery), duplicate keys cause animation glitches. Hook-level counter survives error boundary re-wrapping.

**Design compliance:** Addresses gotcha G-12 (message key stability).

**Implementation hint:** Hook maintains `useRef(0)` counter; `ADD_MESSAGE` action auto-assigns ID.

---

### 8. Constants Barrel Export from interviewStateMachine.ts
**Priority:** SHOULD-HAVE

**What:** Export all interview constants (MAX_REPLAYS, PASS_THRESHOLD, FAIL_THRESHOLD, QUESTIONS_PER_SESSION, TYPING_INDICATOR_MS, TRANSITION_DELAY_MS, REALISTIC_TIMER_SECONDS, RATE_MAP, MAX_RECORD_ATTEMPTS) from interviewStateMachine.ts.

**Why:** Constants are currently inline in InterviewSession.tsx. Sub-components and tests need access. Single source of truth prevents magic number duplication.

**Design compliance:** quizReducer exports `QUESTIONS_PER_QUIZ` pattern.

**Implementation hint:** Simple `export const` declarations at top of module.

---

### 9. Audio Player Getter Memoization in Hook
**Priority:** NICE-TO-HAVE

**What:** Memoize audio player lazy getters in hook using useRef pattern (already current pattern — just verify it survives extraction).

**Why:** createAudioPlayer() allocates HTMLAudioElement. Re-creating on every render would leak elements and break registry tracking.

**Design compliance:** Current pattern (lines 300-317) is correct; just verify preservation.

**Implementation hint:** Verify lazy getter pattern preserved in hook:
```typescript
const getEnglishPlayer = useCallback(() => {
  if (!englishPlayerRef.current) englishPlayerRef.current = createAudioPlayer();
  return englishPlayerRef.current;
}, []);
```

---

### 10. JSDoc on InterviewState/InterviewAction Types
**Priority:** NICE-TO-HAVE

**What:** Add brief JSDoc comments on InterviewState fields and InterviewAction variants explaining purpose and valid values.

**Why:** New developers reading the reducer will understand field purposes without tracing through component code. Low effort, modest maintenance benefit.

**Design compliance:** Project doesn't mandate JSDoc; optional enhancement.

**Implementation hint:** One-line comments on each field:
```typescript
interface InterviewState {
  /** Current phase in the 9-step question cycle */
  questionPhase: QuestionPhase;
  /** 0-based index into questions array (0-19) */
  currentIndex: number;
  // ...
}
```

---

### 11. Reducer Action Logging in Dev Mode
**Priority:** NICE-TO-HAVE

**What:** Add optional dev-mode logging middleware that logs dispatched actions and state transitions to console.

**Why:** Debugging phase transitions is currently opaque — you have to add console.log statements manually. A dev-mode logger shows the full action→state flow.

**Design compliance:** Similar to ProviderOrderGuard dev-mode validation pattern (Phase 49). Only runs in development.

**Implementation hint:**
```typescript
function useInterviewStateMachine(config) {
  const [state, dispatch] = useReducer(interviewReducer, config, initialInterviewState);
  const devDispatch = process.env.NODE_ENV === 'development'
    ? (action) => { console.debug('[interview]', action.type, action); dispatch(action); }
    : dispatch;
  // ...
}
```

---

### 12. Animation Variant Extraction to Shared Config
**Priority:** NICE-TO-HAVE

**What:** Extract chat message animation variants (`{ opacity: 0, y: 8, scale: 0.95 }`) to a shared constant in InterviewChatArea, matching the existing SPRING_GENTLE/SNAPPY/BOUNCY pattern.

**Why:** Animation values are currently inline in JSX. Extracting to named constants improves readability and makes it easier to adjust animations consistently.

**Design compliance:** Project already has motion-config.ts with spring presets. This extends the pattern to component-specific variants.

**Implementation hint:**
```typescript
const MESSAGE_ENTER = { opacity: 0, y: 8, scale: 0.95 };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, scale: 1 };
```

---

*Recommendations generated: 2026-03-21*
*Based on 12-agent deep research across codebase, git history, and prior phase artifacts*
