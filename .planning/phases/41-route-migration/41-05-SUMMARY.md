---
phase: 41-route-migration
plan: 05
subsystem: routing
tags: [nextjs, app-router, layout, react-router-dom-removal, hash-redirect, csp, dynamic-import]

# Dependency graph
requires:
  - phase: 41-route-migration
    plan: 03
    provides: All navigation and page files migrated from react-router-dom to next/navigation
  - phase: 41-route-migration
    plan: 04
    provides: All component files migrated from react-router-dom to next/navigation
provides:
  - Root layout with global overlays and hash redirect script
  - Protected layout wrapping children in NavigationShell
  - ClientProviders simplified without routerWrapper prop
  - Complete removal of react-router-dom dependency
  - Pages Router directory deleted (no more dual-routing)
  - src/pages renamed to src/views (avoids Next.js Pages Router detection)
affects: [phase-42-onwards, deployment, csp]

# Tech tracking
tech-stack:
  added: []
  removed: [react-router-dom]
  patterns:
    - "GlobalOverlays client component with dynamic ssr:false imports for browser-only overlays"
    - "Suspense boundary wrapping pages that use useSearchParams (App Router requirement)"
    - "src/views/ directory for page-level view components (not Next.js route pages)"

key-files:
  created:
    - src/components/pwa/PWAOnboardingFlow.tsx
    - src/components/onboarding/GreetingFlow.tsx
    - src/components/GlobalOverlays.tsx
  modified:
    - app/layout.tsx
    - app/(protected)/layout.tsx
    - src/components/ClientProviders.tsx
    - src/components/navigation/navConfig.ts
    - src/lib/themeScript.ts
    - proxy.ts
    - package.json
  deleted:
    - pages/ (entire directory: 4 files)
    - src/AppShell.tsx
    - src/components/ProtectedRoute.tsx
    - src/components/animations/PageTransition.tsx
  renamed:
    - src/pages/ -> src/views/ (13 page view components)

key-decisions:
  - "src/pages renamed to src/views because Next.js detects src/pages as Pages Router directory conflicting with app/"
  - "GlobalOverlays client component created for ssr:false dynamic imports (not allowed in Server Components)"
  - "Suspense boundaries added for pages using useSearchParams (auth, study, hub) per App Router prerendering rules"
  - "Hash redirect script added as separate <script> tag with own CSP hash (easier maintenance than combining with theme script)"
  - "PWAOnboardingFlow and GreetingFlow extracted from AppShell to standalone components"

patterns-established:
  - "Use src/views/ for page-level view components, app/ for Next.js route wrappers"
  - "Browser-only overlay components must use dynamic(ssr:false) in a client component, not directly in Server Component layout"
  - "Pages using useSearchParams need Suspense boundary for App Router static generation"

requirements-completed: [MIGR-05, MIGR-06, MIGR-08, MIGR-12]

# Metrics
duration: 28min
completed: 2026-02-24
---

# Phase 41 Plan 05: Final Cleanup Summary

**Removed react-router-dom, deleted Pages Router and legacy components, wired root/protected layouts with overlays and NavigationShell, renamed src/pages to src/views**

## Performance

- **Duration:** 28 min
- **Started:** 2026-02-24T14:27:01Z
- **Completed:** 2026-02-24T14:55:50Z
- **Tasks:** 2
- **Files created:** 3
- **Files deleted:** 20 (4 pages/ + 3 legacy components + 13 src/pages/ renamed)
- **Files modified:** 20

## Accomplishments
- Complete removal of react-router-dom from package.json and all imports (zero references remain)
- Pages Router directory deleted entirely -- App Router is sole routing system
- Root layout wired with global overlays (CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator) and hash redirect script
- Protected layout wraps children in NavigationShell for authenticated navigation
- ClientProviders simplified: removed routerWrapper prop, added useViewportHeight, cleanExpiredSessions, installHistoryGuard
- Hash redirect script with CSP hash for legacy #/path URL migration
- All 511 tests pass, production build succeeds with 19 routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire root layout, protected layout, ClientProviders, and hash redirect** - `381aa69` (feat)
2. **Task 2: Delete Pages Router files, remove react-router-dom, and full verification** - `3d48c91` (feat)

