---
phase: 21-test-practice-ux
plan: 07
subsystem: ui
tags: [react, quiz-state-machine, check-continue, feedback-panel, skip-review, progress-bar, practice-mode]

# Dependency graph
requires:
  - phase: 21-03
    provides: FeedbackPanel, AnswerOption, AnswerOptionGroup, useRovingFocus
  - phase: 21-04
    provides: SegmentedProgressBar, QuizHeader, SkipButton, quiz i18n strings
provides:
  - "Refactored PracticeSession with Check/Continue flow and quiz state machine"
  - "SkippedReviewPhase component for reviewing skipped questions at end of practice"
  - "Segment tap review dialog for read-only review of answered questions"
  - "Inline exit confirmation dialog for practice mode"
affects: [21-08, 21-09, 21-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useReducer(quizReducer) for quiz state management in practice mode"
    - "Inline exit confirmation and segment review dialogs (no shared ExitConfirmDialog yet)"
    - "SkippedReviewPhase uses isolated internal quizReducer for review state"

key-files:
  created:
    - src/components/quiz/SkippedReviewPhase.tsx
  modified:
    - src/components/practice/PracticeSession.tsx
    - src/lib/sessions/sessionTypes.ts
    - src/pages/PracticePage.tsx

key-decisions:
  - "SkippedReviewPhase uses its own internal quizReducer (isolated state from main quiz)"
  - "Segment tap review uses inline modal dialog (not separate route or page)"
  - "Exit confirmation inline dialog with session-saved messaging (ExitConfirmDialog component doesn't exist yet)"
  - "SRS marking batched at end via recordAnswer loop (not per-question)"
  - "Timer pauses during feedback phase (isFeedback gates timer effect)"
  - "PracticeSnapshot extended with optional skippedIndices field for persistence"
  - "hasCompletedRef prevents double-firing onComplete from effect on finished state"

patterns-established:
  - "Practice quiz pattern: useReducer + Check/Continue + SkippedReviewPhase at end"
  - "Segment review dialog: inline modal with question + answer + explanation for read-only review"

# Metrics
duration: 26min
completed: 2026-02-15
---

# Phase 21 Plan 07: PracticeSession Refactor Summary

**PracticeSession refactored with Check/Continue quiz state machine, tappable progress segments, skipped question review phase, and live score tally**

## Performance

- **Duration:** 26 min
- **Started:** 2026-02-15T05:39:52Z
- **Completed:** 2026-02-15T06:05:38Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- PracticeSession fully refactored from scattered booleans to useReducer(quizReducer) state machine with Check/Continue flow
- SkippedReviewPhase component presents skipped questions in original order, no re-skipping allowed, with "Finish Without Reviewing" bail-out
- SegmentedProgressBar integrated with live score tally, tappable segments for read-only review dialog
- Session persistence updated with skippedIndices for resume support
- Practice-specific features: explanations in FeedbackPanel, haptic feedback, slide-left transitions

## Task Commits

Each task was committed atomically:

1. **Task 1: SkippedReviewPhase component** - `d7a3bcc` (feat)
2. **Task 2: PracticeSession refactor with Check/Continue flow** - `39888bc` (feat)

## Files Created/Modified
- `src/components/quiz/SkippedReviewPhase.tsx` - Review phase for skipped questions at end of practice quiz with internal quizReducer, Check/Continue flow, and finish-without-reviewing option
- `src/components/practice/PracticeSession.tsx` - Full refactor from auto-advance to Check/Continue flow using quizReducer, with SegmentedProgressBar, FeedbackPanel, SkipButton, QuizHeader, segment tap review dialog, and exit confirmation
- `src/lib/sessions/sessionTypes.ts` - Added optional `skippedIndices` field to PracticeSnapshot for persistence
- `src/pages/PracticePage.tsx` - Added `initialSkippedIndices` state and passing to PracticeSession on resume

## Decisions Made
- Used inline exit confirmation dialog rather than a shared ExitConfirmDialog component (which doesn't exist yet -- will likely be created in a later plan)
- SkippedReviewPhase manages its own isolated quiz state via a separate quizReducer instance (not sharing state with the parent PracticeSession)
- Segment tap review uses a full-screen modal overlay with backdrop, showing question text, user's answer (colored), correct answer, and explanation with TTS
- SRS marking batched at end of practice (recordAnswer loop over all results) rather than per-question to match mock test pattern
- hasCompletedRef used to prevent double-firing onComplete when quizState.phase transitions to 'finished' (effect safety pattern)
- PracticeSnapshot.skippedIndices is optional (backward compatible with existing snapshots)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added inline exit confirmation dialog**
- **Found during:** Task 2 (PracticeSession refactor)
- **Issue:** Plan references ExitConfirmDialog component which doesn't exist yet (likely from a future plan)
- **Fix:** Created inline ExitConfirmInline sub-component within PracticeSession with session-saved messaging
- **Files modified:** src/components/practice/PracticeSession.tsx
- **Verification:** TypeScript and ESLint pass, dialog renders with Continue/Exit buttons
- **Committed in:** 39888bc (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added haptic feedback on Check results**
- **Found during:** Task 2 (PracticeSession refactor)
- **Issue:** Plan mentions sound effects but haptic feedback needed for consistency with quiz UX decisions
- **Fix:** Added hapticLight() on correct and hapticDouble() on incorrect check results
- **Files modified:** src/components/practice/PracticeSession.tsx
- **Verification:** TypeScript and ESLint pass
- **Committed in:** 39888bc (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both auto-fixes necessary for correct user experience. No scope creep.

## Issues Encountered
- Pre-existing "Build optimization failed" error in Next.js build (pages/op-ed, pages/[[...slug]] without default export) -- not caused by this plan's changes. TypeScript compilation and ESLint both pass cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PracticeSession fully refactored and ready for integration testing
- SkippedReviewPhase available for practice mode quiz flow
- Mock test page (plan 06) can follow same pattern with quizReducer
- All quiz UI components (FeedbackPanel, AnswerOptionGroup, SegmentedProgressBar, QuizHeader, SkipButton) integrated and working together

## Self-Check: PASSED

- [x] `src/components/quiz/SkippedReviewPhase.tsx` - FOUND
- [x] `src/components/practice/PracticeSession.tsx` - FOUND (modified)
- [x] `src/lib/sessions/sessionTypes.ts` - FOUND (modified)
- [x] `src/pages/PracticePage.tsx` - FOUND (modified)
- [x] Commit `d7a3bcc` (Task 1) - FOUND
- [x] Commit `39888bc` (Task 2) - FOUND

---
*Phase: 21-test-practice-ux*
*Completed: 2026-02-15*
