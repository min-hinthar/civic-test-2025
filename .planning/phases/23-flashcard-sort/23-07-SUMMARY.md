---
phase: 23-flashcard-sort
plan: 07
subsystem: ui
tags: [react, motion, srs, bilingual, sort-mode, summary-screen]

# Dependency graph
requires:
  - phase: 23-01
    provides: "Sort reducer types (RoundResult, SortState, SortPhase)"
  - phase: 23-02
    provides: "Sound effects and session types for sort mode"
provides:
  - "RoundSummary component with stats grid, category breakdown, improvement delta, personal best"
  - "MissedCardsList expandable component with per-card AddToDeckButton"
  - "SRSBatchAdd component with new/existing card distinction and batch add"
affects: [23-08, 23-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Category breakdown sorted weakest-first with sub-category color-coded progress bars"
    - "SRS batch add with per-card checkbox selection and toast confirmation"
    - "Myanmar numeral conversion helper for bilingual number display"

key-files:
  created:
    - src/components/sort/RoundSummary.tsx
    - src/components/sort/MissedCardsList.tsx
    - src/components/sort/SRSBatchAdd.tsx

key-decisions:
  - "Reuse CountUp from react-countup (already installed) for hero stat animation"
  - "Per-category breakdown uses sub-category colors from categoryMapping.ts, not USCIS main categories"
  - "allUnknownIds prop kept in RoundSummary interface for parent-level SRSBatchAdd integration (unused internally)"
  - "MissedCardsList uses AnimatePresence for expand/collapse rather than CSS transition"
  - "SRSBatchAdd checkbox selection defaults all new cards checked; expandable for deselection"
  - "No effect on existing SRS schedules from sort mode Don't Know classification"

patterns-established:
  - "toMyanmarNumeral helper for converting Arabic to Myanmar digits in bilingual UI"
  - "CategoryBreakdownRow sub-component pattern for reusable category visualization"

# Metrics
duration: 13min
completed: 2026-02-17
---

# Phase 23 Plan 07: Round Summary, Missed Cards, and SRS Batch Add

**End-of-round summary screen with animated Know %, category breakdown, expandable missed cards list, and SRS batch add with new/existing card distinction**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-17T11:17:15Z
- **Completed:** 2026-02-17T11:30:40Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- RoundSummary with animated count-up hero stat, 2x2 stats grid, improvement delta (round 2+), personal best tracking, and per-category breakdown sorted weakest-first
- MissedCardsList with smooth expand/collapse animation, per-card bilingual text, category badges, and individual AddToDeckButton
- SRSBatchAdd distinguishes new vs already-in-deck cards, batch add with optional per-card checkboxes, toast confirmation, and disabled post-add state

## Task Commits

Each task was committed atomically:

1. **Task 1: RoundSummary with stats and category breakdown** - `a3bdced` (feat)
2. **Task 2: MissedCardsList and SRSBatchAdd components** - `a6fdd28` (feat)

## Files Created
- `src/components/sort/RoundSummary.tsx` - End-of-round stats screen with hero %, stats grid, improvement delta, personal best, category breakdown, action buttons, and children slot
- `src/components/sort/MissedCardsList.tsx` - Expandable list of Don't Know cards with per-card review and AddToDeckButton
- `src/components/sort/SRSBatchAdd.tsx` - Batch add missed cards to SRS deck with new/existing distinction and toast confirmation

## Decisions Made
- Used existing `CountUp` from react-countup for hero stat animation (already a project dependency)
- Per-category breakdown uses `SUB_CATEGORY_NAMES` and `SUB_CATEGORY_COLORS` from `@/lib/mastery` for detailed sub-category display rather than rolling up to 3 USCIS main categories
- `allUnknownIds` prop retained in RoundSummaryProps interface for parent-level SRSBatchAdd wiring -- RoundSummary receives it but passes through to children slot
- AnimatePresence chosen for MissedCardsList expand/collapse to support entry/exit animations properly
- SRSBatchAdd per-card checkbox selection defaults all new cards checked, with expandable toggle for deselection of specific cards
- Existing SRS card schedules unaffected by sort mode -- only new cards added, no lapse/reset
- Myanmar numeral helper (`toMyanmarNumeral`) defined locally in both RoundSummary and SRSBatchAdd (small utility, not worth extracting to shared module)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- RoundSummary, MissedCardsList, and SRSBatchAdd ready for integration in plan 23-08 (SortPage orchestrator)
- Components accept all necessary props for wiring with useSortSession hook from plan 23-06

## Self-Check: PASSED

- All 3 created files verified on disk
- Both task commits (a3bdced, a6fdd28) verified in git history
- `npx tsc --noEmit` passes
- `npx eslint` passes on all 3 files

---
*Phase: 23-flashcard-sort*
*Completed: 2026-02-17*
