# Phase 1: Foundation & Code Quality - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix critical bugs (shuffle bias, save race condition, history leak), add TypeScript strict mode, establish testing infrastructure with CI, harden error handling with Sentry, and modularize the questions file by USCIS category. Users benefit from bug fixes; developers gain confidence through strict typing, linting, and test coverage.

</domain>

<decisions>
## Implementation Decisions

### Testing strategy
- Broad foundation coverage: critical bug regression tests + utility functions + component rendering tests (~50-70 tests)
- Unit and integration tests only (Vitest) — E2E with Playwright deferred to later phase
- GitHub Actions CI pipeline runs tests on every push/PR
- 70% minimum coverage threshold enforced in CI
- Must-test behaviors: the 3 bug fixes + test completion saves correctly + study guide loads all questions + score calculation accuracy
- Test data approach: Claude's discretion (fixtures vs factories)
- Snapshot testing: Claude's discretion

### Error handling UX
- Toast notifications for user-facing errors (non-blocking, bottom/top of screen)
- Error messages always bilingual (Burmese + English) regardless of app language setting
- Sentry for production error monitoring with error boundaries
- Anonymized user context in Sentry reports — hashed user ID + device info, personal details stripped
- Failed operations show error toast immediately with "Try again" button (no silent retry)
- Per-page React error boundaries — each route gets its own boundary so one crash doesn't take down the whole app
- Offline: show bilingual toast telling user they're offline (full offline queue is Phase 2)

### Code organization
- Split questions file by USCIS category (american-government.ts, american-history.ts, integrated-civics.ts, etc.)
- Questions stored as TypeScript files with typed interfaces
- Each question gets a stable unique ID (e.g., 'GOV-01', 'HIST-15') for reliable SRS tracking
- Barrel file / import pattern: Claude's discretion
- Layer-based folder structure: src/components/, src/hooks/, src/utils/, src/types/
- Centralized shared types in src/types/
- ESLint + Prettier enforced strictly with CI checks (eslint-config-next + strict TypeScript rules)
- Husky + lint-staged pre-commit hooks for linting and type checking on staged files

### Bug fix verification
- Automated regression tests only (no manual verification steps)
- Shuffle bias: statistical test — run shuffle 1000+ times, verify distribution within expected variance
- Save race condition: fix using mutex/queue pattern to serialize save operations
- History leak: Claude's discretion on fix approach (replaceState vs stack limiting)
- All 3 bug fixes batched together for single deployment
- Bugs tracked in planning docs only, not GitHub Issues

### Claude's Discretion
- Test data management approach (fixtures vs factory functions)
- Snapshot testing strategy (none vs selective)
- Barrel file pattern for question imports
- History.pushState leak fix approach
- Exact Sentry configuration and error boundary fallback UI
- Compression/optimization of question data files

</decisions>

<specifics>
## Specific Ideas

- Statistical shuffle test should prove uniform distribution (not just "different order")
- Mutex/queue for save operations — user should never see duplicate test records
- Bilingual error messages are critical — Burmese users must understand what went wrong
- Stable question IDs enable future SRS tracking (Phase 5) without data migration issues

</specifics>

<deferred>
## Deferred Ideas

- App security hardening, RLS policies, Supabase security, auth — raised during discussion, belongs in its own security-focused phase or as part of Phase 2/5 when Supabase is actively used
- E2E testing with Playwright — deferred until UI is more stable (after Phase 3)

</deferred>

---

*Phase: 01-foundation-code-quality*
*Context gathered: 2026-02-05*
