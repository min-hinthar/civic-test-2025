---
phase: 03-ui-ux-bilingual-polish
plan: 09
subsystem: ui
tags: [dark-mode, css-variables, language-toggle, bilingual, context-api, motion, spring-animation]

# Dependency graph
requires:
  - phase: 03-01
    provides: "CSS design tokens and blue shade system"
  - phase: 03-03
    provides: "Toast and dialog components for feedback states"
  - phase: 03-05
    provides: "BilingualText and BilingualHeading components"
provides:
  - "Dark mode CSS polish with proper contrast and warm destructive colors"
  - "LanguageContext for bilingual/english-only preference management"
  - "LanguageToggle and LanguageToggleCompact components"
  - "Language settings integrated in header and settings page"
affects: [04-gamification, 05-dashboard, 06-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Warm gray/orange for destructive states (hue 25), red reserved for patriotic decoration only"
    - "LanguageContext with localStorage persistence and SSR-safe lazy init"
    - "Spring animation for toggle (stiffness 500, damping 30)"

key-files:
  created:
    - "src/contexts/LanguageContext.tsx"
    - "src/components/ui/LanguageToggle.tsx"
  modified:
    - "src/styles/globals.css"
    - "src/AppShell.tsx"
    - "src/components/AppNavigation.tsx"
    - "src/pages/SettingsPage.tsx"

key-decisions:
  - "Destructive/error states use warm gray/orange (hue 25), NOT red - red reserved for patriotic decoration"
  - "LanguageProvider placed inside OfflineProvider, outside ThemeProvider in hierarchy"
  - "LanguageToggleCompact uses dot indicator when in English-only mode"
  - "SettingsPage migrated from hardcoded gray colors to design token classes"

patterns-established:
  - "Warm destructive pattern: --destructive hue 25 for all error/warning states"
  - "Language context pattern: useLanguage().showBurmese to conditionally render Burmese text"
  - "data-tour attribute pattern for onboarding tour targeting"

# Metrics
duration: 37min
completed: 2026-02-06
---

# Phase 3 Plan 9: Dark Mode & Language Toggle Summary

**Dark mode CSS polish with warm destructive colors (no red for errors) and English-only practice mode via LanguageContext with animated toggle**

## Performance

- **Duration:** 37 min
- **Started:** 2026-02-06T23:37:24Z
- **Completed:** 2026-02-07T00:14:39Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Dark mode CSS variables properly contrast-adjusted with inverted blue shades
- Destructive/error colors changed from red (hue 0) to warm gray/orange (hue 25) across both light and dark modes
- LanguageContext with localStorage persistence enables bilingual/english-only toggle
- Language toggle integrated in header (compact) and settings page (full with explanation)
- Settings page modernized from hardcoded gray to design token classes

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish dark mode CSS variables** - `29efa34` (feat, committed as part of 03-08 pre-existing)
2. **Task 2: Create LanguageContext and LanguageToggle** - `107641d` (feat, committed as part of 03-08 pre-existing)
3. **Task 3: Integrate language toggle into navigation and settings** - `87cb808` (feat)

**Plan metadata:** pending (docs: complete plan)

_Note: Tasks 1 and 2 were found already committed from the 03-08 execution. Only Task 3 required a new commit in this session._

## Files Created/Modified
- `src/contexts/LanguageContext.tsx` - Language mode context with bilingual/english-only toggle and localStorage persistence
- `src/components/ui/LanguageToggle.tsx` - Full toggle with spring animation and compact header variant
- `src/styles/globals.css` - Dark mode CSS variables, warm destructive colors, feedback overrides, skeleton shimmer
- `src/AppShell.tsx` - LanguageProvider added to provider hierarchy
- `src/components/AppNavigation.tsx` - LanguageToggleCompact added to header, data-tour on ThemeToggle
- `src/pages/SettingsPage.tsx` - Language settings section with bilingual explanation, design token migration

## Decisions Made
- Destructive/error states use hue 25 (warm gray/orange) in both light and dark mode - red reserved exclusively for patriotic decoration (stars, stripes, banners)
- LanguageProvider placed inside OfflineProvider and outside ThemeProvider in the provider hierarchy (language preference doesn't depend on theme or routing)
- ThemeToggle wrapped in a div with data-tour="theme-toggle" rather than adding prop to the component (avoids modifying ThemeToggle component)
- SettingsPage header migrated from hardcoded gray-* classes to semantic design token classes (bg-background, text-foreground, bg-card, etc.)
- English-only mode explanation in Burmese is conditionally rendered based on showBurmese flag

## Deviations from Plan

### Auto-fixed Issues

**1. [Pre-existing work] Tasks 1 and 2 already committed from 03-08**
- **Found during:** Task 1 and 2 execution
- **Issue:** The dark mode CSS changes and LanguageContext/LanguageToggle files were already created and committed during the 03-08 plan execution (commits 29efa34 and 107641d)
- **Fix:** Verified the existing implementations matched the 03-09 plan requirements, skipped redundant commits
- **Impact:** Only Task 3 (integration) needed a new commit

**2. [Rule 3 - Blocking] HistoryPage included in Task 3 commit**
- **Found during:** Task 3 commit
- **Issue:** lint-staged stash/restore cycle picked up pre-existing HistoryPage modifications from previous session
- **Fix:** Accepted the inclusion as the changes were valid Phase 3 bilingual updates
- **Committed in:** 87cb808

---

**Total deviations:** 2 (1 pre-existing overlap, 1 lint-staged stash artifact)
**Impact on plan:** No scope creep. Pre-existing work was validated against plan requirements.

## Issues Encountered
- OneDrive file sync causes intermittent `.next` cache corruption during Next.js builds (ENOENT for pages-manifest.json, sw.js permission errors). Resolved by cleaning `.next` directory between builds. This is an environment-specific issue, not a code issue.
- Pre-commit hook build step fails intermittently due to OneDrive file locking. Required multiple retry attempts for successful commits.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Language toggle is functional and integrated but not yet consumed by all bilingual components (BilingualText, BilingualHeading etc. do not yet check useLanguage)
- Future plans should wire showBurmese from useLanguage into existing bilingual components to actually hide/show Burmese text
- Dark mode is polished and ready for visual verification
- All Phase 3 plans (01-09) are now complete

## Self-Check: PASSED

---
*Phase: 03-ui-ux-bilingual-polish*
*Completed: 2026-02-06*
