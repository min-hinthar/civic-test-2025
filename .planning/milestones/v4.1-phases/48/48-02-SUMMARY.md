---
phase: 48-test-infrastructure-quick-wins
plan: 02
subsystem: testing
tags: [vitest, coverage, ci, stylelint, github-actions]

# Dependency graph
requires:
  - phase: 39-04
    provides: "lint:css passes cleanly (stylelint fix)"
provides:
  - "CI pipeline with CSS lint step (9 steps total)"
  - "Global 40% coverage floor in vitest config"
  - "Per-file coverage thresholds for 22 src/lib/ files"
affects: [phase-51-coverage-escalation, ci-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Coverage threshold pattern: floor actual values to integer, set as regression guard"

key-files:
  created: []
  modified:
    - ".github/workflows/ci.yml"
    - "vitest.config.ts"

key-decisions:
  - "Threshold values floored from actual coverage (not aspirational) per G-06 guardrail"
  - "Included streakSync.ts with 0% function threshold (test exists but mocks everything)"
  - "Global branches threshold set to 30% (lower than 40% for lines/functions/statements)"

patterns-established:
  - "Coverage thresholds: floor actual coverage to nearest integer, never set aspirational"
  - "CI step ordering: lint -> CSS lint -> format check -> build -> test"

requirements-completed: [DX-01, TEST-11, TEST-12]

# Metrics
duration: 13min
completed: 2026-03-20
---

# Phase 48 Plan 02: CI CSS Lint + Coverage Thresholds Summary

**CI catches CSS regressions via lint:css step; 27 coverage thresholds (global floor + 4 existing + 22 new per-file) guard against coverage regression on all tested src/lib/ files**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-20T01:58:46Z
- **Completed:** 2026-03-20T02:12:02Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- CI pipeline expanded from 8 to 9 steps with lint:css after ESLint, before format check
- Global coverage floor: 40% lines/functions/statements, 30% branches
- 22 new per-file thresholds set at actual coverage levels (floored to integer) for all tested src/lib/ files
- All 4 existing per-file thresholds preserved unchanged (shuffle 100, saveSession 70, errorSanitizer 90, ErrorBoundary 70)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add lint:css to CI pipeline** - `4fb8be3` (feat)
2. **Task 2: Set coverage thresholds on src/lib/ files and global floor** - `292cb36` (feat)

## Files Created/Modified
- `.github/workflows/ci.yml` - Added CSS lint step between Lint and Format check
- `vitest.config.ts` - Added global threshold block + 22 new per-file coverage thresholds

## Decisions Made
- Set coverage thresholds by flooring actual values (e.g., 97.5% -> 97) per G-06 guardrail -- no aspirational thresholds
- Included streakSync.ts despite 0% functions coverage (test file exists; threshold guards lines/branches/statements)
- Global branches threshold at 30% (vs 40% for other metrics) reflecting lower overall branch coverage

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed coverage column mapping in vitest thresholds**
- **Found during:** Task 2 (coverage thresholds)
- **Issue:** Initial column mapping from coverage output swapped lines/statements/branches/functions -- coverage table columns are Stmts|Branch|Funcs|Lines, not Lines|Funcs|Branch|Stmts
- **Fix:** Corrected all 22 per-file thresholds to map statements=col1, branches=col2, functions=col3, lines=col4
- **Files modified:** vitest.config.ts
- **Verification:** `pnpm test:coverage` exits 0 with no threshold violations
- **Committed in:** 292cb36 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary correction for threshold accuracy. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Coverage thresholds in place; Phase 51 can escalate global floor to 50-55% after adding context provider tests
- CI pipeline ready for all quality gates
- 627 tests passing across 35 test files

## Self-Check: PASSED

- All files exist (ci.yml, vitest.config.ts, SUMMARY.md)
- All commits verified (4fb8be3, 292cb36)
- CSS lint step present in CI
- Global threshold present in vitest config
- 24 src/lib/ threshold entries in vitest.config.ts

---
*Phase: 48-test-infrastructure-quick-wins*
*Completed: 2026-03-20*
