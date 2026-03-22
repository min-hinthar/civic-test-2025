# Phase 48 Precontext Research

**Phase:** 48 - Test Infrastructure + Quick Wins
**Milestone:** v4.1 Production Hardening
**Generated:** 2026-03-19
**Protocol:** Deep Phase Assumptions (12-Agent, 2-Wave)

---

## 1. Resolved Assumptions

### Technical Approach
- **renderWithProviders**: Configurable preset system (minimal/core/full) with selective provider inclusion. Default preset covers Language + Toast (78% of components). Full stack matches exact ClientProviders.tsx ordering. Auto-mocking of external services per included provider.
- **Playwright**: Config + webServer + single smoke test to prove setup. Phase 52 writes the 7 real E2E tests. Use `pnpm start` (production build) for CI, `pnpm dev` for local with `reuseExistingServer`.
- **Coverage thresholds**: Per-file thresholds on 22 src/lib/ files with existing test suites, set to CURRENT actual coverage (not aspirational). Global floor at 40% (achievable today without blocking CI).
- **DotLottie removal**: Complete removal of package + component + config fields. Zero visual regression because no .lottie asset files exist in public/. Celebrations continue via confetti + sound + haptics.
- **safeAsync**: Document as reserved infrastructure with JSDoc. Keep exported from async/index.ts. Cost to keep: ~50 LOC, zero runtime impact.
- **Sentry fingerprinting (ERRS-05)**: ALREADY IMPLEMENTED in src/lib/sentry.ts beforeSendHandler. Phase 48 writes verification test, marks requirement as complete.
- **CI lint:css**: Add single step after existing Lint step in ci.yml.
- **Knip**: Install + configure + run with findings addressed. Exclude Next.js entry points, Sentry instrumentation, service worker, test setup files.

### Scope Boundaries
- **IN**: renderWithProviders utility, Playwright config + smoke test, coverage thresholds (22 files + global 40%), DotLottie removal, safeAsync documentation, RLS policy cleanup (5 tables), CI lint:css, Knip dead code scan, ERRS-05 verification
- **OUT**: Writing E2E tests (Phase 52), testing contexts (Phase 51), error.tsx sanitization (Phase 49), provider ordering guard (Phase 49), InterviewSession decomposition (Phase 53)
- **AMBIGUOUS (resolved)**: safeAsync removal vs documentation (KEEP + document), Playwright test writing scope (smoke only), global coverage floor level (40%)

### Implementation Order
1. DotLottie removal (DEPS-01) — simplest, reduces bundle, no dependencies
2. safeAsync documentation (DEPS-02) — small change, reduces dead code noise
3. RLS policy cleanup (DEPS-03) — SQL changes, no code impact
4. CI lint:css (DX-01) — ci.yml change only
5. Coverage thresholds (TEST-11, TEST-12) — vitest.config.ts update
6. renderWithProviders (TEST-01) — largest deliverable, most complex
7. Playwright setup (TEST-02) — requires npm install + config + smoke test
8. Knip setup (DX-02) — install + config + run + address findings
9. ERRS-05 verification — write test for existing fingerprinting

---

## 2. Realistic Data/Scale Analysis

### Test Infrastructure Scale
| Metric | Current | After Phase 48 |
|--------|---------|----------------|
| Test files | 29 | ~32 (add renderWithProviders tests, Playwright smoke, Sentry fingerprint test) |
| Vitest thresholds | 4 files | ~26 files |
| E2E tests | 0 | 1 (smoke only) |
| CI steps | 8 | 10 (+ lint:css, Playwright) |
| Coverage floor | None | 40% global |

### Bundle Impact
| Change | Size Delta |
|--------|------------|
| Remove @lottiefiles/dotlottie-react | -200KB WASM (never loaded, but in dep graph) |
| Add @playwright/test (devDep) | 0 (devDependency, not bundled) |
| Add knip (devDep) | 0 (devDependency, not bundled) |
| Remove safeAsync | ~0 (tree-shaken, never imported) |

