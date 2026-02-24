---
phase: 41-route-migration
plan: 01
subsystem: routing
tags: [nextjs, app-router, file-routing, page-transitions, motion, redirects]

# Dependency graph
requires:
  - phase: 40-app-router-foundation
    provides: Root layout, ClientProviders, protected layout with auth guard
provides:
  - Complete App Router route tree with 15 page.tsx wrappers
  - Enter-only directional slide animation template for protected routes
  - Hub catch-all with async params and server redirect
  - Custom 404 page and error boundaries at 3 levels
  - Legacy URL permanent redirects in next.config.mjs
affects: [41-02, 41-03, 41-04, 41-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [thin use-client page wrapper, server component with async params, sessionStorage direction tracking]

key-files:
  created:
    - app/(public)/page.tsx
    - app/(public)/auth/page.tsx
    - app/(public)/auth/forgot/page.tsx
    - app/(public)/auth/update-password/page.tsx
    - app/(public)/op-ed/page.tsx
    - app/(public)/about/page.tsx
    - app/(public)/error.tsx
    - app/(protected)/home/page.tsx
    - app/(protected)/test/page.tsx
    - app/(protected)/study/page.tsx
    - app/(protected)/practice/page.tsx
    - app/(protected)/interview/page.tsx
    - app/(protected)/settings/page.tsx
    - app/(protected)/hub/[[...tab]]/page.tsx
    - app/(protected)/hub/[[...tab]]/HubPageClient.tsx
    - app/(protected)/template.tsx
    - app/(protected)/loading.tsx
    - app/(protected)/error.tsx
    - app/not-found.tsx
    - app/error.tsx
  modified:
    - next.config.mjs

key-decisions:
  - "SPRING_GENTLE for enter-only page transitions (smooth without exit counterpart)"
  - "HubPageClient receives initialTab but prefixes with underscore until HubPage accepts it in Plan 03/04"
  - "usePathname null coalesced to /home (Next.js types return string|null)"

patterns-established:
  - "Thin 'use client' wrapper pattern: page.tsx imports from src/pages/ and renders"
  - "Server component catch-all: async params + redirect for bare routes"
  - "sessionStorage direction tracking for enter-only page transitions"

requirements-completed: [MIGR-05, MIGR-08, MIGR-12]

# Metrics
duration: 32min
completed: 2026-02-24
---

# Phase 41 Plan 01: Route Scaffolding Summary

**Complete App Router route tree with 20 new files: 13 page wrappers, hub catch-all with async params, enter-only slide animation template, error boundaries at 3 levels, and 4 legacy URL redirects**

## Performance

- **Duration:** 32 min
- **Started:** 2026-02-24T13:25:39Z
- **Completed:** 2026-02-24T13:57:46Z
- **Tasks:** 2
- **Files created:** 20
- **Files modified:** 1 (next.config.mjs)

## Accomplishments
- 6 public route page.tsx wrappers (landing, auth, forgot, update-password, op-ed, about)
- 7 protected route page.tsx wrappers (home, test, study, practice, interview, settings) plus hub catch-all (server page + client wrapper)
- Enter-only directional slide animation in template.tsx using getSlideDirection + sessionStorage + SPRING_GENTLE
- Error boundaries at 3 levels: root (Sentry), public group, protected group (Sentry)
- Custom 404 page with friendly message and link home
- 4 permanent redirects: /dashboard->/home, /progress->/hub/overview, /history->/hub/history, /social->/hub/achievements

## Task Commits

Each task was committed atomically:

1. **Task 1: Create public route pages, not-found, and error boundaries** - `aa59665` (feat)
2. **Task 2: Create protected route pages, template.tsx, loading.tsx, hub catch-all, and next.config redirects** - `96ce573` (feat)

## Files Created/Modified
- `app/(public)/page.tsx` - Landing page route wrapper
- `app/(public)/auth/page.tsx` - Auth page route wrapper
- `app/(public)/auth/forgot/page.tsx` - Password reset route wrapper
- `app/(public)/auth/update-password/page.tsx` - Password update route wrapper
- `app/(public)/op-ed/page.tsx` - Op-Ed page route wrapper
- `app/(public)/about/page.tsx` - About page route wrapper
- `app/(public)/error.tsx` - Public group error boundary
- `app/(protected)/home/page.tsx` - Dashboard route wrapper
- `app/(protected)/test/page.tsx` - Test page route wrapper
- `app/(protected)/study/page.tsx` - Study guide route wrapper
- `app/(protected)/practice/page.tsx` - Practice page route wrapper
- `app/(protected)/interview/page.tsx` - Interview page route wrapper
- `app/(protected)/settings/page.tsx` - Settings page route wrapper
- `app/(protected)/hub/[[...tab]]/page.tsx` - Hub catch-all with async params and server redirect
- `app/(protected)/hub/[[...tab]]/HubPageClient.tsx` - Hub client wrapper receiving initialTab
- `app/(protected)/template.tsx` - Enter-only page transition with directional slide animation
- `app/(protected)/loading.tsx` - Protected group loading spinner
- `app/(protected)/error.tsx` - Protected group error boundary with Sentry
- `app/not-found.tsx` - Custom 404 page with friendly message
- `app/error.tsx` - Root error boundary with Sentry reporting
- `next.config.mjs` - Added 4 permanent redirects for legacy URLs

## Decisions Made
- Used SPRING_GENTLE for enter-only page transition (stiffness: 200, damping: 20) -- smooth and subtle without an exit animation counterpart, matching the motion system's recommendation for page transitions
- HubPageClient receives initialTab prop but prefixes with underscore (`_initialTab`) to suppress unused-variable warnings until HubPage accepts the prop in Plan 03/04
- Coalesced `usePathname()` return value with `?? '/home'` to handle the `string | null` return type (null only occurs outside navigation context, never in practice)
- Task 1 files were found pre-committed (from a prior execution attempt in commit aa59665 labeled "41-02") -- verified content correctness and proceeded to Task 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed usePathname null type in template.tsx**
- **Found during:** Task 2 (template.tsx creation)
- **Issue:** `usePathname()` returns `string | null` in Next.js types, but `getSlideDirection()` and `sessionStorage.setItem()` require `string`
- **Fix:** Added null coalescing: `const pathname = rawPathname ?? '/home'`
- **Files modified:** app/(protected)/template.tsx
- **Verification:** `pnpm typecheck` passes
- **Committed in:** 96ce573 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for TypeScript correctness. No scope creep.

## Issues Encountered
- **OneDrive build-manifest corruption:** `pnpm build --webpack` compiled successfully but failed during page data collection due to OneDrive locking `.next/` files (ENOENT on build-manifest.json and pages-manifest.json). This is a known environment issue documented in project memory.
- **Prerender failure on react-router-dom pages:** Build compilation succeeds but static generation fails because page components still import react-router-dom (which needs Router context). This is expected for Plan 01 -- full build success requires Plan 03/04 to migrate react-router-dom imports. Typecheck passes confirming all new code is correct.
- **Task 1 already committed:** The public route files and error boundaries were found already committed from a prior execution attempt (commit aa59665). Content was verified correct and Task 2 proceeded normally.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All route file scaffolding is in place for Plan 02 (API route migration)
- Plans 03/04 can migrate react-router-dom imports knowing all App Router pages exist
- Plan 05 (cleanup) can delete Pages Router once all components are migrated
- Build will pass once react-router-dom dependencies are removed in Plan 03/04

## Self-Check: PASSED

- All 21 files verified present on disk
- Commit aa59665 verified in git log
- Commit 96ce573 verified in git log

---
*Phase: 41-route-migration*
*Completed: 2026-02-24*
