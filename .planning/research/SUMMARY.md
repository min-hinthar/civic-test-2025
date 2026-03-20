# Project Research Summary

**Project:** Civic Test 2025 — v4.1 Production Hardening
**Domain:** Production hardening of existing 78K LOC bilingual PWA (Next.js 16 App Router, React 19, Supabase, IndexedDB, Serwist)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This milestone adds zero user-facing features. The focus is hardening an already-shipped 226-requirement codebase against regressions, security leaks, and maintenance burden. All four research areas converge on the same conclusion: the existing architecture is sound, but systematic gaps in testing infrastructure, error handling, and operational tooling mean that real problems go undetected until users encounter them. The highest-confidence, highest-ROI investment is establishing E2E test infrastructure (Playwright) and shared unit test utilities before any other hardening work, because every subsequent phase changes working code and requires a safety net to catch regressions during those changes.

The recommended technology additions are minimal and deliberate: Playwright and @axe-core/playwright as dev dependencies, removal of @lottiefiles/dotlottie-react (~200KB dead WASM with zero .lottie source assets), and no other new runtime dependencies. All other hardening is configuration changes, 5-50 line additions to existing files, and pattern application of already-present utilities (sanitizeError, BilingualMessage, ErrorBoundary, @serwist/window events). The existing custom ErrorBoundary, idb-keyval version tracking, and provider context hooks are already fit for purpose — the work is wiring them up correctly, not replacing them.

The dominant risk is ordering-sensitive changes that affect every deployed user simultaneously. The service worker update UX change (skipWaiting: true -> false with user-triggered update) is the single highest-risk task: a defect causes infinite reload loops in cached PWAs that are difficult to recover from remotely. InterviewSession decomposition (1,474 lines, 9-phase state machine, 29 callbacks) is the highest-effort task and must be deferred until full E2E coverage of the interview flow exists. Both must come last in the phase sequence.

## Key Findings

### Recommended Stack

The project stack is unchanged for this milestone. The only meaningful dependency changes are Playwright + @axe-core/playwright as dev dependencies and removal of @lottiefiles/dotlottie-react. Playwright is the correct E2E choice over Cypress: free parallel execution via --shard, WebKit support for iOS PWA testing (critical for this PWA), native multi-browser without plugins, and official Next.js docs recommend it. The @serwist/window package is already in the dependency tree transitively via @serwist/next — it can be used for SW lifecycle events without a new install. No other new libraries are warranted; react-error-boundary would duplicate the existing bilingual ErrorBoundary, and a full idb migration library would over-engineer a 5-line version check.

**Core technologies (new or changed):**
- `@playwright/test ^1.58.0`: E2E test framework — chosen for free parallelization, WebKit (iOS Safari) support, Next.js webServer integration, and lower CI resource usage than Cypress
- `@axe-core/playwright ^4.11.1`: Accessibility auditing in E2E — Deque's official Playwright integration, catches WCAG violations at full-page level, complements existing vitest-axe unit tests
- `@lottiefiles/dotlottie-react` (REMOVE): ~200KB WASM renderer with zero .lottie source assets after 4 milestones; celebrations work without it via confetti + sound + haptics
- `react-joyride@3.0.0-7` (KEEP PINNED): Pre-release but working, dynamically imported, isolated; no stable 3.0.0 has shipped; replacement is scope creep not hardening

**No new runtime dependencies.** @serwist/window is already present. idb-keyval versioning is a 5-line code change. react-error-boundary is explicitly not needed given the existing custom ErrorBoundary.

### Expected Features

This milestone's "features" are infrastructure and correctness work, not user-facing capabilities.