### Provider Test Complexity
| Provider | Mount Side Effects | Required Mocks | Complexity |
|----------|-------------------|----------------|------------|
| ErrorBoundary | Sentry capture | Sentry | Low |
| AuthProvider | Supabase auth.getSession, hydrate settings/bookmarks, onAuthStateChange | Supabase client, IndexedDB | High |
| LanguageProvider | localStorage read, document.lang, storage events, Alt+L keyboard | useAuth mock, localStorage | Medium |
| ThemeProvider | localStorage read, matchMedia, system pref changes, View Transitions | useAuth mock, localStorage, matchMedia | Medium |
| TTSProvider | Async engine creation (useEffect), loadVoices, voiceschanged event, localStorage | useAuth mock, speechSynthesis, requestIdleCallback, localStorage | High |
| ToastProvider | State context only | None | Low |
| OfflineProvider | IndexedDB cache check, online status listener | useToast, IndexedDB, navigator.onLine | Medium |
| SocialProvider | Supabase profile load, streak sync, visibility changes | useAuth mock, Supabase, IndexedDB | High |
| SRSProvider | IndexedDB deck load, Supabase sync, visibility changes | useAuth mock, IndexedDB, Supabase | High |
| StateProvider | localStorage read | localStorage | Low |
| NavigationProvider | localStorage sidebar pref, resize/pointer events, media tier | localStorage, matchMedia | Low |

---

## 3. Cross-Phase Contract Inventory

### What Phase 48 Must NOT Break
| Contract | Source | Verification |
|----------|--------|-------------|
| 29 existing test files, 618+ passing tests | v1.0-v4.0 | `pnpm test:run` |
| 4 existing per-file coverage thresholds | Phase 09/38 | vitest.config.ts unchanged |
| CI pipeline (8 steps) | v1.0 | All steps pass |
| Provider nesting order in ClientProviders.tsx | Phase 46 fix | Provider-dependent tests pass |
| Celebration system (confetti + sound + haptics) | Phase 32 | Manual verification after DotLottie removal |
| Sentry PII sanitization pipeline | Phase 38 | Existing errorSanitizer tests pass |
| Pre-commit hooks (Husky + lint-staged) | v1.0 | Hook fires on commit |

### What Phase 48 Feeds to Future Phases
| Deliverable | Consumers | Contract |
|-------------|-----------|----------|
| renderWithProviders (TEST-01) | Phase 49 (error boundary tests), Phase 51 (8 context provider tests) | Configurable provider presets, auto-mocking |
| Playwright config (TEST-02) | Phase 52 (7 E2E tests) | `pnpm test:e2e` executes against production build |
| Coverage thresholds (TEST-11) | Phase 51 (new thresholds with new tests) | Per-file thresholds on src/lib/ |
| Global coverage floor (TEST-12) | All future phases | 40% minimum, escalating in Phase 51+ |
| Clean bundle (DEPS-01) | Phase 47+ performance | DotLottie WASM removed from dep graph |
| CI lint:css (DX-01) | All future phases | CSS regressions caught in CI |

### From Prior Phases
| Phase | Contract Consumed |
|-------|-------------------|
| Phase 01 (Foundation) | Vitest config, test setup file, ESLint config |
| Phase 09 (Testing) | Coverage thresholds pattern, CI pipeline structure |
| Phase 24 (A11y) | vitest-axe matchers, a11y test pattern |
| Phase 38 (Security) | Sentry PII pipeline, safeAsync/withRetry utilities, error sanitizer |
| Phase 39 (Next.js 16) | App Router instrumentation, CI smoke test pattern |
| Phase 46 (Cross-Device) | Provider ordering fix, useAuth in Language/Theme/TTS |

---

## 4. Gotcha Inventory

### Critical
| ID | Gotcha | Feature | Fix Guidance | Source |
|----|--------|---------|-------------|--------|
| G-01 | Provider tree ordering in renderWithProviders must match ClientProviders.tsx exactly. AuthProvider above Language/Theme/TTS, ToastProvider above OfflineProvider | renderWithProviders | Copy exact order from ClientProviders.tsx; test with component calling useAuth inside LanguageProvider | learnings/provider-ordering.md |
| G-02 | CSS specificity: custom classes (.prismatic-border) override Tailwind utilities (.fixed) in production build order | CI lint:css | Verify lint:css catches specificity conflicts; prismatic-border.css already has .prismatic-border.fixed fix | learnings/css-specificity.md |
| G-03 | Myanmar text minimum font size 12px, no positive letter-spacing, line-height 1.6+ | Coverage/testing | Not directly Phase 48 scope but relevant to Playwright setup | learnings/myanmar-typography.md |

