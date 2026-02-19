---
phase: 23-flashcard-sort
plan: 04
subsystem: ui-components
tags: [gesture, animation, motion-react, swipe, card-stack, sort-mode]

# Dependency graph
requires:
  - phase: 23-01
    provides: sortTypes for SwipeableCard props
provides:
  - SwipeableCard with drag, rotation, overlays, velocity-based fling
  - SwipeableStack with depth transforms and static card previews
affects: [23-06, 23-09]

# Tech tracking
tech-stack:
  added: []
  patterns: [useMotionValue, useTransform, useAnimate, drag-commit-threshold]

key-files:
  created:
    - src/components/sort/SwipeableCard.tsx
    - src/components/sort/SwipeableStack.tsx
  modified: []

key-decisions:
  - "Velocity threshold 800px/s OR 40% card width for commit"
  - "Spring fling with velocity inheritance for natural feel"
  - "Static card previews behind active card (not full Flashcard3D)"
  - "Bilingual zone labels (Know/Don't Know) tied to drag opacity"

patterns-established:
  - "useMotionValue + useTransform for derived rotation and overlay opacity"
  - "useAnimate scope for imperative fling animation after drag end"

# Metrics
duration: 8min
completed: 2026-02-17
---

# Phase 23 Plan 04: SwipeableCard & SwipeableStack Summary

**Tinder-style swipeable card with spring physics and stacked deck with depth transforms**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- SwipeableCard with horizontal drag, rotation (-15 to 15 degrees), green/amber overlays
- Velocity-based commit: fast flick (>800px/s) always commits, slow drag needs 40% card width
- Spring fling animation with velocity inheritance for natural feel
- Snap-back animation on non-commit with stiff spring
- SwipeableStack renders 2-3 visible cards with scale(0.96/0.92) and translateY(8/16px)
- Only top card receives pointer events
- Bilingual zone labels ("Know / သိပါတယ်" and "Don't Know / မသိပါ")
- Reduced motion support via useReducedMotion

## Task Commits

1. **Task 1: SwipeableCard** - `2862580`
2. **Task 2: SwipeableStack** - `dcbd7bf`

## Files Created
- `src/components/sort/SwipeableCard.tsx` - Draggable card with rotation, overlays, and fling
- `src/components/sort/SwipeableStack.tsx` - Stacked deck with depth transforms

## Self-Check: PASSED

---
*Phase: 23-flashcard-sort*
*Completed: 2026-02-17*
