---
phase: 05-spaced-repetition
plan: 06
subsystem: srs-review-ui
tags: [srs, review-card, swipe-gesture, flashcard, bilingual, motion]

dependency_graph:
  requires: ["05-01", "05-03"]
  provides: ["ReviewCard", "RatingButtons", "SessionSetup"]
  affects: ["05-07", "05-08"]

tech_stack:
  added: []
  patterns: ["swipe-to-rate gesture", "progressive color gradient", "controlled Flashcard3D reuse", "module-level question lookup Map"]

key_files:
  created:
    - src/components/srs/ReviewCard.tsx
    - src/components/srs/RatingButtons.tsx
    - src/components/srs/SessionSetup.tsx
  modified: []

decisions:
  - id: "05-06-01"
    decision: "Flashcard3D used uncontrolled - ReviewCard passes onFlip callback but Flashcard3D manages internal flip state"
    rationale: "Avoids modifying shared Flashcard3D component; parent tracks flip state via callback notification"
  - id: "05-06-02"
    decision: "SWIPE_THRESHOLD=80 (higher than FlashcardStack's 50) for intentional rating vs accidental navigation"
    rationale: "Rating is a more consequential action than card navigation - requires more deliberate gesture"
  - id: "05-06-03"
    decision: "SessionSetup size options dynamically built based on totalDue count"
    rationale: "Shows only relevant options (e.g., no '10' option when only 5 cards due)"
  - id: "05-06-04"
    decision: "Burmese numerals inline in SessionSetup (not importing from fsrsEngine)"
    rationale: "Avoids coupling UI component to SRS engine internals for a simple numeral conversion"

metrics:
  duration: "7 min"
  completed: "2026-02-07"
---

# Phase 5 Plan 6: Review UI Atoms Summary

**One-liner:** ReviewCard with Flashcard3D integration, swipe-to-rate gestures with progressive color gradient, RatingButtons tap fallback, and SessionSetup pre-session config screen.

## What Was Built

### ReviewCard (`src/components/srs/ReviewCard.tsx`)
- Wraps Flashcard3D with horizontal drag gesture for swipe-to-rate
- Progressive color gradient during swipe: green (right/Easy) to orange (left/Hard)
- Bilingual edge labels appear during drag via `useTransform` opacity
- Rating feedback overlay with colored flash + bilingual interval text
- Hard rating shows bilingual encouragement: "Keep going, you've got this!"
- Reduced motion: disables drag, users rely on RatingButtons only
- Module-level `questionsById` Map for O(1) question lookup

### RatingButtons (`src/components/srs/RatingButtons.tsx`)
- Two side-by-side buttons: Hard (orange, RotateCcw icon) and Easy (green, Check icon)
- Bilingual labels using `useLanguage().showBurmese`
- 44px minimum height touch targets
- Spring scale animation on press (stiffness 400, damping 17)
- Disabled state for feedback phase

### SessionSetup (`src/components/srs/SessionSetup.tsx`)
- Header with back button and bilingual title
- Large due count display with primary color
- Dynamic session size picker: 10, 20, or All Due (pill-style radio buttons)
- Smart pre-selection based on totalDue count
- Timer toggle with accessible switch component
- All-caught-up empty state with encouraging bilingual message
- StaggeredList animation for option entry

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ReviewCard + RatingButtons | 4f6ff48 | ReviewCard.tsx, RatingButtons.tsx |
| 2 | SessionSetup | 7f4b83f | SessionSetup.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Flashcard3D uncontrolled reuse** (05-06-01): ReviewCard passes `onFlip` callback to Flashcard3D but does not control its internal flip state. The `isFlipped` prop on ReviewCard is for parent tracking only.

2. **Higher swipe threshold** (05-06-02): SWIPE_THRESHOLD=80 vs FlashcardStack's 50. Rating is more consequential than navigation, so requires a more deliberate gesture.

3. **Dynamic size options** (05-06-03): SessionSetup builds size options based on totalDue count, only showing relevant choices (e.g., hides "10 Cards" when only 5 are due).

4. **Inline Burmese numerals** (05-06-04): SessionSetup includes its own toBurmeseNumeral helper to avoid importing from fsrsEngine.

## Verification Results

- `pnpm exec tsc --noEmit`: PASS (no errors in new components)
- `pnpm exec eslint`: PASS (clean, no React Compiler rule violations)
- All three components export correctly: ReviewCard, RatingButtons, SessionSetup

## Next Phase Readiness

Plan 05-07 (ReviewSession orchestrator) can now compose these atoms:
- ReviewCard handles card display and swipe-to-rate
- RatingButtons provides tap fallback
- SessionSetup handles pre-session configuration
- RatingFeedback type exported for parent state management

## Self-Check: PASSED
