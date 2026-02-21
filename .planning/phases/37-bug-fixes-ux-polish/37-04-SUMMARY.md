---
phase: 37-bug-fixes-ux-polish
plan: 04
subsystem: ui
tags: [srs, review-deck, progress-bar, radix-progress, motion-react, spring-animations, dashboard-banner]

# Dependency graph
requires:
  - phase: 37-01
    provides: Card interactive variant fix with opacity/scale corrections
provides:
  - ReviewDeckCard component with clickable navigation, category badge, difficulty dots
  - Overhauled DeckManager with progress bar, category filter, celebration empty state
  - Dashboard due card banner with dismiss and review navigation
  - Nav badge wiring verification (studyDueCount already connected)
affects: [study-guide, dashboard, review-deck]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@radix-ui/react-progress for accessible progress bars"
    - "AnimatePresence for enter/exit banner animations"
    - "Normalized FSRS difficulty (1-10 range) to 0-1 for visual dots"

key-files:
  created:
    - src/components/srs/ReviewDeckCard.tsx
  modified:
    - src/components/srs/DeckManager.tsx
    - src/pages/Dashboard.tsx

key-decisions:
  - "Navigate to category flashcard view (not specific question) since #cards-{category} is the existing pattern"
  - "Normalize FSRS difficulty (1-10 range) to 0-1 for 5-dot visual indicator"
  - "Session-scoped banner dismiss (useState) resets on page reload as intended"

patterns-established:
  - "ReviewDeckCard: clickable card pattern with motion whileTap + Card interactive for deck lists"
  - "Due card surfacing: banner pattern with AnimatePresence for dismissable alerts"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-02-21
---

# Phase 37 Plan 04: Review Deck Overhaul Summary

**Overhauled review deck with clickable cards navigating to flashcard view, Radix progress bar, category dropdown filter, celebration empty state, and dashboard due-card banner**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-21T08:53:43Z
- **Completed:** 2026-02-21T09:00:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created ReviewDeckCard component with category color accent, question preview, Burmese text, 5-dot difficulty indicator, and navigation to flashcard view
- Overhauled DeckManager with Radix progress bar (reviewed/total), category dropdown filter, and celebration "All caught up!" state with next review time
- Added dismissable due card banner to Dashboard with bilingual text and "Review Now" navigation
- Verified nav badge wiring (studyDueCount already fully connected from SRSContext through useNavBadges)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ReviewDeckCard component + overhaul DeckManager** - `be989a0` (feat)
2. **Task 2: Add due card surfacing - nav badge + dashboard banner** - `6d4ccb8` (feat)

## Files Created/Modified
- `src/components/srs/ReviewDeckCard.tsx` - New clickable card component with category accent, difficulty dots, trash/chevron actions
- `src/components/srs/DeckManager.tsx` - Overhauled with Radix progress bar, category filter dropdown, ReviewDeckCard integration, celebration empty state
- `src/pages/Dashboard.tsx` - Added due card review banner with AnimatePresence, dismiss, and "Review Now" navigation

## Decisions Made
- Navigate to `#cards-{category}` (category flashcard view) rather than a specific question, since the existing hash routing already supports this pattern and FlashcardStack handles the view
- Normalized FSRS difficulty from its 1-10 scale to 0-1 for the 5-dot visual indicator with green-yellow-red color scale
- Used session-scoped dismiss state for the dashboard banner (resets on page reload, as the plan specified)
- Used `@radix-ui/react-progress` (already installed) rather than a custom progress bar for accessibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Review deck is fully overhauled with all specified features
- Dashboard and nav badge surfacing are wired and functional
- Ready for wave 2 plans 37-05, 37-06, 37-07

## Self-Check: PASSED

- All 3 source files verified present
- All 2 task commits verified (be989a0, 6d4ccb8)
- Summary file exists at expected path

---
*Phase: 37-bug-fixes-ux-polish*
*Completed: 2026-02-21*
