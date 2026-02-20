---
phase: 33-states-accessibility
plan: 04
subsystem: ui
tags: [error-recovery, offline-banner, retry, bilingual, toast, a11y]

# Dependency graph
requires:
  - phase: 33-states-accessibility
    provides: ErrorFallback component with retry/escalation, useRetry hook
provides:
  - OfflineBanner component with offline/reconnecting/back-online animation
  - Error recovery integration in Dashboard and Hub tabs
  - Toast + inline fallback hybrid error pattern
affects: [33-states-accessibility]

# Tech tracking
tech-stack:
  added: []
  patterns: [offline banner state machine, hybrid toast + inline error fallback, adjust-state-when-props-change for online status]

key-files:
  created:
    - src/components/pwa/OfflineBanner.tsx
  modified:
    - src/components/navigation/NavigationShell.tsx
    - src/pages/Dashboard.tsx
    - src/pages/HubPage.tsx
    - src/components/hub/HistoryTab.tsx

key-decisions:
  - "OfflineBanner uses 3-state machine (offline/reconnecting/back-online) with timer-driven transitions"
  - "Uses adjust-state-when-props-change pattern (not setState in effect) for React Compiler safety"
  - "OfflineBanner placed in NavigationShell inside main-content div (below header, respects sidebar margin)"
  - "Error recovery wired at component level (not hook refactor) to minimize invasiveness"
  - "Toast fires on first error only (not on retry) to avoid notification fatigue"

patterns-established:
  - "Offline banner pattern: 3-state machine with auto-dismiss, globally rendered in NavigationShell"
  - "Error recovery pattern: error/retryCount/fetchTrigger state + handleRetry callback + ErrorFallback render"
  - "Toast-first-error pattern: track prevError with adjust-state-when-props-change, fire toast once"

requirements-completed: [STAT-03]

# Metrics
duration: 9min
completed: 2026-02-20
---

# Phase 33 Plan 04: Error Recovery Integration Summary

**OfflineBanner with 3-state reconnection animation plus ErrorFallback wired into Dashboard/Hub tabs with toast hybrid pattern**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-20T18:43:13Z
- **Completed:** 2026-02-20T18:52:25Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created OfflineBanner component with offline/reconnecting/back-online states, bilingual messaging, AnimatePresence transitions, reduced-motion support, and auto-dismiss after reconnection
- Wired ErrorFallback into Dashboard (IndexedDB data fetch), HubPage overview/achievements tabs, and HistoryTab (interview history fetch)
- Implemented hybrid toast + inline fallback error pattern: warning toast fires on first error, ErrorFallback shows inline with retry button and escalation after 3 manual retries
- Placed OfflineBanner globally in NavigationShell so it appears on all authenticated routes below the header

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OfflineBanner with reconnection animation** - `76f3d02` (feat)
2. **Task 2: Wire ErrorFallback into Dashboard and Hub tabs** - `860bb36` (feat)

## Files Created/Modified
- `src/components/pwa/OfflineBanner.tsx` - New: 3-state offline banner with bilingual messaging and animation
- `src/components/navigation/NavigationShell.tsx` - Added OfflineBanner render inside main-content div
- `src/pages/Dashboard.tsx` - Added error state tracking, retry handler, ErrorFallback render, toast notification
- `src/pages/HubPage.tsx` - Added error recovery for overview/achievements tabs with ErrorFallback and toast
- `src/components/hub/HistoryTab.tsx` - Added error recovery for interview history fetch with ErrorFallback and toast

## Decisions Made
- OfflineBanner uses 3-state machine (offline -> reconnecting -> back-online) with timer-driven transitions (1.5s reconnecting, 3s back-online auto-dismiss)
- Uses React "adjust state when props change" pattern for all synchronous state transitions (isOnline changes, error tracking) to comply with React Compiler set-state-in-effect rule
- OfflineBanner placed in NavigationShell's main-content div so it inherits sidebar margin and sits below GlassHeader
- Error recovery wired at the component level (error/retryCount/fetchTrigger state + handleRetry) rather than refactoring existing data hooks into useRetry, per plan guidance
- Toast fires only on first error occurrence (tracked via adjust-state-when-props-change pattern) to avoid notification fatigue on retries
- Muted palette colors used for OfflineBanner (bg-muted/60 for offline, bg-primary-subtle for back-online) per user decision against red/amber

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- React Compiler's `set-state-in-effect` lint rule required refactoring initial OfflineBanner implementation from useEffect-based state updates to the "adjust state when props change" render-time pattern. Same pattern needed for error toast tracking in Dashboard, HubPage, and HistoryTab.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- OfflineBanner renders globally for all authenticated routes
- ErrorFallback is wired into all primary data-displaying screens (Dashboard, Hub overview, Hub history, Hub achievements)
- Plan 05 (semantic markup and ARIA audit) can proceed with these error states in place

## Self-Check: PASSED

All 5 files verified present. Both task commits (76f3d02, 860bb36) verified in git log.

---
*Phase: 33-states-accessibility*
*Completed: 2026-02-20*
