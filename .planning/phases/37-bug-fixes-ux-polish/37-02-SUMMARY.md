---
phase: 37-bug-fixes-ux-polish
plan: 02
subsystem: ui
tags: [navigation, heart-icon, animation, css, landing-page, about-page]

# Dependency graph
requires:
  - phase: none
    provides: existing nav components and landing page
provides:
  - About Heart icon in BottomTabBar and Sidebar utility controls
  - About page visible with standard navigation (removed from HIDDEN_ROUTES)
  - Landing page About card with persistent float+shimmer animation
affects: [navigation, about-page, landing-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SidebarAboutButton component for active-state Heart icon with fill toggle"
    - "about-card-animated CSS class combining floaty + shimmer keyframes"

key-files:
  created: []
  modified:
    - src/components/navigation/navConfig.ts
    - src/components/navigation/BottomTabBar.tsx
    - src/components/navigation/Sidebar.tsx
    - src/pages/LandingPage.tsx
    - src/styles/animations.css

key-decisions:
  - "Heart icon placed between language toggle and theme toggle in both nav surfaces"
  - "Used fill-current class for filled heart active state instead of separate filled icon"
  - "CSS-based float+shimmer for About card instead of JS-only animation for performance"

patterns-established:
  - "SidebarAboutButton: dedicated button component for nav items with custom active styling"
  - "about-card-animated: CSS class combining multiple keyframe animations with pseudo-element"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-02-21
---

# Phase 37 Plan 02: About Navbar Link + Landing Card Animation Summary

**Heart icon added to BottomTabBar and Sidebar between language/theme toggles with filled/primary active state, and landing page About card enhanced with persistent float+shimmer CSS animation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-21T08:41:59Z
- **Completed:** 2026-02-21T08:47:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Removed `/about` from HIDDEN_ROUTES so navigation renders on the About page
- Added Heart icon utility control to both BottomTabBar (mobile) and Sidebar (desktop) between language and theme toggles
- Heart icon transitions from outline/muted to filled/primary when on About page with aria-current accessibility
- Landing page About card upgraded with float+shimmer animation, pulsing Heart icon, gradient border, and enhanced shadow
- All animations respect prefers-reduced-motion media query

## Task Commits

Each task was committed atomically:

1. **Task 1: Add About Heart icon to navbar + remove from HIDDEN_ROUTES** - `4035928` (feat)
2. **Task 2: Enhance landing page About teaser card with persistent animation** - `ba65159` (feat)

## Files Created/Modified
- `src/components/navigation/navConfig.ts` - Removed /about from HIDDEN_ROUTES array
- `src/components/navigation/BottomTabBar.tsx` - Added Heart icon utility control between FlagToggle and theme toggle
- `src/components/navigation/Sidebar.tsx` - Added SidebarAboutButton component with collapsed/expanded states
- `src/pages/LandingPage.tsx` - Enhanced About card with animations, increased prominence, pulsing Heart
- `src/styles/animations.css` - Added about-card-animated CSS class with float+shimmer effect

## Decisions Made
- Used `fill-current` Tailwind class to toggle heart fill state rather than importing a separate filled Heart icon
- Placed Heart icon between language toggle and theme toggle (not as a new tab) matching the plan's utility control positioning
- Used CSS animation for card float+shimmer (leveraging existing `floaty` and `shimmer` keyframes) for better performance than JS-only animation
- Added Burmese label text for About button in BottomTabBar for bilingual consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-commit hook (Prettier) reformatted files during first commit attempt, causing lint-staged to prevent an empty commit. Re-staged formatted files and committed successfully on second attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- About page now shows standard navigation (BottomTabBar + Sidebar visible)
- Heart icon is fully functional in both mobile and desktop nav surfaces
- Landing page About card is visually prominent with persistent animation

---
*Phase: 37-bug-fixes-ux-polish*
*Completed: 2026-02-21*
