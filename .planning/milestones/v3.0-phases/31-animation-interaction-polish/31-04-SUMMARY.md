---
phase: 31-animation-interaction-polish
plan: 04
subsystem: ui
tags: [motion, animation, spring-physics, card, glass-card, enter-animation]

# Dependency graph
requires:
  - phase: 31-animation-interaction-polish
    provides: "motion-config.ts SPRING_GENTLE constant"
provides:
  - "Card.tsx with scale(0.95->1) + fade enter animation on mount"
  - "GlassCard.tsx with scale(0.95->1) + fade enter animation via motion wrapper"
  - "animate prop on both Card and GlassCard to disable animation in stagger contexts"
affects: [31-animation-interaction-polish, components-using-card, components-using-glasscard]

# Tech tracking
tech-stack:
  added: []
  patterns: ["outer motion.div wrapper to avoid transform + backdrop-filter conflict on WebKit"]

key-files:
  created: []
  modified:
    - src/components/ui/Card.tsx
    - src/components/ui/GlassCard.tsx

key-decisions:
  - "Card interactive branch uses explicit initial object { opacity: 0, scale: 0.95, y: 0 } that transitions to idle variant for combined enter + hover"
  - "GlassCard uses two-element approach (outer motion.div + inner glass div) to avoid backdrop-filter + transform WebKit conflict"
  - "animate prop defaults to true; consumers inside StaggeredList should pass animate={false}"

patterns-established:
  - "Card enter animation: scale(0.95->1) + opacity(0->1) with SPRING_GENTLE"
  - "Glass component animation isolation: keep transform on outer wrapper, backdrop-filter on inner element"

requirements-completed: [ANIM-04]

# Metrics
duration: 18min
completed: 2026-02-20
---

# Phase 31 Plan 04: Card Enter Animation Summary

**Scale(0.95->1) + fade enter animations on Card.tsx and GlassCard.tsx with SPRING_GENTLE physics and animate prop for StaggeredList opt-out**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-20T12:10:21Z
- **Completed:** 2026-02-20T12:28:48Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Card.tsx enters with subtle scale+fade animation using spring physics for natural deceleration
- GlassCard.tsx enters with same animation via outer motion.div wrapper that avoids backdrop-filter + transform WebKit conflict
- Both components accept `animate` prop (default: true) to disable animation when used inside StaggeredList
- Reduced motion users see instant content with no animation overhead

## Task Commits

Each task was committed atomically:

1. **Task 1: Add enter animation to Card.tsx** - `8e3d233` (feat)
2. **Task 2: Add enter animation to GlassCard.tsx** - `394c591` (feat)

## Files Created/Modified
- `src/components/ui/Card.tsx` - Added scale+fade enter animation for both interactive and non-interactive modes with animate prop
- `src/components/ui/GlassCard.tsx` - Added scale+fade enter animation via outer motion.div wrapper with animate prop

## Decisions Made
- Card interactive branch uses explicit initial object `{ opacity: 0, scale: 0.95, y: 0 }` that transitions to the `idle` variant, combining enter animation with existing hover/tap variants without conflicts
- GlassCard uses two-element approach (outer motion.div + inner glass div) to avoid the known backdrop-filter + transform rendering artifact on WebKit browsers
- `animate` prop defaults to `true` so all cards across the app get enter animation automatically; consumers inside StaggeredList should explicitly pass `animate={false}`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `pnpm build` failed due to OneDrive webpack cache corruption (known issue: `.next/server/pages-manifest.json` deleted by OneDrive during build). Webpack compilation itself succeeded (`Compiled successfully in 4.0min`). Verified with `pnpm typecheck` and `pnpm lint` which both pass cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All cards across the app now enter with satisfying spring-physics pop-in animation
- Cards inside StaggeredList should be updated with `animate={false}` to avoid double-animation if needed
- Ready for remaining animation polish plans in Phase 31

## Self-Check: PASSED

- FOUND: src/components/ui/Card.tsx
- FOUND: src/components/ui/GlassCard.tsx
- FOUND: .planning/phases/31-animation-interaction-polish/31-04-SUMMARY.md
- FOUND: 8e3d233 (Task 1 commit)
- FOUND: 394c591 (Task 2 commit)

---
*Phase: 31-animation-interaction-polish*
*Completed: 2026-02-20*
