---
phase: 28-interview-ux-voice-flow-polish
plan: 05
subsystem: ui
tags: [interview, mode-badge, progress-bar, timer, long-press, motion, svg]

# Dependency graph
requires:
  - phase: 28-02
    provides: KeywordHighlight and TextAnswerInput for interview components
provides:
  - ModeBadge component for Real/Practice mode visual indicator
  - InterviewProgress with mode-aware segmented progress bar
  - Enhanced InterviewTimer with SVG ring and color urgency transitions
  - LongPressButton for 3-second hold-to-exit in Real mode
affects: [28-06, 28-07, 28-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SVG strokeDashoffset for circular countdown rings
    - requestAnimationFrame loop for smooth hold progress (RAF in handlers only, React Compiler safe)
    - Mode-aware coloring (monochrome for Real, colored for Practice)

key-files:
  created:
    - src/components/interview/ModeBadge.tsx
    - src/components/interview/InterviewProgress.tsx
    - src/components/interview/LongPressButton.tsx
  modified:
    - src/components/interview/InterviewTimer.tsx

key-decisions:
  - "ModeBadge uses fixed positioning (top-4 right-4 z-40) with backdrop-blur for visibility over dark interview background"
  - "InterviewProgress uses progressbar role with aria-valuenow/max for accessibility"
  - "InterviewTimer SVG ring uses strokeDashoffset with CSS transition for smooth countdown"
  - "LongPressButton uses RAF loop with refs-only-in-handlers pattern for React Compiler purity"
  - "Three-tier color urgency: white (>5s), amber (5s-3s), red (<3s) using CSS custom properties"

patterns-established:
  - "SVG ring countdown: radius/circumference constants + strokeDashoffset for circular progress"
  - "Mode-aware rendering: isReal boolean toggles monochrome vs colored segments"
  - "Long-press pattern: pointerDown starts RAF, pointerUp/Leave/Cancel cancels, haptic on complete"

requirements-completed: [IVPOL-05, IVPOL-06]

# Metrics
duration: 6min
completed: 2026-02-19
---

# Phase 28 Plan 05: Mode-Differentiated Interview UI Summary

**ModeBadge, segmented InterviewProgress, enhanced InterviewTimer with SVG ring + urgency colors, and LongPressButton for Real mode emergency exit**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-19T08:07:44Z
- **Completed:** 2026-02-19T08:14:37Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- ModeBadge with Shield/BookOpen icons for Real/Practice mode distinction
- InterviewProgress with dual indicator (Q3/20 text + segmented bar) and mode-aware coloring
- InterviewTimer enhanced with numeric countdown, SVG circular ring, and three-tier color urgency (white/amber/red)
- LongPressButton with RAF-driven circular fill progress for 3-second hold-to-exit

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ModeBadge and InterviewProgress** - `285b92b` (feat)
2. **Task 2: Enhance InterviewTimer with color transitions** - `bbe68d9` (feat)
3. **Task 3: Create LongPressButton component** - `ac1fc3b` (feat -- included in parallel 28-04 commit via lint-staged stash)

## Files Created/Modified
- `src/components/interview/ModeBadge.tsx` - Fixed pill badge with mode icon (Shield/BookOpen) and entry animation
- `src/components/interview/InterviewProgress.tsx` - Segmented progress bar with monochrome (Real) vs colored (Practice) segments
- `src/components/interview/InterviewTimer.tsx` - Enhanced with SVG ring, numeric countdown, amber/red urgency transitions, pulse
- `src/components/interview/LongPressButton.tsx` - 3s hold-to-activate with RAF progress loop and haptic feedback

## Decisions Made
- ModeBadge uses fixed positioning with backdrop-blur for visibility over dark interview background
- InterviewProgress uses progressbar role with aria-valuenow/max for screen reader accessibility
- InterviewTimer three-tier urgency: white (>5s), amber warning (5s-3s), red urgent (<3s) with pulse
- LongPressButton uses requestAnimationFrame (not setInterval) for smooth 60fps progress updates
- Refs only accessed in event handlers/effects (not render) for React Compiler safety

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] LongPressButton committed in parallel 28-04 commit**
- **Found during:** Task 3 commit
- **Issue:** lint-staged stash/restore included LongPressButton.tsx in the 28-04 LandscapeOverlay commit (`ac1fc3b`) due to parallel plan execution
- **Fix:** No fix needed -- file content is identical and correctly committed in HEAD
- **Verification:** `git show HEAD:src/components/interview/LongPressButton.tsx` confirms full 169-line file
- **Committed in:** ac1fc3b (alongside 28-04 task)

---

**Total deviations:** 1 (commit attribution only, no code impact)
**Impact on plan:** Zero. All 4 files are correctly in HEAD with intended content.

## Issues Encountered
None -- all components compiled and linted cleanly on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 mode-differentiated UI components ready for integration into InterviewSession (Plan 06+)
- ModeBadge and InterviewProgress can be imported directly into the session layout
- LongPressButton wraps any icon for Real mode's hidden exit
- InterviewTimer is backward-compatible (existing consumers unchanged)

## Self-Check: PASSED

All 4 created/modified files verified on disk. All 3 commit hashes found in git log.

---
*Phase: 28-interview-ux-voice-flow-polish*
*Completed: 2026-02-19*
