---
phase: 13-security-hardening
plan: 04
subsystem: infra
tags: [next.js, dependabot, security-audit, npm, ci, dependency-management]

# Dependency graph
requires:
  - phase: none
    provides: existing package.json and CI pipeline
provides:
  - Next.js 15.5.12 with zero known CVEs
  - Pruned dependency tree (6 unused packages removed)
  - Dependabot weekly monitoring for npm dependencies
  - CI pipeline security audit gate (blocks high/critical vulns)
affects: [all-phases, ci-pipeline, dependency-updates]

# Tech tracking
tech-stack:
  added: []
  patterns: [dependabot-grouped-updates, ci-security-audit-gate]

key-files:
  created:
    - .github/dependabot.yml
  modified:
    - package.json
    - pnpm-lock.yaml
    - .github/workflows/ci.yml
    - next-env.d.ts
    - next.config.mjs

key-decisions:
  - "Upgraded Next.js to 15.5.12 (not 16.x) to fix 7 CVEs without major version breaking changes"
  - "Kept autoprefixer, postcss (PostCSS config), @vitest/coverage-v8 (test:coverage), lint-staged (.lintstagedrc.json), stylelint-config-standard (.stylelintrc.json)"
  - "Removed 4 unused prod deps (marked, react-swipeable, dotenv, @radix-ui/react-toast) and 2 unused dev deps (@testing-library/user-event, eslint-config-next)"
  - "Dependabot ignores major version bumps (manual review) and groups PRs by dependency type"

patterns-established:
  - "Dependabot weekly monitoring: grouped PRs, no auto-major-bumps"
  - "CI security gate: pnpm audit --audit-level=high runs after install, before typecheck"

# Metrics
duration: 23min
completed: 2026-02-10
---

# Phase 13 Plan 04: Dependency Audit & Supply Chain Summary

**Next.js upgraded 15.1.11 to 15.5.12 fixing 7 CVEs, 6 unused deps pruned, Dependabot + CI audit gate added**

## Performance

- **Duration:** 23 min
- **Started:** 2026-02-10T04:07:23Z
- **Completed:** 2026-02-10T04:30:35Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Upgraded Next.js from 15.1.11 to 15.5.12, resolving all 7 known CVEs (including critical authorization bypass CVE)
- Removed 6 unused dependencies: marked (XSS vector), react-swipeable, dotenv, @radix-ui/react-toast, @testing-library/user-event, eslint-config-next
- Created Dependabot config with weekly npm monitoring, grouped PRs, and major version ignore
- Added `pnpm audit --audit-level=high` CI step that blocks merges with high/critical vulnerabilities
- License audit: all production deps use permissive licenses (MIT, Apache-2.0, ISC, OFL-1.1, MPL-2.0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade Next.js and prune unused dependencies** - `ef4d37c` (feat)
2. **Task 2: Add Dependabot config and CI security audit step** - `4f60050` (feat)

## Files Created/Modified
- `package.json` - Upgraded next to 15.5.12, removed 6 unused dependencies
- `pnpm-lock.yaml` - Updated lockfile reflecting dependency changes
- `.github/dependabot.yml` - Weekly npm dependency monitoring with grouped PRs
- `.github/workflows/ci.yml` - Added security audit step after install, before typecheck
- `next-env.d.ts` - Auto-updated by Next.js 15.5.x (added routes.d.ts reference)
- `next.config.mjs` - Security headers from prior phase work (committed alongside)

## Decisions Made
- **Next.js 15.5.12 (not 16.x):** Stayed on 15.x to avoid major version breaking changes while fixing all known CVEs
- **Conservative pruning:** Only removed dependencies with zero imports in source. Kept autoprefixer/postcss (PostCSS config), @vitest/coverage-v8 (test:coverage script), lint-staged (config file exists for re-enablement), stylelint-config-standard (active .stylelintrc.json)
- **eslint-config-next removed:** Project uses flat ESLint config with @next/eslint-plugin-next directly; eslint-config-next was unused
- **Dependabot major version ignore:** Major version bumps require manual review to avoid breaking changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- First build after Next.js upgrade failed with `Cannot find module _document.js` due to stale `.next` cache from old 15.1.x version. Resolved by deleting `.next` directory and rebuilding (known pitfall documented in MEMORY.md).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dependency tree is clean with zero vulnerabilities
- Dependabot will automatically create PRs for dependency updates weekly
- CI pipeline now catches new vulnerabilities before merge
- Ready for remaining security hardening plans (13-05)

---
*Phase: 13-security-hardening*
*Completed: 2026-02-10*
