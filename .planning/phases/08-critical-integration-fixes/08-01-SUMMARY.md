---
phase: 08-critical-integration-fixes
plan: 01
subsystem: build-tooling
tags: [eslint, sentry, pre-commit, build, lint]
depends_on: []
provides:
  - Clean build pipeline (zero errors, zero deprecation warnings)
  - Working pre-commit hook (lint-staged + typecheck, no build)
  - Zero eslint-disable suppressions in AppNavigation.tsx
affects:
  - 08-02 (TypeScript strict mode depends on clean build baseline)
  - 08-03 (all subsequent plans depend on pre-commit hook working)
tech-stack:
  added: []
  removed: []
  patterns:
    - Event handler menu close (replaces useEffect route-change listener)
key-files:
  created: []
  modified:
    - src/hooks/useStreak.ts
    - src/components/AppNavigation.tsx
    - eslint.config.mjs
    - next.config.mjs
    - .husky/pre-commit
  deleted:
    - pages/sentry-example-page.tsx
    - pages/api/sentry-example-api.ts
decisions:
  - Remove deprecated disableLogger and automaticVercelMonitors from Sentry config (cleanest fix)
  - Close menu via click handler setIsMenuOpen(false) instead of route-change useEffect
  - Pre-commit hook: lint-staged + typecheck only (no next build)
metrics:
  duration: 13 min
  completed: 2026-02-08
---

# Phase 08 Plan 01: Build & Lint Fixes Summary

**Clean build/lint pipeline with working pre-commit hook by removing Sentry demo pages, fixing lint errors, eliminating eslint-disable suppressions, and restoring pre-commit integrity.**

## Task Commits

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Delete Sentry demo pages, fix lint error, remove eslint-disable | a6abfd9 | Deleted sentry-example-page.tsx and sentry-example-api.ts; removed unused recordStudyActivity import; replaced useEffect menu close with click handler pattern |
| 2 | Update ESLint config, fix Sentry deprecations, restore pre-commit | 34c1cd9 | Added out/** to ESLint ignores; removed deprecated disableLogger and automaticVercelMonitors; pre-commit now runs lint-staged + typecheck only |

## What Was Done

### Task 1: Delete Sentry demo pages, fix lint error, remove eslint-disable suppression

**Sentry demo page removal:**
- Deleted `pages/sentry-example-page.tsx` (auto-generated Sentry SDK demo page)
- Deleted `pages/api/sentry-example-api.ts` (companion API route)
- These caused SSG build failure (manifest.json ENOENT) since Phase 3
- Sentry SDK remains fully configured via next.config.mjs, sentry.*.config.ts files

**useStreak.ts lint fix:**
- Removed unused `recordStudyActivity` import (moved to masteryStore.recordAnswer per 07-03 decision)
- Other imports (getStreakData, calculateStreak, shouldAutoUseFreeze) remain intact

**AppNavigation.tsx eslint-disable removal:**
- Removed the `useEffect` block that closed menu on route change with eslint-disable comment
- Removed `useEffect` from React import (no longer needed)
- Added `setIsMenuOpen(false)` at top of `handleGuardedNavigation` (covers all nav link clicks)
- Added `setIsMenuOpen(false)` in both desktop and mobile logout onClick handlers
- Every navigation action now closes menu at point of user interaction, not reactively via effect
- React Compiler ESLint clean: setState in event handlers is fine

### Task 2: Update ESLint config, fix Sentry deprecation warnings, restore pre-commit hook

**ESLint config:**
- Added `'out/**'` to ignores array to prevent false lint errors from stale build artifacts

**Sentry deprecation fixes:**
- Removed `disableLogger: true` (deprecated in favor of webpack.treeshake.removeDebugLogging; Sentry default handles logging)
- Removed `automaticVercelMonitors: true` (deprecated; app not using Vercel Cron Monitors)
- Build output now clean of all deprecation warnings

**Pre-commit hook restoration:**
- Removed `pnpm run build` from .husky/pre-commit (build stays as CI-only check)
- Pre-commit now runs: `pnpm lint-staged` + `pnpm run typecheck`
- Combined runtime ~15-20 seconds per commit (vs ~60+ seconds with build)
- Developers can commit without --no-verify (bypassed since Phase 4)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm run lint` | Zero errors, zero warnings |
| `pnpm run typecheck` | Zero errors |
| `pnpm run build` | Success, no SSG failure, no deprecation warnings |
| `eslint-disable` in AppNavigation.tsx | None found |
| Sentry example files | Deleted (not found) |
| Pre-commit hook | lint-staged + typecheck only, no build |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Remove disableLogger entirely (don't migrate to new option) | Sentry's default behavior handles logging; simpler config |
| Remove automaticVercelMonitors entirely | App doesn't use Vercel Cron Monitors |
| Close menu via click handler instead of route-change effect | React Compiler safe; eliminates need for eslint-disable |
| Pre-commit: lint-staged + typecheck, no build | Build is slow (~60s); CI catches build errors; commits should be fast |

## Next Phase Readiness

Build pipeline is clean and fast. Pre-commit hook works without --no-verify. All subsequent plans in Phase 08 can run with full build/lint verification.

## Self-Check: PASSED
