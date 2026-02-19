---
phase: 23-flashcard-sort
plan: 05
subsystem: ui-components
tags: [progress-bar, countdown, buttons, animation, sort-mode]

# Dependency graph
requires:
  - phase: 23-01
    provides: SortPhase type for animation gating
provides:
  - SortProgress with dual animated counters and adaptive progress bar
  - KnowDontKnowButtons with 3D chunky style and undo
  - SortCountdown with circular SVG timer and tick sounds
affects: [23-06, 23-09]

# Tech tracking
tech-stack:
  added: []
  patterns: [key-remount-animation, step-countdown, svg-ring-progress]

key-files:
  created:
    - src/components/sort/SortProgress.tsx
    - src/components/sort/KnowDontKnowButtons.tsx
    - src/components/sort/SortCountdown.tsx
  modified: []

key-decisions:
  - "Adaptive progress bar: segmented for <=40 cards, continuous for >40"
  - "Counter pop animation via key={count} remount with spring scale"
  - "3D chunky button style matching existing quiz buttons"
  - "Step-based countdown with setTimeout (React Compiler safe)"

# Metrics
duration: 8min
completed: 2026-02-17
---

# Phase 23 Plan 05: SortProgress, KnowDontKnowButtons, SortCountdown Summary

**Sort mode progress UI: animated counters, adaptive progress bar, chunky buttons, and circular countdown timer**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- SortProgress with dual animated counters (spring pop on increment), bilingual labels
- Adaptive progress bar: SegmentedProgressBar for <=40 cards, continuous bar for >40
- Round counter badge shown for round > 1 (FLSH-09)
- KnowDontKnowButtons: Don't Know (amber), Undo (neutral), Know (green)
- 3D chunky button style with shadow-[0_4px_0] and active translate-y
- Buttons disabled during animation phase; Undo disabled when stack empty
- SortCountdown: 5-second circular SVG ring countdown with tick/go sounds
- Skip and Cancel buttons on countdown; reduced motion fallback to static text
- All components fully bilingual (FLSH-08)

## Task Commits

1. **Task 1: SortProgress + KnowDontKnowButtons** - `31d691b`
2. **Task 2: SortCountdown** - `0e87ffe`

## Files Created
- `src/components/sort/SortProgress.tsx` - Dual counters + adaptive progress bar
- `src/components/sort/KnowDontKnowButtons.tsx` - Know/Don't Know/Undo buttons
- `src/components/sort/SortCountdown.tsx` - 5-second circular countdown timer

## Self-Check: PASSED

---
*Phase: 23-flashcard-sort*
*Completed: 2026-02-17*