**Must have (table stakes — prevent production incidents):**
- Error.tsx sanitization + bilingual rendering — raw `error.message` exposes SQL/stack traces; Burmese-primary users see English-only errors in all 3 error.tsx files
- Component-level error boundaries on InterviewSession, PracticeSession, TestPage, CelebrationOverlay — single root boundary means any feature crash kills the entire app
- Service worker update notification — skipWaiting: true silently swaps versions mid-session; users see stale pages with no explanation
- Shared renderWithProviders test utility — prerequisite for all provider and view tests; without it every test file reinvents provider wrappers
- Coverage thresholds on business-critical lib files — fsrsEngine, answerGrader, readinessEngine have tests but no threshold; coverage silently regresses
- Playwright E2E setup + 7 critical flow tests — zero E2E coverage on auth, study, sync, and interview flows; regressions reach users undetected
- lint:css in CI — CSS regressions currently caught only locally
- Dead code cleanup (DotLottie, safeAsync, redundant RLS policies) — 200KB dead WASM and dead test files inflate build and confuse coverage

**Should have (resilience and maintainability differentiators):**
- Provider ordering guard (dev-time) — 10-provider chain has caused 2 production bugs; runtime sentinel catches reordering before it ships
- Context provider unit tests (8 of 10 providers untested) — provider bugs have reached production; providers are the hardest part of the app to debug
- Settings sync conflict resolution (per-field LWW timestamps) — server-wins strategy silently drops offline settings changes on login
- Automated WCAG 2.2 audit — glass-morphism contrast and touch targets unverified; axe-core catches ~57% of issues automatically
- IndexedDB cache versioning — version field exists in offlineDb.ts but is never checked on read
- Sentry error fingerprinting — network/IndexedDB errors each create separate Sentry issues; noise obscures real errors

**Defer until E2E safety net is complete:**
- InterviewSession decomposition — 1,474 lines, 9-phase state machine, 29 callbacks; cannot be safely extracted until full interview E2E coverage exists
- Page-level view tests — E2E covers critical paths more efficiently than JSdom view tests
- react-joyride stable migration — wait for upstream 3.0.0 stable release; working, isolated, non-critical

**Anti-features (do not implement in this milestone):**
- Visual regression testing (Percy/Chromatic) — maintenance burden extreme for solo dev; manual visual QA + axe-core is sufficient
- Full CRDT sync engine — CRDTs add 30-100KB; single-user, one-device-at-a-time conflict window makes per-field LWW timestamps sufficient
- 100% coverage target — diminishing returns past 70-80% for UI code; tiered thresholds are correct
- MSW for E2E tests — E2E should hit real endpoints; Playwright route interception handles specific flaky scenarios

### Architecture Approach

The hardening integrates into the existing architecture at 12 well-defined touchpoints (H1-H12) without structural changes to the provider tree, routing, or data layer. New files are additive (ErrorFallbackUI.tsx, providerOrderGuard.ts, useServiceWorkerUpdate.ts, renderWithProviders.tsx). Modified files receive targeted changes — typically 1-5 lines per file for the distributed settings sync, provider guard registration, and error boundary wrapping. The biggest structural addition is extracting a shared ErrorFallbackUI component from ErrorBoundary.tsx so both the React error boundary and the Next.js error.tsx files share bilingual sanitized error display without code duplication.

**Major components and changes:**
1. `ErrorFallbackUI.tsx` (new) — shared bilingual error fallback used by ErrorBoundary, error.tsx, and feature-level boundaries; reads language mode from localStorage directly (no context dependency)
2. `providerOrderGuard.ts` (new) — module-scoped mount registration; each provider calls registerProvider() on mount in dev mode only; fires before first render assertions pass
3. `useServiceWorkerUpdate.ts` (new) — hook consuming raw ServiceWorker API; exposes { updateAvailable, applyUpdate }; consumed in NavigationShell; no new provider needed
4. `renderWithProviders.tsx` (new) — configurable test wrapper using real providers for pure-React contexts (Language, Theme, Toast, State) and mocked values for external deps (Supabase, IndexedDB, speechSynthesis)
5. `settingsSync.ts` (modified) — adds markLocalSettingsChanged() timestamp tracking + per-field LWW merge logic on login; 4 call sites each get 1 new line
6. `sw.ts` (modified) — skipWaiting: false + SKIP_WAITING message listener; client controls activation timing via postMessage
7. CI pipeline (modified) — separate e2e-tests job parallel with unit-tests; lint:css added to lint-typecheck job; lint:css currently missing from CI entirely

