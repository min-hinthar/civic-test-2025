---
phase: 39-next-js-16-upgrade-and-tooling
plan: 04
subsystem: infra
tags: [next.js, verification, smoke-test, bundle-size, ci]
requirements-completed: [MIGR-01, MIGR-02, MIGR-03]

# Dependency graph
requires:
  - phase: 39-next-js-16-upgrade-and-tooling
    provides: Next.js 16 upgrade, proxy rename, Sentry reconfiguration (39-01 through 39-03)
provides:
  - Full CI verification of Next.js 16 upgrade (lint, lint:css, format, typecheck, test, build)
  - Bundle size baseline documentation for v4.0
  - Manual smoke test confirmation of feature parity with v3.0
  - Phase 39 completion gate
affects: [40-app-router-foundation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stylelint 17.3 requires block-level disable/enable comments for multi-line properties (not inline disable-line)"

key-files:
  created: []
  modified:
    - src/styles/globals.css
    - next-env.d.ts

key-decisions:
  - "Stylelint 17.3 multi-line property comments require block-level disable/enable format"
  - "Accept Next.js 16 auto-generated next-env.d.ts path update"

patterns-established:
  - "Full CI suite: lint, lint:css, format:check, typecheck, test:run, build -- all must pass for upgrade verification"

requirements-completed: [MIGR-01, MIGR-02, MIGR-03]

# Metrics
duration: 8min
completed: 2026-02-23
---

# Phase 39 Plan 04: Full Verification Suite and Smoke Test Summary

**All 6 CI checks pass on Next.js 16, bundle sizes documented, manual smoke test confirms feature parity with v3.0**

## Performance

- **Duration:** 8 min (Task 1: 6 min auto, Task 2: 2 min checkpoint approval)
- **Started:** 2026-02-23T11:50:00Z
- **Completed:** 2026-02-23T12:05:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- All 6 CI verification commands pass: lint, lint:css, format:check, typecheck, test:run, build
- Fixed stylelint 17.3 compatibility issue with multi-line vendor-prefix disable comments in globals.css
- Both Turbopack and webpack dev modes start successfully
- Manual smoke test approved by user -- all feature areas verified working identically to v3.0
- Phase 39 (Next.js 16 Upgrade and Tooling) is now complete

## Task Commits

Each task was committed atomically:

1. **Task 1: Run full CI verification suite and document bundle sizes** - `dfa277f` (fix)
2. **Task 2: Manual smoke test for feature parity with v3.0** - No commit (checkpoint: user approved all checklist items)

## Files Created/Modified
- `src/styles/globals.css` - Converted multi-line -webkit-backdrop-filter inline disable comments to block-level disable/enable format for Stylelint 17.3 compatibility
- `next-env.d.ts` - Accept Next.js 16 auto-generated path update

## Decisions Made
1. **Stylelint 17.3 comment format** - Multi-line vendor-prefix properties (like `-webkit-backdrop-filter` + `backdrop-filter`) require block-level `/* stylelint-disable */` / `/* stylelint-enable */` comments instead of inline `/* stylelint-disable-line */` in Stylelint 17.3.
2. **Accept next-env.d.ts update** - Next.js 16 auto-updates this generated file; committed as-is.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed stylelint 17.3 multi-line property comment format**
- **Found during:** Task 1 (lint:css verification)
- **Issue:** Stylelint 17.3 (upgraded in 39-01) changed handling of `/* stylelint-disable-line */` on multi-line vendor-prefix declarations -- lint:css failed on globals.css
- **Fix:** Converted 4 inline disable-line comments to block-level disable/enable pairs for `-webkit-backdrop-filter` + `backdrop-filter` property pairs. Added `declaration-empty-line-before` to suppress list.
- **Files modified:** src/styles/globals.css
- **Verification:** `pnpm lint:css` passes
- **Committed in:** `dfa277f` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix necessary for lint:css to pass. No scope creep.

## Issues Encountered
None beyond the stylelint deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 39 is complete: Next.js 16 is fully operational with all tooling
- Ready for Phase 40 (App Router Foundation): root layout, ClientProviders, auth guard
- Key constraints for Phase 40:
  - `app/layout.tsx` already exists (created in 39-03) as a minimal shell
  - Webpack build flag (`--webpack`) required for production builds
  - Sentry, Serwist, and all 8 context providers working on Next.js 16
  - All 511 tests pass on the upgraded stack

## Self-Check: PASSED

- FOUND: src/styles/globals.css
- FOUND: next-env.d.ts
- FOUND: 39-04-SUMMARY.md
- FOUND: commit dfa277f (Task 1)
- Task 2: checkpoint approval (no commit needed -- user verified)

---
*Phase: 39-next-js-16-upgrade-and-tooling*
*Completed: 2026-02-23*
