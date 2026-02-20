---
phase: 30-mobile-native-feel
plan: 03
subsystem: ui
tags: [motion-react, drag, toast, swipe-to-dismiss, haptics, spring-physics]

# Dependency graph
requires:
  - phase: 30-02
    provides: hapticLight, hapticMedium functions from haptics.ts
provides:
  - Swipe-to-dismiss toast component with motion/react drag
  - Physics-based spring-back on partial swipe
  - Auto-dismiss timer with drag pause/resume
  - Mobile bottom-positioned toast container with safe area support
affects: [mobile-ux, notifications, offline-sync-toasts]

# Tech tracking
tech-stack:
  added: []
  patterns: [useMotionValue-drag-dismiss, auto-dismiss-timer-pause-resume, haptic-threshold-feedback]

key-files:
  created: []
  modified:
    - src/components/BilingualToast.tsx

key-decisions:
  - "Motion value x initialized at 300 with imperative animate() for entrance -- avoids conflict between declarative initial/animate props and style motion value binding"
  - "startTimeRef initialized to 0 (not Date.now()) for React Compiler purity -- startTimer sets actual value before any timer calculation"
  - "AnimationPlaybackControlsWithThen lacks .catch() -- use .then(noop, errorHandler) for standalone or chain .then().catch() after .then()"

patterns-established:
  - "Toast drag pattern: useMotionValue(offset) + useTransform for opacity + useAnimate for exit/springback"
  - "Timer pause/resume: track remaining time in ref, pause on drag start, resume on spring-back"

requirements-completed: [MOBI-04]

# Metrics
duration: 12min
completed: 2026-02-20
---

# Phase 30 Plan 03: Swipe-to-Dismiss Toast Summary

**Motion/react drag-powered toast with velocity+offset dismiss, spring-back physics, progressive opacity fade, auto-dismiss timer pause, and haptic feedback**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-20T07:23:48Z
- **Completed:** 2026-02-20T07:35:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Rewrote Toast component with horizontal drag via motion/react drag="x"
- Velocity-aware dismiss detection (fast flick > 500px/s OR drag > 100px threshold)
- Spring-back animation on partial swipe with spring stiffness 500 / damping 30
- Progressive opacity fade proportional to drag distance via useTransform
- Auto-dismiss timer pauses on drag start, resumes with remaining time on spring-back
- Haptic feedback: hapticLight at threshold crossing, hapticMedium on dismiss
- Ghost blur trail (filter: blur(2px)) on dismiss exit animation
- Desktop X button hover-revealed via group-hover pattern
- Mobile toasts positioned bottom-center above tab bar with safe area insets
- ToastProvider/ToastContext/useToast API completely unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite Toast component with motion/react swipe-to-dismiss** - `72557c3` (feat)

## Files Created/Modified
- `src/components/BilingualToast.tsx` - Rewrote inner Toast with motion/react drag, updated ToastContainer positioning for mobile

## Decisions Made
- Used imperative `animate()` for entrance animation instead of declarative `initial`/`animate` props to avoid conflict with `style={{ x }}` motion value binding (motion/react prioritizes MotionValue in style over declarative animation)
- Initialized `startTimeRef` to 0 instead of `Date.now()` to satisfy React Compiler purity rules -- the `startTimer` callback sets the actual timestamp before any elapsed-time calculation
- Used `.then(noop, errorHandler)` pattern for `AnimationPlaybackControlsWithThen` which lacks `.catch()` method directly (only available after chaining `.then()` which returns a standard Promise)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed motion value / declarative animation conflict**
- **Found during:** Task 1 (Toast rewrite)
- **Issue:** Plan specified `initial={{ opacity: 0, x: 300 }}` and `animate={{ opacity: 1, x: 0 }}` props alongside `style={{ x, opacity }}` where x/opacity are MotionValues. In motion/react, style MotionValues take precedence over declarative animation props, meaning the entrance animation would not fire.
- **Fix:** Removed declarative `initial`/`animate`/`transition` props. Initialized `useMotionValue(300)` instead of `useMotionValue(0)`. Added useEffect with imperative `animate()` call to spring x from 300 to 0 on mount.
- **Files modified:** src/components/BilingualToast.tsx
- **Verification:** Build passes, entrance animation works via imperative animate
- **Committed in:** 72557c3

**2. [Rule 1 - Bug] Fixed React Compiler purity violation with Date.now()**
- **Found during:** Task 1 (Toast rewrite)
- **Issue:** `useRef(Date.now())` triggers react-hooks/purity ESLint error because Date.now() is an impure function called during render
- **Fix:** Changed to `useRef(0)` -- the `startTimer` callback already sets `startTimeRef.current = Date.now()` before any elapsed calculation
- **Files modified:** src/components/BilingualToast.tsx
- **Verification:** ESLint passes with no errors in BilingualToast.tsx
- **Committed in:** 72557c3

**3. [Rule 1 - Bug] Fixed AnimationPlaybackControlsWithThen .catch() type error**
- **Found during:** Task 1 (Toast rewrite)
- **Issue:** TypeScript error: `.catch()` does not exist on `AnimationPlaybackControlsWithThen`. The motion/react type has `.then()` but not `.catch()` directly.
- **Fix:** Changed standalone `.catch()` calls to `.then(() => {}, () => { /* error handler */ })` pattern. Kept chained `.then().catch()` calls which work because `.then()` returns a standard Promise.
- **Files modified:** src/components/BilingualToast.tsx
- **Verification:** `pnpm typecheck` passes cleanly
- **Committed in:** 72557c3

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All fixes necessary for correctness. No scope creep.

## Issues Encountered
- OneDrive webpack cache corruption caused initial build failure (missing .nft.json). Resolved with `rm -rf .next && pnpm build` per known mitigation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Swipe-to-dismiss toast ready for all toast consumers (offline sync, auth errors, etc.)
- Pattern established for motion/react drag on non-card UI elements
- Ready for 30-04 (remaining mobile native feel work)

## Self-Check: PASSED

- [x] src/components/BilingualToast.tsx exists
- [x] Commit 72557c3 exists
- [x] 30-03-SUMMARY.md exists

---
*Phase: 30-mobile-native-feel*
*Completed: 2026-02-20*
