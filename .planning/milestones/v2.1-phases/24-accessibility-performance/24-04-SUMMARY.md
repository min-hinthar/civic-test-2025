---
phase: 24-accessibility-performance
plan: 04
subsystem: ui
tags: [motion, reduced-motion, a11y, prefers-reduced-motion, crossfade, animation]

# Dependency graph
requires:
  - phase: 23-sort-mode
    provides: SwipeableCard/SwipeableStack sort animation components
  - phase: 21-ux-overhaul
    provides: PillTabBar, Flashcard3D, SessionCountdown, StreakReward
provides:
  - Meaningful reduced motion alternatives for all animation-heavy components
  - Crossfade pattern for 3D flip cards under reduced motion
  - Quick linear slide pattern for button-initiated sort under reduced motion
  - 150-200ms subtle transition replacements for all instant-jump animations
affects: [24-05, 24-06, 24-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS opacity crossfade (200ms) replaces 3D rotateY under reduced motion"
    - "pendingDirection state pattern for deferred animation on button press"
    - "150ms easeOut for interactive controls (toggles, nav indicators) under reduced motion"
    - "200ms easeOut for progress bar fill under reduced motion"

key-files:
  created: []
  modified:
    - src/components/study/Flashcard3D.tsx
    - src/components/sort/SwipeableCard.tsx
    - src/components/sort/SwipeableStack.tsx
    - src/components/sort/SortModeContainer.tsx
    - src/components/ui/PillTabBar.tsx
    - src/components/ui/Progress.tsx
    - src/components/ui/LanguageToggle.tsx
    - src/components/ui/FlagToggle.tsx
    - src/components/navigation/Sidebar.tsx
    - src/components/navigation/NavigationShell.tsx
    - src/components/navigation/NavItem.tsx

key-decisions:
  - "Crossfade via CSS opacity transition (not motion/react animate) for Flashcard3D reduced motion flip"
  - "pendingDirection state prop defers SwipeableCard animation to useEffect for button-initiated sorts"
  - "SessionCountdown and StreakReward already had adequate reduced motion handling -- no changes needed"
  - "Interactive controls (toggles, nav) use 150ms easeOut; progress bars use 200ms easeOut"
  - "Tab label scale animations (animate={}) under reduced motion left with duration:0 since no animation occurs"

patterns-established:
  - "Reduced motion crossfade: skip transformStyle/willChange, use CSS opacity+transition on each face"
  - "Deferred animation: parent sets pendingDirection state, child useEffect runs quick linear slide"
  - "150ms easeOut as standard reduced motion transition for interactive position changes"

# Metrics
duration: ~35min
completed: 2026-02-18
---

# Phase 24 Plan 04: Reduced Motion Alternatives Summary

**Crossfade for 3D flip, quick linear slide for sort swipe, 150-200ms subtle transitions replacing 40+ instant-jump animations across navigation, toggles, and progress components**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-02-18T01:20:00Z
- **Completed:** 2026-02-18T01:56:19Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Flashcard3D flip under reduced motion uses 200ms CSS opacity crossfade instead of instant jump (front fades out, back fades in)
- Sort swipe under reduced motion uses pendingDirection state pattern: button press triggers 200ms linear slide off-screen (no spring physics, no rotation)
- Audited 40+ `{ duration: 0 }` instances across the codebase; replaced 8 in key user-facing components (toggles, nav indicators, progress bars) with 150-200ms subtle transitions
- Confirmed SessionCountdown and StreakReward already have adequate reduced motion handling (opacity fade, no scale bounce)

## Task Commits

Each task was committed atomically:

1. **Task 1: Flashcard flip + sort swipe reduced motion alternatives** - `27cb95e` (feat)
2. **Task 2: Countdown + celebrations audit + general duration:0 audit** - `3b7d72a` (feat)

## Files Created/Modified

- `src/components/study/Flashcard3D.tsx` - Crossfade between faces under reduced motion (CSS opacity 200ms instead of 3D rotateY)
- `src/components/sort/SwipeableCard.tsx` - pendingDirection prop + useEffect for 200ms linear slide under reduced motion; drag overlays/zone labels hidden
- `src/components/sort/SwipeableStack.tsx` - Behind-card entrance uses fade-in (duration 0.15) instead of spring scale+translate
- `src/components/sort/SortModeContainer.tsx` - pendingDirection state management; reduced motion button sorts set direction instead of immediate complete
- `src/components/ui/PillTabBar.tsx` - Pill indicator slide: 150ms easeOut instead of instant jump
- `src/components/ui/Progress.tsx` - Bar fill: 200ms easeOut instead of instant snap
- `src/components/ui/LanguageToggle.tsx` - Switch knob: 150ms easeOut instead of instant jump
- `src/components/ui/FlagToggle.tsx` - Button transitions: 150ms easeOut for both flag buttons
- `src/components/navigation/Sidebar.tsx` - Width/expand animation: 150ms easeOut instead of instant resize
- `src/components/navigation/NavigationShell.tsx` - Content margin: 150ms easeOut instead of instant jump
- `src/components/navigation/NavItem.tsx` - Mobile nav pill: 150ms easeOut instead of instant jump

## Decisions Made

- **Crossfade via CSS opacity (not motion/react)**: Under reduced motion, Flashcard3D skips `transformStyle: preserve-3d`, `willChange: transform`, and `backfaceVisibility: hidden`. Instead, each face uses inline `opacity` with `transition: 'opacity 200ms ease-in-out'`. This is simpler and more reliable than having motion/react manage the crossfade.
- **pendingDirection deferred animation pattern**: For button-initiated sorts under reduced motion, the parent (SortModeContainer) sets a `pendingDirection` state. SwipeableCard detects it via `useEffect` and runs a 200ms linear slide. This avoids calling `handleAnimationComplete` synchronously (which would skip the animation entirely).
- **SessionCountdown already adequate**: Uses opacity fade (0.15s), no scale bounce, SVG ring hidden under reduced motion. No changes needed.
- **StreakReward already adequate**: Uses opacity-only animation (0.2s), no scale/y transforms. Auto-hide timer still works. No changes needed.
- **Tab label scale: left as duration:0**: PillTabBar tab label scale animations use `animate={}` (empty object = no animation) under reduced motion, so the `{ duration: 0 }` transition is irrelevant and left as-is.
- **Remaining duration:0 instances left intentionally**: Components like StaggeredList (animation utility), PageTransition (page transitions should be instant for reduced motion users to avoid disorientation), and quiz feedback components (AnswerOption, FeedbackPanel, etc.) were left with `{ duration: 0 }` as they serve layout entrance animations where instant appearance is appropriate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added pendingDirection state pattern to SortModeContainer**
- **Found during:** Task 1 (SwipeableCard reduced motion)
- **Issue:** SwipeableCard needed a `pendingDirection` prop to trigger button-initiated sort animations under reduced motion, but SortModeContainer had no mechanism to provide this
- **Fix:** Added `pendingDirection` state to SortModeContainer, modified `handleSortWithAnnouncement` to set direction instead of immediate complete under reduced motion, added `handleAnimationCompleteWithClear` wrapper
- **Files modified:** src/components/sort/SortModeContainer.tsx
- **Verification:** TypeScript compiles, lint passes
- **Committed in:** 27cb95e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for button-initiated sort animations to work under reduced motion. No scope creep.

## Issues Encountered

- **Parallel agent interference**: Other GSD agents running on plans 02, 03, 07, 08, 09 concurrently modified shared files (SortModeContainer.tsx, SwipeableCard.tsx). Required multiple re-reads and careful staging to avoid committing other agents' changes.
- **SessionCountdown path mismatch**: Plan listed `src/components/session/SessionCountdown.tsx` (singular) but actual path was `src/components/sessions/SessionCountdown.tsx` (plural). Found via Glob search.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All animation-heavy components now have meaningful reduced motion alternatives
- Ready for Phase 24 remaining plans (focus management, color contrast, touch targets, testing)
- Pattern established for future animation work: 150ms easeOut for interactive controls, 200ms for progress indicators

## Self-Check: PASSED

- All 11 modified files exist
- Commit 27cb95e (Task 1) found
- Commit 3b7d72a (Task 2) found
- SUMMARY.md created

---
*Phase: 24-accessibility-performance*
*Completed: 2026-02-18*
