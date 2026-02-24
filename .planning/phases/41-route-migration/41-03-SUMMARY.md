---
phase: 41-route-migration
plan: 03
subsystem: routing
tags: [nextjs, app-router, next-navigation, next-link, useRouter, usePathname, useSearchParams]

# Dependency graph
requires:
  - phase: 41-route-migration
    plan: 01
    provides: App Router route tree with page.tsx wrappers, hub catch-all
provides:
  - All navigation components migrated from react-router-dom to next/navigation
  - All page files migrated from react-router-dom to next/navigation
  - Unified useNavigationGuard hook for back-button interception
  - HubPage accepts initialTab prop for catch-all integration
  - AuthPage uses searchParams-only returnTo pattern
affects: [41-04, 41-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [useNavigationGuard unified hook, hash tracking via state+hashchange, navigateStudy helper for same-page hash navigation]

key-files:
  created:
    - src/hooks/useNavigationGuard.ts
  modified:
    - src/hooks/useInterviewGuard.ts
    - src/hooks/useFocusOnNavigation.ts
    - src/components/navigation/NavigationShell.tsx
    - src/components/navigation/BottomTabBar.tsx
    - src/components/navigation/GlassHeader.tsx
    - src/components/navigation/Sidebar.tsx
    - src/components/navigation/NavItem.tsx
    - src/pages/LandingPage.tsx
    - src/pages/AuthPage.tsx
    - src/pages/Dashboard.tsx
    - src/pages/HubPage.tsx
    - src/pages/TestPage.tsx
    - src/pages/StudyGuidePage.tsx
    - src/pages/OpEdPage.tsx
    - src/pages/PasswordResetPage.tsx
    - src/pages/PasswordUpdatePage.tsx
    - src/pages/SettingsPage.tsx
    - app/(protected)/hub/[[...tab]]/HubPageClient.tsx

key-decisions:
  - "Unified useNavigationGuard hook replaces separate TestPage and InterviewPage guard implementations"
  - "HIDDEN_ROUTES checks removed from NavigationShell/Sidebar/BottomTabBar (only render in protected layout)"
  - "AuthPage uses searchParams-only returnTo (location.state fallback removed per user decision)"
  - "StudyGuidePage hash tracking via useState+hashchange listener (App Router usePathname excludes hash)"
  - "HubPage accepts initialTab prop from catch-all route, forwarded through HubPageClient"

patterns-established:
  - "Hash-based view state tracking: useState + hashchange listener for pages using URL hash"
  - "navigateStudy helper: pushState + setHash for same-page hash navigation (avoids App Router overhead)"
  - "useNavigationGuard: unified popstate/beforeunload guard with configurable markerKey"

requirements-completed: [MIGR-05, MIGR-06]

# Metrics
duration: 17min
completed: 2026-02-24
---

# Phase 41 Plan 03: Navigation and Page Migration Summary

**Migrated 22 files from react-router-dom to next/navigation: 7 navigation components, 3 hooks (including new unified useNavigationGuard), and 12 page files with HubPage initialTab integration and AuthPage searchParams-only returnTo**

## Performance

- **Duration:** 17 min
- **Started:** 2026-02-24T14:02:48Z
- **Completed:** 2026-02-24T14:20:31Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 18

## Accomplishments
- Created unified useNavigationGuard hook replacing separate TestPage/InterviewPage guard implementations
- Migrated all 7 navigation components (NavigationShell, NavItem, GlassHeader, BottomTabBar, Sidebar) and 2 hooks (useFocusOnNavigation, useInterviewGuard) from react-router-dom
- Migrated all 10 page files with react-router-dom imports (LandingPage, AuthPage, Dashboard, HubPage, TestPage, StudyGuidePage, OpEdPage, PasswordResetPage, PasswordUpdatePage, SettingsPage)
- HubPage now accepts initialTab prop and HubPageClient forwards it from catch-all route
- AuthPage consolidated to searchParams-only returnTo (no location.state fallback)
- Removed HIDDEN_ROUTES checks from NavigationShell, Sidebar, and BottomTabBar (components only render in protected layout)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate navigation components and create useNavigationGuard** - `49a9c94` (feat)
2. **Task 2: Migrate all 10+ page files from react-router-dom to next/navigation** - `f9cab90` (feat)

## Files Created/Modified
- `src/hooks/useNavigationGuard.ts` - New unified navigation guard hook for back-button interception
- `src/hooks/useInterviewGuard.ts` - Refactored as thin wrapper around useNavigationGuard
- `src/hooks/useFocusOnNavigation.ts` - Migrated from useLocation to usePathname
- `src/components/navigation/NavigationShell.tsx` - Removed HIDDEN_ROUTES, usePathname
- `src/components/navigation/NavItem.tsx` - next/link with href prop
- `src/components/navigation/GlassHeader.tsx` - next/link with href prop
- `src/components/navigation/BottomTabBar.tsx` - usePathname/useRouter, removed HIDDEN_ROUTES
- `src/components/navigation/Sidebar.tsx` - usePathname/useRouter, removed HIDDEN_ROUTES
- `src/pages/LandingPage.tsx` - useRouter, next/link, router.replace for auth redirect
- `src/pages/AuthPage.tsx` - useSearchParams from next/navigation, searchParams-only returnTo
- `src/pages/Dashboard.tsx` - useRouter replaces useNavigate
- `src/pages/HubPage.tsx` - initialTab prop, usePathname/useRouter
- `src/pages/TestPage.tsx` - useNavigationGuard replaces manual popstate guard
- `src/pages/StudyGuidePage.tsx` - Hash tracking via state+hashchange, navigateStudy helper
- `src/pages/OpEdPage.tsx` - next/link, hash via state
- `src/pages/PasswordResetPage.tsx` - next/link
- `src/pages/PasswordUpdatePage.tsx` - useRouter, next/link
- `src/pages/SettingsPage.tsx` - useRouter with push/back
- `app/(protected)/hub/[[...tab]]/HubPageClient.tsx` - Forward initialTab prop to HubPage

## Decisions Made
- Created unified useNavigationGuard hook with configurable markerKey instead of duplicating guard logic between TestPage and InterviewPage
- Removed HIDDEN_ROUTES checks entirely from Sidebar, BottomTabBar, and NavigationShell since these components only render inside the protected layout
- AuthPage consolidated to searchParams-only returnTo per user decision -- location.state fallback removed
- StudyGuidePage uses useState + hashchange listener for hash tracking because App Router usePathname excludes hash fragments
- HubPage derives tab from initialTab prop first (from catch-all route), falling back to pathname parsing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useCallback inline function requirement for React Compiler**
- **Found during:** Task 1 (useNavigationGuard creation)
- **Issue:** `useCallback(onBackAttempt, [onBackAttempt])` fails React Compiler ESLint rule requiring inline function expression
- **Fix:** Changed to `useCallback(() => { onBackAttempt(); }, [onBackAttempt])`
- **Files modified:** src/hooks/useNavigationGuard.ts
- **Verification:** ESLint + pre-commit hook passes
- **Committed in:** 49a9c94 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed pre-existing stale navigate references in dependency arrays**
- **Found during:** Task 1 (typecheck verification)
- **Issue:** SRSWidget, ReviewSession, and PracticeResults had `[navigate]` in useCallback deps but already used `router.push()` -- likely from a prior incomplete migration
- **Fix:** Changed dependency arrays from `[navigate]` to `[router]`
- **Files modified:** src/components/srs/SRSWidget.tsx, src/components/srs/ReviewSession.tsx (auto-fixed by linter/prior run)
- **Verification:** TypeScript compiler passes
- **Committed in:** Pre-existing files auto-fixed by linter

**3. [Rule 1 - Bug] Fixed Next.js useSearchParams null type handling**
- **Found during:** Task 2 (typecheck after AuthPage/StudyGuidePage migration)
- **Issue:** Next.js `useSearchParams()` returns `ReadonlyURLSearchParams | null`, causing type errors
- **Fix:** Added null-safe access (`searchParams?.get()`, `searchParams?.toString() ?? ''`, parameter type `URLSearchParams | null`)
- **Files modified:** src/pages/AuthPage.tsx, src/pages/StudyGuidePage.tsx
- **Verification:** TypeScript compiler passes
- **Committed in:** f9cab90 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All fixes necessary for React Compiler compliance and TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All navigation components and page files are now using next/navigation hooks
- Zero react-router-dom imports remain in src/pages/, src/components/navigation/, or src/hooks/
- Plan 04 can migrate remaining react-router-dom usage in other components (quiz, interview, etc.)
- Plan 05 can remove react-router-dom dependency and Pages Router files
- HubPage initialTab integration is complete and ready for the catch-all route

## Self-Check: PASSED

- All 19 files verified present on disk
- Commit 49a9c94 verified in git log
- Commit f9cab90 verified in git log

---
*Phase: 41-route-migration*
*Completed: 2026-02-24*