The settings sync fix is deliberately minimal: distributed pattern preserved, no new centralized hook. The SW update notification is a hook, not a new provider — the state is a single boolean consumed in 1-2 places, which does not warrant adding to the fragile 11-provider chain.

### Critical Pitfalls

1. **E2E flakiness on 11-provider async hydration** — The AuthProvider alone triggers 4+ async Supabase queries on mount; SRSProvider reads from IndexedDB; tests written against DOM state that depends on async hydration are intermittently flaky in CI. Prevention: implement data-app-ready attribute gating on all providers initializing before writing any E2E tests; mock Supabase via page.route() for deterministic timing. This must exist before the first test is written or every test is retroactively flaky.

2. **SW update infinite reload loop** — With skipWaiting: true, a controllerchange listener calling window.location.reload() loops indefinitely on every deployment. The cached SW triggers controllerchange, the page reloads, the next SW activates, fires controllerchange again. Prevention: change to skipWaiting: false, require explicit user action (toast "Update now" button), guard with a reloading flag. This is the highest-risk change in the milestone — a defect in a cached SW is hard to push a fix for.

3. **Coverage thresholds immediately blocking CI** — A global threshold fails against InterviewSession.tsx (1,474 lines, 0% covered), PracticeSession.tsx (1,018 lines, 0% covered), and 14 untested page views. Prevention: use per-file thresholds exclusively, added simultaneously with the test file for each module; enable autoUpdate: true so thresholds ratchet automatically without manual bumps.

4. **Error boundary reset loses in-progress session state** — Error boundary reset remounts InterviewSession from scratch; all in-progress state (question index, transcript, timer, audio player) is lost. Prevention: ensure saveSessionSnapshot fires via componentDidCatch before showing fallback; offer "Resume session" from IndexedDB on remount. Do not add error boundaries without also adding session save-on-error.

5. **InterviewSession decomposition breaks the 9-phase state machine** — 29 useCallback hooks form an interconnected dependency web; extracting sub-components that own logic causes stale closures, audio player recreation, and lost ref access. Prevention: extract rendering only (JSX per phase into UI child components), keep all useState/useRef/useCallback in the parent; defer until E2E interview coverage exists; verify full 20-question interview flow after each extraction step.

6. **Provider ordering guard false positives** — JSX nesting order detection is fragile; class components (ErrorBoundary), conditional providers, and formatters all break string-based detection. Prevention: use module-scoped mount registration (registerProvider() in useEffect/componentDidMount), warn in dev only, never throw; the existing useAuth() throws are often sufficient enforcement on their own.

## Implications for Roadmap

The pitfall analysis and feature dependency graph converge on the same phase ordering. The primary constraint: test infrastructure must precede architecture changes, and architecture changes must precede component decomposition. The SW update change must have E2E verification before shipping due to the cached-SW rollback difficulty.

### Phase 1: Test Infrastructure and Quick Wins
**Rationale:** Every subsequent phase changes working code. A safety net must exist first. Quick wins (lint:css, dead code, coverage thresholds) ship high-value, low-risk improvements immediately without blocking anything downstream.
**Delivers:** renderWithProviders utility and mockContextValues; Playwright config, e2e/ directory, data-app-ready attribute implementation; Playwright CI job (separate from unit-tests, parallel); lint:css step added to CI lint-typecheck job; dead code removal (DotLottie, safeAsync, redundant RLS policies); coverage thresholds expanded to all tested src/lib/ files; package.json test:e2e script
**Addresses:** Testing infrastructure gaps, 200KB dead WASM, coverage regression risk
**Avoids:** Pitfall 1 (data-app-ready must exist before first test), Pitfall 2 (per-file thresholds only, added incrementally), DotLottie WASM hanging in jsdom (removed before context provider tests are written)

