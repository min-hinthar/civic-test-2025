---
phase: 03-ui-ux-bilingual-polish
plan: 02
subsystem: ui
tags: [motion, animation, button, card, skeleton, accessibility, reduced-motion]

# Dependency graph
requires:
  - phase: 03-01
    provides: design-tokens.ts, extended Tailwind colors, animations.css, shimmer keyframes
provides:
  - useReducedMotion hook for accessibility
  - Animated Button component with pill shape and spring feedback
  - Card component with hover lift effect
  - Skeleton component with shimmer animation
  - SkeletonCard and SkeletonAvatar convenience components
affects: [03-03, 03-04, 03-05, 03-06, 03-07]

# Tech tracking
tech-stack:
  added: [motion]
  patterns: [motion.button wrapper, spring transitions, motion variants, reduced-motion detection]

key-files:
  created:
    - src/hooks/useReducedMotion.ts
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/components/ui/Skeleton.tsx
  modified: []

key-decisions:
  - "Use Motion's HTMLMotionProps<'button'> type to avoid onDrag type conflicts"
  - "Wrap Motion's useReducedMotion to handle SSR null case gracefully"
  - "Spring physics: stiffness 400, damping 17 for Button; stiffness 300, damping 20 for Card"
  - "Button scale: 0.97 on tap, 1.03 on hover"
  - "Card lift: y=-4 on hover with shadow increase"

patterns-established:
  - "Motion wrapper pattern: use motion.button/motion.div with variants prop"
  - "Reduced motion pattern: check useReducedMotion() and return empty object for animations"
  - "Type safety pattern: use Omit<HTMLMotionProps<'tag'>, 'children'> for component props"

# Metrics
duration: 8min
completed: 2026-02-06
---

# Phase 03 Plan 02: Core Animated UI Components Summary

**Animated Button, Card, and Skeleton components with Motion spring physics and prefers-reduced-motion support**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-06T22:30:00Z
- **Completed:** 2026-02-06T22:38:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- useReducedMotion hook with SSR-safe Motion wrapper
- Pill-shaped Button with scale-down press and hover lift animations
- Elevated Card with spring-based hover lift effect
- Shimmer Skeleton loader with multi-line and circle variants

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useReducedMotion hook** - `82acbf7` (feat)
2. **Task 2: Create animated Button component** - `ea84ab8` (feat, part of 03-01)
3. **Task 3: Create Card and Skeleton components** - `2fc8679` (feat, part of 03-01)

_Note: Tasks 2 and 3 were pre-completed as part of plan 03-01 execution. The commit hashes reference that work._

## Files Created/Modified
- `src/hooks/useReducedMotion.ts` - SSR-safe Motion reduced-motion hook
- `src/components/ui/Button.tsx` - Animated pill button with spring press/hover
- `src/components/ui/Card.tsx` - Elevated card with interactive hover lift
- `src/components/ui/Skeleton.tsx` - Shimmer loader with lines, circle, SkeletonCard, SkeletonAvatar

## Decisions Made
- Used `HTMLMotionProps<'button'>` from motion/react to avoid type conflicts with React's native button attributes
- Spring transition parameters tuned for Duolingo-style tactile feedback (stiff springs with moderate damping)
- Button minimum height set to 44px for WCAG touch accessibility
- Card border-radius set to 16px (rounded-2xl) for bubbly, friendly aesthetic

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing motion dependency**
- **Found during:** Task 1 (useReducedMotion hook)
- **Issue:** motion package not in package.json, plan assumed it was installed
- **Fix:** Ran `pnpm add motion`
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** Import succeeds, build passes
- **Committed in:** 82acbf7 (package.json changes auto-committed)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential dependency was missing. No scope creep.

## Issues Encountered
- Build hook errors with stale .next cache - resolved by clearing .next directory
- Type conflict between React's ButtonHTMLAttributes and Motion's HTMLMotionProps - resolved by using Motion's type system

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Core UI primitives ready for use across all pages
- Motion animations working with spring physics
- Reduced-motion support verified
- Ready for plan 03-03 (ProgressBar and StreakBadge animations)

---
*Phase: 03-ui-ux-bilingual-polish*
*Completed: 2026-02-06*

## Self-Check: PASSED
