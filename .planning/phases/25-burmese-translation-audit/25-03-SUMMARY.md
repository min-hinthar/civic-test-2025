---
phase: 25-burmese-translation-audit
plan: 03
subsystem: i18n
tags: [burmese, translation, civics-questions, glossary-consistency, uscis-2025]

# Dependency graph
requires:
  - phase: 25-burmese-translation-audit
    plan: 01
    provides: "Burmese terminology glossary and typography foundation"
provides:
  - "81 questions with improved Burmese translations across 6 question files"
  - "28 USCIS 2025 additions quality-checked for consistency"
  - "Cross-check file (cross-check-wave-1b.md) for 3-AI verification"
affects: [25-05, 25-06, 25-07, 25-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@verified TSDoc marker on question files for audit tracking"
    - "Burmese transliteration + (English) parenthetical for proper nouns and civics terms"
    - "Casual conversational register for question_my fields"

key-files:
  created:
    - ".planning/phases/25-burmese-translation-audit/cross-check-wave-1b.md"
  modified:
    - "src/constants/questions/rights-responsibilities.ts"
    - "src/constants/questions/american-history-colonial.ts"
    - "src/constants/questions/american-history-1800s.ts"
    - "src/constants/questions/american-history-recent.ts"
    - "src/constants/questions/symbols-holidays.ts"
    - "src/constants/questions/uscis-2025-additions.ts"

key-decisions:
  - "Proper noun transliterations standardized across all files using glossary canonical forms"
  - "USCIS 2025 additions received targeted fixes only (not full rewrites) — preserving good existing translations"
  - "Japanese character (への) in RR-11 identified and replaced with Burmese equivalent"
  - "Non-standard Burmese word 'motto' (မိုထိုး) replaced with correct term (ဆောင်ပုဒ်)"

patterns-established:
  - "History files: Burmese transliteration + (English) for all named historical figures"
  - "War/event names: Burmese term + (English) parenthetical — e.g., ပြည်တွင်းစစ် (Civil War)"
  - "@verified TSDoc marker on all question files processed"

# Metrics
duration: 22min
completed: 2026-02-18
---

# Phase 25 Plan 03: Remaining Questions Translation Summary

**Improved Burmese translations for 81 questions across 6 files — fixed proper noun transliterations, added (English) parentheticals for civics terms, converted question phrasing to casual conversational register, and quality-checked USCIS 2025 additions for data integrity issues**

## Performance

- **Duration:** 22 min
- **Started:** 2026-02-18T08:28:46Z
- **Completed:** 2026-02-18T08:50:24Z
- **Tasks:** 2
- **Files modified:** 7 (6 question files + 1 cross-check file created)

## Accomplishments

- Improved Burmese translations in 53 questions across 5 core files (rights-responsibilities, colonial history, 1800s history, recent history, symbols-holidays)
- Quality-checked 28 USCIS 2025 addition questions, fixing 8 data integrity issues including a Japanese character infiltration, broken phonetic transliterations, and a non-standard Burmese word
- Standardized proper noun transliterations across all files against the canonical glossary (George Washington, Abraham Lincoln, Susan B. Anthony, Woodrow Wilson, Franklin Roosevelt, Eisenhower, etc.)
- Generated cross-check file covering all changed translations for 3-AI verification workflow

## Task Commits

Each task was committed atomically:

1. **Task 1: Improve Burmese translations in 5 core question files** - `070e351` (feat)
2. **Task 2: Quality-check USCIS 2025 additions + generate cross-check file** - `3c2ad85` (feat)

## Files Created/Modified

- `src/constants/questions/rights-responsibilities.ts` - 10 questions: conversational register, (English) parentheticals for Constitution, Amendment, Citizen, Rights, etc.
- `src/constants/questions/american-history-colonial.ts` - 13 questions: fixed George Washington/Thomas Jefferson/Benjamin Franklin transliterations, conversational question phrasing
- `src/constants/questions/american-history-1800s.ts` - 7 questions: fixed Abraham Lincoln/Susan B. Anthony transliterations, added (Civil War)/(Emancipation Proclamation) parentheticals
- `src/constants/questions/american-history-recent.ts` - 10 questions: fixed Woodrow Wilson/Franklin Roosevelt/Eisenhower transliterations, added (World War I/II)/(Great Depression)/(Cold War)
- `src/constants/questions/symbols-holidays.ts` - 13 questions: conversational register, added (Statue of Liberty)/(Independence Day)/(national anthem)
- `src/constants/questions/uscis-2025-additions.ts` - 28 questions: 8 targeted fixes (see deviations)
- `.planning/phases/25-burmese-translation-audit/cross-check-wave-1b.md` - Cross-check tables for all changed translations grouped by source file

## Decisions Made

- **Targeted fixes for USCIS 2025**: Instead of rewriting all 28 questions, preserved good existing translations and only fixed data integrity issues — following the plan's guidance
- **Glossary-canonical proper nouns**: Standardized all named historical figures to match glossary forms exactly (e.g., `အာဗြဟံ လင်ကွန်း` -> `အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)`)
- **Japanese character remediation**: RR-11 contained `への` (Japanese hiragana) — replaced with proper Burmese `အပေါ်`
- **Senator translation**: Replaced broken phonetic `ဆင်နေတာ` with proper Burmese `အထက်လွှတ်တော်အမတ် (Senator)`
- **Motto translation**: Replaced non-standard `မိုထိုး` with correct Burmese `ဆောင်ပုဒ်`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Japanese character infiltration in RR-11**
- **Found during:** Task 2 (USCIS quality check)
- **Issue:** `အခြားနိုင်ငံများへの သစ္စာကို စွန့်လွှတ်မည်` contained Japanese hiragana `への` instead of Burmese
- **Fix:** Replaced with `အခြားနိုင်ငံများအပေါ် သစ္စာကို စွန့်လွှတ်မည်`
- **Files modified:** src/constants/questions/uscis-2025-additions.ts
- **Verification:** Typecheck passes, no non-Burmese characters remain
- **Committed in:** 3c2ad85 (Task 2 commit)

**2. [Rule 1 - Bug] Inconsistent proper noun transliterations across USCIS 2025 file**
- **Found during:** Task 2 (USCIS quality check)
- **Issue:** Pennsylvania (`ပင်စီလ်ဗေးနီးယား` vs glossary `ပင်ဆယ်ဗေးနီးယား`), Alaska (`အလာစကာ` vs `အလက်စကာ`), Massachusetts (`မက်ဆာချူဆက်` vs `မက်ဆာချူးဆက်`), FDR name inconsistency
- **Fix:** Standardized all to glossary canonical forms
- **Files modified:** src/constants/questions/uscis-2025-additions.ts
- **Verification:** All transliterations match glossary
- **Committed in:** 3c2ad85 (Task 2 commit)

**3. [Rule 1 - Bug] Broken "senator" phonetic transliteration**
- **Found during:** Task 2 (USCIS quality check)
- **Issue:** `ပထမဆုံး အမျိုးသမီးဆင်နေတာ` — "ဆင်နေတာ" is broken phonetic attempt at "senator"
- **Fix:** Replaced with proper Burmese `ပထမဆုံး အမျိုးသမီး အထက်လွှတ်တော်အမတ် (Senator)`
- **Files modified:** src/constants/questions/uscis-2025-additions.ts
- **Verification:** Uses standard Burmese parliamentary terminology
- **Committed in:** 3c2ad85 (Task 2 commit)

**4. [Rule 1 - Bug] Non-standard Burmese word for "motto"**
- **Found during:** Task 2 (USCIS quality check)
- **Issue:** `မိုထိုး` is not standard Burmese — appears to be a phonetic guess at English "motto"
- **Fix:** Replaced with `ဆောင်ပုဒ်` (correct Burmese for motto/slogan)
- **Files modified:** src/constants/questions/uscis-2025-additions.ts
- **Verification:** Standard Burmese dictionary term
- **Committed in:** 3c2ad85 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (4 Rule 1 bugs)
**Impact on plan:** All fixes corrected data integrity issues in the USCIS 2025 file. No scope creep.

## Issues Encountered

- USCIS 2025 additions file exceeded single-read token limit (25,461 tokens) — read in two parts using offset/limit parameters. No impact on execution.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 128 civics questions now have improved Burmese translations (Plans 02 + 03 combined)
- Cross-check files ready for 3-AI verification: cross-check-wave-1a.md (Plan 02) and cross-check-wave-1b.md (Plan 03)
- Remaining plans (05-10) can proceed with font rendering, component-level i18n, and advanced features

## Self-Check: PASSED

All 7 files verified present. Both task commits (070e351, 3c2ad85) verified in git history.

---
*Phase: 25-burmese-translation-audit*
*Completed: 2026-02-18*
