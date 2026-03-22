---
phase: 50-pwa-sync-resilience
plan: 02
subsystem: pwa
tags: [service-worker, toast, update-ux, session-lock, bilingual]

# Dependency graph
requires:
  - phase: 49-error-boundaries
    provides: ErrorBoundary and provider ordering foundation
provides:
  - SW update detection via controllerchange + updatefound
  - Session-lock deferral bridge (Real Exam + Realistic Interview)
  - Persistent bilingual toast variant with action buttons
  - useSWUpdate hook bridging React state to SW lifecycle
  - SWUpdateWatcher component in ClientProviders
affects: [50-03, offline-sync, pwa-lifecycle]

# Tech tracking
tech-stack:
  added: []
  patterns: [module-level-manager-pattern, persistent-toast-variant, session-lock-bridge]

key-files:
  created:
    - src/lib/pwa/swUpdateManager.ts
    - src/hooks/useSWUpdate.ts
    - src/__tests__/swUpdateManager.test.ts
  modified:
    - src/components/BilingualToast.tsx
    - src/components/ClientProviders.tsx
    - src/components/navigation/useNavBadges.ts

key-decisions:
  - "SWUpdateWatcher is a component not a provider -- no provider reorder needed"
  - "Dual session lock: NavigationProvider.isLocked + history.state.interviewGuard for complete coverage"
  - "Module-level manager pattern (createSWUpdateManager) enables both singleton export and testable factory"

patterns-established:
  - "Module-level manager pattern: createSWUpdateManager factory exported for testing, singleton for app use"
  - "Persistent toast variant: duration: null skips auto-dismiss timer, shows action button with 44px targets"
  - "Session-lock bridge: React state synced to module-level ref via useEffect for non-React consumers"

requirements-completed: [ARCH-01, ARCH-02]

# Metrics
duration: 14min
completed: 2026-03-20
---

# Phase 50 Plan 02: SW Update UX Summary

**SW update detection with persistent bilingual toast, session-lock deferral during Real Exam/Interview, and 44px action buttons**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-20T08:32:43Z
- **Completed:** 2026-03-20T08:46:53Z
- **Tasks:** 2 (Task 1 TDD)
- **Files modified:** 6

## Accomplishments
- swUpdateManager detects SW updates via controllerchange + updatefound with deferred updates during locked sessions
- BilingualToast supports persistent variant (duration: null) with action buttons meeting 44px touch targets
- SWUpdateWatcher component wired into ClientProviders inside NavigationProvider -- no provider reordering
- useNavBadges integrates with swUpdateManager for Settings badge
- 7 unit tests covering all update/lock/defer/offline/interviewGuard scenarios

## Task Commits

Each task was committed atomically:

1. **Task 1: Create swUpdateManager and persistent BilingualToast variant (TDD)**
   - `2fda641` (test: RED phase - failing tests)
   - `8fb836c` (feat: GREEN phase - implementation passing tests)
2. **Task 2: Wire useSWUpdate into ClientProviders and integrate useNavBadges** - `529ee45` (feat)

## Files Created/Modified
- `src/lib/pwa/swUpdateManager.ts` - SW update detection, session-lock bridge, toast trigger logic
- `src/hooks/useSWUpdate.ts` - React hook wrapping swUpdateManager for component consumption
- `src/components/BilingualToast.tsx` - Persistent toast variant with action button support
- `src/components/ClientProviders.tsx` - SWUpdateWatcher component showing persistent update toast
- `src/components/navigation/useNavBadges.ts` - Integrated swUpdateManager for Settings badge
- `src/__tests__/swUpdateManager.test.ts` - 7 unit tests for SW update logic

## Decisions Made
- SWUpdateWatcher is a component (not a provider) to avoid any provider reordering risk
- Dual session-lock detection: checks both NavigationProvider.isLocked (Real Exam) and history.state.interviewGuard (Realistic Interview)
- createSWUpdateManager factory pattern enables both testable instances and module-level singleton

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Test timeouts on initial RED phase due to dynamic import of swUpdateManager triggering Sentry module chain -- resolved by using static import with vi.mock for sentry

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SW update UX complete, ready for Phase 50 Plan 03 (sync resilience)
- Multi-tab coordination deferred to Phase 52+ (needs BroadcastChannel)

## Self-Check: PASSED

- All 7 files verified present
- All 3 commits verified in git log (2fda641, 8fb836c, 529ee45)

---
*Phase: 50-pwa-sync-resilience*
*Completed: 2026-03-20*
