---
gsd_state_version: 1.0
milestone: v4.1
milestone_name: Production Hardening
status: executing
stopped_at: Completed 52-04-PLAN.md
last_updated: "2026-03-21T08:09:02.000Z"
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 17
  completed_plans: 15
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 52 — E2E Critical Flows + Accessibility

## Current Position

Phase: 52 (E2E Critical Flows + Accessibility) — EXECUTING
Plan: 4 of 4

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
| 51 | 02 | 23min | 2 | 5 |
| 51 | 03 | 14min | 1 | 1 |
| 52 | 01 | 13min | 2 | 8 |
| 52 | 02 | 5min | 2 | 11 |
| 52 | 03 | 5min | 2 | 4 |
| 52 | 04 | 8min | 3 | 10 |

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
- [Phase 51]: vi.hoisted() for auth mock state: mutable mockGetSession/mockOnAuthStateChange refs shared across tests
- [Phase 51]: setupAuthenticated/setupUnauthenticated helpers encapsulate session + onAuthStateChange mock patterns
- [Phase 51]: Global coverage floor kept at 40/40/30/40 (many UI components at 0% prevent bump to 45)
- [Phase 51]: Per-file thresholds for complex providers: Theme 93/81/93/94, Social 55/34/61/61, SRS 85/63/84/87, Auth 48/22/50/47
- [Phase 52]: Glass-heavy opacity 0.45 provides ~5.2:1 contrast ratio (WCAG AA pass), resolves VISC-05
- [Phase 52]: Amber-700 primitive added as 32 90% 35% for warning text contrast on subtle backgrounds
- [Phase 52]: NavItem gets focus-visible rings on both Link and button elements for D-16
- [Phase 52]: E2E fixture files committed by parallel agent 52-02 -- no duplicate commit needed for Plan 01 Task 1
- [Phase 52]: E2E tests use ARIA-first selectors (getByRole, role=status) per research Pattern 2
- [Phase 52]: Timer assertion uses CSS locator fallback since CircularTimer lacks explicit ARIA role
- [Phase 52]: Flashcard sort E2E uses button clicks not drag per precontext Decision 8 (Playwright dragTo flaky on motion/react)
- [Phase 52]: Interview E2E uses TextAnswerInput text fallback since speech APIs not mockable in Playwright
- [Phase 52]: SW update E2E runs under chromium-sw project with serviceWorkers: allow for navigator.serviceWorker access
- [Phase 52]: Offline sync E2E uses context.setOffline() for network simulation per precontext Pattern 3
- [Phase 52]: SyncStatusIndicator and StreakReward already had accessible ARIA -- no changes needed
- [Phase 52]: CategoryBreakdown uses role=progressbar with aria-valuenow/min/max for rich screen reader semantics
- [Phase 52]: axe-core E2E scan pattern: makeAxeBuilder().analyze() + formatViolations for readable test output

### Pending Todos

None.

### Blockers/Concerns

- BRMSE-01: Burmese translation naturalness needs native speaker assessment (carried since v2.1)
- VISC-05: RESOLVED -- glass-heavy opacity 0.45 provides ~5.2:1 contrast (52-02)
- Research flag: SW skipWaiting transition has one-deployment gap (Phase 50)
- Research flag: E2E interview tests must use text input fallback (Phase 52)

## Session Continuity

Last session: 2026-03-21T08:09:02Z
Stopped at: Completed 52-04-PLAN.md
Resume file: None