### Phase 2: Security and Error Resilience
**Rationale:** Error.tsx sanitization is a security issue (raw SQL/stack traces exposed to users) and the simplest change in the milestone. Component-level error boundaries and provider guard are independent of E2E tests. All are low-to-medium risk with no state machine changes.
**Delivers:** All 3 error.tsx files sanitized + bilingual; ErrorFallbackUI shared component extracted from ErrorBoundary.tsx; feature-level ErrorBoundaries on InterviewSession, PracticeSession, TestPage, CelebrationOverlay with session save-on-error via componentDidCatch; providerOrderGuard dev-time sentinel (warn only, dev mode only); Sentry fingerprinting by operation context
**Addresses:** Raw error.message leak, English-only errors for Burmese users, full-app crash on feature error
**Avoids:** Pitfall 4 (error boundary state loss — session save before fallback show required), Pitfall 6 (provider guard false positives — warn never throw)

### Phase 3: PWA and Sync Resilience
**Rationale:** SW update UX and settings sync conflict resolution are independent of testing and error handling. Both affect core offline-first reliability. The SW change requires E2E verification via Phase 1's Playwright setup before shipping.
**Delivers:** skipWaiting: false + SKIP_WAITING message handler in sw.ts; useServiceWorkerUpdate hook; bilingual update toast in NavigationShell with session-lock guard (suppressed during active test/interview); per-field LWW settings sync with markLocalSettingsChanged() at 4 call sites + merge logic in settingsSync.ts; IndexedDB cache versioning (5-line version check in offlineDb.ts)
**Addresses:** Stale version mid-session, offline settings silently overwritten on login, stale questions after content update
**Avoids:** Pitfall 3 (infinite reload loop — user-triggered update only, reloading guard, skipWaiting: false), SW update toast during active session (NavigationProvider.isLocked check)

### Phase 4: Unit Test Expansion
**Rationale:** With renderWithProviders from Phase 1 and a stable provider tree from Phase 2, writing provider tests is straightforward. Thresholds are added file-by-file as each test is written, never speculatively.
**Delivers:** Tests for all 8 untested context providers (SupabaseAuthContext, LanguageContext, ThemeContext, TTSContext, SRSContext, SocialContext, OfflineContext, StateContext); per-file coverage thresholds added simultaneously with each test file; key hook tests (useServiceWorkerUpdate, useTestDate)
**Addresses:** Provider bugs reaching production undetected; 8-of-10 providers with zero test coverage
**Avoids:** Pitfall 2 (thresholds added only when test exists, never at 0%, never global)

### Phase 5: E2E Critical Flows and Accessibility
**Rationale:** E2E tests require a stable built app (pnpm build && pnpm start via Playwright webServer), stable provider tree from Phase 2, and working SW update behavior from Phase 3. Accessibility audit requires stable component structure to avoid re-running after further refactoring.
**Delivers:** E2E tests for 7 critical flows (auth login->dashboard, mock test lifecycle, practice session, flashcard sort, offline->online sync, interview session via text input fallback, SW update toast); @axe-core/playwright scans on dashboard, test page, interview, settings pages tagged wcag22aa; vitest-axe expansion for all interactive components; glass-morphism contrast axe exclusion config (per-element, never global rule disable)
**Addresses:** Auth/study/sync regression detection, WCAG 2.2 compliance gaps, glass-morphism contrast false positive management
**Avoids:** E2E against dev server (always test pnpm start), axe false positives on backdrop-filter elements (selector-scoped exclusion, never global), IndexedDB state leaking between test files (newContext() per file + explicit IDB cleanup)

### Phase 6: Component Decomposition
**Rationale:** Decomposing InterviewSession (1,474 lines) is unconditionally last. Full E2E interview coverage from Phase 5 is required to catch regressions. This is a maintainability improvement on working code — correctness is already validated. Attempting this earlier risks breaking the interview flow without a safety net.
**Delivers:** InterviewSession split into useInterviewStateMachine hook + rendering-only sub-components per phase (InterviewGreetingUI, InterviewQuestioningUI, InterviewFeedbackUI, InterviewTransitionUI); parent component under 400 lines; each phase UI component independently testable; all hooks and state remain in parent
**Addresses:** Untestable 1,474-line monolith; cascading changes required for any interview feature
**Avoids:** Pitfall 5 (extract rendering only, not logic; keep all useState/useRef/useCallback in parent; verify full 20-question Practice and Real interview flows after each extraction step; do not memo-wrap without profiling evidence)

