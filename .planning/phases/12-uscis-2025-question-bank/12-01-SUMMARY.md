---
phase: 12-uscis-2025-question-bank
plan: 01
subsystem: database
tags: [uscis, question-bank, bilingual, burmese, dynamic-answers, civics]

# Dependency graph
requires: []
provides:
  - "128-question bilingual USCIS 2025 civics bank"
  - "DynamicAnswerMeta interface for time/state-varying questions"
  - "9 dynamic-marked questions with code comments for update triggers"
affects: [12-02, 12-03, 12-04, 12-05, 12-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DynamicAnswerMeta metadata pattern for questions with changing answers"
    - "DYNAMIC code comments explaining update triggers and schedule"

key-files:
  created: []
  modified:
    - "src/types/index.ts"
    - "src/constants/questions/uscis-2025-additions.ts"
    - "src/constants/questions/index.ts"
    - "src/constants/questions/american-government.ts"

key-decisions:
  - "8 new questions added to uscis-2025-additions.ts (not american-government.ts) to keep additions grouped"
  - "DynamicAnswerMeta uses per-question lastVerified dates (not global) for accurate state election tracking"
  - "State-specific questions use type:'state', time-dynamic use type:'time' for distinct handling"

patterns-established:
  - "Dynamic question marking: dynamic field + // DYNAMIC code comment on each question"
  - "Multi-answer studyAnswers pattern: array of all acceptable USCIS answers"

# Metrics
duration: 8min
completed: 2026-02-09
---

# Phase 12 Plan 01: Question Bank Expansion Summary

**128 bilingual USCIS 2025 civics questions with DynamicAnswerMeta on 9 time/state-varying questions**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-09T15:22:05Z
- **Completed:** 2026-02-09T15:29:55Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Extended Question type with DynamicAnswerMeta interface and optional dynamic field
- Added 8 missing USCIS 2025 questions (GOV-P17, GOV-S40-S46) with full bilingual content and plausible distractors
- Marked 9 existing questions with dynamic metadata: 5 time-based (president, VP, chief justice, president's party, speaker) and 4 state-specific (senators, representative, governor, capital)
- Added DYNAMIC code comments on all 9 dynamic questions explaining what to update and when
- Updated barrel file and uscis-2025-additions header comments to reflect 128 total

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Question type and add 8 missing questions with dynamic metadata** - `937f44b` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/types/index.ts` - Added DynamicAnswerMeta interface, added dynamic? field to Question
- `src/constants/questions/uscis-2025-additions.ts` - Added 8 new questions (GOV-P17, GOV-S40-S46), updated header to 28 additions
- `src/constants/questions/index.ts` - Updated category counts and total to 128, updated spread comment to 28
- `src/constants/questions/american-government.ts` - Added dynamic metadata and DYNAMIC comments to 9 questions

## Decisions Made
- All 8 new questions placed in uscis-2025-additions.ts to keep the additions module grouped rather than splitting across category files
- Per-question lastVerified dates chosen over global date because state elections happen on different cycles
- DynamicAnswerMeta.type discriminates 'time' vs 'state' to enable distinct UI handling in later plans

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Question bank now has 128 questions, ready for state personalization (plan 02), dynamic answer UI (plan 03), and all downstream plans
- totalQuestions automatically propagates 128 to all consumers via allQuestions.length
- Badge thresholds and mock test format require no changes (auto-adapt per research)

## Self-Check: PASSED

- All 4 modified files exist on disk
- Commit 937f44b found in git log
- TypeScript compiles cleanly (npx tsc --noEmit)
- ESLint passes on all src/ (npx eslint src/ --no-warn-ignored)
- 128 question id: fields counted across question files
- 9 dynamic: fields and 9 // DYNAMIC comments in american-government.ts
- All 8 new IDs present: GOV-P17, GOV-S40, GOV-S41, GOV-S42, GOV-S43, GOV-S44, GOV-S45, GOV-S46

---
*Phase: 12-uscis-2025-question-bank*
*Completed: 2026-02-09*
