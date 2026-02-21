---
phase: 04-learning-explanations-category-progress
plan: 03
subsystem: ui
tags: [react, motion, bilingual, explanation, accessibility, i18n]

# Dependency graph
requires:
  - phase: 04-01
    provides: Explanation type definition and question data with explanations
  - phase: 03-05
    provides: BilingualText component, centralized strings pattern, LanguageContext
  - phase: 03-02
    provides: Card component, spring physics, useReducedMotion hook
provides:
  - ExplanationCard component for expandable bilingual explanations
  - WhyButton component for auto-visible explanation reveal in answer feedback
  - RelatedQuestions component for inline-expandable related question links
  - Bilingual strings for explanations, progress, and practice sections
affects: [04-04, 04-05, 04-06, 04-07, 04-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expandable card with AnimatePresence height animation and reduced-motion fallback"
    - "Nested component composition: WhyButton wraps ExplanationCard wraps RelatedQuestions"

key-files:
  created:
    - src/components/explanations/ExplanationCard.tsx
    - src/components/explanations/WhyButton.tsx
    - src/components/explanations/RelatedQuestions.tsx
  modified:
    - src/lib/i18n/strings.ts

key-decisions:
  - "WhyButton wraps ExplanationCard with border-0 rounded-none to embed seamlessly"
  - "RelatedQuestions filters out missing question IDs gracefully (returns null if none found)"
  - "ExplanationCard accepts allQuestions prop to pass through for RelatedQuestions lookup"

patterns-established:
  - "Explanation section pattern: conditional rendering based on data presence (hasMnemonic, hasCitation, etc.)"
  - "Nested expandable pattern: outer WhyButton expand/collapse wrapping inner ExplanationCard"

# Metrics
duration: 5min
completed: 2026-02-07
---

# Phase 4 Plan 3: Explanation UI Components Summary

**Reusable ExplanationCard, WhyButton, and RelatedQuestions components with motion animations, bilingual support, and 48 new i18n strings for explanations/progress/practice**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-07T10:07:12Z
- **Completed:** 2026-02-07T10:12:51Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ExplanationCard with expandable sections: brief, common mistake (orange-tinted), mnemonic (primary-tinted), citation, fun fact, and related questions
- WhyButton as auto-visible collapsed card with compact mode for smaller footprints
- RelatedQuestions with inline-expandable question links showing answer and explanation
- 48 bilingual strings added across explanations, progress, and practice sections

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ExplanationCard, WhyButton, and RelatedQuestions components** - `b5ddcbc` (feat)
2. **Task 2: Add bilingual strings for explanation UI** - `ebbed20` (feat)

## Files Created/Modified
- `src/components/explanations/ExplanationCard.tsx` - Expandable bilingual explanation display with mnemonic, citation, fun fact, common mistake sections
- `src/components/explanations/WhyButton.tsx` - Auto-visible collapsed explanation card with expand to reveal ExplanationCard
- `src/components/explanations/RelatedQuestions.tsx` - See-also section with inline-expandable related question links
- `src/lib/i18n/strings.ts` - Added explanations, progress, and practice string sections (48 new bilingual strings)

## Decisions Made
- WhyButton renders ExplanationCard with `border-0 rounded-none` class overrides to embed seamlessly within the WhyButton's own border
- RelatedQuestions gracefully handles missing question IDs by filtering them out (returns null if no matches found)
- ExplanationCard receives `allQuestions` prop to pass through to RelatedQuestions for ID-to-question lookup
- Common mistake section only shows when `isCorrect === false` AND `commonMistake_en` exists (per plan spec)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ExplanationCard, WhyButton, RelatedQuestions ready for integration into test mode (04-04) and review screen (04-05)
- Bilingual strings for progress and practice sections ready for 04-06 through 04-09
- All components follow established motion/react animation patterns for consistency

## Self-Check: PASSED

---
*Phase: 04-learning-explanations-category-progress*
*Completed: 2026-02-07*
