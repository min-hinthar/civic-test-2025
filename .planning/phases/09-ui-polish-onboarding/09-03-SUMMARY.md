---
phase: 09-ui-polish-onboarding
plan: 03
subsystem: ui
tags: [sync, pwa, animation, motion/react, AnimatePresence, floating-indicator]

# Dependency graph
requires:
  - phase: 02-pwa-offline
    provides: OfflineContext with pendingSyncCount and isSyncing
  - phase: 09-01
    provides: Duolingo-style design tokens (rounded-2xl cards, chunky UI)
provides:
  - Floating bottom-center sync status indicator with AnimatePresence
  - syncFailed state on OfflineContext for failure detection
  - Warning state display (orange CloudOff icon) on sync failure
affects: [09-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Floating toast-like indicator with AnimatePresence spring animation"
    - "syncFailed boolean on OfflineContext for downstream failure awareness"

key-files:
  created: []
  modified:
    - src/components/pwa/SyncStatusIndicator.tsx
    - src/contexts/OfflineContext.tsx
    - src/AppShell.tsx
    - src/components/AppNavigation.tsx

key-decisions:
  - "Added syncFailed state to OfflineContext (was not exposed before)"
  - "bottom-20 offset (80px) to clear future mobile bottom tab bar from plan 09-06"
  - "Icon-only (Cloud/CloudOff) + count number for language-neutral display"
  - "Informational only -- no tap-to-sync, removed onClick/triggerSync from component"

patterns-established:
  - "Floating indicator pattern: fixed bottom-center with AnimatePresence slide"
  - "motion.span key={count} for animated number tick-down"

# Metrics
duration: 10min
completed: 2026-02-08
---

# Phase 9 Plan 3: Floating Sync Status Indicator Summary

**Floating bottom-center sync toast using AnimatePresence with animated count tick-down, warning state for failures, consuming OfflineContext**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-08T09:41:16Z
- **Completed:** 2026-02-08T09:51:14Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Redesigned SyncStatusIndicator from toolbar icon-button to floating bottom-center pill indicator
- Switched data source from useSyncQueue() to useOffline() from OfflineContext
- Added syncFailed state to OfflineContext for warning display capability
- Animated count display with motion.span key transitions (spring physics)
- Warning state with CloudOff icon in text-warning-500 on sync failure
- Moved indicator from AppNavigation toolbar to AppShell (Router scope)

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign SyncStatusIndicator as Floating Toast** - `6b299b9` (feat)
2. **Task 2: Mount Floating Indicator in AppShell and Remove from AppNavigation** - `e5862d9` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `src/components/pwa/SyncStatusIndicator.tsx` - Complete rewrite: floating bottom-center pill with AnimatePresence, Cloud/CloudOff icons, animated count
- `src/contexts/OfflineContext.tsx` - Added syncFailed state and setSyncFailed in triggerSync callback
- `src/AppShell.tsx` - Added SyncStatusIndicator import and mount inside Router after PWAOnboardingFlow
- `src/components/AppNavigation.tsx` - Removed SyncStatusIndicator import and JSX from toolbar
- `src/components/BilingualToast.tsx` - Included pre-existing warning toast type (from prior session)
- `src/components/ui/use-toast.ts` - Included pre-existing warning variant type (from prior session)

## Decisions Made
- Added `syncFailed` boolean to OfflineContext -- the existing context did not expose failure state, which is required for the warning display in the indicator
- Used `bottom-20` (80px) offset to proactively clear the mobile bottom tab bar that plan 09-06 will add
- Icon + count number only (no text) for language-neutral display per locked user decision
- Removed all interactive behavior (onClick, triggerSync, button element) -- indicator is purely informational
- Included pre-existing BilingualToast warning type changes that were uncommitted from prior session (needed for typecheck to pass)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added syncFailed state to OfflineContext**
- **Found during:** Task 1 (SyncStatusIndicator redesign)
- **Issue:** OfflineContext did not expose a syncFailed boolean, but the indicator needs it for warning state display
- **Fix:** Added syncFailed useState, setSyncFailed(true) on result.failed > 0 and catch block, setSyncFailed(false) on sync start; exposed in context value
- **Files modified:** src/contexts/OfflineContext.tsx
- **Verification:** npx tsc --noEmit passes, component correctly consumes syncFailed
- **Committed in:** 6b299b9 (Task 1 commit)

**2. [Rule 3 - Blocking] Staged pre-existing BilingualToast warning type changes**
- **Found during:** Task 1 commit (pre-commit hook typecheck failure)
- **Issue:** Working tree had uncommitted changes adding 'warning' to ToastType union in BilingualToast.tsx and use-toast.ts. The staged snapshot (without these changes) failed typecheck because the Record<ToastType, string> map was incomplete
- **Fix:** Included the pre-existing changes in the Task 1 commit to unblock typecheck
- **Files modified:** src/components/BilingualToast.tsx, src/components/ui/use-toast.ts
- **Verification:** Pre-commit hook typecheck passes
- **Committed in:** 6b299b9 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correct operation. syncFailed state is required for the warning display feature. BilingualToast changes were pre-existing and needed for typecheck to pass. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Floating sync indicator ready for visual review
- bottom-20 offset pre-positioned for plan 09-06 bottom tab bar
- OfflineContext now exposes syncFailed for any future components needing failure awareness

## Self-Check: PASSED

---
*Phase: 09-ui-polish-onboarding*
*Completed: 2026-02-08*