### High
| ID | Gotcha | Feature | Fix Guidance | Source |
|----|--------|---------|-------------|--------|
| G-04 | TTSProvider creates engine async in useEffect. Tests need vi.advanceTimersByTime(10) after render | renderWithProviders | Auto-advance timers when TTS provider included in preset | learnings/provider-ordering.md |
| G-05 | Audio players use property-based event handlers (el.onended), not addEventListener. Mocks must support both | Playwright/testing | Include MockAudioElement with property handlers in test setup | learnings/tts-voice-selection.md |
| G-06 | Coverage thresholds must be set to CURRENT actual coverage, not aspirational. Running coverage first is mandatory | Coverage thresholds | Run pnpm test:coverage before setting any thresholds | git history: f46e647 |
| G-07 | Supabase onAuthStateChange deadlock if async calls made inside callback. AuthProvider uses setTimeout(0) defer | renderWithProviders | Auth mock must simulate deferred hydration pattern | debug/session-expired.md |
| G-08 | safeAsync has zero production consumers but full test suite. Removing tests reduces total test count | safeAsync | Document as reserved rather than delete to preserve test count | git: c5b49ab |

### Medium
| ID | Gotcha | Feature | Fix Guidance | Source |
|----|--------|---------|-------------|--------|
| G-09 | Knip may flag voice selection helpers, error-path throws, and test utilities as unused | Knip setup | Configure Knip exclusions for Next.js entry points, Sentry, test files, SW | CONCERNS.md |
| G-10 | DotLottie component has Suspense fallback={null} — already renders nothing. Removal has zero visual impact | DotLottie removal | Safe to delete entirely; verify with grep after | celebrations analysis |
| G-11 | RLS policy cleanup found 5 redundant tables, not just 2 documented in CONCERNS.md | RLS cleanup | Also clean user_settings, user_bookmarks, mock_tests redundant INSERT policies | schema.sql audit |
| G-12 | vitest-axe v0.1.0 extend-expect.js is empty (0 bytes). Must use explicit expect.extend(matchers) | renderWithProviders | Pattern already established in setup.ts; preserve it | Phase 24-01 SUMMARY |
| G-13 | Stylelint 17.3 requires block-level disable/enable for multi-line properties, not inline disable-line | CI lint:css | Already fixed in Phase 39-04; verify lint:css passes before adding to CI | Phase 39-04 SUMMARY |
| G-14 | Tailwind landscape: variant fires on desktop (1920x1080). Must pair with max-md: breakpoint | CI lint:css | Stylelint won't catch this; document as known pattern | learnings/css-specificity.md |

### Low
| ID | Gotcha | Feature | Fix Guidance | Source |
|----|--------|---------|-------------|--------|
| G-15 | ERRS-05 already implemented in src/lib/sentry.ts beforeSendHandler. Don't re-implement | Sentry verification | Write test verifying existing fingerprinting works | sentry.ts analysis |
| G-16 | withRetry IS actively used (8+ import sites). Do not remove from async/index.ts barrel | safeAsync cleanup | Only modify safeAsync exports, keep withRetry untouched | codebase grep |
| G-17 | CI runs test:coverage but local verification uses test:run (no coverage). Threshold failures only surface in CI | Coverage thresholds | Consider adding test:coverage to local verification | CONCERNS.md |

---

## 5. Data Contracts

### renderWithProviders Interface
```typescript
interface RenderWithProvidersOptions {
  preset?: 'minimal' | 'core' | 'full';
  // 'minimal': ErrorBoundary + StateProvider (lightest)
  // 'core': ErrorBoundary + Auth + Language + Theme + Toast + State (default)
  // 'full': All 11 providers in correct order

  providers?: Partial<Record<ProviderName, boolean>>;
  // Override individual providers (applied on top of preset)

  mocks?: {
    user?: User | null;              // AuthProvider mock user
    language?: LanguageMode;          // LanguageProvider initial mode
    theme?: 'light' | 'dark';        // ThemeProvider initial theme
    onLine?: boolean;                 // OfflineProvider network state
  };
}

// Returns standard @testing-library/react RenderResult
function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions
): RenderResult;
```

### Playwright Config Shape
```typescript
// playwright.config.ts
{
  testDir: './e2e',
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: ['chromium', 'firefox', 'webkit'],
}
```

### Coverage Threshold Schema
```typescript
// vitest.config.ts thresholds
{
  global: { lines: 40, functions: 40, branches: 30, statements: 40 },
  // 4 existing per-file thresholds preserved
  // ~18 new per-file thresholds on src/lib/ files with test suites
}
```

---

