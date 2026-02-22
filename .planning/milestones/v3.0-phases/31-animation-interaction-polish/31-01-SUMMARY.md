---
phase: 31-animation-interaction-polish
plan: 01
subsystem: ui
tags: [motion, spring-animation, button, tailwind, dark-mode, accessibility]

# Dependency graph
requires:
  - phase: 30-mobile-native-feel
    provides: "Haptic feedback integration, mobile-native interaction patterns"
provides:
  - "Three-tier button press feedback system (primary/secondary/tertiary)"
  - "SPRING_PRESS_DOWN spring config for fast button press"
  - "Dark mode rim-lit edge classes for 3D chunky buttons"
  - "Shared tier classification function getTier()"
affects: [31-animation-interaction-polish, ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [three-tier-button-press, dark-mode-rim-lit-edges, hybrid-css-spring-animation]

key-files:
  created: []
  modified:
    - src/components/ui/Button.tsx
    - src/components/bilingual/BilingualButton.tsx
    - src/lib/motion-config.ts

key-decisions:
  - "Hybrid CSS+spring approach: CSS handles shadow/translateY on :active, motion handles scale on whileTap/whileHover to avoid transform conflicts"
  - "Token-based colors (hsl(var(--primary-*))) over hardcoded HSL values for consistency"
  - "BilingualButton outline/ghost both classified as tertiary tier (opacity fade) for simplified hierarchy"
  - "Skip ripple effect: 3D chunky press with prismatic glow is already distinctive enough"
  - "SPRING_PRESS_DOWN (stiffness 800, damping 30, mass 0.5) for ~50ms settle time on primary tier"

patterns-established:
  - "Three-tier button classification: getTier() maps variant strings to primary/secondary/tertiary"
  - "Dark mode rim-lit edges: lighter hsl colors at 0.6 opacity replace darker shadows in dark mode"
  - "Tier-aware spring selection: primary uses SPRING_PRESS_DOWN, others use SPRING_BOUNCY"

requirements-completed: [ANIM-01]

# Metrics
duration: 10min
completed: 2026-02-20
---

# Phase 31 Plan 01: Three-Tier Button Press Summary

**Three-tier button press system with 3D chunky primary (SPRING_PRESS_DOWN), scale secondary, and opacity tertiary feedback across Button.tsx and BilingualButton.tsx**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-20T12:10:13Z
- **Completed:** 2026-02-20T12:20:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Implemented three-tier button press hierarchy: primary (3D chunky with lift-on-hover + spring-back), secondary (scale 0.97 + shadow reduction), tertiary (opacity 0.7 fade)
- Added dark mode rim-lit edges using lighter HSL values at 0.6 opacity for all 3D chunky variants (primary, destructive, success)
- Aligned BilingualButton.tsx with Button.tsx: replaced local springTransition and hardcoded colors with shared configs and token-based colors
- Added SPRING_PRESS_DOWN spring config (stiffness 800, damping 30, mass 0.5) for instant press feel

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SPRING_PRESS_DOWN config and enhance Button.tsx with three-tier press system** - `6b6fd62` (feat)
2. **Task 2: Align BilingualButton.tsx with Button.tsx tier system** - `b959059` (feat)

## Files Created/Modified
- `src/lib/motion-config.ts` - Added SPRING_PRESS_DOWN spring config export
- `src/components/ui/Button.tsx` - Three-tier press system with getTier(), dark mode rim-lit edges, tier-aware motionVariants, smooth focus ring transition
- `src/components/bilingual/BilingualButton.tsx` - Aligned with Button.tsx tier system, replaced local configs with shared imports, token-based colors

## Decisions Made
- Hybrid CSS+spring approach: CSS handles immediate shadow/translateY on :active, motion/react handles scale on whileTap/whileHover -- prevents double-transform conflicts
- Token-based colors (hsl(var(--primary-*))) used in BilingualButton to replace hardcoded HSL values (hsl(224_76%_48%))
- BilingualButton outline and ghost both mapped to tertiary tier (opacity fade) since it has fewer variant types than Button.tsx
- Skipped ripple effect per plan guidance -- 3D chunky press with prismatic glow is already bold and distinctive
- SPRING_PRESS_DOWN configured with high stiffness (800) and low mass (0.5) for ~50ms settle time

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Button tier system is fully operational for all existing variants
- Dark mode rim-lit edges ready for glass morphism integration in later plans
- SPRING_PRESS_DOWN available for other components needing fast press feedback
- No blockers for 31-02 (card interaction animations)

## Self-Check: PASSED

- All 3 modified files verified on disk
- Both task commits (6b6fd62, b959059) verified in git log
- TypeScript typecheck: passed
- ESLint: passed
- Production build: passed

---
*Phase: 31-animation-interaction-polish*
*Completed: 2026-02-20*
