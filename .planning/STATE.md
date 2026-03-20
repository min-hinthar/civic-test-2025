---
gsd_state_version: 1.0
milestone: v4.1
milestone_name: Production Hardening
status: unknown
stopped_at: Completed 51-03-PLAN.md
last_updated: "2026-03-20T10:19:15.980Z"
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 13
  completed_plans: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 51 — Unit Test Expansion

## Current Position

Phase: 51 (Unit Test Expansion) — EXECUTING
Plan: 3 of 3 (COMPLETE)

## Performance Metrics

**Cumulative:**

- Total milestones: 5 shipped + 1 active
- Total phases: 48 shipped + 6 planned = 54
- Total plans: 278 shipped
- Total requirements: 226/227 shipped + 36 active

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 48 | 01 | 12min | 2 | 7 |
| 48 | 02 | 13min | 2 | 2 |
| 48 | 03 | 13min | 1 | 2 |
| 48 | 04 | 15min | 3 | 19 |
| Phase 49 P01 | 7min | 2 tasks | 6 files |
| 49 | 02 | 15min | 2 | 8 |
| Phase 49 P03 | 8min | 2 tasks | 7 files |
| Phase 50 P01 | 13min | 2 tasks | 4 files |
| Phase 50 P02 | 14min | 2 tasks | 6 files |
| Phase 50 P03 | 9min | 2 tasks | 10 files |
| Phase 51 P01 | 12min | 2 tasks | 5 files |
| 51 | 03 | 14min | 1 | 1 |

## Accumulated Context

### Decisions

- DotLottie removal safe: no .lottie assets in public/, component rendered nothing
- safeAsync kept as reserved infrastructure (tree-shaken, zero runtime cost)
- Coverage thresholds floored from actual values (not aspirational) per G-06 guardrail
- Global branches threshold 30% (lower than 40% for lines/functions/statements)
- Core preset includes 6 providers (ErrorBoundary, Auth, Language, Theme, Toast, State) for ~78% test coverage
- Provider ordering enforced via PROVIDER_ORDER array matching ClientProviders.tsx
- Chromium-only for Playwright; full browser matrix deferred to Phase 52
- 10 genuinely unused files deleted; 5 Knip false positives kept (import chain traversal limitation)
- Sentry fingerprint precedence fixed: Next.js noise filters take priority over app-specific fingerprinting
- [Phase 49]: SharedErrorFallback extracted as shared bilingual error component with BilingualMessage props
- [Phase 49]: error.tsx useLanguage() in try-catch with localStorage fallback (hook always called, catch handles runtime failure)
- [Phase 49]: global-error.tsx uses Sentry.captureException directly (not captureError wrapper) for catastrophic resilience
- [Phase 49]: ToastProvider detection skipped in ProviderOrderGuard: useToast returns fallback, ToastContext not exported
- [Phase 49]: Conditional rendering for ProviderOrderGuard over early return for Rules of Hooks compliance
- [Phase 49]: withSessionErrorBoundary HOC wraps at module level; TestPage wrapped at export level
- [Phase 49]: ErrorBoundary fallback check: !== undefined (not truthy) to support fallback={null} silent failure
- [Phase 50]: STORAGE_VERSIONS uses as const for type safety and immutability
- [Phase 50]: Backwards compat: getCachedQuestions treats missing meta (null) as valid for pre-versioned caches
- [Phase 50]: captureError logs version mismatch with cached vs expected context for debugging
- [Phase 50]: SWUpdateWatcher is component not provider -- no provider reorder needed
- [Phase 50]: Dual session lock: NavigationProvider.isLocked + history.state.interviewGuard for complete coverage
- [Phase 50]: Module-level manager pattern (createSWUpdateManager) enables both singleton export and testable factory
- [Phase 50]: Pure merge function (no side effects) for testability -- localStorage helpers separated from merge logic
- [Phase 50]: TTS field mapping: TTSSettings keys mapped to UserSettings keys via ttsFieldMap for per-field timestamp tracking
- [Phase 50]: Dirty flags take absolute priority over timestamps -- offline changes always win regardless of remote timestamp
- [Phase 51]: Mock hooks directly (useMediaTier, useNavBadges, useOnlineStatus) instead of transitive deps for cleaner provider test isolation
- [Phase 51]: Consumer component pattern: each provider test creates a component that reads full context and exposes actions via button handlers
- [Phase 51]: All 3 pnpm.overrides still required: bn.js (asn1.js ^4.0.0), rollup (multi-dep), serialize-javascript (terser-webpack-plugin ^6.0.2)
- [Phase 51]: CVE-2026-26996 removed from ignoreCves (no longer matches any advisory)
- [Phase 51]: CVE-2025-69873 kept (matches ajv in eslint devDep chain, non-exploitable)
- [Phase 51]: react-joyride 3.0.0 stable not published; kept at 3.0.0-7 prerelease

### Pending Todos

None.

### Blockers/Concerns

- BRMSE-01: Burmese translation naturalness needs native speaker assessment (carried since v2.1)
- VISC-05: Dark mode glass panel readability -- targeted by A11Y-04 in Phase 52
- Research flag: SW skipWaiting transition has one-deployment gap (Phase 50)
- Research flag: E2E interview tests must use text input fallback (Phase 52)

## Session Continuity

Last session: 2026-03-20T10:16:49Z
Stopped at: Completed 51-03-PLAN.md
Resume file: None
