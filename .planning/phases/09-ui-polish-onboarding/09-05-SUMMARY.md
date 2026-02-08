---
phase: 09-ui-polish-onboarding
plan: 05
subsystem: ui
tags: [tailwind, toast, color-tokens, semantic-colors, warning, destructive]

# Dependency graph
requires:
  - phase: 09-01
    provides: "Destructive warm red hue (~10) and warning orange tokens in design system"
  - phase: 03-03
    provides: "Radix Toast system with warning variant support"
provides:
  - "Warning variant in BilingualToast (orange styling)"
  - "Warning variant in legacy toast shim"
  - "Clean red token audit - zero bg-red-*/text-red-* in src/"
  - "Semantic color classification: destructive=data-loss/auth, warning=non-data-loss errors"
affects: [09-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Warning orange for non-data-loss errors (sync, navigation, save failures)"
    - "Destructive warm red reserved for data-loss and auth failures only"

key-files:
  created: []
  modified:
    - "src/contexts/OfflineContext.tsx"
    - "src/hooks/useSyncQueue.ts"
    - "src/pages/TestPage.tsx"
    - "src/lib/srs/fsrsEngine.ts"

key-decisions:
  - "Task 1 was a no-op: warning variant already added in plan 09-03 commit 6b299b9"
  - "AppNavigation.tsx destructive toast deferred to plan 09-06 per plan instructions"
  - "fsrsEngine interval strength <= 1 day changed from bg-red-500 to bg-warning-500"

patterns-established:
  - "Semantic color rules: destructive (warm red) for data-loss/auth only; warning (orange) for all other errors"

# Metrics
duration: 10min
completed: 2026-02-08
---

# Phase 9 Plan 5: Red Token Audit Summary

**Reclassified non-data-loss destructive toasts to warning orange and eliminated all bg-red/text-red tokens from src/**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-08T09:43:57Z
- **Completed:** 2026-02-08T09:54:08Z
- **Tasks:** 2 (1 was no-op, 1 committed)
- **Files modified:** 4

## Accomplishments
- Reclassified 4 non-data-loss destructive toast usages to warning variant (sync failures, nav lock, save error)
- Replaced last bg-red-500 in fsrsEngine.ts with bg-warning-500
- Verified zero bg-red-*/text-red-* tokens remain in src/
- Auth failures (GoogleOneTapSignIn, PasswordUpdatePage) correctly remain destructive

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Warning Variant to Toast System** - No commit needed (already delivered in plan 09-03 commit 6b299b9)
2. **Task 2: Reclassify Non-Data-Loss Destructive Usages and Fix Remaining Red** - `1325c17` (fix)

## Files Created/Modified
- `src/contexts/OfflineContext.tsx` - Sync failure toast: destructive -> warning
- `src/hooks/useSyncQueue.ts` - Sync failure toast: destructive -> warning
- `src/pages/TestPage.tsx` - Navigation lock + save error toasts: destructive -> warning
- `src/lib/srs/fsrsEngine.ts` - Interval strength color: bg-red-500 -> bg-warning-500

## Decisions Made
- Task 1 was already delivered in plan 09-03 (BilingualToast warning type + use-toast.ts legacy shim update), so no duplicate commit was created
- AppNavigation.tsx destructive toast reclassification deferred to plan 09-06 which does full AppNavigation overhaul
- fsrsEngine.ts "learning/weak" interval color changed from red to warning orange to match semantic color rules

## Deviations from Plan

None - plan executed exactly as written. Task 1 was discovered to be a no-op (already completed in prior plan).

## Issues Encountered
- Pre-existing lint error in OnboardingTour.tsx (from plan 09-04) - not related to this plan's changes, all modified files pass lint individually

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Red token audit complete, semantic color system is clean
- AppNavigation reclassification ready for plan 09-06
- All remaining destructive usages are correctly scoped to data-loss and auth failure scenarios

---
*Phase: 09-ui-polish-onboarding*
*Completed: 2026-02-08*

## Self-Check: PASSED
