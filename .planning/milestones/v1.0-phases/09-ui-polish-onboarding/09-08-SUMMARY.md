---
phase: 09-ui-polish-onboarding
plan: 08
subsystem: pages
tags: [dashboard, settings, duolingo, ui-overhaul, readiness-score, bilingual]

dependency_graph:
  requires: ["09-01"]
  provides: ["Dashboard hero readiness score layout", "Settings Duolingo visual treatment"]
  affects: ["09-09", "09-10", "09-11", "09-12"]

tech_stack:
  added: []
  patterns:
    - "Hero section pattern: dominant ReadinessIndicator with gradient card"
    - "3D chunky action buttons with shadow-[0_4px_0] + active:translate-y-[3px]"
    - "SettingsSection/SettingsRow/ToggleSwitch helper component pattern"
    - "Stagger entrance animation with as-const typing for Motion"

key_files:
  created: []
  modified:
    - src/pages/Dashboard.tsx
    - src/pages/SettingsPage.tsx

decisions:
  - id: "09-08-01"
    decision: "Dashboard uses inline stagger helper with as-const for Motion type safety"
    why: "Motion's Easing type rejects plain strings; as-const narrows to literal type"
  - id: "09-08-02"
    decision: "SettingsPage uses SettingsSection/SettingsRow/ToggleSwitch helper components"
    why: "Encapsulates grouped card pattern with icon headers, bilingual titles, and consistent 44px touch targets"
  - id: "09-08-03"
    decision: "SocialSettings embedded directly inside SettingsSection wrapper"
    why: "SocialSettings has its own SectionHeading/Card structure but renders fine inside the wrapper"
  - id: "09-08-04"
    decision: "useMemo for history, categoryBreakdown, masteredCount in Dashboard"
    why: "React Compiler ESLint rules require stable references for derived state"

metrics:
  duration: "~10 min"
  completed: "2026-02-08"
---

# Phase 9 Plan 08: Dashboard & Settings Page Overhaul Summary

**Dashboard hero readiness score with 3D chunky buttons and stagger animations; Settings with grouped rounded cards, icons, and bilingual toggle sections.**

## Task Commits

| Task | Name | Commit | Files Modified |
|------|------|--------|---------------|
| 1 | Dashboard Overhaul with Hero Readiness Score | 5bbfc29 | src/pages/Dashboard.tsx |
| 2 | Settings Page Duolingo Visual Treatment | 6ab7538 | src/pages/SettingsPage.tsx |

## What Was Built

### Task 1: Dashboard Overhaul

Reorganized the Dashboard into a game home screen layout:

- **Hero Section**: ReadinessIndicator as the dominant element at top, wrapped in gradient card with patriotic eagle emoji and bilingual motivational message based on score level
- **Quick Action Row**: Three 3D chunky buttons (Study, Test, Interview) with shadow-[0_4px_0], active press animation, icons, and bilingual labels
- **Card Hierarchy**: SRS deck (if cards due), Streak widget, Interview widget, Category grid - ordered by user importance
- **Stagger Animation**: Each section fades and slides in with 80ms delay using motion/react
- **Responsive Grid**: Single column mobile, 2-column tablet/desktop for action buttons
- **data-tour Attributes**: Preserved dashboard, study-action, test-action, srs-deck, interview-sim

### Task 2: Settings Page Duolingo Treatment

Applied full Duolingo visual treatment to SettingsPage:

- **SettingsSection Component**: Rounded-2xl card with icon + bilingual title header, default and danger variants
- **SettingsRow Component**: Label/description/action layout with border-b dividers and 44px min touch targets
- **ToggleSwitch Component**: Reusable toggle with h-7 w-12 sizing, bg-primary-500 when checked
- **Grouped Sections**: Appearance, Sound & Notifications, Interview, Social & Community, Help & Guidance, Danger Zone
- **Danger Zone**: Destructive border/bg variant with LogOut button
- **Bilingual Throughout**: 13 font-myanmar instances for Burmese text

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed signOut to logout in SettingsPage**
- **Found during:** Task 2
- **Issue:** SettingsPage destructured `signOut` from `useAuth()`, but the auth context exports `logout`
- **Fix:** Changed `signOut` to `logout` in both destructuring and onClick handler
- **Files modified:** src/pages/SettingsPage.tsx
- **Commit:** 6ab7538

**2. [Rule 1 - Bug] Fixed Motion ease type error in Dashboard**
- **Found during:** Task 1
- **Issue:** `ease: 'easeOut'` not assignable to Motion's `Easing` type (string too wide)
- **Fix:** Added `as const` assertion: `ease: 'easeOut' as const`
- **Files modified:** src/pages/Dashboard.tsx
- **Commit:** 5bbfc29

**3. [Rule 1 - Bug] React Compiler memoization errors in Dashboard**
- **Found during:** Task 1
- **Issue:** `history`, `categoryBreakdown`, `masteredCount` as plain variables violated React Compiler's `preserve-manual-memoization` and `exhaustive-deps` rules
- **Fix:** Wrapped all three in `useMemo` with proper dependency arrays
- **Files modified:** src/pages/Dashboard.tsx
- **Commit:** 5bbfc29

## Verification Results

- `npx tsc --noEmit` passes (0 errors)
- `npx eslint` passes (0 warnings/errors)
- ReadinessIndicator is first major component rendered in Dashboard (line 338)
- data-tour attributes: dashboard, study-action, test-action, srs-deck, interview-sim all present
- Settings has 7 SettingsSection groups with rounded-2xl cards
- Both pages have dark mode support via design token classes
- 44px minimum touch targets on all interactive Settings elements

## Next Phase Readiness

No blockers. Dashboard and Settings are fully overhauled with Duolingo aesthetic. Remaining phase plans (09-09 through 09-12) can proceed.

## Self-Check: PASSED
