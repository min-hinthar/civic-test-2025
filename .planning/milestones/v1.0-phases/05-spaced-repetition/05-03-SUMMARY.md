---
phase: 05-spaced-repetition
plan: 03
subsystem: srs-state-management
tags: [react-context, hooks, state-machine, srs, fsrs, offline-first]

dependency-graph:
  requires: ["05-01", "05-02"]
  provides: ["SRSProvider", "useSRS", "useSRSDeck", "useSRSReview", "useSRSWidget"]
  affects: ["05-04", "05-05", "05-06", "05-07", "05-08", "05-09"]

tech-stack:
  added: []
  patterns: ["context-provider-with-optimistic-updates", "state-machine-hook", "visibility-change-reactivity"]

key-files:
  created:
    - src/contexts/SRSContext.tsx
    - src/hooks/useSRSDeck.ts
    - src/hooks/useSRSReview.ts
    - src/hooks/useSRSWidget.ts
  modified:
    - src/AppShell.tsx

decisions:
  - id: "05-03-01"
    description: "SRSProvider placed inside AuthProvider, wrapping Router (needs useAuth for sync)"
  - id: "05-03-02"
    description: "No eslint-disable comments needed for setState in effects (React Compiler does not flag these cases)"
  - id: "05-03-03"
    description: "Review streak computed separately from study streak using SRS lastReviewedAt dates"
  - id: "05-03-04"
    description: "Category breakdown uses USCIS main categories (3 groups) not sub-categories (7)"
  - id: "05-03-05"
    description: "useSRSWidget module-level questionsById Map for O(1) lookup without recreating per render"

metrics:
  duration: "8 min"
  completed: "2026-02-07"
---

# Phase 5 Plan 3: SRS Context & Hooks Summary

**One-liner:** SRSContext provider with optimistic deck CRUD, auto-sync, and three specialized hooks for deck management, review sessions, and dashboard widget data.

## What Was Built

### SRSContext Provider (`src/contexts/SRSContext.tsx`)
- Central state management for the SRS deck with `SRSProvider` and `useSRS` hook
- Loads all cards from IndexedDB on mount using cancelled-flag async pattern
- Derives `dueCount` via `useMemo` from deck filtered by `isDue()`
- `addCard()` / `removeCard()` / `gradeCard()`: persist to IndexedDB, optimistically update in-memory state, queue sync if logged in
- `getDueCards()`: returns due cards sorted by due date ascending (most overdue first)
- `isInDeck()`: O(n) check against in-memory deck
- `refreshDeck()`: reloads from IndexedDB
- Visibility change listener triggers `refreshDeck()` for due count reactivity after midnight/backgrounding
- Sync integration: on mount when user is logged in, pushes pending reviews, pulls remote, merges with last-write-wins, writes back to both IDB and Supabase
- Works fully offline without login; sync activates only when `user?.id` is available

### useSRSDeck (`src/hooks/useSRSDeck.ts`)
- Thin wrapper over SRSContext for deck CRUD
- `bulkAddCards(questionIds)`: adds multiple cards, skips duplicates, returns count added
- `getWeakQuestionIds(categoryMasteries)`: detects weak areas (< 60% mastery) and returns all question IDs from those categories for bulk-add

### useSRSReview (`src/hooks/useSRSReview.ts`)
- State machine: `setup` -> `reviewing` -> `summary`
- `startSession(size, timerEnabled)`: pulls due cards, slices to size, begins reviewing
- `rateCard(isEasy)`: grades current card, records result, advances or completes
- `exitSession()`: transitions to summary (reviewed cards saved, remaining stay in queue)
- No in-session re-queuing of Hard cards (FSRS Rating.Again + enable_short_term handles this naturally)

### useSRSWidget (`src/hooks/useSRSWidget.ts`)
- `dueCount`, `reviewStreak`, `categoryBreakdown`, `isEmpty`, `isAllCaughtUp`, `nextDueText`
- Review streak: counts consecutive days with reviews backwards from today
- Category breakdown: groups cards by USCIS main category (3 groups), counts due vs total
- `nextDueText`: when all caught up, shows bilingual text for earliest future due card
- Module-level `questionsById` Map for O(1) category lookup

### AppShell Integration
- `SRSProvider` wired into provider hierarchy: inside `AuthProvider`, wrapping `Router`

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | SRSContext provider with deck state management | d595a51 | src/contexts/SRSContext.tsx, src/AppShell.tsx |
| 2 | useSRSDeck, useSRSReview, useSRSWidget hooks | 5fbf704 | src/hooks/useSRSDeck.ts, useSRSReview.ts, useSRSWidget.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm exec tsc --noEmit`: PASS
- `pnpm exec eslint` (all 5 files): PASS (0 errors, 0 warnings)
- SRSProvider in AppShell provider hierarchy: CONFIRMED
- All hooks export correctly and consume only SRSContext

## Next Phase Readiness

Plans 05-04 through 05-09 can now consume:
- `useSRS()` for direct context access
- `useSRSDeck()` for deck management with bulk-add
- `useSRSReview()` for review session UI
- `useSRSWidget()` for dashboard widget

## Self-Check: PASSED
