---
phase: 25-burmese-translation-audit
plan: 07
subsystem: ui
tags: [burmese, myanmar, i18n, translation, social, srs, sort, inline-strings]

# Dependency graph
requires:
  - phase: 25-01
    provides: "Burmese glossary with canonical terminology"
  - phase: 25-04
    provides: "Centralized string files for UI actions and navigation"
provides:
  - "Natural Burmese translations in all social components (badges, leaderboard, sharing)"
  - "Correct review terminology in SRS components (ပြန်လည်သုံးသပ် not ပြန်လှည့်)"
  - "Literal Myanmar characters in sort mode components (no Unicode escapes)"
  - "Consistent glossary terms across settings and study guide pages"
affects: [25-09, 25-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Node.js scripts for Myanmar Unicode text replacement (Edit tool has encoding issues with Myanmar combining characters)"

key-files:
  created: []
  modified:
    - "src/components/social/BadgeCelebration.tsx"
    - "src/components/social/BadgeHighlights.tsx"
    - "src/components/social/BadgeGrid.tsx"
    - "src/components/social/LeaderboardTable.tsx"
    - "src/components/social/SocialSettings.tsx"
    - "src/components/social/SocialOptInFlow.tsx"
    - "src/components/social/StreakHeatmap.tsx"
    - "src/components/social/LeaderboardProfile.tsx"
    - "src/components/social/ShareCardPreview.tsx"
    - "src/components/sort/SortModeContainer.tsx"
    - "src/components/sort/SwipeableCard.tsx"
    - "src/components/sort/KnowDontKnowButtons.tsx"
    - "src/components/sort/SortProgress.tsx"
    - "src/components/sort/SortCountdown.tsx"
    - "src/components/sort/SwipeableStack.tsx"
    - "src/components/srs/DeckManager.tsx"
    - "src/components/srs/RatingButtons.tsx"
    - "src/components/srs/ReviewCard.tsx"
    - "src/components/srs/ReviewHeatmap.tsx"
    - "src/components/srs/ReviewSession.tsx"
    - "src/components/srs/SRSWidget.tsx"
    - "src/components/srs/SessionSetup.tsx"
    - "src/components/srs/SessionSummary.tsx"
    - "src/pages/SettingsPage.tsx"
    - "src/pages/StudyGuidePage.tsx"

key-decisions:
  - "All Unicode escape sequences converted to literal Myanmar characters for readability"
  - "Review terminology standardized: 'ပြန်လှည့်' (turn back) replaced with 'ပြန်လည်သုံးသပ်' (review) across SRS components"
  - "SRS context terms fixed: 'စာမေးပွဲ' (test/exam) replaced with 'ပြန်လည်သုံးသပ်' (review) in SRSWidget"
  - "Leaderboard term standardized: 'ဥူးဆောင်ဘုတ်' replaced with glossary 'အဆင့်ဇယား' across social components"
  - "Points term standardized: 'ရမှတ်' replaced with glossary 'အမှတ်' across leaderboard components"
  - "Day labels corrected in both heatmaps: incomplete abbreviations expanded to proper Burmese day names"
  - "SettingsPage and StudyGuidePage included despite not being in plan file list (same Unicode escape issue)"

patterns-established:
  - "Node.js file manipulation for Myanmar Unicode: Edit tool cannot reliably match Myanmar combining characters due to encoding differences"
  - "Burmese day name convention: တနင်္လာ (Mon), ဗုဒ္ဓဟူး (Wed), သောကြာ (Fri) - full forms, not abbreviations"

# Metrics
duration: ~45min
completed: 2026-02-18
---

# Phase 25 Plan 07: Social, SRS & Sort Burmese Translation Summary

**Standardized Burmese terminology across 25 component files: corrected review/leaderboard/points terms per glossary, converted all Unicode escapes to literal Myanmar, and removed unnecessary JSX string wrappers**

## Performance

- **Duration:** ~45 min (across two context windows due to Myanmar Unicode encoding challenges)
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 2/2
- **Files modified:** 25

## Accomplishments

- Converted all `\u10XX` Unicode escape sequences to literal Myanmar characters across social, SRS, sort, settings, and study guide components
- Fixed incorrect review terminology in SRS components: "ပြန်လှည့်" (turn back) consistently replaced with "ပြန်လည်သုံးသပ်" (review) per glossary
- Standardized social component terms: Leaderboard ("အဆင့်ဇယား"), Points ("အမှတ်"), Badge ("တံဆိပ်"), Continue ("ဆက်လက်ပါ")
- Fixed SRSWidget using "စာမေးပွဲ" (test/exam) where "ပြန်လည်သုံးသပ်" (review) was needed
- Corrected day name abbreviations in both ReviewHeatmap and StreakHeatmap
- Fixed unguarded Burmese text in DeckManager (was always showing regardless of showBurmese)
- Removed unnecessary `{'string'}` JSX expression wrappers in 10+ files

## Task Commits

Each task was committed atomically:

1. **Task 1: Update social component inline strings** - `a63323e` (feat)
2. **Task 2: Update SRS and sort mode component inline strings** - `c47cb45` (feat)

## Files Created/Modified

**Social components (Task 1):**
- `src/components/social/BadgeCelebration.tsx` - Fixed Continue term, removed JSX wrappers
- `src/components/social/BadgeHighlights.tsx` - Converted Unicode escapes, fixed Badge term
- `src/components/social/BadgeGrid.tsx` - Fixed category labels per glossary
- `src/components/social/LeaderboardTable.tsx` - Fixed Points term
- `src/components/social/SocialSettings.tsx` - Fixed Leaderboard and Social terms
- `src/components/social/SocialOptInFlow.tsx` - Fixed 5 leaderboard/social/points terms
- `src/components/social/StreakHeatmap.tsx` - Corrected day name abbreviations
- `src/components/social/LeaderboardProfile.tsx` - Fixed Points term
- `src/components/social/ShareCardPreview.tsx` - Removed unnecessary JSX wrappers

**SRS components (Task 2):**
- `src/components/srs/DeckManager.tsx` - Fixed unguarded Burmese, improved navigation label
- `src/components/srs/SRSWidget.tsx` - Fixed 4 instances of wrong "test" term for "review"
- `src/components/srs/SessionSetup.tsx` - Fixed 4 review terms, removed 5 JSX wrappers
- `src/components/srs/SessionSummary.tsx` - Fixed 4 review terms, removed 5 JSX wrappers
- `src/components/srs/ReviewCard.tsx` - Fixed review term, removed JSX wrappers
- `src/components/srs/RatingButtons.tsx` - Removed JSX wrappers
- `src/components/srs/ReviewSession.tsx` - Removed JSX wrappers
- `src/components/srs/ReviewHeatmap.tsx` - Corrected day name abbreviations

**Sort components (Task 2):**
- `src/components/sort/SortModeContainer.tsx` - Converted all Unicode escapes in labels object
- `src/components/sort/SwipeableCard.tsx` - Converted Know/Don't Know Unicode escapes
- `src/components/sort/KnowDontKnowButtons.tsx` - Converted all Unicode escapes
- `src/components/sort/SortProgress.tsx` - Converted Unicode escapes
- `src/components/sort/SortCountdown.tsx` - Converted Unicode escapes
- `src/components/sort/SwipeableStack.tsx` - Converted zone label Unicode escapes

**Additional files (Task 2 - deviation):**
- `src/pages/SettingsPage.tsx` - Converted ~30 Unicode escapes to literal Myanmar
- `src/pages/StudyGuidePage.tsx` - Converted tab label Unicode escapes

## Decisions Made

- **Review terminology fix:** "ပြန်လှည့်" (turn back/flip) was being used as "review" in multiple SRS components. Replaced with glossary-standard "ပြန်လည်သုံးသပ်" (review/reassess). This is a semantic fix, not just a style change.
- **SRSWidget context fix:** Widget was using "စာမေးပွဲ" (test/exam) in deck-related strings. Changed to "ပြန်လည်သုံးသပ်" (review) since the widget is about SRS review, not testing.
- **Scope expansion:** SettingsPage.tsx and StudyGuidePage.tsx were not in the plan's file list but contained the same Unicode escape issues. Fixed them in the same commit rather than leaving inconsistency.
- **Node.js for Myanmar text:** Used Node.js scripts instead of Edit tool for Myanmar text replacements due to encoding mismatches with combining characters.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unguarded Burmese text in DeckManager**
- **Found during:** Task 2 (DeckManager.tsx)
- **Issue:** Line 219 always displayed Burmese text without checking `showBurmese`, violating the bilingual guard pattern
- **Fix:** Added `showBurmese &&` guard around the Burmese span
- **Files modified:** src/components/srs/DeckManager.tsx
- **Verification:** Typecheck passes, visual inspection confirms guard
- **Committed in:** c47cb45

**2. [Rule 1 - Bug] Fixed incorrect review terminology across SRS components**
- **Found during:** Task 2 (SessionSetup, SessionSummary, ReviewCard)
- **Issue:** "ပြန်လှည့်" (turn back/flip) was used as translation for "review" in 8+ places. This is semantically incorrect - the SRS context requires "ပြန်လည်သုံးသပ်" (review/reassess)
- **Fix:** Replaced all instances with glossary-standard "ပြန်လည်သုံးသပ်"
- **Files modified:** SessionSetup.tsx, SessionSummary.tsx, ReviewCard.tsx
- **Verification:** Typecheck passes, grep confirms no remaining instances
- **Committed in:** c47cb45

**3. [Rule 1 - Bug] Fixed SRSWidget using test/exam term for review**
- **Found during:** Task 2 (SRSWidget.tsx)
- **Issue:** "စာမေးပွဲ" (test/exam) used in 4 places where "ပြန်လည်သုံးသပ်" (review) was needed
- **Fix:** Replaced all instances with context-appropriate review terms
- **Files modified:** src/components/srs/SRSWidget.tsx
- **Verification:** Typecheck passes
- **Committed in:** c47cb45

**4. [Rule 3 - Blocking] Extended scope to SettingsPage and StudyGuidePage**
- **Found during:** Task 2 (detected during initial file scan)
- **Issue:** These pages had the same Unicode escape sequences as the planned files
- **Fix:** Converted all escapes to literal Myanmar characters
- **Files modified:** src/pages/SettingsPage.tsx, src/pages/StudyGuidePage.tsx
- **Verification:** Typecheck passes, no escapes remain
- **Committed in:** c47cb45

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and consistency. The terminology fixes are the most impactful -- users would have seen wrong Burmese words for "review" throughout the SRS experience.

## Issues Encountered

- **Myanmar Unicode encoding in Edit tool:** The Edit tool consistently failed to match strings containing Myanmar combining characters. The tool's string comparison appears to use different encoding than what's stored in the file. Workaround: Used Node.js `fs.readFileSync`/`writeFileSync` with regex patterns for all Myanmar text replacements. This is a known issue from prior sessions and should be expected for any future Myanmar text editing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All social, SRS, and sort components now have natural Burmese translations
- Glossary terminology is consistent across all modified files
- Plans 05 (Landing/Auth/Onboarding), 09, and 10 remain for phase completion
- No blockers for remaining plans

---
*Phase: 25-burmese-translation-audit*
*Completed: 2026-02-18*
