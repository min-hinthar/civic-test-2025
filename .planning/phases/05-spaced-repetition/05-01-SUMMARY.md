---
phase: 05-spaced-repetition
plan: 01
subsystem: srs-engine
tags: [ts-fsrs, indexeddb, idb-keyval, spaced-repetition, offline-first]
depends_on:
  requires: []
  provides: [srs-types, fsrs-engine, srs-store, srs-barrel]
  affects: [05-02, 05-03, 05-04, 05-05, 05-06, 05-07, 05-08, 05-09]
tech_stack:
  added: [ts-fsrs@5.2.3]
  patterns: [module-level-singleton, dedicated-idb-store, binary-fsrs-grading, bilingual-text]
key_files:
  created:
    - src/lib/srs/srsTypes.ts
    - src/lib/srs/fsrsEngine.ts
    - src/lib/srs/srsStore.ts
    - src/lib/srs/index.ts
  modified: [package.json, pnpm-lock.yaml]
decisions:
  - "FSRS singleton at module level (not per-component) for performance"
  - "Binary grading: Easy->Rating.Good, Hard->Rating.Again (NOT Rating.Hard)"
  - "Burmese numerals in getNextReviewText for bilingual next-review display"
  - "Dedicated IndexedDB store 'civic-prep-srs' separate from mastery data"
  - "elapsed_days set to 0 in rowToCard (deprecated field, required for type compat)"
metrics:
  duration: 7 min
  completed: 2026-02-07
---

# Phase 5 Plan 1: FSRS Engine & SRS Store Summary

FSRS scheduling engine wrapper with binary Easy/Hard grading, bilingual UI helpers, and IndexedDB persistence via dedicated idb-keyval store.

## What Was Built

### Task 1: ts-fsrs + SRS Types + FSRS Engine Wrapper
- Installed `ts-fsrs@5.2.3` as the FSRS scheduling algorithm library
- Created `srsTypes.ts` with:
  - `SRSCardRecord` interface for local IndexedDB storage
  - `SupabaseSRSRow` type matching cloud table schema
  - `cardToRow()` and `rowToCard()` serialization helpers (Date <-> ISO string)
  - `ReviewResult` and `SessionPhase` types for review session flow
- Created `fsrsEngine.ts` with:
  - Module-level FSRS singleton (`enable_fuzz: true`, `enable_short_term: true`, `maximum_interval: 365`)
  - `createNewSRSCard()` -- creates empty card due now
  - `gradeCard(card, isEasy)` -- Easy->Rating.Good, Hard->Rating.Again
  - `isDue(card)` -- checks if card.due <= now
  - `getNextReviewText(card)` -- bilingual next-review text with Burmese numerals
  - `getCardStatusLabel(card)` -- New (blue), Due (warning), Done (success) labels
  - `getIntervalStrengthColor(card)` -- red/orange/yellow/green based on scheduled_days

### Task 2: SRS IndexedDB Store + Barrel Exports
- Created `srsStore.ts` with dedicated `'civic-prep-srs'` / `'cards'` IndexedDB database:
  - `getSRSCard(questionId)` -- single card lookup
  - `setSRSCard(record)` -- upsert by questionId key
  - `removeSRSCard(questionId)` -- delete from deck
  - `getAllSRSCards()` -- iterate all keys, filter nulls
  - `getDueSRSCards()` -- convenience filter using `isDue()`
  - `getSRSCardCount()` -- fast count via `keys().length`
- Created `index.ts` barrel re-exporting all types, engine functions, and store functions

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install ts-fsrs + types + engine | ae16080 | srsTypes.ts, fsrsEngine.ts, package.json |
| 2 | SRS IndexedDB store + barrel exports | 68c3084 | srsStore.ts, index.ts |

## Decisions Made

1. **FSRS module-level singleton** -- The FSRS scheduler is stateless and expensive to create; instantiated once at module level rather than per-component.
2. **Binary grading mapping** -- Easy -> Rating.Good (successful recall), Hard -> Rating.Again (failed recall). Rating.Hard was explicitly avoided because in FSRS it means "successful but difficult" which still increases intervals.
3. **Burmese numerals** -- `getNextReviewText()` converts Arabic digits to Burmese Unicode numerals for the Myanmar text variant.
4. **Dedicated IndexedDB store** -- `createStore('civic-prep-srs', 'cards')` keeps SRS data separate from mastery answer history in `civic-prep-mastery`.
5. **elapsed_days = 0 in rowToCard** -- The `elapsed_days` field is deprecated in ts-fsrs v5.x but required for Card type compatibility. Set to 0 as a safe default.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `pnpm exec tsc --noEmit` passes with zero errors
- All 4 files in `src/lib/srs/` exist and export correctly via barrel
- No `useMemo<T>()` generic patterns (React Compiler safe)
- No `setState` in effects or `ref.current` in render (pure utility modules)

## Next Phase Readiness

All SRS infrastructure is ready for dependent plans:
- **05-02** (Supabase sync): Can import `cardToRow`, `rowToCard`, `SRSCardRecord` from `@/lib/srs`
- **05-03** (SRS Context): Can import engine functions and store CRUD
- **05-04+** (UI components): Can import types and helpers

No blockers identified.

## Self-Check: PASSED
