---
phase: 39-next-js-16-upgrade-and-tooling
plan: 03
subsystem: infra
tags: [sentry, next.js, app-router, error-boundary, noise-filters]

# Dependency graph
requires:
  - phase: 39-next-js-16-upgrade-and-tooling
    provides: Next.js 16 with Sentry SDK types updated (39-02)
provides:
  - App Router global-error.tsx for error capture via Sentry
  - Next.js 16 noise filters (hydration-mismatch, chunk-load-failure, AbortError suppression)
  - Dev-only Sentry test page at /dev-sentry-test
  - Minimal App Router root layout (app/layout.tsx)
affects: [39-next-js-16-upgrade-and-tooling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "global-error.tsx captures unhandled App Router errors via Sentry.captureException in useEffect"
    - "AbortError events dropped entirely from Sentry (return null in beforeSend)"
    - "Hydration and chunk-load errors fingerprinted to single issues for noise reduction"
    - "App Router layout.tsx coexists with Pages Router via Next.js dual-routing"

key-files:
  created:
    - app/global-error.tsx
    - app/layout.tsx
    - app/dev-sentry-test/page.tsx
  modified:
    - src/lib/sentry.ts
    - tsconfig.json

key-decisions:
  - "Create minimal app/layout.tsx to satisfy App Router root layout requirement"
  - "Place Next.js 16 noise filters before app-specific fingerprinting in beforeSendHandler"
  - "AbortError returns null (dropped) rather than fingerprinted — navigation cancellation is pure noise"
  - "Add app directory to tsconfig.json include for type checking"

patterns-established:
  - "App Router and Pages Router coexist via Next.js dual-routing — App Router takes precedence for specific routes"
  - "Dev-only pages use process.env.NODE_ENV guard to render fallback message in production"

requirements-completed: [MIGR-03]

# Metrics
duration: 18min
completed: 2026-02-23
---

# Phase 39 Plan 03: Sentry App Router Reconfiguration Summary

**App Router global-error.tsx with Sentry capture, Next.js 16 noise filters (hydration/chunk/AbortError), and dev-only test page**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-23T11:14:14Z
- **Completed:** 2026-02-23T11:32:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created app/global-error.tsx that captures unhandled App Router errors to Sentry with a reset button
- Added three Next.js 16 noise filters: hydration-mismatch fingerprinting, chunk-load-failure fingerprinting, and AbortError suppression (drops entirely)
- Created dev-only Sentry test page at /dev-sentry-test with click handler and render error throw buttons
- Created minimal app/layout.tsx for App Router root layout requirement
- All existing Sentry config files (instrumentation.ts, sentry.server.config.ts, sentry.edge.config.ts, instrumentation-client.ts) remain untouched
- All 511 tests pass, typecheck clean, build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create app/global-error.tsx and Sentry dev test page** - `03f3daf` (feat)
2. **Task 2: Add Next.js 16 noise filters to Sentry beforeSendHandler** - `902833c` (feat)

## Files Created/Modified
- `app/global-error.tsx` - App Router error boundary that captures exceptions to Sentry
- `app/layout.tsx` - Minimal root layout required by App Router (does not replace Pages Router shell)
- `app/dev-sentry-test/page.tsx` - Dev-only page with buttons to throw click handler and render errors
- `src/lib/sentry.ts` - Added hydration-mismatch, chunk-load-failure fingerprinting, AbortError suppression
- `tsconfig.json` - Added app directory to include array

## Decisions Made

1. **Create minimal app/layout.tsx** - Next.js App Router requires a root layout.tsx for any page in the `app/` directory. Created a minimal wrapper that coexists with the Pages Router shell.

2. **Place noise filters before app-specific fingerprints** - Hydration/chunk/AbortError filters are evaluated first. If matched, they take precedence over app-specific network/IndexedDB/TTS fingerprints. AbortError returns null (dropped) since navigation cancellation is pure noise.

3. **Add app to tsconfig.json include** - Required for TypeScript to type-check the new App Router files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created app/layout.tsx root layout**
- **Found during:** Task 1 (build verification)
- **Issue:** Next.js build failed with "dev-sentry-test/page.tsx doesn't have a root layout"
- **Fix:** Created minimal `app/layout.tsx` with html/body wrapper
- **Files modified:** app/layout.tsx
- **Verification:** `pnpm build` succeeds with both App Router and Pages Router routes
- **Committed in:** `03f3daf` (Task 1 commit)

**2. [Rule 1 - Bug] Added lang prop to html element in global-error.tsx**
- **Found during:** Task 1 (pre-commit lint)
- **Issue:** ESLint jsx-a11y/html-has-lang requires lang attribute on html elements
- **Fix:** Added `lang="en"` to html element
- **Files modified:** app/global-error.tsx
- **Verification:** ESLint passes, pre-commit hook succeeds
- **Committed in:** `03f3daf` (Task 1 commit)

**3. [Rule 1 - Bug] Added return type to BuggyComponent in dev test page**
- **Found during:** Task 1 (typecheck)
- **Issue:** TypeScript error TS2786: BuggyComponent return type 'void' not assignable to JSX element
- **Fix:** Added explicit `React.JSX.Element` return type annotation (component always throws, never returns)
- **Files modified:** app/dev-sentry-test/page.tsx
- **Verification:** `pnpm typecheck` passes
- **Committed in:** `03f3daf` (Task 1 commit)

**4. [Rule 3 - Blocking] Added app directory to tsconfig.json include**
- **Found during:** Task 1 (typecheck)
- **Issue:** New app/ directory files not included in TypeScript compilation
- **Fix:** Added "app" to tsconfig.json include array
- **Files modified:** tsconfig.json
- **Verification:** `pnpm typecheck` passes
- **Committed in:** `03f3daf` (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking)
**Impact on plan:** All fixes necessary for build, lint, and type correctness. No scope creep.

## Issues Encountered
- Next.js 16 auto-modified tsconfig.json during build to add `"plugins": [{"name": "next"}]` and `.next/types/**/*.ts` includes. These are expected auto-configurations and were accepted.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sentry is configured for App Router with global-error.tsx error boundary
- Noise filters will reduce alert fatigue from hydration mismatches, chunk load failures, and navigation cancellations
- Dev test page available at /dev-sentry-test for end-to-end Sentry verification
- Ready for Phase 39-04 (remaining upgrade tasks)
- All existing Pages Router Sentry infrastructure intact for dual-routing period

## Self-Check: PASSED

- FOUND: app/global-error.tsx (with Sentry.captureException)
- FOUND: app/layout.tsx
- FOUND: app/dev-sentry-test/page.tsx (use client, throw buttons)
- FOUND: src/lib/sentry.ts (hydration-mismatch, chunk-load-failure, AbortError)
- FOUND: 39-03-SUMMARY.md
- FOUND: commit 03f3daf (Task 1)
- FOUND: commit 902833c (Task 2)
- VERIFIED: instrumentation.ts unchanged
- VERIFIED: sentry.server.config.ts unchanged
- VERIFIED: sentry.edge.config.ts unchanged
- VERIFIED: instrumentation-client.ts unchanged

---
*Phase: 39-next-js-16-upgrade-and-tooling*
*Completed: 2026-02-23*
