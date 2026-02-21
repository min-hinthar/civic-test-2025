---
phase: 37-bug-fixes-ux-polish
plan: 01
subsystem: ui
tags: [motion/react, card, interview, feedback, transcript]

# Dependency graph
requires: []
provides:
  - "Card.tsx interactive variant with explicit opacity:1 and scale:1"
  - "Interview Practice mode feedback phase after self-grading"
  - "Interview Realistic mode answer hiding in transcript"
affects: [study-guide, interview]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "motion/react variants must include all animated properties in every variant state"

key-files:
  created: []
  modified:
    - "src/components/ui/Card.tsx"
    - "src/components/interview/InterviewSession.tsx"
    - "src/components/interview/InterviewTranscript.tsx"

key-decisions:
  - "Card idle/hover variants must explicitly set opacity:1 and scale:1 when initial includes opacity:0/scale:0.95"
  - "handleSelfGrade triggers feedback phase instead of transition, reusing existing FEEDBACK effect for answer display"
  - "InterviewTranscript gates answer reveal on mode === 'practice' rather than showing for all modes"

patterns-established:
  - "Motion variant completeness: every variant must define all properties that appear in initial to avoid interpolation gaps"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-02-21
---

# Phase 37 Plan 01: Critical Bug Fixes Summary

**Fixed invisible Study Guide cards via Card.tsx motion variant completeness, interview practice answer display via feedback phase, and realistic mode answer hiding via mode-gated transcript**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-21T08:42:21Z
- **Completed:** 2026-02-21T08:50:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Card.tsx interactive variant now includes opacity:1 and scale:1 in both idle and hover states, fixing invisible Study Guide category cards
- Interview Practice mode handleSelfGrade triggers feedback phase instead of skipping to transition, enabling answer text display after self-grading
- Interview Realistic mode transcript gates "Show correct answer" section on mode === 'practice', preventing answer leakage in realistic mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Card.tsx interactive variant missing opacity and scale** - `a0c94e6` (fix)
2. **Task 2: Fix Interview Practice mode answer display + Realistic mode answer hiding** - `ba65159` (fix)

## Files Created/Modified
- `src/components/ui/Card.tsx` - Added opacity:1 and scale:1 to idle and hover motion variants
- `src/components/interview/InterviewSession.tsx` - Changed handleSelfGrade to trigger feedback phase instead of transition
- `src/components/interview/InterviewTranscript.tsx` - Renamed _mode to mode, gated answer reveal on mode === 'practice'

## Decisions Made
- Card idle variant must explicitly set all animated properties (opacity, scale) that appear in initial, not just y and boxShadow
- handleSelfGrade reuses existing FEEDBACK effect rather than duplicating transition logic, following DRY principle
- Transcript answer hiding uses simple mode check rather than a separate prop, keeping the component API clean

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- OneDrive + lint-staged stash/unstash caused commit cross-contamination: Task 2 changes were picked up by lint-staged during Task 1 commit, resulting in interview fixes being committed in a different commit than planned. All fixes are present in the commit history.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three critical bugs fixed and verified with typecheck + test suite (482 tests passing)
- Ready for Plan 02 and subsequent bug fix plans

## Self-Check: PASSED

- FOUND: src/components/ui/Card.tsx
- FOUND: src/components/interview/InterviewSession.tsx
- FOUND: src/components/interview/InterviewTranscript.tsx
- FOUND: .planning/phases/37-bug-fixes-ux-polish/37-01-SUMMARY.md
- FOUND: commit a0c94e6
- FOUND: commit ba65159

---
*Phase: 37-bug-fixes-ux-polish*
*Completed: 2026-02-21*
