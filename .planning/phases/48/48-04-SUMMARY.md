---
phase: 48-test-infrastructure-quick-wins
plan: 04
subsystem: testing
tags: [playwright, e2e, knip, dead-code, sentry, fingerprinting, pii]

requires:
  - phase: 48-02
    provides: CSS lint CI step (Playwright steps placed after it in pipeline)
provides:
  - Playwright E2E framework with smoke test and CI integration
  - Knip dead code detection configured and initial cleanup done
  - Sentry fingerprinting verified with 16 tests
  - 10 dead files removed
affects: [52-e2e-testing, 50-service-worker]

tech-stack:
  added: ["@playwright/test", "knip"]
  patterns: [e2e-smoke-test, dead-code-detection, sentry-fingerprint-testing]

key-files:
  created:
    - playwright.config.ts
    - e2e/smoke.spec.ts
    - knip.json
    - src/lib/sentry.test.ts
  modified:
    - package.json
    - .github/workflows/ci.yml
    - .gitignore
    - src/lib/sentry.ts

key-decisions:
  - "Chromium-only for Playwright (full browser matrix deferred to Phase 52)"
  - "Knip false positives left as-is (import chain traversal limitation)"
  - "10 genuinely unused files deleted; 5 false positives kept"
  - "Sentry fingerprint precedence bug fixed: Next.js noise filters take priority over app-specific fingerprinting"

patterns-established:
  - "E2E tests in e2e/ directory, Playwright config at root"
  - "Dead code detection via pnpm knip with Next.js plugin"

requirements-completed: [TEST-02, DX-02, ERRS-05]

duration: 15min
completed: 2026-03-20
---

# Phase 48 Plan 04: Playwright + Knip + Sentry Fingerprinting Summary

**Playwright E2E framework with smoke test, Knip dead code detection removing 10 unused files, and 16 Sentry fingerprinting verification tests with a precedence bug fix**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-20T02:15:33Z
- **Completed:** 2026-03-20T02:30:04Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments
- Playwright E2E framework configured with webServer, CI pipeline integration, and 2 passing smoke tests
- Knip installed and configured; 10 genuinely dead files removed (~1400 lines of dead code)
- 16 Sentry fingerprinting tests written covering all 5 error categories, drop rules, and PII stripping
- Fixed fingerprint precedence bug where network-error overwrote chunk-load-failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up Playwright E2E framework** - `fc7e589` (feat)
2. **Task 2: Install Knip and remove dead code** - `5e8156b` (feat)
3. **Task 3: Sentry fingerprinting tests** - `6ba92e0` (test)
4. **Task 3 fix: vi.stubEnv for typecheck** - `e7925c2` (fix)

## Files Created/Modified
- `playwright.config.ts` - Playwright config with webServer (pnpm start in CI, dev locally)
- `e2e/smoke.spec.ts` - Smoke tests: homepage title and heading visibility
- `knip.json` - Dead code detection config with Next.js plugin and exclusions
- `src/lib/sentry.test.ts` - 16 tests for fingerprinting, drops, PII stripping
- `src/lib/sentry.ts` - Fixed fingerprint precedence bug
- `package.json` - Added test:e2e, test:e2e:ui, knip scripts; added @playwright/test, knip deps
- `.github/workflows/ci.yml` - Added Playwright install + E2E run steps after Build
- `.gitignore` - Added Playwright artifact directories
- 10 deleted files: ThemeToggle, useSyncQueue, bilingual/index, AnswerReveal, onboarding/index, SkillTreePath, OnlineStatusIndicator, StreakHeatmap, AnswerFeedback, LanguageToggle

## Decisions Made
- Chromium-only for Playwright -- full browser matrix (firefox, webkit) deferred to Phase 52
- Knip false positives (5 files reported as unused but actually imported via chains) left as-is -- Knip limitation with indirect imports
- 10 genuinely unused files deleted after verifying no imports exist anywhere in codebase
- Fixed Sentry fingerprint precedence: wrap app-specific fingerprinting in `if (!event.fingerprint)` guard

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Sentry fingerprint precedence**
- **Found during:** Task 3 (Sentry test writing)
- **Issue:** "Failed to fetch dynamically imported module" matched both chunk-load-failure and network-error patterns. The app-specific network fingerprinting block (independent `if`) overwrote the chunk-load fingerprint set by the Next.js noise filter block.
- **Fix:** Wrapped app-specific fingerprinting in `if (!event.fingerprint)` guard so previously-set fingerprints from Next.js noise filters are not overwritten.
- **Files modified:** src/lib/sentry.ts
- **Verification:** All 16 sentry tests pass including the "Failed to fetch dynamically imported module" -> chunk-load-failure test
- **Committed in:** 6ba92e0

**2. [Rule 1 - Bug] Fixed NODE_ENV assignment in test**
- **Found during:** Task 3 verification (typecheck)
- **Issue:** Direct `process.env.NODE_ENV = 'production'` assignment fails TypeScript strict mode (read-only property)
- **Fix:** Replaced with `vi.stubEnv('NODE_ENV', 'production')` and `vi.unstubAllEnvs()` cleanup
- **Files modified:** src/lib/sentry.test.ts
- **Verification:** pnpm typecheck exits 0
- **Committed in:** e7925c2

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. Fingerprint precedence bug was a real production issue. No scope creep.

## Issues Encountered
- Prettier format:check reports 356 files with formatting issues -- pre-existing CRLF/LF differences on Windows. Lint-staged handles formatting on commit, so committed files are correct. Out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Playwright foundation ready for Phase 52 to add 7 real E2E tests
- Knip available for ongoing dead code detection via `pnpm knip`
- Sentry fingerprinting verified; ERRS-05 confirmed complete
- All 643 tests passing (627 existing + 16 new)

## Self-Check: PASSED

All 4 created files verified present. All 4 commit hashes verified in git log.

---
*Phase: 48-test-infrastructure-quick-wins*
*Completed: 2026-03-20*
