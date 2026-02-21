---
phase: 14-unified-navigation
plan: 04
subsystem: ui
tags: [navigation, routing, react-router, redirects, shell-integration, i18n]

# Dependency graph
requires:
  - phase: 14-unified-navigation
    plan: 02
    provides: Sidebar component with glass-morphism, responsive collapse, scroll-hide
  - phase: 14-unified-navigation
    plan: 03
    provides: Refactored BottomTabBar consuming shared nav foundation
provides:
  - NavigationShell.tsx orchestrating Sidebar + BottomTabBar visibility by route
  - AppShell wired with NavigationProvider, NavigationShell, route redirects
  - /home and /hub canonical routes with /dashboard, /progress, /history, /social redirects
  - RedirectWithLoading component for hash-based redirect routes
  - strings.nav.progressHub i18n entry
affects: [14-05-page-migration, 14-06-onboarding-tour, 14-07-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [navigation-shell-orchestration, route-redirect-with-loading, canonical-route-rename]

key-files:
  created:
    - src/components/navigation/NavigationShell.tsx
  modified:
    - src/AppShell.tsx
    - src/lib/i18n/strings.ts

key-decisions:
  - "Removed HistoryPage and SocialHubPage imports from AppShell since those routes now redirect (not render page components)"
  - "RedirectWithLoading shows spinner alongside Navigate -- brief visual cue during hash-based redirects"
  - "Existing strings.nav keys preserved for backward compatibility with AppNavigation and page headers"

patterns-established:
  - "NavigationShell pattern: thin wrapper that conditionally renders nav surfaces based on HIDDEN_ROUTES"
  - "Route redirect pattern: old routes use <Navigate replace> for simple redirects, <RedirectWithLoading> for hash-based redirects"

# Metrics
duration: 4min
completed: 2026-02-10
---

# Phase 14 Plan 04: Route Renames & Shell Integration Summary

**NavigationShell orchestrating Sidebar/BottomTabBar by route, AppShell wired with NavigationProvider and canonical /home + /hub routes with backward-compatible redirects from /dashboard, /progress, /history, /social**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-10T09:30:07Z
- **Completed:** 2026-02-10T09:34:30Z
- **Tasks:** 2
- **Files modified:** 3 (1 created + 2 modified)

## Accomplishments
- Created NavigationShell component that conditionally renders Sidebar and BottomTabBar based on route (hides on public/auth routes)
- Wired AppShell with NavigationProvider wrapping all Router children and NavigationShell wrapping page content
- Added /home and /hub as new canonical routes rendering Dashboard and ProgressPage
- Set up 4 route redirects: /dashboard->/home, /progress->/hub, /history->/hub#history, /social->/hub#social
- Removed standalone BottomTabBar render from AppShell (now managed by NavigationShell)
- Added strings.nav.progressHub i18n entry with Burmese translation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create NavigationShell and update AppShell** - `f6d493c` (feat)
2. **Task 2: Update i18n strings for new nav labels** - `a450a55` (feat)

## Files Created/Modified
- `src/components/navigation/NavigationShell.tsx` - Shell component orchestrating Sidebar + BottomTabBar visibility based on HIDDEN_ROUTES
- `src/AppShell.tsx` - Major restructure: NavigationProvider wrapping Router, NavigationShell wrapping pages, route redirects, RedirectWithLoading component, removed standalone BottomTabBar
- `src/lib/i18n/strings.ts` - Added progressHub nav string, added backward compatibility comment

## Decisions Made
- **Removed unused page imports:** HistoryPage and SocialHubPage imports removed from AppShell since those routes now redirect rather than render page components directly. This prevents ESLint unused-import warnings.
- **RedirectWithLoading design:** Shows a centered spinner alongside `<Navigate>` for hash-based redirects (/history, /social), giving a brief visual cue before redirect completes.
- **Backward compatibility:** All existing `strings.nav.*` keys preserved because they are still referenced by AppNavigation.tsx (to be removed in Plan 05), HistoryPage.tsx page title, and BilingualText.tsx JSDoc example.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed unused HistoryPage and SocialHubPage imports**
- **Found during:** Task 1 (AppShell route restructure)
- **Issue:** After converting /history and /social to redirect routes, the HistoryPage and SocialHubPage page component imports became unused, which would cause ESLint errors
- **Fix:** Removed both import statements from AppShell.tsx
- **Files modified:** src/AppShell.tsx
- **Verification:** `npx eslint src/AppShell.tsx --max-warnings 0` passes
- **Committed in:** f6d493c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking fix for unused imports)
**Impact on plan:** Trivial import cleanup. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NavigationShell and NavigationProvider fully wired into AppShell
- All route redirects operational (/dashboard, /progress, /history, /social)
- Ready for Plan 05 (page migration: remove AppNavigation from individual pages)
- OnboardingTour still checks `/dashboard` -- to be updated in Plan 07 (acceptable temporary gap per plan)

## Self-Check: PASSED

- All 3 modified/created source files exist on disk
- Both task commits (f6d493c, a450a55) verified in git log
- NavigationShell.tsx renders Sidebar + BottomTabBar conditionally
- AppShell has NavigationProvider wrapping Router contents
- AppShell has NavigationShell wrapping PageTransition/Routes
- /dashboard route renders Navigate to="/home"
- BottomTabBar is NOT directly rendered in AppShell (managed by NavigationShell)
- strings.nav.progressHub entry present
- TypeScript compiles with zero errors
- ESLint passes with zero warnings on all modified files

---
*Phase: 14-unified-navigation*
*Completed: 2026-02-10*
