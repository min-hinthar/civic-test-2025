---
phase: 16-dashboard-next-best-action
plan: 03
subsystem: ui
tags: [nba, composition-hook, hero-card, glassmorphism, animation, bilingual, react-compiler]

# Dependency graph
requires:
  - phase: 16-01
    provides: "determineNextBestAction pure function, NBAState types, NBAInput interface"
provides:
  - "useNextBestAction composition hook bridging 5+ data hooks to NBA pure function"
  - "NBAHeroCard glassmorphic hero component with contextual gradients and animations"
  - "NBAHeroSkeleton loading placeholder for dashboard"
affects: [16-04-dashboard-composition, 16-05-dashboard-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Composition hook aggregating 5+ data sources with unified loading gate", "AnimatePresence crossfade keyed on discriminated union type", "Icon/gradient/color maps keyed on NBAStateType enum"]

key-files:
  created:
    - src/hooks/useNextBestAction.ts
    - src/components/dashboard/NBAHeroCard.tsx
  modified: []

key-decisions:
  - "InterviewSession.passed used directly (field exists on type) -- no need to compute from score"
  - "Link from react-router-dom used for CTA/skip (accessible, no button+navigate pattern)"
  - "Gradient overlay uses fixed opacity-15 class (not per-state) to keep glassmorphism clean"
  - "Icon color map separate from icon bg map for independent theming of icon stroke vs background tint"

patterns-established:
  - "Composition hook pattern: aggregate multiple hooks + async IndexedDB loads with unified isLoading gate before useMemo computation"
  - "NBAStateType-keyed Record maps for icon, bg, color, gradient -- easily extensible for new states"

# Metrics
duration: 4min
completed: 2026-02-11
---

# Phase 16 Plan 03: NBA Hook + Hero Card Summary

**useNextBestAction composition hook aggregating 6 data sources with NBAHeroCard glassmorphic hero component featuring contextual gradients, pulsing urgent icons, and bilingual AnimatePresence crossfade**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-11T11:16:39Z
- **Completed:** 2026-02-11T11:20:39Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- useNextBestAction hook composes streak, SRS, mastery, auth test history, interview history, and practice count with unified loading orchestration
- NBAHeroCard renders glassmorphic card with contextual gradient overlay, themed icon with pulse animation for urgent states, bilingual title/hint/CTA
- AnimatePresence crossfade keyed on NBAStateType for smooth state transitions with spring entrance animation
- NBAHeroSkeleton loading placeholder matches hero card layout dimensions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useNextBestAction composition hook** - `69d45c8` (feat)
2. **Task 2: Create NBAHeroCard component** - `cd5d87a` (feat)

## Files Created/Modified
- `src/hooks/useNextBestAction.ts` - Composition hook bridging 6 data sources to determineNextBestAction pure function
- `src/components/dashboard/NBAHeroCard.tsx` - NBA hero card UI with NBAHeroSkeleton loading state

## Decisions Made
- InterviewSession type already has `passed: boolean` field -- used directly without computing from score
- Used Link from react-router-dom for CTA and skip navigation (accessibility pattern with proper anchor semantics)
- Gradient overlay set to fixed opacity-15 to avoid muddy glassmorphism; gradient classes from NBAState provide color direction
- Separated icon color map from icon background tint map for independent theming flexibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- useNextBestAction hook ready for consumption by Dashboard.tsx composition (plan 16-04/05)
- NBAHeroCard + NBAHeroSkeleton ready for dashboard layout integration
- All React Compiler ESLint rules satisfied (no useMemo generics, no setState in effects)

## Self-Check: PASSED

- [x] src/hooks/useNextBestAction.ts exists
- [x] src/components/dashboard/NBAHeroCard.tsx exists
- [x] Commit 69d45c8 found in git log
- [x] Commit cd5d87a found in git log
- [x] TypeScript compiles without errors

---
*Phase: 16-dashboard-next-best-action*
*Completed: 2026-02-11*