### Phase Ordering Rationale

- Phase 1 is unconditionally first: data-app-ready must exist before E2E tests are written (Pitfall 1); dead code removal before coverage thresholds prevents dead test files from inflating calculations (Pitfall 2)
- Phase 2 can technically overlap with Phase 3 in planning (they are independent), but Phase 2 must complete before Phase 4 (provider tests need a stable error handling layer)
- Phase 3 (SW update) requires Phase 1's Playwright config to write the update flow E2E test before shipping
- Phase 4 (unit tests) requires Phase 1 (renderWithProviders) and benefits from Phase 2 (stable error boundaries don't interfere with test renders)
- Phase 5 (E2E) requires Phase 3 (stable SW behavior) and is most effective after Phase 4 (unit tests already cover edge cases; E2E tests cover integration)
- Phase 6 (decomposition) is unconditionally last; it requires the full E2E safety net from Phase 5 and improves maintainability on already-correct code

### Research Flags

Phases needing targeted investigation before or during planning:
- **Phase 3 (SW update UX):** The skipWaiting: false transition has a one-deployment gap where existing users still have skipWaiting: true. Confirm exact rollout behavior — specifically whether the first deploy after the change auto-activates (old SW's skipWaiting: true) and second deploy onward shows the prompt.
- **Phase 5 (E2E IndexedDB isolation):** No reusable Playwright fixture for IndexedDB cleanup exists. Must be built as part of Phase 5 setup — navigate to about:blank + page.evaluate to delete IDB databases per test file.
- **Phase 5 (E2E interview with SpeechRecognition):** SpeechRecognition is unavailable in Playwright Chromium headless. Must confirm whether page.addInitScript mock or text input fallback path is used for interview E2E; decide before writing tests.

Phases with well-documented patterns (skip research-phase):
- **Phase 1 (Playwright setup):** Next.js official docs provide verbatim config including webServer. No novel research needed.
- **Phase 2 (error.tsx sanitization):** Pattern already exists in ErrorBoundary.tsx line 143. Mechanical application.
- **Phase 2 (component-level ErrorBoundary):** Existing ErrorBoundary accepts fallback prop; wrapping 4 views is a one-liner each.
- **Phase 3 (settings LWW):** Architecture doc specifies exact file changes (settingsSync.ts + 4 one-line additions). No research needed.
- **Phase 4 (provider unit tests):** Testing Library renderHook pattern is documented; mock strategy per provider is specified in ARCHITECTURE.md H9.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified against official npm registry and official docs. Playwright 1.58.0 confirmed latest; @axe-core/playwright 4.11.1 peer deps confirmed; @serwist/window confirmed already in dep tree at 9.5.6. |
| Features | HIGH | Based on direct codebase audit with exact file names and line numbers. No speculation. Current state of each gap (e.g., 8-of-10 providers untested, 3 error.tsx files unsanitized) is verified. |
| Architecture | HIGH | Integration points derived from reading actual source files. File modification list specifies exact files with line-level rationale. Data flow diagrams for SW update, settings sync, and error handling are concrete. |
| Pitfalls | HIGH | Critical pitfalls 1 and 3 verified against specific GitHub issues (Workbox #3260 infinite loop, axe-core #2851 backdrop-filter). Pitfall 5 (InterviewSession decomposition) verified against codebase reading of specific line counts and callback dependencies. |

**Overall confidence:** HIGH

### Gaps to Address

- **Supabase E2E strategy (test project vs. route interception):** Research recommends page.route() mocking for Supabase REST calls, but auth state persistence across E2E tests may require a dedicated Supabase test project. Decide before writing E2E auth tests in Phase 5.
- **IDB cleanup fixture:** No reusable Playwright fixture for IndexedDB isolation exists. Must be written as part of Phase 5 setup, not per-test.
- **SpeechRecognition in E2E:** Interview E2E must use text input fallback path or page.addInitScript mock. Clarify approach before Phase 5.
- **lint:css first-run violations:** Run pnpm lint:css locally before adding to CI — may surface existing violations that were never caught. Fix violations before the CI step is added.
- **Settings sync schema migration:** Adding updated_at column to user_settings table is a production Supabase migration. Verify the migration does not break existing sync behavior for users who log in during the migration window.
- **CSP wasm-unsafe-eval audit:** If wasm-unsafe-eval was added to CSP solely for DotLottie WASM, removing DotLottie enables removing that CSP directive too. Audit before and after removal.

## Sources

### Primary (HIGH confidence)
- [Next.js Testing: Playwright](https://nextjs.org/docs/app/guides/testing/playwright) — Playwright setup, webServer config for Next.js
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) — error.tsx vs global-error.tsx scope and constraints
- [Playwright Release Notes](https://playwright.dev/docs/release-notes) — v1.58.0 confirmed latest
- [@axe-core/playwright npm](https://www.npmjs.com/package/@axe-core/playwright) — v4.11.1 peer dependency requirements
- [Vitest Coverage Configuration](https://vitest.dev/config/coverage) — perFile, glob thresholds, autoUpdate
- [@serwist/window Documentation](https://serwist.pages.dev/docs/window) — waiting/controlling events, messageSkipWaiting API
- [Workbox Infinite Loop Issue #3260](https://github.com/GoogleChrome/workbox/issues/3260) — confirmed root cause of SW infinite reload
- [axe-core Color Contrast False Positives #2851](https://github.com/dequelabs/axe-core/issues/2851) — backdrop-filter limitation confirmed
- [React Error Boundaries (react.dev)](https://react.dev/reference/react/Component) — componentDidCatch, getDerivedStateFromError
- [Chrome Developers: Handling SW Updates](https://developer.chrome.com/docs/workbox/handling-service-worker-updates) — skipWaiting patterns and user notification flow
- [Playwright CI Integration](https://playwright.dev/docs/ci) — GitHub Actions job structure, artifact upload
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) — @axe-core/playwright integration guide

### Secondary (MEDIUM confidence)
- [Playwright vs Cypress 2026](https://www.d4b.dev/blog/2026-02-17-why-playwright-seems-to-be-winning-over-cypress-for-end-to-end-testing) — benchmark data for CI resource comparison
- [LWW vs CRDTs](https://dzone.com/articles/conflict-resolution-using-last-write-wins-vs-crdts) — conflict resolution tradeoffs for single-writer apps
- [Modularizing React Apps (Martin Fowler)](https://martinfowler.com/articles/modularizing-react-apps.html) — component decomposition patterns
- [PWA Update Patterns (web.dev)](https://web.dev/learn/pwa/update) — service worker update UX
- [Playwright Flaky Test Research (BrowserStack)](https://www.browserstack.com/guide/playwright-flaky-tests) — async state timing root causes
- [Service Worker Pitfalls (Rich Harris)](https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9) — SW anti-patterns including skipWaiting misuse
- [Slack Automated Accessibility Testing](https://slack.engineering/automated-accessibility-testing-at-slack/) — enterprise a11y CI patterns

### Tertiary (LOW confidence, needs validation)
- [Playwright PWA Testing Guide](https://dev.to/pritig/how-playwright-simplifies-ui-testing-for-progressive-web-apps-pwas-9n8) — PWA-specific E2E patterns
- [WCAG 2.2 Guide (2026)](https://www.vervali.com/blog/accessibility-testing-services-in-2026-the-complete-guide-to-wcag-2-2-ada-section-508-and-eaa-compliance/) — WCAG 2.2 AA criteria coverage by axe-core

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
*Recommended phases: 6*
*Critical path: Phase 1 (Test Infrastructure) -> Phase 2 (Error Resilience) -> Phase 3 (PWA/Sync) -> Phase 4 (Unit Tests) -> Phase 5 (E2E + A11y) -> Phase 6 (Decomposition)*
*Parallel opportunity: Phases 2 and 3 can be planned in parallel; Phase 3 SW change needs Phase 1 Playwright config before shipping*
