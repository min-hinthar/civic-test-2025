---
phase: 33-states-accessibility
plan: 02
subsystem: ui
tags: [css, prefers-reduced-motion, a11y, motion/react, animation]

# Dependency graph
requires:
  - phase: 31-micro-interaction-system
    provides: "StaggeredList adaptive stagger, glass-morphism animations"
provides:
  - "Complete prefers-reduced-motion coverage for all CSS keyframes"
  - "StaggeredList reduced-motion variant with preserved stagger timing"
affects: [33-states-accessibility, animation-system]

# Tech tracking
tech-stack:
  added: []
  patterns: ["prefers-reduced-motion media queries for every @keyframes", "duration:0 snap for reduced-motion stagger items"]

key-files:
  created: []
  modified:
    - src/styles/globals.css
    - src/styles/animations.css
    - src/components/animations/StaggeredList.tsx

key-decisions:
  - "Decorative animations (badge shimmer, soft bounce, pulse glow) get animation:none under reduced motion"
  - "Progress bar stripe-move uses animation-duration:0s with !important to override inline styles"
  - "StaggeredList reduced-motion keeps stagger orchestration but items snap visible with duration:0"
  - "15+ items and low-end device skips remain performance-based, separate from motion preference"

patterns-established:
  - "Reduced-motion per-keyframe: decorative=none, entrance=show final state, progress=freeze"
  - "Stagger under reduced motion: container orchestrates timing, items use opacity snap (no slide/fade/scale)"

requirements-completed: [STAT-05]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 33 Plan 02: Reduced Motion CSS/JS Animation Audit Summary

**Complete prefers-reduced-motion coverage for all CSS keyframes plus StaggeredList sequential-reveal fix**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T18:34:59Z
- **Completed:** 2026-02-20T18:38:39Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added prefers-reduced-motion rules for 6 uncovered CSS keyframes across globals.css and animations.css
- Verified prismatic-border.css already had complete coverage (no changes needed)
- Fixed StaggeredList to preserve sequential stagger timing under reduced motion while removing per-item visual motion

## Task Commits

Each task was committed atomically:

1. **Task 1: Add prefers-reduced-motion rules for all uncovered CSS keyframes** - `973836c` (feat)
2. **Task 2: Fix StaggeredList reduced-motion to keep timing but remove visual motion** - `f2c2cf5` (fix)

## Files Created/Modified
- `src/styles/globals.css` - Added reduced-motion block for animate-soft-bounce, badge-shimmer, badge-gold-shimmer, stripe-move
- `src/styles/animations.css` - Added reduced-motion rules for pulse-glow and animate-fade-in-up
- `src/components/animations/StaggeredList.tsx` - Separated motion preference from performance skips; updated reducedItemVariants to use opacity snap with stagger

## Decisions Made
- Decorative animations (badge shimmer, soft bounce, pulse glow) use `animation: none` -- fully stopped
- Progress bar stripe-move uses `animation-duration: 0s !important` to override inline style specificity while preserving the static stripe visual
- fade-in-up sets `opacity: 1; transform: none` so elements appear instantly in their final position
- StaggeredList `getAdaptiveConfig` no longer short-circuits for reduced motion -- only 15+ items and low-end devices bypass animation (performance reasons)
- Reduced-motion item variants use `opacity: 0 -> 1` with `duration: 0` so stagger orchestration still sequences appearance
- Shorter default delay (50ms vs 100ms) for reduced-motion stagger to feel snappier

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing stylelint errors (8) in globals.css glass-morphism section (-webkit-backdrop-filter vendor prefix warnings) -- confirmed pre-existing, not caused by this plan's changes

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All CSS keyframes now have reduced-motion coverage
- StaggeredList correctly differentiates motion preference from performance optimizations
- Ready for remaining accessibility plans (33-03 through 33-05)

---
*Phase: 33-states-accessibility*
*Completed: 2026-02-20*
