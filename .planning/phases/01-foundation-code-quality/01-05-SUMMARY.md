---
phase: 01-foundation-code-quality
plan: 05
subsystem: data-structure
tags: [questions, ids, modular, srs]
status: complete

dependency-graph:
  requires: []
  provides: [stable-question-ids, modular-question-files, barrel-export]
  affects: [05-srs, data-tracking]

tech-stack:
  added: []
  patterns: [barrel-file, backwards-compatibility-layer]

key-files:
  created:
    - src/constants/questions/index.ts
    - src/constants/questions/american-government.ts
    - src/constants/questions/american-history-colonial.ts
    - src/constants/questions/american-history-1800s.ts
    - src/constants/questions/american-history-recent.ts
    - src/constants/questions/rights-responsibilities.ts
    - src/constants/questions/symbols-holidays.ts
  modified:
    - src/types/index.ts
    - src/constants/civicsQuestions.ts
    - src/pages/StudyGuidePage.tsx

decisions:
  - context: Question ID format
    choice: Prefix-based stable IDs (GOV-P01, HIST-C01, etc.)
    reason: Enables reliable SRS tracking without data migration

metrics:
  duration: 15 min
  completed: 2026-02-05
---

# Phase 01 Plan 05: Question File Split Summary

**One-liner:** Split 100 civics questions into 7 category modules with stable string IDs (GOV-P##, HIST-C##, etc.) for future SRS tracking.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Update Question type to string IDs | `1382e14` | types/index.ts, american-government.ts, american-history-colonial.ts |
| 2 | Complete all category files | `1b16aee` | american-history-1800s.ts, american-history-recent.ts, rights-responsibilities.ts, symbols-holidays.ts |
| 3 | Create barrel file and update imports | `51bbe9e` | questions/index.ts, civicsQuestions.ts, StudyGuidePage.tsx |

## What Changed

### Type System Updates
- Changed `Question.id` from `number` to `string` in src/types/index.ts
- Changed `QuestionResult.questionId` from `number` to `string`
- Updated StudyGuidePage.tsx `flippedCards` state and `toggleCard` function to use string IDs

### New Question Module Structure

```
src/constants/questions/
  index.ts                    # Barrel file with aggregation and helpers
  american-government.ts      # GOV-P01-12, GOV-S01-35 (47 questions)
  american-history-colonial.ts # HIST-C01-13 (13 questions)
  american-history-1800s.ts   # HIST-101-107 (7 questions)
  american-history-recent.ts  # HIST-R01-10 (10 questions)
  rights-responsibilities.ts  # RR-01-10 (10 questions)
  symbols-holidays.ts         # SYM-01-13 (13 questions)
```

Total: 100 questions with stable unique IDs

### ID Prefix Mapping

| Category | Prefix | Count |
|----------|--------|-------|
| Principles of American Democracy | GOV-P## | 12 |
| System of Government | GOV-S## | 35 |
| Rights and Responsibilities | RR-## | 10 |
| American History: Colonial Period | HIST-C## | 13 |
| American History: 1800s | HIST-1## | 7 |
| Recent American History | HIST-R## | 10 |
| Civics: Symbols and Holidays | SYM-## | 13 |

### Backwards Compatibility
- Original `civicsQuestions.ts` now re-exports from `./questions` with deprecation notice
- Existing imports continue to work unchanged

## Decisions Made

1. **ID Format:** Used prefix-based IDs (GOV-P01, not GOV-01) to distinguish subcategories within American Government
2. **Barrel File Design:** Simple re-export aggregation rather than complex helper functions (keeping it minimal for now)
3. **Backwards Compatibility:** Kept civicsQuestions.ts as a re-export layer rather than updating all imports

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compilation: PASS
- Question count matches original: 100 questions
- All 7 categories represented
- Unique IDs verified (no duplicates)

## Next Phase Readiness

Ready for Phase 5 (Spaced Repetition) which requires stable question IDs for tracking learning progress across sessions.

## Self-Check: PASSED
