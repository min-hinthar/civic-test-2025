---
phase: 37-bug-fixes-ux-polish
plan: 06
subsystem: ui
tags: [flashcard, bookmark, auto-play, tts, fsrs, mastery]

# Dependency graph
requires:
  - phase: 37-03
    provides: "Bookmark persistence layer (IndexedDB bookmarkStore + useBookmarks hook)"
  - phase: 37-05
    provides: "CategoryChipRow, FlashcardToolbar, FlashcardStack controlledIndex + hideProgress"
provides:
  - "Enriched Flashcard3D back with category badge, difficulty, mastery, bookmark star"
  - "useAutoPlay hook for hands-free sequential TTS study"
  - "AutoPlayControls component with play/pause and bilingual labels"
  - "Flashcard3D controlledFlipped prop for external flip control"
affects: [study-guide, flashcards, review-deck]

# Tech tracking
tech-stack:
  added: []
  patterns: ["auto-play effect with closure-local cancellation", "controlled vs uncontrolled flip state pattern"]

key-files:
  created:
    - src/hooks/useAutoPlay.ts
    - src/components/study/AutoPlayControls.tsx
  modified:
    - src/components/study/Flashcard3D.tsx
    - src/components/study/FlashcardStack.tsx

key-decisions:
  - "Bookmark state passed via props (not useBookmarks inside Flashcard3D) for decoupling"
  - "Difficulty derived from question number as proxy (1-40 Beginner, 41-80 Intermediate, 81+ Advanced)"
  - "FSRS State.Review mapped to Mastered label since review-state cards have high retention"
  - "Auto-play uses isolated TTS engine to avoid conflicts with auto-read"
  - "MP3 first with browser TTS fallback in auto-play for mobile compatibility"
  - "Disable auto-read during auto-play to prevent audio overlap"

patterns-established:
  - "controlledFlipped prop: Flashcard3D supports both internal and parent-controlled flip"
  - "Metadata badge row: compact pill badges for category, difficulty, mastery on card back"

requirements-completed: []

# Metrics
duration: 7min
completed: 2026-02-21
---

# Phase 37 Plan 06: Flashcard Back Enrichment + Auto-Play Summary

**Enriched flashcard back with category/difficulty/mastery badges, bookmark star toggle, and hands-free auto-play study mode with TTS sequencing**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-21T09:06:31Z
- **Completed:** 2026-02-21T09:14:14Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Flashcard back now shows category badge, difficulty dots (3-level), mastery level, and bookmark star
- Auto-play mode reads question, pauses, flips to answer, reads answer, pauses, advances
- Effect cleanup uses closure-local cancelled flag for race condition prevention
- All badges bilingual (English + Burmese) with color coding

## Task Commits

Each task was committed atomically:

1. **Task 1: Enrich Flashcard3D back face with full details + bookmark toggle** - `fb3886c` (feat)
2. **Task 2: Implement auto-play study mode hook and controls** - `513bde5` (feat)

## Files Created/Modified
- `src/hooks/useAutoPlay.ts` - Auto-play hook with sequential TTS playback cycle
- `src/components/study/AutoPlayControls.tsx` - Play/pause toggle with bouncing dots indicator
- `src/components/study/Flashcard3D.tsx` - Enriched back face with metadata badges, bookmark star, controlledFlipped prop
- `src/components/study/FlashcardStack.tsx` - Integrated useBookmarks, useSRS, useAutoPlay, and AutoPlayControls

## Decisions Made
- Passed bookmark/mastery/difficulty as props from FlashcardStack rather than importing hooks in Flashcard3D -- keeps card component decoupled
- Used question number as difficulty proxy (1-40 Beginner, 41-80 Intermediate, 81+ Advanced) since there is no explicit difficulty field
- Mapped FSRS State.Review to "Mastered" display label since review-state means high retention achieved
- Auto-play uses isolated TTS engine (not shared) to avoid cancelling other TTS consumers
- Disabled auto-read during auto-play to prevent double audio playback
- Auto-play cycle: question -> 2s pause -> flip -> answer -> 3s pause -> advance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All flashcard enhancements complete (enriched back, bookmarks, auto-play)
- Ready for 37-07 (final plan in phase)

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 37-bug-fixes-ux-polish*
*Completed: 2026-02-21*