## 6. Design Compliance Matrix

| Principle | Phase 48 Compliance | Notes |
|-----------|-------------------|-------|
| Offline-first | N/A | Test infrastructure doesn't affect offline behavior |
| Bilingual (en/my) | N/A | No user-facing changes |
| 44px touch targets | N/A | No UI changes |
| Glass-morphism tiers | N/A | No visual changes |
| iOS-inspired UX | N/A | No interaction changes |
| Provider ordering | CRITICAL | renderWithProviders must enforce correct order |
| PII sanitization | VERIFY | ERRS-05 test verifies Sentry PII stripping works |
| Zero TypeScript any | ENFORCE | All new test utilities must use proper types |

---

## 7. Ethical Framework / Brand Constraints

Phase 48 is infrastructure-only. No user-facing content changes. No ethical or brand constraints apply.

---

## 8. Architectural Decisions

### Decision 1: renderWithProviders Preset System
- **Options:** (A) Always mount all 11 providers, (B) Configurable presets, (C) Individual provider flags only
- **Chosen:** (B) Configurable presets with override flags
- **Rationale:** 78% of components need only Language+Toast. Mounting all 11 providers for every test is slow and fragile (requires mocking 5+ external services). Presets give speed + flexibility.

### Decision 2: safeAsync — Keep vs Remove
- **Options:** (A) Delete entirely, (B) Document as reserved infrastructure
- **Chosen:** (B) Document as reserved
- **Rationale:** Zero runtime cost. Removing reduces test count. Result-tuple pattern may be adopted in future error handling work. Cost of keeping: ~50 LOC + JSDoc comment.

### Decision 3: Global Coverage Floor Level
- **Options:** (A) 60% (aggressive), (B) 50% (moderate), (C) 40% (conservative)
- **Chosen:** (C) 40% conservative
- **Rationale:** 8/10 contexts, 14/14 views, 20+ hooks have zero test coverage. A 60% floor would fail CI immediately. 40% is achievable today; Phase 51 escalates to 50-55% after context tests added.

### Decision 4: Playwright webServer Command
- **Options:** (A) `pnpm dev` (fast, HMR), (B) `pnpm build && pnpm start` (production), (C) `pnpm start` (assume pre-built)
- **Chosen:** (A) for local with reuseExistingServer, (B) pattern for CI via pre-build step
- **Rationale:** Production build tests catch production-only issues (CSP, tree-shaking, webpack). Dev mode for local iteration speed.

### Decision 5: Knip vs Manual Dead Code
- **Options:** (A) Manual grep only, (B) Knip automated scan, (C) Both
- **Chosen:** (B) Knip automated with exclusion config
- **Rationale:** DX-02 explicitly requires Knip. Manual grep already identified 3 items; Knip will find more and provide ongoing enforcement.

---

## 9. File Map

### Create
| File | Purpose |
|------|---------|
| `src/__tests__/utils/renderWithProviders.tsx` | Shared test render utility with provider presets |
| `src/__tests__/utils/renderWithProviders.test.tsx` | Tests for the utility itself |
| `playwright.config.ts` | Playwright E2E configuration |
| `e2e/smoke.spec.ts` | Single smoke test proving Playwright setup works |
| `knip.json` | Knip dead code detection config |

### Modify
| File | Change |
|------|--------|
| `vitest.config.ts` | Add ~18 per-file thresholds + global 40% floor |
| `package.json` | Remove @lottiefiles/dotlottie-react; add @playwright/test, knip devDeps; add e2e, knip scripts |
| `.github/workflows/ci.yml` | Add lint:css step; add Playwright install + run steps |
| `src/components/celebrations/CelebrationOverlay.tsx` | Remove DotLottie import, config fields, render block |
| `src/components/celebrations/index.ts` | Remove DotLottieAnimation export |
| `src/lib/async/index.ts` | Keep safeAsync export but add JSDoc reservation comment |
| `src/lib/async/safeAsync.ts` | Add JSDoc marking as reserved infrastructure |
| `supabase/schema.sql` | Remove 5 redundant INSERT policies |
| `.lintstagedrc.json` | Add CSS linting to pre-commit (optional enhancement) |

### Delete
| File | Reason |
|------|--------|
| `src/components/celebrations/DotLottieAnimation.tsx` | DEPS-01: no .lottie assets, 200KB WASM waste |

