---
phase: 19-tts-core-extraction
plan: 02
subsystem: testing
tags: [vitest, speech-synthesis, unit-tests, mocking, fake-timers, tts]

# Dependency graph
requires:
  - phase: 19-01
    provides: "ttsCore.ts and ttsTypes.ts -- all public exports to test"
provides:
  - "ttsCore.test.ts: 39 unit tests covering all public exports, engine lifecycle, error handling, chunking"
affects: [19-03, 19-04, 19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [manual-speechSynthesis-mock, fake-timer-async-speech, configurable-cancel-behavior]

key-files:
  created:
    - src/lib/ttsCore.test.ts
  modified:
    - src/__tests__/setup.ts

key-decisions:
  - "Combined Task 1 (mock infrastructure) and Task 2 (test suites) into single commit -- ESLint unused-import errors prevent committing Task 1 alone"
  - "Made global speechSynthesis mock configurable: true in setup.ts so test file can delete/redefine it"
  - "Used .catch() pattern for cancel tests to avoid unhandled promise rejection warnings"
  - "Mock engine for safeSpeak cancelled/error tests instead of real engine with timing races"

patterns-established:
  - "Manual speechSynthesis mock: installSpeechSynthesisMock() with configurable autoFireOnend and cancelBehavior"
  - "Mock voice factory: createMockVoice(overrides) returns SpeechSynthesisVoice-shaped object"
  - "Async speech testing: vi.useFakeTimers() + vi.advanceTimersByTimeAsync() for timeout-dependent tests"
  - "Cancel race prevention: .catch() on speak promise before cancel() to avoid unhandled rejection"

# Metrics
duration: 11min
completed: 2026-02-14
---

# Phase 19 Plan 02: TTS Core Test Suite Summary

**39 unit tests covering all ttsCore public exports with manual speechSynthesis mock, fake timers, and cross-browser workaround verification**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-14T15:27:37Z
- **Completed:** 2026-02-14T15:38:38Z
- **Tasks:** 2 (committed as 1 due to ESLint constraint)
- **Files created:** 1
- **Files modified:** 1

## Accomplishments
- 39 test cases covering all 7 test suites: findVoice (9), estimateDuration (3), loadVoices (4), createTTSEngine (12), Chrome 15s chunking (3), safeSpeak (4), error handling (4)
- Manual speechSynthesis mock with configurable speak completion, cancel behavior, and voice list
- Mock SpeechSynthesisUtterance class with all event handlers
- Full async speech lifecycle testing via vitest fake timers
- Cross-browser workaround verification: Chrome 15s chunking, Safari cancel errors, retry logic, double-fire guard, timeout fallback

## Task Commits

Tasks 1 and 2 were combined into a single commit (ESLint unused-import constraint prevents committing mock infrastructure without test consumers):

1. **Task 1+2: Mock infrastructure + all test suites** - `5127343` (test)

## Files Created/Modified
- `src/lib/ttsCore.test.ts` - 821-line test file with 39 test cases across 7 suites, manual speechSynthesis mock, mock voice factory, mock SpeechSynthesisUtterance class
- `src/__tests__/setup.ts` - Added `configurable: true` to speechSynthesis mock definition so test file can delete/redefine it

## Decisions Made
- Combined Tasks 1 and 2 into single commit because ESLint's no-unused-vars rule prevents committing mock infrastructure without test consumers
- Made global speechSynthesis mock configurable in setup.ts (additive, non-breaking change for other tests)
- Used .catch() pattern on speak promises in cancel tests to prevent unhandled rejection warnings from timer-based async races
- Used mock TTSEngine objects for safeSpeak cancelled/error tests instead of real engine with timing complexities

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added configurable: true to global speechSynthesis mock**
- **Found during:** Task 1 (mock infrastructure setup)
- **Issue:** Global setup.ts defines window.speechSynthesis via Object.defineProperty without configurable: true, preventing delete in tests that simulate missing API
- **Fix:** Added configurable: true to the defineProperty call in src/__tests__/setup.ts
- **Files modified:** src/__tests__/setup.ts
- **Verification:** Tests that delete window.speechSynthesis now work correctly
- **Committed in:** 5127343

**2. [Rule 3 - Blocking] Combined Tasks 1+2 into single commit**
- **Found during:** Task 1 (first commit attempt)
- **Issue:** ESLint pre-commit hook rejects files with unused imports; Task 1 imports are only used by Task 2 test suites
- **Fix:** Combined both tasks into a single commit
- **Files modified:** src/lib/ttsCore.test.ts
- **Verification:** ESLint passes, all 39 tests pass
- **Committed in:** 5127343

**3. [Rule 1 - Bug] Fixed unhandled promise rejection in cancel tests**
- **Found during:** Task 2 (running tests)
- **Issue:** Safari cancel mock fires onerror via setTimeout, creating race condition where rejection goes unhandled before test's try/catch
- **Fix:** Used .catch() on speak promise immediately after creation, stored error in variable for assertion
- **Files modified:** src/lib/ttsCore.test.ts
- **Verification:** No unhandled rejection warnings, tests pass cleanly
- **Committed in:** 5127343

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All auto-fixes necessary for test infrastructure and test correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All ttsCore public exports verified with passing tests
- Test infrastructure (mock factory, mock utterance, installSpeechSynthesisMock) available as patterns for future TTS test files
- Ready for 19-03 (TTSContext provider) and subsequent plans

## Self-Check: PASSED

- [x] src/lib/ttsCore.test.ts exists
- [x] Commit 5127343 exists (Tasks 1+2)

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
