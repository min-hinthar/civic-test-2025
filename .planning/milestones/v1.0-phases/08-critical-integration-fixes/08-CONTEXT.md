# Phase 8: Critical Integration Fixes - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up existing features that were built in isolation but not fully connected: offline test result syncing to the sync queue, settings page navigation from the app, lint/build fixes to restore clean CI. No new capabilities — this is integration wiring and tech debt closure.

</domain>

<decisions>
## Implementation Decisions

### Settings navigation placement
- Settings link on Dashboard only (not every page)
- Claude's discretion on exact placement (header vs. inline) and icon style — should match existing navigation patterns
- Current settings page sections and ordering remain unchanged
- Claude decides which other pages (if any) get contextual cross-links to Settings
- Claude decides visual design (icon style, prominence) consistent with the app's design system
- Claude decides back-navigation pattern from Settings based on existing page patterns

### Sync failure feedback
- Silent automatic retry when coming back online — no notification during retry attempts
- Show bilingual error toast only if all retries are exhausted (permanent failure)
- No manual retry button — sync is fully automatic, user doesn't think about it
- Test results taken offline appear immediately in history from IndexedDB (local-first display)

### Lint fix strategy
- Fix ALL root causes — no eslint-disable suppressions, no workarounds
- Remove unused code entirely (YAGNI) — no TODO comments for unused variables/imports
- Keep all React Compiler ESLint rules strict (no relaxation)
- Claude's discretion on whether to enable additional TypeScript strict flags based on current tsconfig

### Sentry build fix
- Fix the pre-existing sentry-example-page manifest.json ENOENT build failure in this phase
- Approach: whatever resolves it cleanly (fix, remove demo page, etc.)

### Pre-commit hook restoration
- Partial restore: lint-staged + typecheck in pre-commit hook (no `next build`)
- `next build` stays as CI-only check
- Claude decides exact pre-commit hook configuration (lint-staged only vs. lint-staged + typecheck) based on speed/safety balance
- No more --no-verify after this phase

### Claude's Discretion
- Exact settings navigation placement and icon within AppShell
- Which pages get contextual cross-links to Settings (if any)
- Whether to enable additional TypeScript strict flags
- Pre-commit hook composition (lint-staged vs. lint-staged + typecheck)
- How to resolve the Sentry example page build issue
- Back navigation pattern from Settings page

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants lint-staged + typecheck as pre-commit, but build as CI-only (partial restore)
- Settings accessible from Dashboard only, not cluttering every page's navigation
- Offline test results are local-first — show immediately from IndexedDB, sync invisibly
- Error toast only on permanent sync failure, not on transient retries

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-critical-integration-fixes*
*Context gathered: 2026-02-07*
