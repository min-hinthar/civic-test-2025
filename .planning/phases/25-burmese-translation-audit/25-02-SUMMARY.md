---
phase: 25-burmese-translation-audit
plan: 02
subsystem: i18n
tags: [burmese, myanmar, translation, civics, american-government]

requires:
  - phase: 25-01
    provides: "Burmese terminology glossary for consistent translations"
provides:
  - "47 American Government questions with natural conversational Burmese translations"
  - "Cross-check file (cross-check-wave-1a.md) for 3-AI consensus verification"
affects: [25-05, 25-06, 25-07, 25-08, 25-09, 25-10]

tech-stack:
  added: []
  patterns:
    - "Burmese transliteration + (English) for proper nouns"
    - "Burmese translation + (English) for key civics terms"
    - "Casual conversational register with informal endings"

key-files:
  created:
    - ".planning/phases/25-burmese-translation-audit/cross-check-wave-1a.md"
  modified:
    - "src/constants/questions/american-government.ts"

key-decisions:
  - "Used glossary term တရားလွှတ်တော်ချုပ် (Supreme Court) consistently — aligns with glossary"
  - "Converted all formal question endings (အဘယ်နည်း/သနည်း) to casual (ဘာလဲ/ဘယ်သူလဲ)"
  - "Added @verified TSDoc marker for tracking 3-AI consensus status"
  - "Light pass on explanations — converted obvious formal register but did not fully rewrite"

patterns-established:
  - "Cross-check file format: Questions table, Study Answers table, MC Answers table, Explanations summary"
  - "Proper noun pattern applied to all current political figures (transliteration + English)"

duration: 34min
completed: 2026-02-18
---

# Phase 25 Plan 02: American Government Translations Summary

**47 American Government questions updated with casual conversational Burmese, glossary-consistent civics terms with English parenthetical, and proper noun transliterations**

## Performance

- **Duration:** 34 min
- **Started:** 2026-02-18T08:27:40Z
- **Completed:** 2026-02-18T09:01:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- All 47 American Government questions converted from formal to casual conversational Burmese register
- English parenthetical added to all key civics terms (Constitution, Amendment, Congress, Senate, etc.) per glossary standards
- All proper nouns given Burmese transliteration + (English) format (political figures, place names)
- Cross-check file created with 47 questions, 36 study answers, 80+ MC answers for Gemini/GPT verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Improve Burmese translations in american-government.ts** - `fee11d1` (feat)
2. **Task 2: Generate cross-check file for American Government questions** - `fa88149` (docs)

## Files Created/Modified
- `src/constants/questions/american-government.ts` - 47 questions with improved Burmese translations, @verified marker added
- `.planning/phases/25-burmese-translation-audit/cross-check-wave-1a.md` - Cross-check tables for 3-AI verification

## Decisions Made
- Used `တရားလွှတ်တော်ချုပ်` for Supreme Court (glossary standard) rather than `တရားရုံးချုပ်` (previous)
- Formal endings like `အဘယ်နည်း` and `သနည်း` systematically replaced with casual `ဘာလဲ` and `ဘယ်သူလဲ`
- `ယခု` (formal "now") replaced with `အခု` (casual "now") in dynamic questions
- `ကွန်ဂရက်` expanded to `ကွန်ဂရက်လွှတ်တော် (Congress)` for clarity
- `အမှုဆောင်ဌာန` (executive branch) changed to glossary-standard `အုပ်ချုပ်ရေးဌာန (Executive Branch)`
- Explanation translations received light pass only -- converted obvious formal markers but not full rewrites

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- American Government translations complete and ready for 3-AI cross-check verification
- Cross-check file (cross-check-wave-1a.md) formatted for easy copy to Gemini/GPT
- Glossary terms established in 25-01 successfully applied; patterns ready for remaining question files

## Self-Check: PASSED

- [x] `src/constants/questions/american-government.ts` exists with 47 question_my fields
- [x] `.planning/phases/25-burmese-translation-audit/cross-check-wave-1a.md` exists
- [x] Commit `fee11d1` exists
- [x] Commit `fa88149` exists
- [x] TypeScript compilation passes
- [x] No Unicode escape sequences in translations

---
*Phase: 25-burmese-translation-audit*
*Completed: 2026-02-18*
