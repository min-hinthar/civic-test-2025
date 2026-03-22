# Phase 51: Unit Test Expansion - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

All 8 previously untested context providers have unit test coverage, per-file coverage thresholds are added simultaneously with each new test file, and dependency overrides/CVEs are re-evaluated. Specifically: unit tests for SupabaseAuth, Language, Theme, SRS, Social, Offline, State, and Navigation providers using renderWithProviders `full` preset; per-file thresholds floored to actual achieved coverage; dependency audit re-evaluation (DEPS-04); react-joyride status documentation (DEPS-05).

Requirements: TEST-10, DEPS-04, DEPS-05.

No user-facing changes. No new features. Testing and dependency maintenance only.

</domain>

<decisions>
## Implementation Decisions

### Test Scope & Depth
- Test "core behaviors" per provider: initialization, state management, derived state, context value exposure
- Target 88-110 total test cases across 8 providers
- Implementation order: simple → complex (State → Navigation → Language → Offline → Theme → Social → SRS → SupabaseAuth)
- All tests use mocked Supabase/IndexedDB/localStorage — zero real backend calls
- Use renderWithProviders `full` preset for all provider tests (enforces correct provider ordering)

### Test Organization
- Location: `src/__tests__/contexts/` (centralized, cross-cutting pattern — matches existing convention)
- File naming: `{ProviderName}.test.tsx` (e.g., `State.test.tsx`, `SupabaseAuth.test.tsx`)
- No new mock modules needed — reuse existing 28+ vi.mock declarations from renderWithProviders
- State fixture factories as test-local constants (not shared across test files)

### Coverage Strategy
- Per-file thresholds added simultaneously with each new test file (Phase 48 contract: never set speculative thresholds)
- Floor to actual achieved coverage, rounded down to integer
- Target per-provider: 75-95% (simple providers higher, complex providers lower due to async edge cases)
- Global floor escalated from 40/40/30/40 to 45/45/35/45 after all 8 provider tests added
- Preserve existing 4 per-file thresholds (shuffle 100%, errorSanitizer 90%, ErrorBoundary 70%, saveSession 70%)

### Dependency Audit (DEPS-04)
- Re-evaluation only — not deep remediation
- Run `pnpm audit` to check current state of 3 overrides (bn.js, rollup, serialize-javascript)
- Re-evaluate 2 ignored CVEs (CVE-2026-26996, CVE-2025-69873) against current data
- Remove overrides/ignores that are no longer needed; document rationale for kept ones
- Update package.json pnpm.overrides and auditConfig.ignoreCves sections

### react-joyride Status (DEPS-05)
- Stable 3.0.0 NOT yet published — document as unavailable
- Continue with 3.0.0-7 prerelease (dynamically imported, SSR-gated, non-critical feature)
- Risk: MEDIUM — acceptable for v4.1

### Unused Code Cleanup
- Address Knip findings from Phase 48: 5 unused files (952 LOC), 141 unused exports, 9 duplicate exports
- Batch removal in dependency audit plan
- Preserve 5 known Knip false positives (import chain traversal limitation)

### Claude's Discretion
- Exact test assertions per provider (within "core behaviors" scope)
- vi.useFakeTimers strategy for time-dependent providers (SRS retry, streak merge)
- Fixture data shape (authenticated user, SRS cards, social profile, streak data)
- Whether to test SSR safety (typeof window checks) — medium priority per gotcha G13
- Exact coverage threshold numbers per file (determined by running test:coverage)
- Whether to combine dependency audit with unused code cleanup into single plan

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — TEST-10, DEPS-04, DEPS-05 definitions and acceptance criteria

### Precontext Research
- `.planning/phases/51/51-PRECONTEXT-RESEARCH.md` — 12-agent deep analysis: provider complexity matrix, 30 gotchas (G1-G30), data contracts (all 8 provider TypeScript interfaces), implementation order, mock boundary summary, dependency audit status, file map
- `.planning/phases/51/51-ENHANCEMENT-RECOMMENDATIONS.md` — Enhancement recommendations

