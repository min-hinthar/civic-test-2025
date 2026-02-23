---
phase: 39-next-js-16-upgrade-and-tooling
plan: 01
subsystem: infra
tags: [dependencies, pnpm, sentry, serwist, supabase, react-router, typescript, lucide, motion]

# Dependency graph
requires:
  - phase: none
    provides: existing v3.0 codebase
provides:
  - All non-Next.js dependencies at latest versions
  - Git tag v3.0-pre-upgrade for rollback safety
  - Clean pnpm-lock.yaml regenerated from scratch
affects: [39-next-js-16-upgrade-and-tooling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separate non-Next dep upgrades from Next.js upgrade for bisect isolation"

key-files:
  created: []
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Keep tailwindcss at v3 (v4 is a breaking architectural change requiring config rewrite)"
  - "Keep eslint at v9 (v10 is a major version bump, defer to separate plan)"
  - "Keep @types/node at v22 range (v25 is a major bump)"
  - "Upgrade typescript from 5.8 to 5.9 (minor version, safe)"
  - "Keep react-joyride at 3.0.0-7 pre-release pin (peer dep warning is expected)"

patterns-established:
  - "Pre-upgrade git tag pattern for safe rollback before major framework upgrades"

requirements-completed: [MIGR-01]

# Metrics
duration: 12min
completed: 2026-02-23
---

# Phase 39 Plan 01: Non-Next.js Dependency Upgrade Summary

**Upgraded 18 dependencies to latest versions with git tag v3.0-pre-upgrade safety net, all 511 tests passing**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-23T10:31:43Z
- **Completed:** 2026-02-23T10:43:57Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created `v3.0-pre-upgrade` git tag on commit 60546ec for easy rollback
- Upgraded 18 dependencies across production and dev (Sentry, Serwist, Supabase, motion, lucide-react, react-router-dom, recharts, TypeScript, and more)
- Deleted and regenerated pnpm-lock.yaml from clean state (+98 packages, -95 packages)
- All 511 tests pass, TypeScript typecheck clean with TS 5.9.3
- Next.js remains at 15.5.12 (unchanged, per plan isolation strategy)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pre-upgrade git tag and upgrade non-Next dependencies** - `247bbbe` (chore)

## Files Created/Modified
- `package.json` - Updated 18 dependency version ranges to latest
- `pnpm-lock.yaml` - Regenerated from clean state with all resolved versions

## Decisions Made

1. **Keep tailwindcss at v3.x** - Tailwind v4 is a fundamentally different architecture (no tailwind.config.js, CSS-first) that would require rewriting config and potentially hundreds of class names. Not appropriate for a dependency bump plan.

2. **Keep eslint at v9.x** - ESLint v10 is a major version bump. The current v9 flat config setup works well. Defer to a separate plan if needed.

3. **Keep @types/node at v22.x** - v25 is a major version jump (3 majors ahead). Current types are sufficient.

4. **Upgrade TypeScript 5.8 -> 5.9** - Minor version bump with backward-compatible changes. Tests and typecheck pass cleanly.

5. **Keep react-joyride at 3.0.0-7** - Pre-release pin. The peer dependency warning about React 16-18 from `@gilbarbara/hooks` is expected and harmless since the library works with React 19.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All dependencies at latest versions, ready for Next.js 16 upgrade in Plan 02
- Git tag `v3.0-pre-upgrade` available for rollback if needed
- Clean lockfile establishes a known-good baseline
- Peer dependency warning for react-joyride is informational only

## Self-Check: PASSED

- FOUND: package.json
- FOUND: pnpm-lock.yaml
- FOUND: 39-01-SUMMARY.md
- FOUND: commit 247bbbe
- FOUND: git tag v3.0-pre-upgrade

---
*Phase: 39-next-js-16-upgrade-and-tooling*
*Completed: 2026-02-23*
