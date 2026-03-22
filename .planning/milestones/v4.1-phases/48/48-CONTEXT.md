# Phase 48: Test Infrastructure + Quick Wins - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Developers have a complete testing foundation and CI catches regressions that currently slip through. Specifically: shared test utility (renderWithProviders), Playwright E2E config + smoke test, coverage thresholds on src/lib/ files + global floor, DotLottie removal, safeAsync documentation, RLS policy cleanup, CI lint:css, Knip dead code scan, Sentry fingerprinting verification.

No user-facing changes. No new features. Infrastructure only.

</domain>

<decisions>
## Implementation Decisions

### Test Utility (renderWithProviders)
- Configurable preset system: minimal (ErrorBoundary + StateProvider), core (+ Auth + Language + Theme + Toast + State), full (all 11 providers in ClientProviders.tsx order)
- Default preset is `core` — covers 78% of component test needs
- Provider ordering must exactly match ClientProviders.tsx: ErrorBoundary → Auth → Language → Theme → TTS → Toast → Offline → Social → SRS → State → Navigation
- Auto-mocking of external services per included provider (Supabase, speechSynthesis, localStorage, matchMedia)
- Override individual providers via `providers` map on top of preset
- Mock options for common overrides: user, language mode, theme, online status
- Location: `src/__tests__/utils/renderWithProviders.tsx` with its own test file

### Playwright Setup
- Config + webServer + single smoke test only — Phase 52 writes the 7 real E2E tests
- `pnpm start` (production build) for CI, `pnpm dev` for local with `reuseExistingServer`
- Test directory: `e2e/`
- Projects: chromium only for Phase 48 smoke test (full matrix chromium/firefox/webkit deferred to Phase 52 E2E tests)
- Smoke test: navigate to homepage, verify title/heading renders
- New script: `pnpm test:e2e`

### Coverage Thresholds
- Per-file thresholds on ~22 src/lib/ files set to CURRENT actual coverage (run test:coverage first, then set thresholds)
- Preserve existing 4 per-file thresholds (shuffle 100%, errorSanitizer 90%, ErrorBoundary 70%, saveSession 70%)
- Global floor at 40% (lines, functions, statements) and 30% branches — achievable today without blocking CI
- Phase 51 will escalate to 50-55% after context provider tests added

### DotLottie Removal (DEPS-01)
- Complete removal: @lottiefiles/dotlottie-react package + DotLottieAnimation component + config fields in CelebrationOverlay
- No .lottie asset files exist in public/ — component was never rendering visible content (Suspense fallback={null})
- Celebration system continues via confetti (canvas) + sound (Web Audio) + haptics (Vibration API) — all independent of DotLottie
- Zero visual regression expected

### safeAsync Documentation (DEPS-02)
- Document as reserved infrastructure with JSDoc, not delete
- Keep exported from async/index.ts
- Zero runtime cost (~50 LOC), preserves test suite count
- withRetry IS actively used (8+ import sites) — do not modify

### RLS Policy Cleanup (DEPS-03)
- Remove 5 redundant INSERT policies where ALL policy already covers INSERT:
  1. streak_data
  2. earned_badges
  3. user_settings
  4. user_bookmarks
  5. mock_tests

### CI Hardening (DX-01)
- Add `lint:css` step after existing Lint step in ci.yml
- Add Playwright install + run steps after Build step
- Verify lint:css passes before adding to CI (already fixed in Phase 39-04)

### Knip Dead Code (DX-02)
- Install knip as devDependency
- Configure exclusions: Next.js entry points, Sentry instrumentation, service worker, test setup files
- Run scan, address findings
- New script: `pnpm knip`

### Sentry Fingerprinting (ERRS-05)
- Already implemented in src/lib/sentry.ts beforeSendHandler
- Phase 48 writes verification test only, marks requirement as complete
- Do not re-implement

### Implementation Order
1. DotLottie removal (DEPS-01) — simplest, reduces bundle
2. safeAsync documentation (DEPS-02) — small change
3. RLS policy cleanup (DEPS-03) — SQL only
4. CI lint:css (DX-01) — ci.yml change
5. Coverage thresholds (TEST-11, TEST-12) — vitest.config.ts
6. renderWithProviders (TEST-01) — largest deliverable
7. Playwright setup (TEST-02) — npm install + config + smoke test
8. Knip setup (DX-02) — install + config + run + address findings
9. ERRS-05 verification — write test for existing fingerprinting

### Claude's Discretion
- Exact renderWithProviders API beyond the preset system (type signatures, helper functions)
- Knip configuration specifics (exact exclusion patterns)
- Coverage threshold exact numbers per file (determined by running test:coverage)
- Playwright smoke test assertion details
- Whether to add CSS linting to pre-commit hook (.lintstagedrc.json)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — TEST-01, TEST-02, TEST-11, TEST-12, DEPS-01, DEPS-02, DEPS-03, DX-01, DX-02, ERRS-05 definitions

### Testing Patterns
- `.planning/codebase/TESTING.md` — Current test framework, file organization, mocking patterns, coverage config, CI integration
- `src/__tests__/setup.ts` — Global test setup (matchMedia, speechSynthesis mocks, vitest-axe matchers)
- `vitest.config.ts` — Current Vitest configuration with 4 per-file thresholds

### Provider Ordering
- `src/components/ClientProviders.tsx` — Canonical provider nesting order (renderWithProviders must match exactly)
- `.claude/learnings/provider-ordering.md` — Provider ordering constraints and debugging history

### CI Pipeline
- `.github/workflows/ci.yml` — Current 8-step CI pipeline to extend

### Sentry
- `src/lib/sentry.ts` — Existing fingerprinting in beforeSendHandler (ERRS-05 already implemented)

### DotLottie
- `src/components/celebrations/CelebrationOverlay.tsx` — DotLottie integration to remove
- `src/components/celebrations/DotLottieAnimation.tsx` — Component to delete

### Dead Code
- `src/lib/async/safeAsync.ts` — Reserved infrastructure to document
- `src/lib/async/index.ts` — Barrel export to preserve

### Database
- `supabase/schema.sql` — RLS policies to clean up (5 redundant INSERT policies)

### Precontext Research
- `.planning/phases/48/48-PRECONTEXT-RESEARCH.md` — 12-agent deep analysis with gotcha inventory, data contracts, cross-phase contracts

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/__tests__/setup.ts`: Global test setup with matchMedia, speechSynthesis mocks — renderWithProviders builds on this
- `src/components/ClientProviders.tsx`: Canonical provider ordering — renderWithProviders mirrors this exactly
- 29 existing test files with 618+ passing tests — all must continue passing
- 4 existing per-file coverage thresholds in vitest.config.ts — preserve and extend
- Existing mock patterns: Supabase client, Sentry, auth context, TTS, localStorage, withRetry

### Established Patterns
- Co-located tests (`src/lib/**/*.test.ts`) + centralized tests (`src/__tests__/`) coexist
- Named exports preferred over default exports
- `@/` path alias for cross-directory imports
- vi.mock for module mocking, vi.useFakeTimers for time-dependent tests
- Local wrapper functions per test file (no shared utility yet — that's what TEST-01 creates)

### Integration Points
- `vitest.config.ts` — coverage thresholds config
- `.github/workflows/ci.yml` — new steps added here
- `package.json` — devDependency changes, new scripts
- `src/components/celebrations/` — DotLottie removal affects CelebrationOverlay and index barrel

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase with clear technical scope defined by REQUIREMENTS.md and precontext research.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 48-test-infrastructure-quick-wins*
*Context gathered: 2026-03-19*
