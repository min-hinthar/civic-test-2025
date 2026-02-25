---
phase: 40-app-router-foundation
plan: 03
subsystem: auth
tags: [app-router, auth-guard, route-group, protected-routes, open-redirect-prevention, returnTo]
requirements-completed: [MIGR-07]

# Dependency graph
requires:
  - phase: 40-app-router-foundation
    plan: 02
    provides: "App Router root layout with ClientProviders wrapping children"
provides:
  - "Auth guard layout for App Router (protected) route group with redirect + returnTo"
  - "Unified returnTo pattern across both routers (URL param instead of router state)"
  - "Open redirect prevention validating relative paths in all auth redirect flows"
affects: [41-route-migration, auth-flows, protected-routes]

# Tech tracking
tech-stack:
  added: []
  patterns: ["App Router route group auth guard via (protected)/layout.tsx", "URL param returnTo pattern replacing react-router state"]

key-files:
  created:
    - app/(protected)/layout.tsx
  modified:
    - src/components/ProtectedRoute.tsx
    - src/pages/AuthPage.tsx

key-decisions:
  - "Use URL search param (?returnTo=) instead of react-router state for redirect-after-login (works across both routers)"
  - "Keep router state fallback in AuthPage during transition period for in-flight redirects"
  - "Validate all returnTo values: must start with / and not // (open redirect prevention)"

patterns-established:
  - "Auth guard layout pattern: 'use client' layout with useAuth + redirect() from next/navigation"
  - "URL param returnTo: all auth guards encode returnTo in query string, AuthPage reads from searchParams"
  - "Open redirect prevention: validate relative paths (startsWith('/') && !startsWith('//')) before redirect"

requirements-completed: [MIGR-07]

# Metrics
duration: 12min
completed: 2026-02-24
---

# Phase 40 Plan 03: Auth Guard Layout & Unified returnTo Pattern Summary

**App Router auth guard layout with redirect-after-login via URL param returnTo, unified across both Pages and App Router with open redirect prevention**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-24T08:57:44Z
- **Completed:** 2026-02-24T09:10:09Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `app/(protected)/layout.tsx` as `'use client'` auth guard with useAuth + redirect for App Router protected routes
- Unified returnTo pattern across both routers: ProtectedRoute (Pages Router) and ProtectedLayout (App Router) both use `?returnTo=` URL params
- Updated AuthPage to read returnTo from URL search params with graceful fallback to react-router state during transition
- Added open redirect prevention in all three files (validates relative paths only)
- Full build and all 511 tests pass with both routers coexisting

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth guard layout and update returnTo pattern** - `2af2be6` (feat)
2. **Task 2: Full build verification** - `4d8fe67` (fix)

## Files Created/Modified
- `app/(protected)/layout.tsx` - Auth guard layout for App Router protected route group with useAuth + redirect
- `src/components/ProtectedRoute.tsx` - Updated to use ?returnTo= URL param instead of react-router state
- `src/pages/AuthPage.tsx` - Reads returnTo from URL search params with state fallback and open redirect validation

## Decisions Made
- Use URL search param (`?returnTo=`) instead of react-router state for redirect-after-login, enabling cross-router compatibility during the coexistence period
- Keep react-router state fallback in AuthPage temporarily for any in-flight redirects using the old pattern
- All returnTo values validated: must start with `/` and must not start with `//` (prevents open redirect attacks)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nullable usePathname return type**
- **Found during:** Task 2 (Build verification)
- **Issue:** `usePathname()` from `next/navigation` returns `string | null`, but code accessed `.startsWith()` without null check
- **Fix:** Added null guard: `pathname && pathname.startsWith('/')`
- **Files modified:** `app/(protected)/layout.tsx`
- **Verification:** `pnpm build` succeeds, `pnpm test:run` passes (511 tests)
- **Committed in:** `4d8fe67`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Straightforward type safety fix. No scope creep.

## Issues Encountered
None beyond the type error caught during build verification.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 40 (App Router Foundation) is complete: shared foundations, root layout, and auth guard all in place
- `app/(protected)/` route group ready for protected App Router pages in Phase 41
- Both routers coexist cleanly: App Router serves `/_not-found` and `/dev-sentry-test`, Pages Router serves `[[...slug]]`
- returnTo pattern unified and ready for route migration

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 40-app-router-foundation*
*Completed: 2026-02-24*
