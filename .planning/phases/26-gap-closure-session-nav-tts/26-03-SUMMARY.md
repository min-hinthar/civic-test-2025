---
phase: 26-gap-closure-session-nav-tts
plan: 03
subsystem: ui
tags: [react, interview, language-mode, navigation, routing]

requires:
  - phase: 18-language-mode
    provides: useLanguage hook with showBurmese flag
  - phase: 21-test-practice-ux-overhaul
    provides: InterviewSession with practice/realistic modes
  - phase: 23-flashcard-sort-mode
    provides: Sort mode in StudyGuidePage with hash-based tab navigation
provides:
  - Interview realistic mode English-only UI override
  - Correct sort session route in UnfinishedBanner
affects: [interview, dashboard, navigation]

tech-stack:
  added: []
  patterns: [mode-based-showBurmese-override]

key-files:
  created: []
  modified:
    - src/components/interview/InterviewSession.tsx
    - src/components/sessions/UnfinishedBanner.tsx

key-decisions:
  - "Local showBurmese override (not global) — only affects InterviewSession component"
  - "Practice mode still respects global language toggle"
  - "Sort route uses /study#sort matching StudyGuidePage hash-based tab navigation"

patterns-established:
  - "Mode-based showBurmese override: destructure as globalShowBurmese, derive local showBurmese from mode"

requirements-completed: [LANG-03, SESS-06, FLSH-07]

duration: 2min
completed: 2026-02-18
---

# Plan 26-03: Interview English-Only + Sort Route Fix Summary

**Interview realistic mode forces showBurmese=false for zero Burmese UI text; sort banner navigates to /study#sort**

## Performance

- **Duration:** 2 min
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Interview realistic mode overrides showBurmese to false (all 13+ Burmese locations render nothing)
- Interview practice mode still respects global language toggle
- Dashboard UnfinishedBanner for sort sessions navigates to /study#sort instead of dead /sort route

## Task Commits

1. **Task 1: Override showBurmese for interview realistic mode** - `59f6fc9` (fix)
2. **Task 2: Fix sort route in UnfinishedBanner** - `59f6fc9` (fix)

## Files Created/Modified
- `src/components/interview/InterviewSession.tsx` - globalShowBurmese rename + mode-based override
- `src/components/sessions/UnfinishedBanner.tsx` - Sort route changed from /sort to /study#sort

## Decisions Made
None - followed plan as specified

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three gap closure items in this plan are resolved
- Phase 26 execution complete

---
*Phase: 26-gap-closure-session-nav-tts*
*Completed: 2026-02-18*
