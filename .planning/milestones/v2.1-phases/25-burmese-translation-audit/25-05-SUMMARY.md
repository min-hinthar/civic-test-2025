---
phase: 25-burmese-translation-audit
plan: 05
subsystem: ui
tags: [burmese, myanmar, translations, i18n, settings, study-guide, auth, onboarding, landing]

# Dependency graph
requires:
  - phase: 25-01
    provides: "Burmese glossary and canonical terminology"
  - phase: 25-04
    provides: "Centralized i18n strings for navigation and shared labels"
provides:
  - "Natural Burmese translations across 8 core page/component files"
  - "Zero Unicode escape sequences in landing, auth, settings, study guide"
  - "Glossary-consistent terminology in study guide tabs and card labels"
  - "Fully bilingual onboarding tour with literal Myanmar characters"
affects: [25-09, 25-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Node.js helper scripts for bulk Myanmar Unicode escape conversion"
    - "font-myanmar class on all inline Burmese text containers"

key-files:
  created: []
  modified:
    - src/pages/LandingPage.tsx
    - src/pages/AuthPage.tsx
    - src/pages/PasswordResetPage.tsx
    - src/pages/PasswordUpdatePage.tsx
    - src/pages/SettingsPage.tsx
    - src/pages/StudyGuidePage.tsx
    - src/components/onboarding/WelcomeScreen.tsx
    - src/components/onboarding/OnboardingTour.tsx

key-decisions:
  - "Dashboard.tsx has no inline Burmese strings (delegates to child components) -- no changes needed"
  - "HubPage.tsx uses centralized strings from i18n/strings.ts -- no inline changes needed"
  - "Node.js scripts needed for Myanmar Unicode text replacement (Edit tool has encoding issues with Myanmar combining characters)"
  - "Card terminology standardized to glossary 'ကဒ်' (not colloquial 'ကတ်') throughout StudyGuidePage"
  - "Answer/အဖြေ flip card label wrapped in font-myanmar span for proper Myanmar rendering"

patterns-established:
  - "Bulk Unicode escape conversion: use Node.js helper script with regex, not inline edit commands"
  - "Mixed English-Burmese labels: wrap Burmese portion in <span className='font-myanmar'> inside JSX fragment"

# Metrics
duration: ~45min
completed: 2026-02-18
---

# Phase 25 Plan 05: Core Pages Inline Burmese Summary

**Natural Burmese translations for landing, auth, settings, study guide, and onboarding pages with glossary-consistent terminology and zero Unicode escapes**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Converted all Unicode escape sequences to literal Myanmar characters across 8 files (966+ escapes in SettingsPage alone)
- Rewrote all inline Burmese to casual conversational register per glossary standards
- Standardized study guide tab labels and card terminology to glossary canonical forms (Browse, Sort, Deck, Review)
- Fixed garbled onboarding welcome text and rewrote all 6 tour step descriptions
- Verified Dashboard and HubPage need no inline changes (both delegate to child components or centralized strings)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update landing, auth, and onboarding pages** - `7d012e7` (feat)
2. **Task 2: Update settings, dashboard, study guide, and hub pages** - `44f1d05` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified

- `src/pages/LandingPage.tsx` - Casual register for hero, features, CTAs; added ခု classifier for question count
- `src/pages/AuthPage.tsx` - Shortened password labels, natural auth flow Burmese
- `src/pages/PasswordResetPage.tsx` - Casual register for reset flow messages
- `src/pages/PasswordUpdatePage.tsx` - Casual register for update flow messages
- `src/components/onboarding/WelcomeScreen.tsx` - Fixed garbled welcome text, removed JSX string wrappers
- `src/components/onboarding/OnboardingTour.tsx` - Converted all Unicode escapes to literal Myanmar, rewrote 6 tour steps
- `src/pages/SettingsPage.tsx` - Converted 966+ Unicode escapes, rewrote all section titles/labels/descriptions to casual register
- `src/pages/StudyGuidePage.tsx` - Fixed tab labels per glossary, standardized card terminology to ကဒ်, added font-myanmar to Answer label

## Decisions Made

- **Dashboard.tsx skipped:** Has no inline Burmese text -- all Burmese rendering delegated to child components (NBAHeroCard, CompactStatRow, etc.)
- **HubPage.tsx skipped:** Uses centralized `strings` from `i18n/strings.ts` for all labels; only inline Burmese is the possessive progress title which is already correct
- **Node.js helper scripts:** Created `.planning/convert-unicode.js` and `.planning/fix-settings.js` for bulk Unicode escape conversion because the Edit tool has encoding issues with Myanmar combining characters in large files
- **Card terminology:** Standardized all instances of colloquial ကတ် to glossary canonical ကဒ် in StudyGuidePage
- **Answer label font:** Wrapped Burmese အဖြေ in `<span className="font-myanmar">` inside JSX fragment on flip card backs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed bilingual mode description comma character**
- **Found during:** Task 2 (SettingsPage)
- **Issue:** Myanmar "because" particle (၍) used instead of comma (၊) in bilingual mode description
- **Fix:** Replaced ၍ with ၊ in the bilingual mode explanation text
- **Files modified:** src/pages/SettingsPage.tsx
- **Verification:** Visual check of rendered text
- **Committed in:** 44f1d05 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed time label with spurious quote marks**
- **Found during:** Task 2 (SettingsPage)
- **Issue:** `"အချိန်"` had literal quote marks wrapping the Burmese word in the time picker label
- **Fix:** Removed quote marks, leaving just `အချိန်`
- **Files modified:** src/pages/SettingsPage.tsx
- **Verification:** TypeScript typecheck passes
- **Committed in:** 44f1d05 (Task 2 commit)

**3. [Rule 2 - Missing Critical] Added font-myanmar to Answer/အဖြေ labels**
- **Found during:** Task 2 (StudyGuidePage)
- **Issue:** "Answer - အဖြေ" label on flip card backs had Myanmar text without font-myanmar class
- **Fix:** Wrapped Burmese portion in `<span className="font-myanmar">` using JSX fragment
- **Files modified:** src/pages/StudyGuidePage.tsx (2 occurrences)
- **Verification:** TypeScript typecheck passes, font-myanmar class present on all Myanmar text
- **Committed in:** 44f1d05 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bug fixes, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness and proper Myanmar font rendering. No scope creep.

## Issues Encountered

- **Unicode escape conversion complexity:** The Edit tool cannot reliably handle Myanmar Unicode combining characters in large files. Solved by creating Node.js helper scripts (`.planning/convert-unicode.js` and `.planning/fix-settings.js`) that use regex with Unicode code points for reliable replacement.
- **Linter reverts:** The pre-commit hook (lint-staged with Prettier) occasionally reformatted edits, requiring re-reads before subsequent edits. Handled by reading files after each linter modification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 8 core page files now have natural Burmese translations with literal Myanmar characters
- Plans 09 and 10 (final verification and cleanup) can proceed
- Helper scripts in `.planning/` can be cleaned up after phase completion

## Self-Check: PASSED

- All 8 modified files verified present
- Commit 7d012e7 (Task 1) verified in git log
- Commit 44f1d05 (Task 2) verified in git log

---
*Phase: 25-burmese-translation-audit*
*Completed: 2026-02-18*
