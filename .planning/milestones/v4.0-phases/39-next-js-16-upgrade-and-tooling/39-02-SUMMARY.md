---
phase: 39-next-js-16-upgrade-and-tooling
plan: 02
subsystem: infra
tags: [next.js, turbopack, webpack, proxy, middleware, eslint, sentry, typescript]
requirements-completed: [MIGR-01, MIGR-02]

# Dependency graph
requires:
  - phase: 39-next-js-16-upgrade-and-tooling
    provides: Non-Next.js dependencies at latest versions (39-01)
provides:
  - Next.js 16.1.6 with Turbopack default dev and webpack production build
  - proxy.ts renamed from middleware.ts with proxy() export
  - ESLint runs via eslint . instead of removed next lint
  - Dual dev scripts (Turbopack + webpack fallback)
affects: [39-next-js-16-upgrade-and-tooling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next build --webpack required when using Sentry + Serwist webpack plugins"
    - "proxy.ts with proxy() export replaces middleware.ts in Next.js 16"
    - "eslint . replaces next lint (removed in Next.js 16)"
    - "Turbopack is default dev bundler in Next.js 16 (no flag needed)"

key-files:
  created: []
  modified:
    - package.json
    - pnpm-lock.yaml
    - proxy.ts
    - tsconfig.json
    - eslint.config.mjs
    - src/lib/sentry.ts
    - next-env.d.ts

key-decisions:
  - "Use @next/codemod middleware-to-proxy for atomic file+function rename"
  - "Add .planning/** and public/sw.js to ESLint ignores for eslint . compatibility"
  - "Replace custom Sentry inline types with ErrorEvent/EventHint from @sentry/nextjs"
  - "Keep jsx: react-jsx (Next.js 16 auto-set this in tsconfig.json)"

patterns-established:
  - "ESLint flat config must ignore generated files when running eslint . instead of next lint"
  - "Root-level .ts files (proxy.ts, instrumentation.ts, etc.) must be in tsconfig include array"

requirements-completed: [MIGR-01, MIGR-02]

# Metrics
duration: 20min
completed: 2026-02-23
---

# Phase 39 Plan 02: Next.js 16 Upgrade Summary

**Next.js 16.1.6 with Turbopack dev, webpack production build, middleware-to-proxy rename, and ESLint direct CLI migration**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-23T10:48:36Z
- **Completed:** 2026-02-23T11:09:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Upgraded Next.js from 15.5.12 to 16.1.6 (exact pin, no caret)
- Renamed middleware.ts to proxy.ts with proxy() export via @next/codemod
- Updated build scripts: dev (Turbopack default), dev:webpack (fallback), build (--webpack), lint (eslint .)
- Fixed Sentry type incompatibility caused by stricter type resolution in Next.js 16
- Updated ESLint config to ignore generated files for eslint . compatibility
- Updated tsconfig.json to include all root-level TypeScript files
- All 511 tests pass, typecheck clean, lint clean (0 errors), build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade Next.js 16 and update package.json scripts** - `d7d20b0` (chore)
2. **Task 2: Rename middleware to proxy and update build config** - `268be8d` (feat)

## Files Created/Modified
- `package.json` - Next.js 16.1.6 pinned, updated dev/build/lint scripts, added dev:webpack
- `pnpm-lock.yaml` - Updated lockfile for Next.js 16 dependency tree
- `proxy.ts` - Renamed from middleware.ts with proxy() export function
- `tsconfig.json` - jsx: react-jsx (Next.js 16 auto-set), added root-level files to include
- `eslint.config.mjs` - Added ignores for generated files, node globals for config files
- `src/lib/sentry.ts` - Replaced custom inline types with ErrorEvent/EventHint from @sentry/nextjs
- `next-env.d.ts` - Updated by Next.js 16

## Decisions Made

1. **Use @next/codemod for middleware-to-proxy** - The codemod handled both file rename and function rename atomically. It reported "1 skipped" confusingly but actually performed the file rename and content transformation correctly.

2. **Replace custom Sentry types with SDK types** - The custom inline `SentryEvent`/`SentryEventHint` types in sentry.ts had an index signature (`[key: string]: unknown`) on `SentryStackFrame` that Sentry's actual `StackFrame` type lacks. Using `ErrorEvent`/`EventHint` from `@sentry/nextjs` is more correct and future-proof.

3. **Add root-level files to tsconfig include** - Next.js 16 with jsx: react-jsx caused the build's TypeScript checker to be stricter about file inclusion. Added proxy.ts, instrumentation.ts, instrumentation-client.ts, and sentry config files.

4. **ESLint ignores for eslint . compatibility** - `next lint` only linted specific directories. Switching to `eslint .` exposed generated files (public/sw.js) and planning scripts (.planning/) that need to be ignored.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Sentry type incompatibility**
- **Found during:** Task 2 (build verification)
- **Issue:** Custom `SentryEvent`/`SentryEventHint` inline types in `src/lib/sentry.ts` were incompatible with Sentry SDK's `ErrorEvent`/`EventHint` types. The `StackFrame` type in Sentry lacks `[key: string]: unknown` index signature, and `User.id` is `string | number` (not just `string`).
- **Fix:** Replaced custom inline types with `import type { ErrorEvent, EventHint } from '@sentry/nextjs'`. Added `String()` coercion for `User.id` before hashing.
- **Files modified:** `src/lib/sentry.ts`
- **Verification:** `pnpm typecheck` passes, `pnpm build` succeeds
- **Committed in:** `268be8d` (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed ESLint . compatibility with generated files**
- **Found during:** Task 2 (lint verification)
- **Issue:** `eslint .` (replacing removed `next lint`) picked up generated files (`public/sw.js`, `.planning/*.js`) and config files without Node globals, causing 155 errors.
- **Fix:** Added `public/sw.js` and `.planning/**` to ESLint ignores. Added config block for `.config.{js,mjs}` and `scripts/**` with node globals and no-console off.
- **Files modified:** `eslint.config.mjs`
- **Verification:** `pnpm lint` exits 0 with 0 errors (20 pre-existing warnings)
- **Committed in:** `268be8d` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for build and lint to pass. No scope creep.

## Issues Encountered
- The @next/codemod middleware-to-proxy reported "0 ok, 1 skipped" in its output but actually successfully renamed the file and function. The confusing output is a known codemod reporting issue.
- Next.js 16 auto-modified tsconfig.json to set `jsx: "react-jsx"` (was `preserve`). This is the correct setting for Next.js 16 and was accepted.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Next.js 16 is fully operational with webpack production builds and Turbopack dev
- Sentry and Serwist plugin chain works correctly with --webpack flag
- ESLint runs independently of Next.js via eslint . command
- Ready for Phase 39-03 (Sentry reconfiguration for App Router)
- v3.0-pre-upgrade git tag still available for rollback if needed

## Self-Check: PASSED

- FOUND: package.json (next: 16.1.6, exact pin)
- FOUND: proxy.ts (with proxy() export)
- FOUND: middleware.ts deleted
- FOUND: tsconfig.json (jsx: react-jsx, includes root files)
- FOUND: eslint.config.mjs (ignores generated files)
- FOUND: src/lib/sentry.ts (ErrorEvent/EventHint from @sentry/nextjs)
- FOUND: 39-02-SUMMARY.md
- FOUND: commit d7d20b0 (Task 1)
- FOUND: commit 268be8d (Task 2)
- VERIFIED: dev:webpack script exists
- VERIFIED: build uses --webpack flag
- VERIFIED: lint uses eslint . command

---
*Phase: 39-next-js-16-upgrade-and-tooling*
*Completed: 2026-02-23*
