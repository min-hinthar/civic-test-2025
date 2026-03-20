---
phase: 51-unit-test-expansion
plan: 03
subsystem: infra
tags: [pnpm, audit, cve, overrides, react-joyride, security]

# Dependency graph
requires:
  - phase: 48-test-infrastructure
    provides: test infrastructure, coverage thresholds
provides:
  - Re-evaluated pnpm.overrides with documented rationale for all 3 entries
  - Removed obsolete CVE-2026-26996 from ignoreCves
  - Documented react-joyride 3.0.0 stable unavailability
affects: [phase-52, dependency-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [audit-re-evaluation-with-override-justification]

key-files:
  created: []
  modified: [package.json]

key-decisions:
  - "All 3 pnpm.overrides kept: bn.js (asn1.js needs ^4.0.0), rollup (multiple deps), serialize-javascript (terser-webpack-plugin needs ^6.0.2)"
  - "CVE-2026-26996 removed: no longer matches any advisory in current dependency tree"
  - "CVE-2025-69873 kept: still matches ajv advisory in eslint devDep chain (non-exploitable, dev-only)"
  - "react-joyride 3.0.0 stable not published; kept at 3.0.0-7 prerelease (dynamically imported, SSR-gated, non-critical)"

patterns-established:
  - "Override justification: document dependency chain showing why natural resolution would pull vulnerable version"

requirements-completed: [DEPS-04, DEPS-05]

# Metrics
duration: 14min
completed: 2026-03-20
---

# Phase 51 Plan 03: Dependency Audit Re-evaluation Summary

**Removed obsolete CVE-2026-26996 ignore; confirmed all 3 pnpm.overrides still required; documented react-joyride 3.0.0-7 prerelease status**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-20T10:02:34Z
- **Completed:** 2026-03-20T10:16:49Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Re-evaluated all 3 pnpm.overrides against current resolved versions with documented rationale
- Removed CVE-2026-26996 from ignoreCves (no longer matches any advisory)
- Confirmed CVE-2025-69873 still needed (matches ajv advisory in eslint chain)
- Verified react-joyride stable 3.0.0 not yet published (latest: 3.0.0-7)
- Production audit: 0 vulnerabilities confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-evaluate dependency overrides, ignored CVEs, and react-joyride status** - `8908cc6` (chore)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified

- `package.json` - Removed CVE-2026-26996 from pnpm.auditConfig.ignoreCves

## Decisions Made

### Override Re-evaluation Results

| Override | Version | Verdict | Rationale |
|----------|---------|---------|-----------|
| bn.js | >=5.2.3 | KEPT | asn1.js 5.4.1 requires `^4.0.0`; without override resolves to vulnerable 4.x |
| rollup | >=4.59.0 | KEPT | Multiple deps resolve to exactly 4.59.0 via override; @rollup/plugin-commonjs, vite, vitest all depend on it |
| serialize-javascript | >=7.0.3 | KEPT | terser-webpack-plugin 5.3.16 requires `^6.0.2`; without override resolves to 6.x (XSS-vulnerable) |

### Ignored CVE Re-evaluation Results

| CVE | Verdict | Rationale |
|-----|---------|-----------|
| CVE-2026-26996 | REMOVED | No longer matches any advisory in current dependency tree; vulnerability was fixed or advisory withdrawn |
| CVE-2025-69873 | KEPT | Still matches ajv advisory (ID 1113714) in eslint > ajv chain; dev-only transitive dependency, non-exploitable in production |

### react-joyride Status (DEPS-05)

- Current: `3.0.0-7` (prerelease)
- Stable 3.0.0: NOT published as of 2026-03-20
- Latest 3.x versions: 3.0.0-0 through 3.0.0-7 (all prereleases)
- Risk: MEDIUM (dynamically imported, SSR-gated, non-critical onboarding feature)
- Action: No change; continue with 3.0.0-7

### Full Audit Summary

- Production: 0 vulnerabilities
- Dev: 9 total (8 displayed + 1 ignored)
  - flatted: 2 high (eslint > file-entry-cache > flat-cache > flatted)
  - undici: 3 high + 3 moderate (jsdom > undici)
  - ajv: 1 moderate ignored (eslint > ajv, CVE-2025-69873)
- All dev vulnerabilities are in transitive chains of eslint and jsdom; unfixable without upstream releases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All dependency overrides documented with justification
- Audit baseline clean for production
- react-joyride upgrade deferred until stable 3.0.0 published

---
*Phase: 51-unit-test-expansion*
*Completed: 2026-03-20*
