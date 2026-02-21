---
phase: 05-spaced-repetition
plan: 02
subsystem: srs-sync
tags: [supabase, indexeddb, offline-sync, srs, idb-keyval]
depends_on:
  requires: [05-01]
  provides: [srs-sync-layer, srs-cards-schema]
  affects: [05-03, 05-04, 05-05]
tech_stack:
  added: []
  patterns: [offline-queue, last-write-wins-merge, batch-upsert]
key_files:
  created:
    - supabase/schema.sql (appended srs_cards table)
    - src/lib/srs/srsSync.ts
  modified:
    - src/lib/srs/index.ts (added srsSync barrel exports)
decisions:
  - "cardToRow accepts full SRSCardRecord (not raw Card) to access addedAt for Supabase row"
  - "PendingSRSSync stores full SRSCardRecord rather than raw Card for complete serialization"
  - "Orphaned keys in sync queue are cleaned up silently during sync processing"
  - "mergeSRSDecks falls back to addedAt when neither card has lastReviewedAt"
metrics:
  duration: 5 min
  completed: 2026-02-07
---

# Phase 5 Plan 02: Supabase Schema & Sync Layer Summary

Supabase srs_cards table DDL with RLS policies and dedicated sync layer connecting IndexedDB to Supabase for cross-device SRS state with offline queuing.

## What Was Done

### Task 1: Add srs_cards table to Supabase schema
- Appended srs_cards table DDL to `supabase/schema.sql`
- FSRS state columns: due, stability, difficulty, scheduled_days, learning_steps, reps, lapses, state
- Metadata: added_at, updated_at, last_review
- UNIQUE constraint on (user_id, question_id) prevents duplicates
- 4 RLS policies: select, insert, update, delete (per-user access)
- 2 indexes: (user_id, due) for due-card queries, (user_id, question_id) for lookups
- NOTE: This SQL is for documentation and manual Supabase dashboard execution -- no local migration runner

### Task 2: Create SRS sync layer with offline queue
- Created `src/lib/srs/srsSync.ts` following existing `syncQueue.ts` pattern
- Dedicated IndexedDB store `civic-prep-srs-sync` for pending review operations
- 5 exported functions:
  - `queueSRSSync`: Queues upsert/delete operations for offline processing
  - `syncPendingSRSReviews`: Processes queue with error-tolerant iteration (failed items remain for retry)
  - `pushSRSCards`: Batch upserts local deck to Supabase
  - `pullSRSCards`: Fetches remote deck and deserializes via rowToCard
  - `mergeSRSDecks`: Last-write-wins merge based on lastReviewedAt (falls back to addedAt)
- Added all sync exports to barrel index.ts

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add srs_cards table to Supabase schema | 40a30aa | supabase/schema.sql |
| 2 | Create SRS sync layer with offline queue | 72b6e9a | src/lib/srs/srsSync.ts, src/lib/srs/index.ts |
| 2-fix | Re-add barrel exports after parallel overwrite | c91f72e | src/lib/srs/index.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] PendingSRSSync stores SRSCardRecord instead of raw Card**
- **Found during:** Task 2
- **Issue:** Plan specified `card: Card` in PendingSRSSync, but `cardToRow()` from srsTypes.ts expects `SRSCardRecord` (needs `addedAt` for Supabase row)
- **Fix:** Changed to `record: SRSCardRecord` for complete serialization compatibility
- **Files modified:** src/lib/srs/srsSync.ts

**2. [Rule 1 - Bug] Barrel index overwritten by parallel 05-01 execution**
- **Found during:** Task 2 post-commit verification
- **Issue:** 05-01 committed its own index.ts (68c3084) after 05-02's commit (72b6e9a), overwriting srsSync exports
- **Fix:** Re-added srsSync exports in a follow-up commit (c91f72e)
- **Files modified:** src/lib/srs/index.ts

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Store SRSCardRecord in sync queue (not raw Card) | cardToRow needs addedAt from record; ensures complete serialization |
| Silent orphaned key cleanup | No user impact; keeps queue clean without noise |
| Error-tolerant sync iteration | Failed items remain in queue for next sync pass; prevents one bad item from blocking all |
| >= comparison in merge (local wins ties) | Prefer local state when timestamps are equal (user's device is source of truth) |

## Verification

- [x] `pnpm exec tsc --noEmit` passes
- [x] supabase/schema.sql contains valid srs_cards DDL with RLS
- [x] srsSync.ts imports from supabaseClient and idb-keyval correctly
- [x] All sync functions exported via barrel index
- [x] `from('srs_cards')` pattern used in 4 Supabase operations
- [x] `createStore('civic-prep-srs-sync', 'pending-reviews')` for dedicated sync store

## Next Phase Readiness

- srs_cards table DDL ready for manual execution in Supabase dashboard
- Sync layer ready for SRSContext/SRSProvider to use (05-03)
- Push/pull/merge operations ready for login flow integration
- Offline queue ready for review session grading to queue changes

## Self-Check: PASSED
