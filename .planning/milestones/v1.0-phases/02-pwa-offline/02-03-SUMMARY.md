---
phase: 02-pwa-offline
plan: 03
subsystem: pwa
tags: [indexeddb, supabase, sync, offline, react-hooks]

# Dependency graph
requires:
  - phase: 02-01
    provides: PWA foundation with idb-keyval and syncQueueStore
provides:
  - Sync queue with exponential backoff retry to Supabase
  - useSyncQueue hook for triggering sync and tracking pending count
  - SyncStatusIndicator component with badge and spinning animation
  - Auto-sync when coming back online
  - Bilingual toast notifications for sync completion
affects: [03-test-flow, 04-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Exponential backoff retry (5 retries, 1s base delay)
    - IndexedDB queue pattern for offline storage
    - Auto-sync on connectivity restore

key-files:
  created:
    - src/lib/pwa/syncQueue.ts
    - src/hooks/useSyncQueue.ts
    - src/components/pwa/SyncStatusIndicator.tsx
  modified:
    - src/lib/pwa/offlineDb.ts
    - src/components/AppNavigation.tsx

key-decisions:
  - "Exponential backoff: 5 retries with 1s base delay (2s, 4s, 8s, 16s)"
  - "Sync queue uses same IndexedDB store pattern as questions cache"
  - "SyncStatusIndicator hidden when no pending items"
  - "Toast shows bilingual success/failure messages"

patterns-established:
  - "Queue pattern: store locally, sync when online, remove after success"
  - "Auto-sync: track wasOffline ref, trigger sync on connectivity restore"

# Metrics
duration: 37min
completed: 2026-02-06
---

# Phase 02 Plan 03: Offline Sync Queue Summary

**IndexedDB sync queue with exponential backoff retry to Supabase, auto-sync on reconnect, and bilingual toast notifications**

## Performance

- **Duration:** 37 min
- **Started:** 2026-02-06T11:30:11Z
- **Completed:** 2026-02-06T12:07:10Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Sync queue stores offline test results in IndexedDB
- Exponential backoff retry (5 attempts) for failed syncs
- SyncStatusIndicator shows badge count and spins during sync
- Auto-sync triggers when connectivity returns with pending items
- Bilingual toast confirms sync completion/failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend offlineDb and create syncQueue module** - `47f9972` (feat)
2. **Task 2: Create sync hook and indicator component** - `03b51a8` (feat)
3. **Task 3: Integrate sync into OfflineContext and AppNavigation** - `d64dd26` (feat)

**Plan metadata:** (to be added after this commit)

## Files Created/Modified

- `src/lib/pwa/offlineDb.ts` - Extended with PendingTestResult interface and queue functions
- `src/lib/pwa/syncQueue.ts` - Sync queue with exponential backoff to Supabase
- `src/hooks/useSyncQueue.ts` - Hook for sync state, auto-sync, and manual trigger
- `src/components/pwa/SyncStatusIndicator.tsx` - RefreshCw icon with badge and spin animation
- `src/components/AppNavigation.tsx` - Added SyncStatusIndicator to header

## Decisions Made

- **Exponential backoff:** 5 retries with doubling delay (1s, 2s, 4s, 8s, 16s base)
- **Badge display:** Shows count up to 9, then "9+" for larger counts
- **Auto-sync timing:** Uses wasOffline ref to detect transition back to online
- **Toast messages:** Bilingual (English + Burmese) for sync success/failure

## Deviations from Plan

None - plan executed exactly as written.

## Coordination with 02-02

This plan ran in parallel with 02-02. Coordination points:

- **offlineDb.ts:** Both plans extended this file. 02-02 added questions caching, 02-03 added sync queue.
- **OfflineContext.tsx:** 02-02 created the context. My sync state was integrated into their version.
- **AppNavigation.tsx:** Both plans updated this file. OnlineStatusIndicator (02-02) and SyncStatusIndicator (02-03) now both appear in header.

All conflicts were automatically reconciled without issues.

## Issues Encountered

None - all tasks completed successfully.

## Next Phase Readiness

- Sync queue ready for test completion flow to queue results when offline
- SyncStatusIndicator visible in header for user feedback
- OfflineContext exposes sync state for any component that needs it

---
*Phase: 02-pwa-offline*
*Completed: 2026-02-06*

## Self-Check: PASSED
