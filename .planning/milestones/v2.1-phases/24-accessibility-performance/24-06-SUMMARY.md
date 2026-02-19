---
phase: 24-accessibility-performance
plan: 06
subsystem: ui
tags: [timer, quiz, accessibility, wcag-2.2.1, per-question-timer, mock-test, practice]

# Dependency graph
requires:
  - phase: 24-05
    provides: usePerQuestionTimer hook, PerQuestionTimer component, TimerExtensionToast component
provides:
  - Per-question timer integrated into mock test (always ON, dual timer display, no extension)
  - Per-question timer integrated into practice session (optional toggle, with WCAG extension)
  - PreTestScreen timer toggle with SessionOverrides interface
  - Auto-submit on per-question timer expiry in both modes
  - Timer pauses during feedback phase in both modes
affects: [quiz-flow, practice-session, mock-test, session-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Ref-based expire handler pattern to avoid circular dependency between hook and useCallback handlers
    - Dual timer display (per-question + overall) in QuizHeader timerSlot

key-files:
  created: []
  modified:
    - src/pages/TestPage.tsx
    - src/components/practice/PracticeSession.tsx
    - src/components/test/PreTestScreen.tsx
    - src/lib/i18n/strings.ts

key-decisions:
  - "Ref-based expire handler pattern: perQuestionExpireRef updated after handleCheck/handleSkip defined to avoid temporal dead zone"
  - "Timer isPaused gated on quizState.phase !== 'answering' (pauses during feedback, checked, transitioning)"
  - "useEffect reset on quizState.currentIndex (not on question object) for minimal re-render"
  - "PreTestScreen timer toggle default ON for mock test path; PracticeConfig already has its own toggle"
  - "SessionOverrides extends SpeechOverrides with timerEnabled for backward compatibility"

patterns-established:
  - "Ref-based callback forwarding: use useRef for handlers that depend on later-declared useCallback hooks"
  - "Dual timer display pattern: PerQuestionTimer + CircularTimer side-by-side in QuizHeader timerSlot"

# Metrics
duration: 23min
completed: 2026-02-18
---

# Phase 24 Plan 06: Per-Question Timer Integration Summary

**Dual-timer quiz integration with 30s per-question countdown in mock test (always ON) and practice mode (toggleable with WCAG 2.2.1 extension)**

## Performance

- **Duration:** 23 min
- **Started:** 2026-02-18T02:07:25Z
- **Completed:** 2026-02-18T02:31:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Mock test now shows both a per-question 30s timer and the overall 20-minute timer, with auto-submit on expiry
- Practice mode has optional per-question timer (toggled from PracticeConfig) with WCAG 2.2.1 extension toast (+15s, E keyboard shortcut)
- PreTestScreen gained a per-question timer toggle (default ON) with new SessionOverrides interface
- Timer pauses during feedback/checked phases in both modes; resets on question advance
- No regressions: all 453 tests pass, production build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: PreTestScreen timer toggle + dependency components** - `7889fae` (feat)
2. **Task 2: TestPage + PracticeSession per-question timer integration** - `76b881a` (feat)

## Files Created/Modified
- `src/components/test/PreTestScreen.tsx` - Added SessionOverrides interface, timerEnabled state, per-question timer toggle UI
- `src/pages/TestPage.tsx` - Integrated usePerQuestionTimer (always ON, no extension), dual timer display, auto-submit on expire
- `src/components/practice/PracticeSession.tsx` - Integrated usePerQuestionTimer (optional, with extension), TimerExtensionToast, auto-submit on expire
- `src/lib/i18n/strings.ts` - Added timer-related bilingual strings (timerWarning, extend, secondsRemaining, perQuestionTimer, thirtySecondsPerQuestion)
- `src/components/quiz/PerQuestionTimer.tsx` - Created as 24-05 dependency (compact 40x40 SVG circular timer)
- `src/components/quiz/TimerExtensionToast.tsx` - Created as 24-05 dependency (WCAG 2.2.1 extension banner)

## Decisions Made
- Ref-based expire handler pattern: `perQuestionExpireRef` updated after `handleCheck` and `handleSkip` are defined, avoiding temporal dead zone issues with `useCallback` forward references
- Timer `isPaused` gated on `quizState.phase !== 'answering'` so timer pauses during all non-answering phases (feedback, checked, transitioning, finished)
- `useEffect` reset triggers on `quizState.currentIndex` change (not on question object reference) for minimal re-renders
- PreTestScreen gets timer toggle even for mock test path (default ON); TestPage ignores the setting and always enables per-question timer
- `SessionOverrides extends SpeechOverrides` with `timerEnabled` for backward compatibility -- existing code destructuring `SpeechOverrides` fields continues to work
- PerQuestionTimer and TimerExtensionToast created as prerequisites since 24-05 was running in parallel

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created 24-05 dependency components**
- **Found during:** Task 1 (PreTestScreen timer toggle)
- **Issue:** PerQuestionTimer.tsx and TimerExtensionToast.tsx did not exist yet (24-05 running in parallel)
- **Fix:** Created both components based on 24-05 plan spec; parallel agent completed shortly after
- **Files modified:** src/components/quiz/PerQuestionTimer.tsx, src/components/quiz/TimerExtensionToast.tsx
- **Verification:** Both files later reconciled with 24-05 agent's versions via pre-commit hooks
- **Committed in:** 7889fae (Task 1 commit)

**2. [Rule 1 - Bug] Ref-based expire handler to avoid temporal dead zone**
- **Found during:** Task 2 (TestPage integration)
- **Issue:** `handlePerQuestionExpire` needed to call `handleCheck()` and `handleSkip()`, but those are defined later as `useCallback` hooks -- causing temporal dead zone with `const` declarations
- **Fix:** Used `useRef<() => void>` pattern with assignment after handler definitions; `onExpire` calls through ref
- **Files modified:** src/pages/TestPage.tsx, src/components/practice/PracticeSession.tsx
- **Verification:** Typecheck passes, build succeeds, no runtime errors
- **Committed in:** 76b881a (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for correct compilation. No scope creep.

## Issues Encountered
None - plan executed with minor adaptations noted above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Per-question timer fully integrated into both quiz modes
- Interview mode remains unaffected (no per-question timer) as specified
- Ready for any remaining Phase 24 plans (24-10)

## Self-Check: PASSED

All 7 referenced files verified to exist on disk. Both commit hashes (7889fae, 76b881a) verified in git log.

---
*Phase: 24-accessibility-performance*
*Completed: 2026-02-18*
