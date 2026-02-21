---
phase: 37-bug-fixes-ux-polish
plan: 05
subsystem: ui
tags: [flashcard, category-filter, chip-row, toolbar, shuffle, sort, search, radix-progress]

# Dependency graph
requires:
  - phase: 37-01
    provides: Card interactive variant fix (opacity/scale)
provides:
  - CategoryChipRow horizontal scrollable component with icons and accent colors
  - FlashcardToolbar with search, counter, progress, shuffle, sort
  - FlashcardStack controlled index mode
  - Replacement of dropdown with chip-based category filter
affects: [study-guide, flashcard-browsing]

# Tech tracking
tech-stack:
  added: []
  patterns: [controlled-component-pattern, fisher-yates-shuffle, useMemo-stable-setter]

key-files:
  created:
    - src/components/study/CategoryChipRow.tsx
    - src/components/study/FlashcardToolbar.tsx
  modified:
    - src/pages/StudyGuidePage.tsx
    - src/components/study/FlashcardStack.tsx

key-decisions:
  - "Used useMemo for stable setCurrentIndex in controlled FlashcardStack to satisfy React Compiler"
  - "Short category labels in chips to prevent overflow (Democracy, Government, Rights, etc.)"
  - "Question ID numeric parse as difficulty proxy for sort-by-difficulty mode"
  - "shuffleKey counter triggers Fisher-Yates re-shuffle via useMemo dependency"

patterns-established:
  - "Controlled component pattern: FlashcardStack accepts optional controlledIndex prop for external navigation"
  - "Category chip row with scroll-snap, fade masks, and ARIA listbox semantics"

requirements-completed: []

# Metrics
duration: 10min
completed: 2026-02-21
---

# Phase 37 Plan 05: Flashcard Chip Row + Toolbar Summary

**Horizontal scrollable CategoryChipRow with icons/accents replaces dropdown; FlashcardToolbar adds search, card counter with progress bar, shuffle via Fisher-Yates, and tri-mode sort**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-21T08:53:47Z
- **Completed:** 2026-02-21T09:03:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- CategoryChipRow renders 7 category chips + "All" with icons, accent colors, count badges, subtitles, and Burmese labels
- FlashcardToolbar provides search input, "X of Y" card counter with navigation arrows, Radix progress bar, shuffle button with rotation animation, and sort dropdown
- FlashcardStack now supports controlled index mode for external navigation from toolbar
- Old `<select>` dropdown removed and replaced with chip-based filtering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CategoryChipRow horizontal scrollable component** - `f883700` (feat)
2. **Task 2: Create FlashcardToolbar + wire chip row and toolbar into StudyGuidePage** - `d490793` (feat)

## Files Created/Modified
- `src/components/study/CategoryChipRow.tsx` - Horizontal scrollable chip/pill row with scroll-snap, fade masks, category icons, accent colors, count badges, subtitles, ARIA listbox
- `src/components/study/FlashcardToolbar.tsx` - Search input, card counter with nav arrows, Radix progress bar, shuffle with rotation animation, sort dropdown
- `src/pages/StudyGuidePage.tsx` - Replaced select dropdown with CategoryChipRow and FlashcardToolbar; added sortMode, shuffleKey, cardIndex state; Fisher-Yates shuffle utility; sortedQuestions memo
- `src/components/study/FlashcardStack.tsx` - Added controlledIndex, hideProgress props; useMemo-based stable setter for controlled mode

## Decisions Made
- Used short category labels in chips (Democracy, Government, Rights, etc.) to prevent horizontal overflow while keeping full names as subtitles
- Question ID numeric parse as difficulty proxy since FSRS card data is not available at browse time
- shuffleKey counter pattern: incrementing a key triggers useMemo re-computation which calls Fisher-Yates
- useMemo wraps the controlled vs uncontrolled setter to satisfy React Compiler's exhaustive-deps rule (avoids conditional creating new function identity each render)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React Compiler lint warnings for FlashcardStack controlled mode**
- **Found during:** Task 2 (FlashcardStack modification)
- **Issue:** Conditional `setCurrentIndex` created unstable function identity, triggering useCallback dependency warnings from React Compiler ESLint rules
- **Fix:** Wrapped setCurrentIndex in useMemo with [isControlled, onIndexChange] deps; removed useEffect sync (unnecessary since currentIndex reads controlled prop directly)
- **Files modified:** src/components/study/FlashcardStack.tsx
- **Verification:** ESLint passes with 0 errors on FlashcardStack.tsx
- **Committed in:** d490793 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for React Compiler compatibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chip row and toolbar provide foundation for future enhancements (e.g., bookmark filter chip, mastery-based difficulty sort)
- FlashcardStack controlled mode enables any parent to drive navigation externally

## Self-Check: PASSED

- All 4 source files exist on disk
- Both task commits verified (f883700, d490793)
- SUMMARY.md created at expected path

---
*Phase: 37-bug-fixes-ux-polish*
*Completed: 2026-02-21*
