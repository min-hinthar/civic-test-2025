---
phase: 27-gap-closure-timer-a11y
plan: 01
subsystem: a11y
tags: [accessibility, wcag, screen-reader, timer, aria-live]

requires:
  - phase: 24-accessibility-performance
    provides: PerQuestionTimer sr-only pattern and TimerExtensionToast
provides:
  - Overall mock test timer screen reader announcements at 5min/2min/1min
  - WCAG 2.2.1 timer extension exception documentation
affects: [test, accessibility]

tech-stack:
  added: []
  patterns: [sr-only-aria-live-milestone-announcements]

key-files:
  created: []
  modified:
    - src/components/test/CircularTimer.tsx

key-decisions:
  - "Exact threshold matching (=== 300/120/60) not range — fires once per threshold crossing"
  - "sr-only span placed outside aria-hidden wrapper so announcements work when timer is visually hidden"
  - "Overall timer documented as WCAG 2.2.1 essential timing exception (USCIS simulation)"
  - "role=timer with aria-label on outer container for continuous accessible label"

patterns-established:
  - "Overall timer milestone announcements follow same pattern as per-question timer threshold announcements"

requirements-completed: [A11Y-04, A11Y-05]

duration: 3min
completed: 2026-02-18
---

# Plan 27-01: Timer Accessibility — sr-only Announcements + WCAG Exception Summary

**Screen reader announces at 5/2/1 min milestones; WCAG 2.2.1 timer extension documented as USCIS simulation exception**

## Performance

- **Duration:** 3 min
- **Completed:** 2026-02-18
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- CircularTimer announces "5 minutes remaining", "2 minutes remaining", "1 minute remaining" via aria-live="assertive" sr-only region
- Announcements fire at exact threshold values (=== 300, 120, 60 seconds) — one-shot per threshold
- sr-only span placed outside aria-hidden={isHidden} wrapper — works even when timer is visually hidden
- Outer container gets role="timer" with dynamic aria-label for continuous accessible state
- WCAG 2.2.1 timer extension exception documented in JSDoc: essential timing for USCIS simulation, per-question timer already has extension, practice mode has no limit

## Task Commits

1. **Task 1: Add sr-only aria-live announcements to CircularTimer** - `bbc3699` (feat)

## Files Created/Modified
- `src/components/test/CircularTimer.tsx` - Added sr-only aria-live region, role="timer", aria-label, WCAG 2.2.1 JSDoc

## Decisions Made
- Used exact equality checks (===) for threshold matching, following PerQuestionTimer pattern
- Placed sr-only span between timer display div and hide/show toggle button, outside aria-hidden wrapper

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 27 execution complete
- Both A11Y-04 and A11Y-05 requirements addressed

---
*Phase: 27-gap-closure-timer-a11y*
*Completed: 2026-02-18*
