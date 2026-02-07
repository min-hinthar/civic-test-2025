---
phase: 05-spaced-repetition
plan: 05
subsystem: srs-ui
tags: [deck-manager, hash-routing, srs, card-status, bulk-add]

dependency_graph:
  requires: ["05-01", "05-03"]
  provides: ["DeckManager component", "#deck hash route in StudyGuidePage"]
  affects: ["05-06", "05-07"]

tech_stack:
  added: []
  patterns: ["Hash route sub-views in StudyGuidePage", "Module-level questionsById Map for O(1) lookup", "Sort order function for card priority display"]

key_files:
  created:
    - src/components/srs/DeckManager.tsx
  modified:
    - src/pages/StudyGuidePage.tsx

decisions:
  - id: "05-05-01"
    description: "DeckManager as sub-view via #deck hash route (not separate page)"
    rationale: "Per locked decision: deck management lives under Study Guide tab"
  - id: "05-05-02"
    description: "Sort order: Due first, then New, then Done"
    rationale: "Due cards are most actionable; New cards need first review; Done cards are informational"
  - id: "05-05-03"
    description: "Due count badge on Review Deck button uses absolute positioning over BilingualButton"
    rationale: "BilingualButton does not accept children prop; overlay badge via relative wrapper"
  - id: "05-05-04"
    description: "onStartReview navigates to #review (placeholder for future review session plan)"
    rationale: "Review session component will be built in plan 05-06"

metrics:
  duration: "11 min"
  completed: "2026-02-07"
---

# Phase 5 Plan 5: Deck Manager Summary

**DeckManager component with card statuses, remove, bulk-add weak areas, integrated via #deck hash route in StudyGuidePage with due count badge.**

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create DeckManager component | 83d4de5 | src/components/srs/DeckManager.tsx |
| 2 | Integrate DeckManager into StudyGuidePage | 37f60ab | src/pages/StudyGuidePage.tsx |

## What Was Built

### DeckManager Component (src/components/srs/DeckManager.tsx)

Full-featured deck management view with:

- **Stats bar**: 4 stat cards (Total, Due, New, Done) with color-coded values
- **Start Review button**: Primary action, disabled when dueCount === 0
- **Bulk-add weak areas**: Builds CategoryMasteryEntry from useCategoryMastery, detects weak areas, and bulk-adds via useSRSDeck
- **Card list**: Each card shows question text (EN + MY), status badge (New/Due/Done with bilingual labels), interval strength dot, next review date, and remove button
- **Sorting**: Due cards first, then New, then Done
- **Empty state**: Encouraging bilingual message with BookOpen icon and bulk-add CTA
- **Loading state**: Spinner with bilingual text

Sub-components: StatCard (stats display), DeckCardItem (individual card row)

### StudyGuidePage Integration

- `#deck` hash route renders DeckManager instead of default category overview
- "Review Deck" button added alongside "View All Flashcards" in category overview
- Due count badge (orange pill) shown on Review Deck button when dueCount > 0
- Uses useSRS() for reactive due count display

## Decisions Made

1. **DeckManager as #deck sub-view**: Follows existing hash routing pattern (#cards, #category-{name})
2. **Sort order**: Due > New > Done prioritizes actionable cards
3. **Badge positioning**: Absolute overlay on BilingualButton wrapper since BilingualButton has no children slot
4. **onStartReview -> #review**: Placeholder navigation target for plan 05-06 (review session)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- DeckManager is ready for review session integration (plan 05-06 will handle #review route)
- AddToDeckButton from plan 05-04 is already merged, so cards can be added from flip card views
- No blockers for subsequent plans

## Self-Check: PASSED