### Read (verification)
| File | Purpose |
|------|---------|
| `src/lib/sentry.ts` | Verify ERRS-05 fingerprinting exists |
| `src/components/ClientProviders.tsx` | Reference for provider ordering |

---

## 10. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence | Evidence |
|---|-----------|-----------|-----------|----------|
| 1 | renderWithProviders: mock all or selective? | Selective presets (minimal/core/full) | HIGH (95%) | 78% of components need only Language+Toast |
| 2 | Playwright: how much scaffold? | Config + smoke test only | HIGH (93%) | Phase 52 writes real tests; Phase 48 = infrastructure |
| 3 | Coverage: current vs aspirational thresholds? | Current actual coverage (run test:coverage first) | HIGH (92%) | Git history: per-file model never lowered (f46e647) |
| 4 | safeAsync: remove vs document? | Document as reserved | HIGH (96%) | Zero runtime cost; removing reduces test count |
| 5 | Knip exclusions? | Next.js entries, Sentry, SW, test setup | HIGH (88%) | Standard Knip configuration for Next.js projects |
| 6 | ERRS-05 done already? | Yes, write verification test only | HIGH (97%) | beforeSendHandler has network/IndexedDB/TTS fingerprinting |
| 7 | Global coverage floor level? | 40% (conservative, achievable today) | HIGH (88%) | 8/10 contexts + 14 views untested = low baseline |
| 8 | RLS cleanup scope? | 5 tables not 2 (also user_settings, user_bookmarks, mock_tests) | HIGH (97%) | schema.sql audit found 5 ALL+INSERT redundancies |

---

## 11. Expanded Gotcha Inventory (Wave 2 Findings)

### DotLottie Removal Safety
- CelebrationOverlay.tsx LEVEL_CONFIG has 4 levels with dotLottieSrc fields
- Only burst/celebration/ultimate reference .lottie files (sparkle has null)
- Suspense fallback={null} means component never rendered visible content
- Celebration system layers: confetti (canvas) + sound (Web Audio) + haptics (Vibration API) — ALL independent of DotLottie
- No visual regression expected; celebrations unchanged

### RLS Policy Audit (Extended)
5 tables with redundant INSERT policies where ALL policy already covers INSERT:
1. `streak_data` — "Users can insert own streak data" redundant with "Users can manage own streak data" (ALL)
2. `earned_badges` — "Users can insert own badges" redundant with "Users can manage own badges" (ALL)
3. `user_settings` — "Users can insert own settings" redundant with "Users can manage own settings" (ALL)
4. `user_bookmarks` — "Users can insert own bookmarks" redundant with "Users can manage own bookmarks" (ALL)
5. `mock_tests` — "Users can insert their own mock tests" redundant with "Users can manage their own mock tests"

### Debug Record Patterns
- **Session deadlock** (41f0018): Auth context uses setTimeout(0) to defer Supabase calls out of onAuthStateChange lock. renderWithProviders auth mock must simulate this pattern.
- **Provider ordering crash** (e2dfdb9): Phase 46 added useAuth() to Language/Theme/TTS but they were above AuthProvider. Fixed by reordering. renderWithProviders must enforce this order.
- **Interview mode bugs** (ca6a3e3): Logic bugs in feedback rendering missed by unit tests. Validates need for E2E tests in Phase 52.

---

## 12. Design Token Audit Results

Phase 48 makes no visual changes. No design token modifications required. DotLottie removal does not affect any design tokens, CSS custom properties, or Tailwind configuration.

---

## 13. Requirements Traceability

| Requirement | Phase 48 Deliverable | Status |
|-------------|---------------------|--------|
| TEST-01 | renderWithProviders utility | To implement |
| TEST-02 | Playwright E2E config + smoke test | To implement |
| TEST-11 | Per-file coverage thresholds on ~18 src/lib/ files | To implement |
| TEST-12 | Global 40% coverage floor | To implement |
| DEPS-01 | DotLottie package + component removed | To implement |
| DEPS-02 | safeAsync documented as reserved | To implement |
| DEPS-03 | 5 redundant RLS INSERT policies removed | To implement |
| DX-01 | lint:css added to CI pipeline | To implement |
| DX-02 | Knip installed, configured, findings addressed | To implement |
| ERRS-05 | Sentry fingerprinting VERIFIED (already implemented) | To verify |

---

*Precontext research generated: 2026-03-19*
*Protocol: 12-agent, 2-wave deep analysis*
*Agent sources: 6 Wave 1 + 6 Wave 2 Explore agents*
