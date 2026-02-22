---
phase: 31-animation-interaction-polish
plan: 02
subsystem: ui
tags: [motion/react, AnimatePresence, radix-dialog, forceMount, exit-animation, audio-feedback]

# Dependency graph
requires:
  - phase: 31-01
    provides: "motion-config springs and animation patterns"
provides:
  - "Dialog exit animations via AnimatePresence + forceMount pattern"
  - "DialogInternalContext for threading open state to children"
  - "playDismiss() audio cue for overlay dismiss"
  - "Dynamic transformOrigin targeting trigger element"
affects: [31-animation-interaction-polish, ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AnimatePresence + forceMount for Radix dialog exit animations"
    - "React context to thread open state from Dialog root to DialogContent"
    - "useState + useEffect for transformOrigin (avoids ref.current in render)"

key-files:
  created: []
  modified:
    - src/components/ui/Dialog.tsx
    - src/lib/audio/soundEffects.ts

key-decisions:
  - "Task execution reordered: Task 2 (playDismiss) before Task 1 (Dialog refactor) to avoid broken intermediate typecheck"
  - "transformOrigin computed in useEffect + useState, not useMemo, to avoid ref.current access during render (React Compiler compliance)"
  - "DialogOverlayInner renamed internally but exported as DialogOverlay for backward compatibility"

patterns-established:
  - "AnimatePresence + forceMount pattern: wrap Radix content in AnimatePresence, conditionally render on open, use forceMount on Portal/Overlay/Content"
  - "DialogInternalContext pattern: thread open state and trigger ref from Dialog root to children without prop drilling"

requirements-completed: [ANIM-03]

# Metrics
duration: 17min
completed: 2026-02-20
---

# Phase 31 Plan 02: Dialog Exit Animations Summary

**Fade + scale(0.95) exit animation on all 7 dialog consumers via AnimatePresence + forceMount, with synchronized backdrop fade-out, transformOrigin targeting, and playDismiss audio cue**

## Performance

- **Duration:** 17 min
- **Started:** 2026-02-20T12:10:17Z
- **Completed:** 2026-02-20T12:27:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- All 7 dialog consumer files get smooth exit animations automatically via React context -- zero consumer code changes
- Exit animation (150ms fade + scale) is snappier than enter (spring ~250ms), creating satisfying close feel
- Soft descending audio pop (600->300 Hz sine sweep) plays on every dialog dismiss
- prefers-reduced-motion users see instant hide with no animation
- Escape key triggers the same animated exit path (handled by Radix onOpenChange)
- Backdrop fades out synchronized with content panel (both 150ms exit duration)
- transformOrigin targets trigger button position for spatial coherence (falls back to center for programmatic dialogs)

## Task Commits

Each task was committed atomically:

1. **Task 2: Add playDismiss sound effect** - `b9685cf` (feat)
2. **Task 1: Refactor Dialog.tsx with forceMount + AnimatePresence** - `2525590` (feat)

## Files Created/Modified
- `src/lib/audio/soundEffects.ts` - Added playDismiss() in new "Overlay sounds" section
- `src/components/ui/Dialog.tsx` - Refactored with DialogInternalContext, AnimatePresence + forceMount, exit animations, transformOrigin targeting, playDismiss integration

## Decisions Made
- **Task execution reorder:** Executed Task 2 before Task 1 because Dialog.tsx imports playDismiss -- without the export existing, typecheck would fail at the Task 1 intermediate commit
- **transformOrigin via useState + useEffect:** The plan suggested useMemo but noted potential React Compiler issues with ref.current access during render. Used useState + useEffect pattern to be fully Compiler-safe
- **DialogOverlayInner naming:** Created internal name to allow both standalone forceMount usage and the shared AnimatePresence wrapper in DialogContent

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reordered task execution (Task 2 before Task 1)**
- **Found during:** Pre-execution analysis
- **Issue:** Task 1 imports playDismiss from soundEffects.ts, but that function is defined in Task 2. Executing in plan order would produce a broken intermediate state that fails typecheck
- **Fix:** Executed Task 2 (add playDismiss) first, then Task 1 (Dialog refactor)
- **Files modified:** N/A (execution order only)
- **Verification:** Both tasks typecheck independently after their commits
- **Committed in:** b9685cf (Task 2), 2525590 (Task 1)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary task reorder for correct atomic commits. No scope creep.

## Issues Encountered
- OneDrive webpack cache lock prevented first build attempt (.next directory couldn't be deleted). Resolved by waiting and retrying rm -rf .next (known OneDrive + Next.js pitfall).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dialog exit animations complete and working for all consumers
- Pattern established for any future dialogs to inherit exit animations automatically
- playDismiss audio cue available for other overlay/sheet components if needed

## Self-Check: PASSED

- [x] src/components/ui/Dialog.tsx exists
- [x] src/lib/audio/soundEffects.ts exists
- [x] .planning/phases/31-animation-interaction-polish/31-02-SUMMARY.md exists
- [x] Commit b9685cf found in git log
- [x] Commit 2525590 found in git log

---
*Phase: 31-animation-interaction-polish*
*Completed: 2026-02-20*
