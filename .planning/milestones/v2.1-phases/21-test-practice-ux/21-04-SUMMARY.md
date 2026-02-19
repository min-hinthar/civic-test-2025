---
phase: 21-test-practice-ux
plan: 04
subsystem: ui
tags: [progress-bar, quiz-header, skip-button, segmented, bilingual, sound-effects, haptics]

# Dependency graph
requires:
  - phase: 21-test-practice-ux
    plan: 01
    provides: "QuizState types, sound effects (playSkip, playCompletionSparkle), haptics (hapticMedium)"
provides:
  - "SegmentedProgressBar with 5 segment states, fraction label, live score, tappable segments, completion sparkle"
  - "QuizHeader with exit button, question counter, timer slot, Escape key binding"
  - "SkipButton with outline style, sound/haptic feedback, bilingual labels"
  - "Quiz i18n strings (check, skip, continue, exit, questionNofM, of)"
affects: [21-05, 21-06, 21-07, 21-08, 21-09, 21-10, 21-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "React.memo on individual segment sub-component for re-render optimization"
    - "Ref-based completion tracking (no setState in effect) for React Compiler safety"
    - "CSS transitions for segment colors, animate-pulse for current indicator"

key-files:
  created:
    - src/components/quiz/SegmentedProgressBar.tsx
    - src/components/quiz/QuizHeader.tsx
    - src/components/quiz/SkipButton.tsx
  modified:
    - src/lib/i18n/strings.ts

key-decisions:
  - "Segment completion tracked via refs (hasPlayedRef + prevAllFilledRef) to avoid setState-in-effect lint violation"
  - "SkipButton uses 3D chunky outline style with border shadow matching Check button visual language"
  - "Quiz i18n strings added as new 'quiz' section separate from existing 'test' and 'actions' sections"
  - "Segment sub-component uses React.memo to avoid re-rendering all 20 segments on each state change"

patterns-established:
  - "Quiz component pattern: showBurmese prop for bilingual support, sound/haptic on interactions"
  - "Ref-only effect tracking pattern for one-shot side effects (completion sparkle)"

# Metrics
duration: 7min
completed: 2026-02-15
---

# Phase 21 Plan 04: Quiz UI Controls Summary

**SegmentedProgressBar with 5-state color-coded segments, QuizHeader with Escape-key exit, and SkipButton with sound/haptic feedback**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-15T05:13:29Z
- **Completed:** 2026-02-15T05:19:58Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- SegmentedProgressBar renders color-coded segments (correct/incorrect/skipped/current/unanswered) with animated pulse on current, fraction label, optional live score tally, tappable segments in Practice mode, and completion glow with sparkle sound effect
- QuizHeader provides exit button (X icon) with Escape key listener, bilingual question counter ("Question 3 of 10"), and timer slot for CircularTimer integration
- SkipButton implements secondary/outline 3D chunky style with SkipForward icon, playSkip() sound, hapticMedium() vibration, and 48px minimum touch target

## Task Commits

Each task was committed atomically:

1. **Task 1: SegmentedProgressBar component** - `51c8048` (feat)
2. **Task 2: QuizHeader and SkipButton components** - `dd4f174` (feat)

## Files Created/Modified
- `src/components/quiz/SegmentedProgressBar.tsx` - Full-width segmented progress bar with color-coded segments, React.memo optimization, completion sparkle
- `src/components/quiz/QuizHeader.tsx` - Top bar with exit button, question counter, timer slot, Escape key binding
- `src/components/quiz/SkipButton.tsx` - Secondary outline-style skip button with sound/haptic feedback
- `src/lib/i18n/strings.ts` - Added quiz section with check, skip, continue, exit, questionNofM, of strings

## Decisions Made
- Used refs (not state) for completion sparkle tracking to comply with React Compiler's no-setState-in-effect rule
- SkipButton uses 3D chunky outline style (border-2 + shadow) to match Check button's visual language while maintaining lighter visual weight
- Added dedicated `quiz` section to i18n strings rather than overloading existing `test` or `actions` sections
- Individual Segment wrapped in React.memo for performance -- prevents re-rendering all segments when only one changes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed setState-in-effect violation for completion sparkle**
- **Found during:** Task 1 (SegmentedProgressBar)
- **Issue:** Initial implementation used `useState` + `setHasPlayed(true)` inside `useEffect` which violates React Compiler's `react-hooks/set-state-in-effect` rule
- **Fix:** Replaced `useState` with `useRef` for `hasPlayedRef` since the played state is only used for side-effect gating, not rendering
- **Files modified:** src/components/quiz/SegmentedProgressBar.tsx
- **Verification:** `npx eslint` passes with no errors
- **Committed in:** 51c8048 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary fix for React Compiler compliance. No scope change.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three quiz UI control components ready for integration into quiz flow (plans 21-05 through 21-11)
- SegmentedProgressBar can be driven by QuizState.results array mapped to SegmentStatus
- QuizHeader timer slot accepts CircularTimer as ReactNode
- SkipButton wired to dispatch SKIP action via onSkip callback
- No blockers for downstream plans

## Self-Check: PASSED

- FOUND: src/components/quiz/SegmentedProgressBar.tsx
- FOUND: src/components/quiz/QuizHeader.tsx
- FOUND: src/components/quiz/SkipButton.tsx
- FOUND: commit 51c8048
- FOUND: commit dd4f174

---
*Phase: 21-test-practice-ux*
*Completed: 2026-02-15*
