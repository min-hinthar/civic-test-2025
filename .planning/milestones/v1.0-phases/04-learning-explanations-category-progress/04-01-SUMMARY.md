---
phase: 04-learning-explanations-category-progress
plan: 01
subsystem: data
tags: [explanation, bilingual, burmese, uscis, category-mapping, question-content]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Question type with string IDs, 7 category question modules
provides:
  - Explanation interface with brief_en, brief_my, mnemonic, citation, funFact, commonMistake, relatedQuestionIds
  - USCIS 3-category mapping (American Government, American History, Integrated Civics) with colors and bilingual names
  - 100 bilingual explanation entries across all 6 question files
  - Category helper functions (getUSCISCategory, getCategoryQuestionIds)
affects:
  - 04-02 (test explanations UI depends on explanation data)
  - 04-03 (study guide explanations depends on explanation data)
  - 04-04 (mastery tracking uses category mapping)
  - 04-05 (progress visualization uses category colors and names)
  - 04-06 (category practice uses getCategoryQuestionIds)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Explanation data colocated with questions (same file, not separate)"
    - "Bilingual explanation fields use _en/_my suffix pattern"
    - "USCIS 3-category mapping with emerald (not green) for Integrated Civics"

key-files:
  created:
    - src/lib/mastery/categoryMapping.ts
  modified:
    - src/types/index.ts
    - src/constants/questions/american-government.ts
    - src/constants/questions/rights-responsibilities.ts
    - src/constants/questions/american-history-colonial.ts
    - src/constants/questions/american-history-1800s.ts
    - src/constants/questions/american-history-recent.ts
    - src/constants/questions/symbols-holidays.ts

key-decisions:
  - "Explanations colocated with questions for single-cache-unit offline support"
  - "Emerald (not green) for Integrated Civics to avoid clash with success-500 semantic color"
  - "Optional explanation field on Question interface for gradual rollout safety"
  - "Citation field only on constitutional questions (31 GOV + 3 RR + 1 HIST-1800s)"
  - "Bilingual category names included for dashboard/progress display"

patterns-established:
  - "Explanation content pattern: brief (2-3 sentences), friendly tone, natural Burmese rephrasing"
  - "USCIS category mapping: 7 sub-categories -> 3 main categories with color assignments"
  - "Related questions: cross-category links via relatedQuestionIds array"

# Metrics
duration: 15min
completed: 2026-02-07
---

# Phase 4 Plan 1: Explanation Data & USCIS Category Mapping Summary

**Bilingual explanation content for all 100 civics questions with USCIS 3-category mapping, constitutional citations, and cross-question linking**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-07T09:38:33Z
- **Completed:** 2026-02-07T09:53:33Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Defined Explanation interface with 10 fields covering bilingual content, mnemonics, citations, fun facts, common mistakes, and related questions
- Created USCIS category mapping with 3 main categories (blue/amber/emerald), bilingual names, and helper functions
- Populated all 100 questions with bilingual explanations (brief_en + brief_my), with citations on 35 constitutional questions, fun facts on ~40 questions, and common mistakes on ~30 questions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Explanation type and USCIS category mapping** - `3102eb2` (feat)
2. **Task 2a: Write bilingual explanations for Government & Rights (57 questions)** - `d98e784` (feat)
3. **Task 2b: Write bilingual explanations for History & Symbols (43 questions)** - `d0bbee7` (feat)

## Files Created/Modified
- `src/types/index.ts` - Added Explanation interface, extended Question with optional explanation field
- `src/lib/mastery/categoryMapping.ts` - USCIS 3-category mapping with colors, bilingual names, helper functions
- `src/constants/questions/american-government.ts` - 47 questions with explanations (31 citations)
- `src/constants/questions/rights-responsibilities.ts` - 10 questions with explanations (3 citations)
- `src/constants/questions/american-history-colonial.ts` - 13 questions with explanations, fun facts, mnemonics
- `src/constants/questions/american-history-1800s.ts` - 7 questions with explanations (1 citation for 13th Amendment)
- `src/constants/questions/american-history-recent.ts` - 10 questions with explanations covering modern history
- `src/constants/questions/symbols-holidays.ts` - 13 questions with explanations, geography mnemonics, cultural fun facts

## Decisions Made
- **Explanation colocation:** Kept explanations in same files as questions (not separate files) for simpler caching and maintenance
- **Emerald for Integrated Civics:** Used emerald instead of green per research pitfall #3 to avoid clash with success-500 semantic color
- **Optional explanation field:** Made `explanation?` optional on Question interface for gradual rollout safety
- **Citation scope:** Only constitutional questions get citation field (Articles, Amendments); general knowledge questions skip citations
- **Sub-category bilingual names:** Added SUB_CATEGORY_NAMES with shorter display names (e.g., "Colonial Period and Independence" instead of full "American History: Colonial Period and Independence")

## Deviations from Plan

None - plan executed exactly as written. Tasks 1 and 2a had been completed in a prior session and were already committed. Task 2b was partially started (colonial + 4/7 1800s) and completed in this session.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 100 questions have explanation data ready for UI display
- USCIS category mapping ready for mastery tracking and progress visualization
- Explanation interface supports all planned features: "Why?" cards, review screens, study guide expansion
- Category helpers (getUSCISCategory, getCategoryQuestionIds) ready for practice mode question selection

## Self-Check: PASSED

---
*Phase: 04-learning-explanations-category-progress*
*Completed: 2026-02-07*
