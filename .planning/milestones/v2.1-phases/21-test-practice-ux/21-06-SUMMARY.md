---
phase: 21-test-practice-ux
plan: 06
subsystem: quiz-flow
tags: [quiz, state-machine, check-continue, feedback-panel, exit-dialog]
dependency_graph:
  requires: ["21-01", "21-03", "21-04"]
  provides: ["TestPage Check/Continue flow", "ExitConfirmDialog"]
  affects: ["src/pages/TestPage.tsx", "src/components/quiz/ExitConfirmDialog.tsx"]
tech_stack:
  added: []
  patterns: ["useReducer quiz state machine", "Radix Dialog exit confirmation", "AnimatePresence slide transitions", "batch SRS recording"]
key_files:
  created:
    - src/components/quiz/ExitConfirmDialog.tsx
  modified:
    - src/pages/TestPage.tsx
decisions:
  - "Batch SRS recording on finish (not per-answer) for better performance"
  - "Timer pauses during checked AND feedback phases"
  - "250ms intentional delay between CHECK and SHOW_FEEDBACK for suspense"
  - "TRANSITION_COMPLETE dispatched 50ms after CONTINUE for animation timing"
  - "Exit dialog uses Radix Dialog for focus trap and portal rendering"
  - "Check button uses rounded-full pill shape with 3D chunky shadow"
  - "Feedback panel fixed to bottom with z-40"
  - "Helper function getQuestionAtIndex outside component for React Compiler purity"
metrics:
  duration: "13 min"
  completed: 2026-02-15
---

# Phase 21 Plan 06: TestPage Check/Continue Refactor Summary

Major refactor of TestPage from scattered boolean state to useReducer quiz state machine with Duolingo-style Check/Continue flow.

## What Changed

### ExitConfirmDialog (NEW)
- Radix Dialog-based exit confirmation with focus trap and Escape key
- Bilingual titles per mode (mock-test/practice/interview)
- Session save messaging: "Your progress is saved. You can resume this session later."
- Two buttons: Keep Going (secondary outline 3D) and Exit (warning primary 3D)

### TestPage (MAJOR REFACTOR)
- **State machine**: Replaced `showFeedback`, `selectedAnswer`, `isFinished` booleans with `useReducer(quizReducer, quizConfig, initialQuizState)`
- **Check/Continue flow (TPUX-01/02/03)**: Tapping answer only selects (SELECT_ANSWER). Check button commits. FeedbackPanel slides up. Continue button advances.
- **Timer pause**: Interval gated on `quizState.phase !== 'feedback' && quizState.phase !== 'checked'`
- **Sound + haptic**: Check handler plays `playCorrect()`/`playIncorrect()` and `hapticLight()`/`hapticDouble()`
- **SegmentedProgressBar**: Color-coded segments derived from quizState.results + skippedIndices
- **QuizHeader**: Exit (X) button with Escape key opens ExitConfirmDialog
- **SkipButton**: Dispatches SKIP action, amber segment tracking
- **AnimatePresence**: Slide-from-right entrance, slide-left exit per question index
- **Batch SRS**: Moved from per-answer recordAnswer() to batch on finish
- **Session persistence**: Fire-and-forget IndexedDB snapshots on each check

### Removed Dependencies
- `AnswerFeedback` component (replaced by FeedbackPanel)
- `getAnswerOptionClasses` (replaced by AnswerOptionGroup with built-in styles)
- `Progress` component (replaced by SegmentedProgressBar)
- `ChevronRight` icon (no longer needed without inline Next button)
- `FEEDBACK_DELAY_MS` constant (replaced by `CHECK_DELAY_MS`)
- `INCORRECT_LIMIT` constant (handled by quizReducer thresholds)

## Commits

| Hash | Message |
|------|---------|
| 177ed1a | feat(21-06): refactor TestPage with Check/Continue quiz flow |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` passes clean
- `npx eslint` passes clean on both files
- `npm run build` succeeds (101s compile, 2/2 static pages)
- Pre-commit hook (lint-staged: ESLint + Prettier) passes

## Self-Check: PASSED
- [x] src/components/quiz/ExitConfirmDialog.tsx exists
- [x] src/pages/TestPage.tsx modified
- [x] Commit 177ed1a exists
