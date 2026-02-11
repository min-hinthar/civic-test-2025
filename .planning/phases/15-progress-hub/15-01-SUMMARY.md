---
phase: 15-progress-hub
plan: 01
subsystem: ui
tags: [react-router, motion-react, glassmorphism, tabs, animation, layout]

# Dependency graph
requires:
  - phase: 14-unified-navigation
    provides: NavigationShell, Sidebar, BottomTabBar, navConfig with hub tab, PageTransition
provides:
  - HubPage shell with 3-tab navigation and direction-aware slide animation
  - HubTabBar with bilingual labels and spring-animated pill indicator
  - GlassCard reusable glass-morphism card wrapper
  - Route wiring for /hub/* with redirects from /progress, /history, /social
  - CSS glass-card and stripe-move animation utilities
affects: [15-02, 15-03, 15-04, progress-hub]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional tab rendering with AnimatePresence (not Outlet) for direction-aware slide"
    - "layoutId spring pill indicator for tab bar"
    - "glass-card CSS utility with @supports backdrop-filter fallback"
    - "Prefix-based nav active state matching for nested route tabs"

key-files:
  created:
    - src/pages/HubPage.tsx
    - src/components/hub/HubTabBar.tsx
    - src/components/hub/GlassCard.tsx
  modified:
    - src/AppShell.tsx
    - src/styles/globals.css
    - src/components/navigation/BottomTabBar.tsx
    - src/components/navigation/Sidebar.tsx
    - src/components/navigation/navConfig.ts

key-decisions:
  - "Conditional tab rendering (not Outlet) for AnimatePresence key-based exit/enter animations"
  - "Prefix-based active state matching added to BottomTabBar, Sidebar, getSlideDirection for /hub sub-paths"
  - "Glass-card uses CSS class in globals.css (not inline styles) with @supports fallback for no-backdrop-filter browsers"

patterns-established:
  - "Hub tab bar: spring layoutId pill with bilingual labels"
  - "Hub route: /hub/* wildcard with internal pathname parsing, useEffect redirect for bare/invalid paths"
  - "Prefix-based nav active matching: tab.href starts path for nested routes"

# Metrics
duration: 8min
completed: 2026-02-11
---

# Phase 15 Plan 01: Hub Page Shell Summary

**HubPage shell with 3-tab spring-animated navigation, GlassCard glassmorphism wrapper, and /hub/* route wiring with redirects**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-11T02:08:21Z
- **Completed:** 2026-02-11T02:16:47Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- GlassCard component with frosted glass effect, dark mode variant, interactive hover, and @supports fallback
- HubPage shell with direction-aware tab slide animation using AnimatePresence and spring physics
- HubTabBar with bilingual labels (English + Burmese) and motion layoutId spring pill indicator
- Full route wiring: /hub/* wildcard, /progress -> /hub/overview, /history -> /hub/history, /social -> /hub/achievements, bare /hub -> /hub/overview, invalid tabs -> /hub/overview
- Nav active state fixed for hub sub-paths in BottomTabBar, Sidebar, and getSlideDirection

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GlassCard component and Hub CSS utilities** - `5591b95` (feat)
2. **Task 2: Create HubPage shell, HubTabBar, and route wiring** - `28983ed` (feat)

## Files Created/Modified

- `src/components/hub/GlassCard.tsx` - Reusable glass-morphism card wrapper with backdrop-filter blur
- `src/components/hub/HubTabBar.tsx` - Premium tab bar with bilingual labels and spring-animated pill
- `src/pages/HubPage.tsx` - Hub shell with tab derivation from pathname, direction-aware slide animation, placeholder tab content
- `src/AppShell.tsx` - Route changed from /hub to /hub/*, redirects updated for hub tab paths
- `src/styles/globals.css` - Added .glass-card, .glass-card-interactive CSS utilities and stripe-move keyframes
- `src/components/navigation/BottomTabBar.tsx` - Added prefix-based active state for /hub sub-paths
- `src/components/navigation/Sidebar.tsx` - Added prefix-based active state for /hub sub-paths
- `src/components/navigation/navConfig.ts` - Updated getSlideDirection to use prefix matching for nested routes

## Decisions Made

- Used conditional tab rendering (not `<Outlet>`) inside AnimatePresence to ensure proper key-based exit/enter animations (per research Pitfall 1)
- Added prefix-based active state matching (`startsWith('/hub')`) to BottomTabBar, Sidebar, and getSlideDirection to keep hub nav item highlighted on all sub-paths
- Used `useEffect` for bare/invalid path redirect (not inline Navigate) to avoid render-time navigation
- Glass-card styles defined as CSS class in globals.css with @supports fallback, keeping component lean

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nav active state for hub sub-paths**
- **Found during:** Task 2 (Route wiring)
- **Issue:** BottomTabBar and Sidebar used exact `pathname === tab.href` match; with /hub/overview as the actual pathname, the hub tab would never show as active
- **Fix:** Added `(tab.href === '/hub' && location.pathname.startsWith('/hub'))` check to both BottomTabBar and Sidebar isActive logic
- **Files modified:** src/components/navigation/BottomTabBar.tsx, src/components/navigation/Sidebar.tsx
- **Verification:** TypeScript compiles, build succeeds
- **Committed in:** 28983ed (Task 2 commit)

**2. [Rule 1 - Bug] Fixed getSlideDirection for hub sub-paths**
- **Found during:** Task 2 (Route wiring)
- **Issue:** getSlideDirection used exact `t.href === path` matching; navigating from /hub/overview to /test would not find the hub tab, breaking slide direction
- **Fix:** Changed to prefix matching: `path === t.href || path.startsWith(t.href + '/')`
- **Files modified:** src/components/navigation/navConfig.ts
- **Verification:** TypeScript compiles, build succeeds
- **Committed in:** 28983ed (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for correct navigation behavior with nested hub routes. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HubPage shell is ready for tab content plans (15-02 Overview, 15-03 History, 15-04 Achievements)
- GlassCard component is ready for use in all tab content
- All route redirects functional; old ProgressPage still exists but is no longer routed
- Tab bar and slide animation infrastructure ready for real tab content

## Self-Check: PASSED

- FOUND: src/components/hub/GlassCard.tsx
- FOUND: src/components/hub/HubTabBar.tsx
- FOUND: src/pages/HubPage.tsx
- FOUND: commit 5591b95
- FOUND: commit 28983ed

---
*Phase: 15-progress-hub*
*Completed: 2026-02-11*
