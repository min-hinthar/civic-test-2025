---
phase: 18-language-mode
plan: 07
subsystem: ui
tags: [react, language-mode, font-myanmar, showBurmese, pwa, onboarding, auth, landing]

# Dependency graph
requires:
  - phase: 18-language-mode (plan 01)
    provides: "LanguageContext with useLanguage hook and showBurmese boolean"
provides:
  - "All 11 PWA/onboarding/auth/landing files guard font-myanmar text with showBurmese"
  - "Zero unconditional Burmese text in PWA prompts, onboarding flows, auth pages, or landing page"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Extract inline JSX from module-level arrays into React components for hook access"
    - "{showBurmese && (...)} for block-level Burmese text"
    - "Ternary {showBurmese ? 'EN / MY' : 'EN'} for inline bilingual strings"

key-files:
  created: []
  modified:
    - src/components/pwa/InstallPrompt.tsx
    - src/components/pwa/IOSTip.tsx
    - src/components/pwa/NotificationPrePrompt.tsx
    - src/components/pwa/NotificationSettings.tsx
    - src/components/pwa/WelcomeModal.tsx
    - src/components/onboarding/OnboardingTour.tsx
    - src/components/onboarding/WelcomeScreen.tsx
    - src/pages/AuthPage.tsx
    - src/pages/LandingPage.tsx
    - src/pages/PasswordResetPage.tsx
    - src/pages/PasswordUpdatePage.tsx

key-decisions:
  - "Extracted OnboardingTour inline step JSX into 7 separate React function components (StepWelcome, StepStudy, StepTest, StepInterview, StepHub, StepFinish, StateSelectContent) so each can call useLanguage() -- hooks cannot be used in module-level constants"

patterns-established:
  - "Module-level data arrays with JSX: extract content into components for hook access"

# Metrics
duration: 9min
completed: 2026-02-14
---

# Phase 18 Plan 07: PWA/Onboarding/Auth/Landing showBurmese Guards Summary

**Added showBurmese guards to all 11 files (5 PWA, 2 onboarding, 4 page-level) covering 58 font-myanmar occurrences across install prompts, iOS tips, notifications, welcome flows, auth forms, and landing page**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-14T08:45:46Z
- **Completed:** 2026-02-14T08:54:32Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- All 5 PWA components (InstallPrompt, IOSTip, NotificationPrePrompt, NotificationSettings, WelcomeModal) guard Burmese text with showBurmese conditionals
- OnboardingTour refactored: extracted 7 inline JSX step contents into separate React components so each can call useLanguage() internally
- All 4 page-level components (AuthPage, LandingPage, PasswordResetPage, PasswordUpdatePage) guard Burmese text including form labels, descriptions, and footer links
- LandingPage (14 occurrences) handles both standalone font-myanmar paragraphs and data-driven rendering from features/stats arrays

## Task Commits

Each task was committed atomically:

1. **Task 1: Add showBurmese guards to PWA and onboarding components** - `2002713` (feat)
2. **Task 2: Add showBurmese guards to auth and page-level components** - `711941f` (feat)

## Files Created/Modified
- `src/components/pwa/InstallPrompt.tsx` - Guard 4 font-myanmar + 4 inline bilingual button texts
- `src/components/pwa/IOSTip.tsx` - Guard 2 font-myanmar paragraphs
- `src/components/pwa/NotificationPrePrompt.tsx` - Guard 2 font-myanmar + 2 inline bilingual buttons
- `src/components/pwa/NotificationSettings.tsx` - Guard 5 font-myanmar including frequency labels and status text
- `src/components/pwa/WelcomeModal.tsx` - Guard 4 font-myanmar tips + 1 inline bilingual button
- `src/components/onboarding/OnboardingTour.tsx` - Extract 7 step contents into components, guard all font-myanmar
- `src/components/onboarding/WelcomeScreen.tsx` - Guard 3 font-myanmar (h2, p, button span)
- `src/pages/AuthPage.tsx` - Guard 8 font-myanmar (header, divider, labels, confirmation, footer)
- `src/pages/LandingPage.tsx` - Guard 14 font-myanmar (hero, tagline, CTA, stats, sections, footer)
- `src/pages/PasswordResetPage.tsx` - Guard 4 font-myanmar (title, description, label, footer)
- `src/pages/PasswordUpdatePage.tsx` - Guard 5 font-myanmar (title, description, labels, footer)

## Decisions Made
- Extracted OnboardingTour inline JSX from module-level `tourSteps` array into 7 separate React function components (StepWelcome, StepStudy, StepTest, StepInterview, StepHub, StepFinish, plus existing StateSelectContent). This was necessary because React hooks (`useLanguage()`) cannot be called in module-level constants -- only inside function components.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] OnboardingTour module-level JSX extraction**
- **Found during:** Task 1 (OnboardingTour.tsx)
- **Issue:** Tour steps defined as module-level `Step[]` array with inline JSX containing font-myanmar text. Cannot call `useLanguage()` hook at module scope.
- **Fix:** Extracted each step's content JSX into named React function components (StepWelcome, StepStudy, StepTest, StepInterview, StepHub, StepFinish) that each call `useLanguage()` internally. StateSelectContent already existed as a component, just added showBurmese guard to it.
- **Files modified:** src/components/onboarding/OnboardingTour.tsx
- **Verification:** TypeScript compiles, step content renders identically with language guards
- **Committed in:** 2002713 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary architectural change to enable hook access in tour step content. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 75 files with font-myanmar in src/ now have showBurmese guards
- Combined with plans 02-06, the entire codebase respects language mode
- Ready for any remaining phase 18 plans or phase 19

## Self-Check: PASSED

- All 11 modified files: FOUND
- Commit 2002713 (Task 1): FOUND
- Commit 711941f (Task 2): FOUND
- TypeScript: zero errors
- All 75 font-myanmar files have showBurmese guards

---
*Phase: 18-language-mode*
*Completed: 2026-02-14*