### Provider Source Files
- `src/contexts/SupabaseAuthContext.tsx` — Auth provider (573 lines, very complex)
- `src/contexts/LanguageContext.tsx` — Language provider (147 lines, medium)
- `src/contexts/ThemeContext.tsx` — Theme provider (175 lines, complex)
- `src/contexts/SRSContext.tsx` — SRS provider (377 lines, very complex)
- `src/contexts/SocialContext.tsx` — Social provider (389 lines, complex)
- `src/contexts/OfflineContext.tsx` — Offline provider (233 lines, medium)
- `src/contexts/StateContext.tsx` — State provider (128 lines, simple)
- `src/components/navigation/NavigationProvider.tsx` — Nav provider (227 lines, medium)

### Test Infrastructure (Phase 48)
- `src/__tests__/utils/renderWithProviders.tsx` — Shared test utility with 3 presets (minimal/core/full)
- `src/__tests__/utils/renderWithProviders.test.tsx` — 28+ vi.mock declarations, mock patterns reference
- `src/__tests__/setup.ts` — Global mocks (matchMedia, speechSynthesis)
- `vitest.config.ts` — Coverage thresholds config (4 existing per-file thresholds + global floor)

### Testing Patterns
- `.planning/codebase/TESTING.md` — Current test framework, file organization, mocking patterns, coverage config

### Provider Ordering
- `src/components/ClientProviders.tsx` — Canonical provider nesting order (tests must match)
- `.claude/learnings/provider-ordering.md` — Provider ordering constraints and debugging history

### Settings Sync (Phase 50)
- `src/lib/settings/settingsSync.ts` — Settings sync with per-field LWW merge (test SupabaseAuth merge logic)
- `src/lib/settings/settingsTimestamps.ts` — Pure timestamp functions (already tested in settingsSync.test.ts)

### Dependency Config
- `package.json` — pnpm.overrides and auditConfig.ignoreCves sections to re-evaluate

### Prior Phase Context
- `.planning/phases/48/48-CONTEXT.md` — renderWithProviders presets, coverage thresholds, CI pipeline
- `.planning/phases/49/49-CONTEXT.md` — ProviderOrderGuard, SharedErrorFallback, error boundaries
- `.planning/phases/50/50-CONTEXT.md` — STORAGE_VERSIONS, per-field LWW merge, settingsTimestamps

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `renderWithProviders` with `full` preset: Wraps all 11 providers in correct order — primary utility for all Phase 51 tests
- 28+ existing vi.mock declarations: All provider dependencies already mocked (Supabase, Sentry, localStorage, matchMedia, etc.)
- `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()`: Established pattern for time-dependent tests (SRS retry, streak merge)
- `vi.stubEnv()`: Established pattern for NODE_ENV assignment (Phase 48 contract)
- `vi.hoisted()`: Spy introspection pattern for asserting mock call args

### Established Patterns
- Co-located tests (`src/lib/**/*.test.ts`) + centralized tests (`src/__tests__/`) coexist
- `vi.clearAllMocks()` in beforeEach, `vi.restoreAllMocks()` in afterEach
- Supabase mock: `vi.mock('@/lib/supabaseClient', ...)` with chainable query builder
- `withRetry` mock: passes through directly `withRetry(fn) => fn()` — retry logic not tested in provider tests
- State fixture factories as test-local constants (not shared utilities)

### Integration Points
- `vitest.config.ts` — Add 8 per-file coverage thresholds; raise global floor
- `package.json` — Re-evaluate pnpm.overrides and auditConfig.ignoreCves
- No source code changes to providers — tests only

</code_context>

<specifics>
## Specific Ideas

No specific requirements — testing phase with clear technical scope defined by REQUIREMENTS.md and precontext research. All gray areas resolved by research with HIGH confidence.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 51-unit-test-expansion*
*Context gathered: 2026-03-20*
