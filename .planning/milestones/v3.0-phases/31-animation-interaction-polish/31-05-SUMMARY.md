---
phase: 31-animation-interaction-polish
plan: 05
subsystem: ui
tags: [motion, animation, stagger, adaptive-timing, performance, low-end-device]

# Dependency graph
requires:
  - phase: 31-animation-interaction-polish
    provides: "motion-config.ts SPRING_BOUNCY constant, Card/GlassCard animate prop"
provides:
  - "StaggeredList with adaptive timing that scales to list length"
  - "Low-end device detection (hardwareConcurrency <= 4) auto-disabling stagger"
  - "getAdaptiveConfig function for smart stagger defaults"
  - "Coverage audit of all 20 StaggeredList/FadeIn consumer files"
affects: [components-using-staggered-list, dashboard, study-guide, hub-tabs]

# Tech tracking
tech-stack:
  added: []
  patterns: ["adaptive animation timing based on child count", "navigator.hardwareConcurrency for low-end device detection"]

key-files:
  created: []
  modified:
    - src/components/animations/StaggeredList.tsx

key-decisions:
  - "Item animation updated to y(12->0) + opacity + scale(0.97->1) -- removes old y:20/scale:0.9 for subtler effect"
  - "15+ items skip stagger entirely for instant appearance -- prevents painful delays on long lists"
  - "hardwareConcurrency <= 4 threshold for low-end device detection -- matches budget Android phones"
  - "Custom stagger prop still accepted for backward compat -- 5 consumers with explicit values unchanged"
  - "No consumer file modifications in this plan -- audit only documents current state"

patterns-established:
  - "Adaptive stagger: omit stagger prop for smart defaults, pass explicit value to override"
  - "Performance guard: skip animation entirely on low-end devices rather than degrading"

requirements-completed: [ANIM-02, ANIM-06]

# Metrics
duration: 5min
completed: 2026-02-20
---

# Phase 31 Plan 05: Adaptive Stagger Timing Summary

**Adaptive StaggeredList with length-based timing (60ms/40ms/capped/skip), low-end device detection, and coverage audit of 20 consumer files**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-20T12:39:15Z
- **Completed:** 2026-02-20T12:44:27Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- StaggeredList now adapts timing based on child count: 60ms for 1-3 items, 40ms for 4-8, capped formula for 9-14, skipped for 15+
- Low-end device detection auto-disables stagger on budget phones (hardwareConcurrency <= 4)
- Item animation refined to slide-up from 12px + subtle scale(0.97->1) + fade-in with spring physics
- Coverage audit documented all 20 consumer files with usage patterns and intentional exclusions
- All 482 tests pass, typecheck and lint clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance StaggeredList with adaptive timing and low-end device detection** - `ce6778a` (feat)
2. **Task 2: Audit StaggeredList coverage across all consumer files** - `4b5db95` (docs)

## Files Created/Modified
- `src/components/animations/StaggeredList.tsx` - Added getAdaptiveConfig function, adaptive timing, low-end device detection, updated item variants, coverage audit comment

## Decisions Made
- Item animation changed from y:20 + scale:0.9 to y:12 + scale:0.97 for subtler, more refined slide-up effect (plan specified 10-15px range, chose 12px midpoint)
- Stagger skipped entirely (not just reduced) for 15+ items -- rendering 15+ items at once is faster than any stagger delay
- Low-end device threshold set at hardwareConcurrency <= 4 -- matches typical budget Android phones where animation jank is most noticeable
- Custom stagger/delay props preserved for backward compatibility -- consumers with explicit values (LandingPage, Dashboard, WelcomeState, OverviewTab, LeaderboardTable, AchievementsTab, BadgeGrid) keep their settings unchanged
- No consumer files modified -- audit documents state, adaptive system benefits consumers without explicit stagger automatically

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 plans in Phase 31 (Animation & Interaction Polish) are now complete
- StaggeredList adaptive timing benefits DeckManager (up to 128 cards) and HistoryTab (dynamic sessions) automatically
- Phase ready for milestone completion

## Self-Check: PASSED

- FOUND: src/components/animations/StaggeredList.tsx
- FOUND: .planning/phases/31-animation-interaction-polish/31-05-SUMMARY.md
- FOUND: ce6778a (Task 1 commit)
- FOUND: 4b5db95 (Task 2 commit)
- getAdaptiveConfig function present (2 references)
- Children.count usage confirmed (1 reference)

---
*Phase: 31-animation-interaction-polish*
*Completed: 2026-02-20*