## Files Created/Modified
- `src/components/pwa/PWAOnboardingFlow.tsx` - Extracted from AppShell, manages install prompt/welcome modal/iOS tip lifecycle
- `src/components/onboarding/GreetingFlow.tsx` - Extracted from AppShell, manages welcome/what's new flow
- `src/components/GlobalOverlays.tsx` - Client component with dynamic ssr:false imports for all overlay components
- `app/layout.tsx` - Root layout with ClientProviders, GlobalOverlays, theme + hash redirect scripts
- `app/(protected)/layout.tsx` - Added NavigationShell wrapping for authenticated routes
- `src/components/ClientProviders.tsx` - Removed routerWrapper, added useViewportHeight/cleanExpiredSessions/installHistoryGuard
- `src/components/navigation/navConfig.ts` - Removed HIDDEN_ROUTES constant
- `src/lib/themeScript.ts` - Added HASH_REDIRECT_SCRIPT constant
- `proxy.ts` - Added hash redirect script CSP hash to script-src directive
- `package.json` - Removed react-router-dom dependency
- `app/(public)/auth/page.tsx` - Added Suspense boundary for useSearchParams
- `app/(protected)/study/page.tsx` - Added Suspense boundary for useSearchParams
- `app/(protected)/hub/[[...tab]]/HubPageClient.tsx` - Added Suspense boundary for useSearchParams
- 13 app/ page wrappers updated from `@/pages/` to `@/views/` imports

### Deleted Files
- `pages/[[...slug]].tsx`, `pages/_app.tsx`, `pages/_document.tsx`, `pages/_error.tsx`
- `src/AppShell.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/animations/PageTransition.tsx`

## Decisions Made
- Renamed `src/pages/` to `src/views/` because Next.js treats `src/pages/` as Pages Router directory, conflicting with `app/` (they must be under the same folder). This was an unexpected blocking issue discovered during build.
- Created `GlobalOverlays` client component wrapper because `next/dynamic` with `ssr: false` is not allowed in Server Components (layout.tsx is a Server Component).
- Added Suspense boundaries around pages using `useSearchParams` (auth, study, hub) because App Router requires Suspense during static generation to handle CSR bailout.
- Hash redirect script kept as separate `<script>` tag (not combined with theme script) for easier maintenance and independent CSP hashing.
- PWAOnboardingFlow and GreetingFlow extracted as standalone components from AppShell for reuse in root layout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed src/pages/ to src/views/**
- **Found during:** Task 2 (build verification)
- **Issue:** Next.js detected `src/pages/` as Pages Router directory, erroring with "pages and app directories should be under the same folder" since `app/` is at root level
- **Fix:** Renamed `src/pages/` to `src/views/`, updated all 13 import references in app/ page wrappers
- **Files modified:** 13 app/ page files, 13 src/views/ files (renamed from src/pages/)
- **Verification:** Build succeeds, all routes render correctly
- **Committed in:** 3d48c91 (Task 2 commit)

**2. [Rule 3 - Blocking] Created GlobalOverlays client component for ssr:false dynamic imports**
- **Found during:** Task 2 (build verification after first CelebrationOverlay prerender error)
- **Issue:** CelebrationOverlay uses canvas-confetti which requires browser APIs, causing prerender failure. Then `ssr: false` with `next/dynamic` is not allowed in Server Components.
- **Fix:** Created `src/components/GlobalOverlays.tsx` as a 'use client' component that uses dynamic imports with ssr:false for all overlay components
- **Files modified:** app/layout.tsx, src/components/GlobalOverlays.tsx (new)
- **Verification:** Build succeeds, all 19 routes prerender correctly
- **Committed in:** 3d48c91 (Task 2 commit)

**3. [Rule 3 - Blocking] Added Suspense boundaries for useSearchParams pages**
- **Found during:** Task 2 (build verification)
- **Issue:** AuthPage uses `useSearchParams()` which requires a Suspense boundary for App Router static generation
- **Fix:** Added `<Suspense>` wrapper in auth/page.tsx, study/page.tsx, and hub/HubPageClient.tsx
- **Files modified:** app/(public)/auth/page.tsx, app/(protected)/study/page.tsx, app/(protected)/hub/[[...tab]]/HubPageClient.tsx
- **Verification:** Build succeeds, all pages prerender correctly
- **Committed in:** 3d48c91 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking issues)
**Impact on plan:** All fixes were necessary for the build to succeed. The src/pages rename is the most significant deviation but was unavoidable -- Next.js cannot have both app/ and src/pages/ directories. No scope creep.

## Issues Encountered
- `.next` cache contained stale references to deleted pages/[[...slug]].tsx -- required `rm -rf .next` before typecheck
- `next-env.d.ts` had pre-existing formatting issue (double quotes vs single quotes) that was included in commit

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Route migration is 100% complete -- App Router is the sole routing system
- Zero react-router-dom references in the codebase
- All 511 tests pass, production build succeeds
- Hash redirect script handles legacy #/path URLs for existing bookmarks/links
- CSP updated with both theme and hash redirect script hashes
- Ready for Phase 42+ work on the App Router foundation

## Self-Check: PASSED

- All 8 created/modified files verified present on disk
- All 4 deleted files/directories confirmed absent
- Commit 381aa69 (Task 1) verified in git log
- Commit 3d48c91 (Task 2) verified in git log
- 13 src/views/ files confirmed present (renamed from src/pages/)
- Zero react-router-dom references confirmed via grep

---
*Phase: 41-route-migration*
*Completed: 2026-02-24*
