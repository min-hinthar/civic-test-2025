---
phase: 19-tts-core-extraction
plan: 05
subsystem: tts
tags: [speech-synthesis, useTTS, async-await, safeSpeak, interview-migration]

# Dependency graph
requires:
  - "19-03: TTSContext provider, useTTS hook with speak/cancel/isSpeaking, auto-cancel on unmount"
provides:
  - "InterviewSession.tsx migrated to useTTS with 4 async handler functions (handleGreeting, handleReading, handleGrading, handleReplay)"
  - "InterviewResults.tsx migrated to useTTS shared engine for closing statement"
affects: [19-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [safeSpeakLocal-wrapper, async-handler-functions, fire-and-forget-speak]

key-files:
  created: []
  modified:
    - src/components/interview/InterviewSession.tsx
    - src/components/interview/InterviewResults.tsx

key-decisions:
  - "safeSpeakLocal wraps useTTS speak (not raw engine) -- simpler, useTTS already handles cancellation silently"
  - "handleReplay uses Promise-based delay instead of setTimeout callback -- cleaner async flow"
  - "Chime effect calls handleReading directly from timeout (no separate reading useEffect)"
  - "InterviewResults keeps effect-level cancelTTS for navigation-away cancellation"

patterns-established:
  - "safeSpeakLocal: local async wrapper returning 'completed' | 'cancelled' | 'error' for TTS sequencing"
  - "Named handler pattern: 4 explicit async handlers per interview phase (greeting, reading, grading, replay)"
  - "Fire-and-forget speak: InterviewResults calls speak() without await for closing statement"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 19 Plan 05: Interview Consumer Migration Summary

**InterviewSession and InterviewResults migrated from useInterviewTTS to useTTS with async handler pattern and safeSpeakLocal wrapper**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T15:43:13Z
- **Completed:** 2026-02-14T15:48:44Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- InterviewSession migrated to useTTS with 4 named async handlers (handleGreeting, handleReading, handleGrading, handleReplay) replacing callback-driven speakWithCallback
- InterviewResults migrated to useTTS shared engine for closing statement TTS
- Removed manual cancelTTS from InterviewSession unmount cleanup -- useTTS auto-cancels on unmount
- handleReplay converted from setTimeout+callback to clean async/await with Promise-based delay

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate InterviewSession to useTTS with 4 handler functions** - `83acc48` (feat)
2. **Task 2: Migrate InterviewResults to useTTS shared engine** - `09c0b4e` (feat)

## Files Created/Modified
- `src/components/interview/InterviewSession.tsx` - Replaced useInterviewTTS with useTTS, added safeSpeakLocal wrapper, created 4 named async handler functions for TTS sequencing, simplified unmount cleanup
- `src/components/interview/InterviewResults.tsx` - Replaced useInterviewTTS with useTTS, replaced speakWithCallback with fire-and-forget speak() for closing statement

## Decisions Made
- safeSpeakLocal wraps the useTTS `speak` function (not the raw engine via safeSpeak from ttsCore). This is simpler because useTTS already silently handles TTSCancelledError, and the interview handlers work correctly in all cancellation scenarios since React ignores state updates on unmounted components.
- handleReplay uses `await new Promise(resolve => setTimeout(resolve, 1000))` for the 1s delay instead of nesting a setTimeout callback. Cleaner async flow.
- The chime effect calls `handleReading(currentQuestion.question_en)` directly from its timeout callback, eliminating the need for a separate reading useEffect. This is more explicit about the flow.
- InterviewResults retains `cancelTTS()` in the TTS effect cleanup (for navigating away mid-speech), even though useTTS auto-cancels on unmount -- the effect cleanup handles the specific case of the timer being cleared before speech starts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both interview consumers (InterviewSession, InterviewResults) now use useTTS
- Zero references to useInterviewTTS in src/components/interview/
- Plan 19-06 (AppShell wiring) can proceed to wrap app with TTSProvider and delete old hooks
- useInterviewTTS.ts still exists for other potential consumers -- will be cleaned up in 19-06

## Self-Check: PASSED

- [x] src/components/interview/InterviewSession.tsx modified (uses useTTS, has 4 handlers)
- [x] src/components/interview/InterviewResults.tsx modified (uses useTTS shared engine)
- [x] Commit 83acc48 exists (Task 1)
- [x] Commit 09c0b4e exists (Task 2)

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
