# Pitfalls Research: Production Hardening an Existing Next.js PWA

**Domain:** Adding E2E tests, security hardening, architecture resilience, accessibility compliance, dependency cleanup, and large component decomposition to a 78K LOC bilingual Next.js 16 PWA with 11 context providers, offline-first IndexedDB, and Supabase sync.
**Researched:** 2026-03-19
**Confidence:** HIGH (based on codebase audit of specific files at risk, official Playwright/Serwist/axe-core docs, and verified community reports of the exact failure modes described)

---

## Critical Pitfalls

Mistakes that break existing functionality, block CI, or require significant rollback.

---

### Pitfall 1: E2E Tests Flake on IndexedDB and Supabase Async State

**What goes wrong:**
Playwright tests interact with pages that hydrate context providers which read from IndexedDB (SRS deck, sessions, bookmarks, sync queue) and Supabase (auth, settings, test history). These async operations resolve at unpredictable times. Tests written against DOM state that depends on async hydration pass locally (fast machine, warmed IDB) and fail in CI (cold start, resource-constrained runner). The `AuthProvider` alone triggers `hydrateFromSupabase()` which makes 4+ async Supabase queries on mount. `SRSProvider` reads from IndexedDB. `OfflineProvider` checks cache status. A test that navigates to `/home` and asserts on dashboard content may see the loading skeleton, the auth redirect, or the fully hydrated dashboard depending on timing.

**Why it happens:**
Playwright's auto-wait handles DOM readiness but not application state readiness. `waitForSelector('[data-testid="dashboard"]')` resolves when the element appears, but the element may render with stale/partial data that updates milliseconds later. The 11-provider cascade in `ClientProviders.tsx` means state settles over multiple ticks: Auth resolves, then Language/Theme/TTS read from it, then OfflineProvider checks cache, then SRS loads deck. Each provider's `useEffect` fires in order but asynchronously.

**How to avoid:**
1. Create a `data-app-ready` attribute on the root element that only sets `true` after ALL providers have initialized. Check the `isLoading` states from `useAuth()`, SRS deck load, and offline cache check.
2. In Playwright tests, always `await page.waitForSelector('[data-app-ready="true"]')` before any assertions.
3. Mock Supabase at the network level using `page.route('**/rest/v1/**', ...)` to return deterministic data with controlled timing.
4. For IndexedDB, use Playwright's `browserContext.storageState()` with `indexedDB` option (available since Playwright 1.49) to pre-seed known state.
5. Set explicit timeouts on CI: `expect(locator).toBeVisible({ timeout: 10000 })` for first-paint assertions.

**Warning signs:**
- Tests pass in `--headed` mode but fail in `--headless`
- Tests pass when run individually but fail in parallel
- CI failure rate > 5% on the same test

**Phase to address:**
Phase 1 (E2E test framework setup). The `data-app-ready` attribute must be implemented BEFORE writing any E2E tests, or every test written will be retroactively flaky.

---

### Pitfall 2: Coverage Thresholds Block CI on Existing Uncovered Code

**What goes wrong:**
Setting a global coverage threshold (e.g., 60% lines) immediately fails CI because the existing 34 test files only cover `src/lib/` utilities and a few components. The 8 untested context providers, 14 untested page views, and 20+ untested hooks represent the majority of lines. A global threshold of even 30% may not pass. The developer adds new tests for providers, passes locally, then CI fails because the threshold also enforces coverage on `InterviewSession.tsx` (1,474 lines, 0% covered) and `PracticeSession.tsx` (1,018 lines, 0% covered).

**Why it happens:**
Coverage thresholds are all-or-nothing per scope. Vitest's `thresholds` config applies per-file patterns, but a global threshold applies to ALL included files. The existing config in `vitest.config.ts` only has 4 per-file thresholds. Adding a global threshold retroactively punishes all existing untested code.

**How to avoid:**
1. Do NOT set a global coverage threshold. Use per-file thresholds exclusively.
2. Add thresholds only for files that ALREADY have tests or that you are writing tests for in this milestone. The existing pattern in `vitest.config.ts` (per-file thresholds for `shuffle.ts`, `saveSession.ts`, `errorSanitizer.ts`, `ErrorBoundary.tsx`) is correct.
3. For new provider tests, add thresholds at the same time: `'src/contexts/LanguageContext.tsx': { lines: 70 }`.
4. Consider a "ratchet" approach: measure current coverage, set threshold at current level, only allow increases. But this requires tooling (codecov/coveralls) that may be overkill for a solo project.
5. For CI, use `--passWithNoTests` and per-file thresholds, not global.

**Warning signs:**
- CI fails on `pnpm test:coverage` immediately after adding thresholds
- Developer has to lower thresholds repeatedly to unblock PRs
- Threshold set so low it catches nothing (2%)

**Phase to address:**
Phase with unit test expansion (provider tests, view tests). Add thresholds incrementally as each file gets tested.

---

### Pitfall 3: Service Worker Update Toast Causes Infinite Reload Loop

**What goes wrong:**
Adding a `controllerchange` event listener that calls `window.location.reload()` creates an infinite loop. The new service worker activates (due to `skipWaiting: true`), fires `controllerchange`, the page reloads, the SW is already active, but the reload triggers another `controllerchange` because the browser re-evaluates the SW registration, and the cycle repeats. This is especially dangerous because the current `sw.ts` uses both `skipWaiting: true` AND `clientsClaim: true`, meaning the new SW takes control immediately without waiting for the user to close all tabs.

**Why it happens:**
The `controllerchange` event fires whenever the service worker controlling the page changes. With `skipWaiting: true`, this happens automatically on every new deployment. If the reload handler does not guard against re-triggering, the page enters a reload loop. The user sees an endlessly refreshing page with no way to stop it (the SW is cached and keeps triggering).

**How to avoid:**
1. Track whether a reload has already been triggered using a flag: `let reloading = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; window.location.reload(); });`
2. Better approach: Do NOT auto-reload. Show a toast notification with an explicit "Update now" button. Only reload when the user clicks it.
3. Store the shown-toast state in `sessionStorage` so it survives the brief flash but not across sessions: `sessionStorage.getItem('sw-update-dismissed')`.
4. Remove `skipWaiting: true` from `sw.ts` and instead use the "prompt to update" pattern: detect the waiting worker via `registration.waiting`, show the toast, and only call `registration.waiting.postMessage({ type: 'SKIP_WAITING' })` when the user clicks "Update."
5. Add a version check: only show the toast if the new SW version differs from the current one.

**Warning signs:**
- Page keeps reloading in production after a deployment
- Users report the app is "broken" / "keeps refreshing"
- Lighthouse audit shows service worker registration churn

**Phase to address:**
Phase handling service worker update UX. This is the single most dangerous change in the PWA hardening work because it affects every deployed user simultaneously.

---

### Pitfall 4: Provider Ordering Guard Creates False Positive Crashes

**What goes wrong:**
A dev-time `ProviderOrderGuard` component that validates the provider tree order at runtime throws errors for valid configurations. The guard checks that each provider can access its dependencies (e.g., `LanguageProvider` calls `useAuth()` so it must be inside `AuthProvider`). But the guard itself must be inside all providers to read their contexts, creating a chicken-and-egg problem. Alternatively, the guard checks at the `ClientProviders` level using JSX children inspection, but React.Children.toArray flattens fragments, and wrapper components (ErrorBoundary is a class component, not a function component) break the detection logic.

**Why it happens:**
Provider ordering is a tree-nesting problem, not a linear-array problem. The guard must understand that `<A><B><C>{children}</C></B></A>` means C is inside B inside A. But React's children API does not provide parent context. A guard that inspects `ClientProviders.tsx`'s JSX source at dev time is fragile because code formatters, wrapper components, and conditional providers all break string-based detection.

**How to avoid:**
1. Use a simple runtime sentinel approach: each provider sets a `__providerName` value in its context. Dependencies check for the sentinel on mount. Example: `AuthProvider` sets `{ __isAuthProvider: true }` in its context. `LanguageProvider`'s `useEffect` checks `if (!authContext?.__isAuthProvider) console.error(...)`.
2. Only warn in development (`process.env.NODE_ENV === 'development'`), never throw. A false-positive throw in production would crash the entire app.
3. Avoid an "order guard component" entirely. Instead, add a single `useProviderDebugCheck()` hook in `ClientProviders.tsx` that runs only in dev and verifies the expected contexts are available.
4. Document the ordering contract in a comment (already done in `ClientProviders.tsx` lines 23-33) and rely on the existing runtime throw from `useAuth()`/`useToast()` when called outside their provider as the enforcement mechanism. Those throws already produce clear error messages.
5. Add an integration test that renders `ClientProviders` and asserts no errors thrown -- this is cheaper and more reliable than a runtime guard.

**Warning signs:**
- Guard triggers on valid code after a formatting change
- Guard requires maintenance every time a provider is added/removed
- Guard logic is more complex than the providers it guards

**Phase to address:**
Phase handling architecture resilience / provider ordering. Consider whether this is worth the complexity -- the existing throws from `useAuth()` etc. may be sufficient.

---

### Pitfall 5: InterviewSession Decomposition Breaks State Machine

**What goes wrong:**
`InterviewSession.tsx` (1,474 lines) manages a complex state machine with 9 phase states (`greeting`, `chime`, `typing`, `reading`, `responding`, `transcription`, `grading`, `feedback`, `transition`), 29+ `useCallback` hooks, cross-phase dependencies (audio players shared across phases, message log accumulates across all phases, timer state affects multiple phases), and a session snapshot save that captures the full state. Extracting sub-components (e.g., `InterviewGreeting`, `InterviewResponding`) requires threading this shared state through props or a shared context. Incorrectly splitting the state machine causes:
- Phase transitions that reference stale closures from the parent
- Audio players that get recreated on sub-component remount (Chrome 15s speech cutoff workaround lost)
- The `saveSessionSnapshot` callback losing access to current state
- `useRef` values in the parent not being readable by child components

**Why it happens:**
The component was designed as a single unit where all callbacks close over the same scope. The 29 `useCallback` hooks reference each other, `useRef` values, and state variables in an interconnected web. Extracting a sub-component means lifting state up or passing it down, but the dependencies form a directed graph, not a clean tree.

**How to avoid:**
1. Extract RENDERING only, not logic. Keep all `useState`, `useRef`, `useCallback` in the parent `InterviewSession.tsx`. Create child components like `InterviewGreetingUI` that receive only the props they need to render, plus event handlers as callbacks.
2. Do NOT extract the phase state machine into a separate hook yet. The callbacks form a dependency cycle that `useReducer` could solve, but converting 29 `useCallback`s to reducer actions is a rewrite, not a decomposition.
3. Start with the simplest extraction: the JSX return statement currently has a large phase-based switch/conditional. Extract each phase's JSX into a `<PhaseRendererXxx>` component that receives pre-computed props. The parent still owns all logic.
4. Verify after each extraction: run the full interview flow (Practice mode: all 20 questions, Real mode: early termination). Check audio playback, speech recognition, timer, session save, and transcript.
5. Do NOT memo-wrap the extracted components unless profiling shows re-render cost. The parent re-renders on every phase transition anyway, and passing 10+ props through `React.memo` creates more complexity than it saves.

**Warning signs:**
- Extracted component re-mounts on phase transition (loses internal state)
- Audio stops playing mid-sentence after extraction
- Session snapshot saves incomplete data
- TypeScript errors from missing callback dependencies

**Phase to address:**
Phase handling component decomposition. This should be one of the LAST tasks, not one of the first, because it requires thorough E2E test coverage of the interview flow to catch regressions.

---

### Pitfall 6: Error Boundary Insertion Resets Component State on Recovery

**What goes wrong:**
Adding component-level error boundaries around `InterviewSession`, `PracticeSession`, `TestPage`, and `CelebrationOverlay` means that when an error occurs in (say) `InterviewSession`, the error boundary catches it and shows a fallback. When the user clicks "Try again," the error boundary resets, which REMOUNTS `InterviewSession` from scratch. All in-progress interview state is lost: current question index, transcript, accumulated results, timer position, audio player state. The user loses their entire interview session with no way to recover it.

**Why it happens:**
Error boundary reset (`this.setState({ hasError: false })`) causes React to re-render the children tree. Since the error boundary wraps the entire component, the child component remounts from scratch. There is no mechanism in React to "resume" a component after an error boundary catches.

**How to avoid:**
1. For stateful features (Interview, Practice, Test), save session state to IndexedDB BEFORE the error boundary catches. The existing `saveSessionSnapshot` in `InterviewSession.tsx` (line 674) writes to IndexedDB. Ensure this fires on error via `componentDidCatch` or a global error handler, not just on user-triggered saves.
2. When the error boundary resets and the component remounts, check for a saved session snapshot in IndexedDB and offer to resume. The session persistence infrastructure (24h expiry) already exists.
3. For `CelebrationOverlay`, state loss is acceptable -- confetti restarting is not a problem. Use a simple error boundary with `fallback={null}` (swallow the error, hide the celebration).
4. Add the `onError` callback prop to the existing `ErrorBoundary` component. Use it to trigger `captureError()` + session save before showing the fallback.
5. Use granular boundaries: wrap the interview phase renderer, not the entire `InterviewSession`. If the greeting phase crashes, the user can still recover mid-interview by remounting just the greeting sub-component.

**Warning signs:**
- User reports "lost my progress" after seeing an error screen
- Interview session snapshots in IndexedDB are stale (not updated on crash)
- Error boundary fallback shown during interview has no "resume" option

**Phase to address:**
Phase handling error boundaries. Must be designed alongside the session persistence check in the Interview/Practice/Test components. Do NOT add error boundaries without also adding session save-on-error.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Global `data-testid` on every element | Easy Playwright selectors | Pollutes HTML, couples tests to implementation | Never globally. Use only on key interaction points (buttons, major sections) |
| Mocking all providers in unit tests | Fast test setup | Tests pass but components break in real provider tree | Acceptable for pure logic tests. Integration tests must use real providers. |
| `skipWaiting: true` with auto-reload | Users always get latest version | Infinite reload loops, mid-session interruption | Never with auto-reload. OK with user-initiated update toast. |
| Per-file coverage thresholds at 100% | Catches all regressions | New features in the file immediately fail CI | Only for pure utility functions (`shuffle.ts`). 70-80% for components. |
| Suppress axe-core rules globally | No false positives | Real violations go undetected | Only for rules that genuinely cannot apply (e.g., `color-contrast` with `backdrop-filter`). Always suppress per-test, never globally. |
| DotLottie dependency kept "for later" | No code change needed | 200KB WASM in dependency tree, zero output, `@lottiefiles/dotlottie-react@0.18.2` is pre-release | Never. Remove now or source the assets now. |

---

## Integration Gotchas

Common mistakes when connecting hardening tools to the existing codebase.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Playwright + Supabase auth | Using real Supabase credentials in E2E tests, hitting rate limits and creating test user pollution | Mock Supabase at the network layer with `page.route()`. Or use a dedicated Supabase test project with separate credentials in CI env vars. |
| Playwright + service worker | Tests start with stale SW from previous run, causing inconsistent caching behavior | Use `browser.newContext({ serviceWorkers: 'block' })` for non-PWA tests. Only enable SW in dedicated PWA test suite. |
| Playwright + IndexedDB | Tests share IndexedDB state across test files because Playwright reuses browser context | Create a fresh `browser.newContext()` per test file. Use `context.clearCookies()` + `context.clearPermissions()` but note: these do NOT clear IndexedDB. Must navigate to `about:blank` and use `evaluate` to delete IDB databases. |
| axe-core + glass-morphism | `color-contrast` rule fails on elements with `backdrop-filter: blur()` because axe cannot compute the effective background color behind the blur | Use `axe.configure({ rules: [{ id: 'color-contrast', selector: ':not(.glass-light):not(.glass-medium):not(.glass-heavy)' }] })` to exclude glass elements, then manually verify glass contrast with a screenshot comparison tool. |
| axe-core + Burmese text | `lang` attribute on Burmese text elements may trigger `valid-lang` violations if `my` (Myanmar) is not recognized | Ensure `<html lang="en">` is set and Burmese text blocks use `<span lang="my">`. The `my` language tag is valid per BCP 47. |
| Vitest + context providers | Each test file creates its own mock wrapper, duplicating provider setup across 20+ test files | Create `src/__tests__/utils/renderWithProviders.tsx` that wraps components in a configurable subset of the real provider tree. Allow overriding individual contexts via props. |
| Sentry fingerprinting + async errors | All `IndexedDB` errors grouped as one issue, all `fetch` errors as another, losing actionable specificity | Fingerprint by operation context: `[error.name, context.operation]`. Use the existing `captureError(error, { operation: '...' })` pattern to include operation in the Sentry event. |

---

## Performance Traps

Patterns that work in development but degrade in CI or production.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| E2E test parallelism exceeding CI runner memory | Tests timeout or crash with OOM. GitHub Actions Ubuntu runners have 7GB RAM. Each Playwright browser context uses ~100-200MB. | Set `workers: 2` in CI (not auto-detect). Run test shards if > 20 E2E tests. | > 10 parallel browser contexts on a 7GB runner |
| Coverage instrumentation slowing test suite | `pnpm test:coverage` takes 3x longer than `pnpm test:run`. Adding 50+ provider/view tests makes CI exceed 10-minute timeout. | Run coverage only on the files being tested: `--coverage.include='src/contexts/**'`. Or run coverage in a separate CI step from the main test run. | > 100 test files with V8 coverage instrumentation |
| axe-core full-page scan on every component test | Each `toHaveNoViolations()` call takes 200-500ms. With 50 component tests, this adds 10-25 seconds. | Run axe checks in a dedicated a11y test suite, not in every component test. Use `vitest-axe` only in files under `src/__tests__/a11y/`. | > 50 tests with axe assertions |
| Playwright video/trace recording in CI | Each test records video (10-50MB) and trace (5-20MB). A 30-test suite generates 500MB+ artifacts. | Only record on failure: `use: { video: 'retain-on-failure', trace: 'retain-on-failure' }`. Set artifact retention to 3 days. | > 20 E2E tests with always-on recording |
| DotLottie WASM loading in test environment | `@lottiefiles/dotlottie-react` attempts to load WASM in jsdom, which does not support WASM. Tests hang or fail with opaque errors. | Mock the DotLottie component in test setup: `vi.mock('@lottiefiles/dotlottie-react', () => ({ DotLottieReact: () => null }))`. Or remove the dependency entirely (no .lottie assets exist). | Any test that imports CelebrationOverlay |

---

## Security Mistakes

Domain-specific security issues relevant to the hardening work.

| Mistake | Risk | Prevention |
|---------|------|------------|
| `error.tsx` pages rendering raw `error.message` without sanitization | Internal error details (stack traces, SQL errors, Supabase URLs) leaked to users | Apply `sanitizeError()` from `src/lib/errorSanitizer.ts` in all 3 `error.tsx` files. The `ErrorBoundary` component already does this correctly -- mirror that pattern. |
| E2E test credentials committed to repo | Supabase service role key or test user passwords in Playwright config | Use GitHub Actions secrets for Supabase credentials. Use `dotenv` in `playwright.config.ts` to load from `.env.test.local` (gitignored). |
| Playwright screenshots containing user data | Screenshots captured on test failure may contain PII from test data (email, names) | Use obviously fake test data: `test@example.com`, `Test User`. Set artifact retention to 3 days. Never screenshot auth pages with real credentials. |
| Sentry fingerprinting too coarse | Grouping all network errors suppresses genuine new error patterns, creating blind spots | Fingerprint by `[error.name, context.operation, url.pathname]`. Keep default grouping for non-network errors. |
| Removing DotLottie breaks CSP if `wasm-unsafe-eval` was added for it | Unused CSP directive stays in config, expanding attack surface unnecessarily | Audit CSP directives when removing DotLottie. Check if `wasm-unsafe-eval` in `proxy.ts` is only needed for DotLottie. If so, remove it too. |

---

## UX Pitfalls

Common user experience mistakes when adding hardening features.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| SW update toast appearing during active test/interview | User taps "Update" mid-test, page reloads, test progress lost | Suppress the update toast when `NavigationProvider` reports an active session (mock test, practice, interview, drill). Show it only on Dashboard or Settings. |
| Error boundary fallback showing English-only "Something went wrong" | Burmese-primary users (50% of target audience) see only English error messages | Use the existing `ErrorBoundary` pattern: read `localStorage('civic-test-language-mode')` directly (no context dependency) and show bilingual fallback. |
| Accessibility audit changing focus management in ways that break keyboard shortcuts | Users who relied on specific tab order for quiz flow (answer -> check -> next) find the flow disrupted | Map the current focus flow BEFORE making changes. Document the expected tab order for each interactive screen. Run manual keyboard walkthrough after changes. |
| Touch target audit enlarging elements that break existing layout | Cards, badges, and decorative elements that were intentionally small get 44px minimum treatment, breaking the visual hierarchy | Distinguish between interactive elements (must be 44px) and informational elements (no minimum). WCAG 2.5.8 allows exceptions for inline targets and elements where size is essential to the information. |
| Coverage thresholds in error messages confusing CI output | Developer sees "Coverage threshold not met: src/contexts/SRSContext.tsx (lines: 45% < 70%)" and does not know which tests to write | Add a comment next to each threshold in `vitest.config.ts` pointing to the test file: `// Tested in src/__tests__/srsContext.test.tsx` |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **E2E test suite "passing":** Often missing test isolation -- tests pass individually but fail in sequence because IndexedDB state leaks between tests. Verify by running the full suite 3 times in a row.
- [ ] **Provider error boundaries "added":** Often missing session save-on-error -- the boundary catches but the user loses progress. Verify by throwing an error in InterviewSession mid-interview and checking if IndexedDB has a recovery snapshot.
- [ ] **Coverage thresholds "configured":** Often missing the actual tests -- threshold set to 0% on new files, or threshold only covers happy path. Verify by checking that each threshold corresponds to a meaningful test file.
- [ ] **axe-core "integrated":** Often missing custom rule configuration -- default rules produce false positives on glass-morphism, reduced-motion alternatives, and Burmese text, which get suppressed globally instead of per-case. Verify by reviewing the axe config for blanket rule disables.
- [ ] **Service worker update "implemented":** Often missing the loop guard -- works on first update but enters infinite reload on the second. Verify by deploying twice in succession and watching the update behavior.
- [ ] **DotLottie "removed":** Often missing cleanup of related code -- the `DotLottieAnimation.tsx` component (150 lines), the `CelebrationOverlay` references to `.lottie` files, and the `LevelConfig.dotLottieSrc` fields remain as dead code. Verify by grepping for `dotlottie`, `DotLottie`, and `.lottie`.
- [ ] **react-joyride "upgraded":** Often missing re-verification of the 7-step onboarding tour -- the step targets, callbacks, and tooltip positioning may break between pre-release versions. Verify by running the full onboarding flow after upgrade.
- [ ] **InterviewSession "decomposed":** Often missing the full flow verification -- each extracted sub-component works in isolation but phase transitions break (audio stops, timer resets, transcript loses entries). Verify by running a complete 20-question Practice interview end-to-end.
- [ ] **Settings sync "fixed":** Often missing the offline-then-online scenario -- sync works when online but offline changes are still overwritten on next login. Verify by: change theme offline -> go online -> login on another device -> come back to first device -> check theme.
- [ ] **lint:css in CI "added":** Often missing the actual fix for any violations it catches -- adding the step is trivial, but it may flag existing violations that were never caught locally. Run `pnpm lint:css` locally first and fix violations before adding to CI.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| E2E tests flaky in CI | LOW | Add `retries: 2` to Playwright config. Fix root cause by adding proper `data-app-ready` waits. Flaky tests are fixable without architecture changes. |
| Coverage thresholds blocking CI | LOW | Temporarily lower thresholds or remove the blocking file's threshold. Fix by writing the missing tests. No user impact. |
| SW update infinite reload loop | HIGH | Users stuck in loop cannot access the app. Recovery: deploy a new SW version that removes the loop. But cached SW may prevent the fix from reaching users for up to 24h. Nuclear option: change SW URL in registration to force new SW. |
| Provider ordering guard false positives | LOW | Remove the guard. The existing `useAuth()` throws are sufficient. No user impact since guard should be dev-only. |
| InterviewSession decomposition breaks flow | MEDIUM | Revert the decomposition (single git revert if done in one commit). The monolithic file works correctly. Re-attempt with better extraction strategy. |
| Error boundary state loss during interview | MEDIUM | Add session save to `componentDidCatch`. Requires code change + deploy. Users who hit the bug before the fix lose one session. |
| DotLottie removal breaks celebration flow | LOW | The `DotLottieAnimation` component already has `Suspense fallback={null}`. Removing it should have zero visual impact since no `.lottie` files exist. If something else breaks, the celebration system has 3 other layers (confetti, sound, haptics). |
| axe-core false positives deployed as failures | LOW | Add specific rule suppressions per-test rather than globally. No user impact -- this only affects the test suite. |
| react-joyride upgrade breaks onboarding | MEDIUM | Pin back to `3.0.0-7`. Or if a stable 3.x exists, try that. The onboarding tour is dynamically imported, so a broken version does not affect the rest of the app. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| E2E flakiness on async state (Pitfall 1) | E2E framework setup (first phase) | Run full suite 3x in CI, < 5% flake rate |
| Coverage thresholds blocking CI (Pitfall 2) | Test expansion phase | CI passes with thresholds, no emergency lowers needed |
| SW update infinite reload (Pitfall 3) | Service worker update UX phase | Deploy 2 consecutive versions, no loop, toast shows once |
| Provider ordering guard false positives (Pitfall 4) | Architecture resilience phase | Guard fires only for actual misordering; 0 false positives in test suite |
| InterviewSession decomposition breaks (Pitfall 5) | Component decomposition phase (LAST) | Full 20-question interview flow works in both Practice and Real modes |
| Error boundary state loss (Pitfall 6) | Error boundary phase | Throw in InterviewSession mid-interview, recover session from IndexedDB |
| Error.tsx unsanitized messages | Security hardening phase | No raw `error.message` in any error.tsx; all use `sanitizeError()` |
| DotLottie dependency waste | Dependency cleanup phase | `@lottiefiles/dotlottie-react` removed from package.json; grep returns 0 matches |
| react-joyride pre-release risk | Dependency cleanup phase | Stable version installed; onboarding tour runs all 7 steps without errors |
| axe-core false positives on glass | Accessibility audit phase | axe config excludes glass elements from contrast check; 0 false positives in CI |
| SW update toast during active session | Service worker update UX phase | Toast suppressed during test/interview; shown on Dashboard |
| Settings sync offline overwrite | Settings sync phase | Offline theme change persists after going online and logging in |
| lint:css in CI reveals violations | CI pipeline phase | `pnpm lint:css` passes locally AND in CI; no new suppressions added |
| Shared test render utility missing | Test infrastructure phase (first) | `renderWithProviders` utility exists and is used by > 10 test files |
| Sentry fingerprinting noise | Security hardening phase | Network errors grouped by operation context in Sentry dashboard |

---

## Recommended Phase Ordering (Based on Pitfall Dependencies)

The pitfall analysis reveals a clear ordering constraint for the production hardening work:

1. **Test Infrastructure** (Pitfalls 1, 2) -- Create `renderWithProviders` utility, `data-app-ready` attribute, and Playwright config BEFORE writing any tests. Infrastructure-first prevents retrofitting flaky tests.

2. **Security Hardening** (Pitfalls relating to error.tsx, Sentry) -- Quick wins: sanitize error pages, add Sentry fingerprinting, add `lint:css` to CI. Low risk, high value, no dependency on other phases.

3. **Dependency Cleanup** (DotLottie, react-joyride) -- Remove dead weight before adding new tests that might import the dead code. Clean dependency tree makes test mocking simpler.

4. **Unit Test Expansion** (Provider tests, view tests, coverage thresholds) -- Write tests with the shared utility from Phase 1. Add per-file thresholds as each file is tested.

5. **E2E Test Suite** (Critical flow coverage) -- Requires all the above to be stable. E2E tests cover the integration layer that unit tests miss.

6. **Architecture Resilience** (Provider ordering guard, error boundaries, settings sync) -- Changes to the provider tree and error handling require the E2E safety net from Phase 5 to catch regressions.

7. **Service Worker Update UX** (Pitfall 3) -- Highest-risk change. Must have E2E tests for the update flow. Deploy with a canary/feature flag if possible.

8. **Accessibility Audit** (axe-core, touch targets, contrast) -- Requires stable component tree from Phase 6. False positive management needs iterative tuning.

9. **Component Decomposition** (Pitfall 5) -- LAST. Requires full E2E coverage (Phase 5) to catch regression. The monolithic components work; decomposition is for maintainability, not correctness.

---

## Sources

- [Playwright PWA Testing Guide](https://dev.to/pritig/how-playwright-simplifies-ui-testing-for-progressive-web-apps-pwas-9n8) -- MEDIUM confidence
- [Playwright Offline-First Testing](https://dt.in.th/PlaywrightOfflineFirstTest) -- MEDIUM confidence
- [Playwright Flaky Test Research (BrowserStack)](https://www.browserstack.com/guide/playwright-flaky-tests) -- MEDIUM confidence
- [Playwright Test Failure Root Causes (TestDino)](https://testdino.com/blog/playwright-test-failure/) -- MEDIUM confidence
- [Service Worker Pitfalls (Rich Harris)](https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9) -- HIGH confidence
- [Workbox Infinite Loop Issue #3260](https://github.com/GoogleChrome/workbox/issues/3260) -- HIGH confidence
- [PWA Update Notifications in React](https://felixgerschau.com/create-a-pwa-update-notification-with-create-react-app/) -- MEDIUM confidence
- [axe-core Color Contrast False Positives #2851](https://github.com/dequelabs/axe-core/issues/2851) -- HIGH confidence
- [React Error Boundaries (react.dev)](https://react.dev/reference/react/Component) -- HIGH confidence
- [React memo Pitfalls (TkDodo)](https://tkdodo.eu/blog/the-uphill-battle-of-memoization) -- HIGH confidence
- [Serwist Offline Discussion #205](https://github.com/serwist/serwist/discussions/205) -- MEDIUM confidence
- [Codebase: `ClientProviders.tsx`](src/components/ClientProviders.tsx) -- provider ordering source of truth
- [Codebase: `sw.ts`](src/lib/pwa/sw.ts) -- service worker config with `skipWaiting: true`
- [Codebase: `InterviewSession.tsx`](src/components/interview/InterviewSession.tsx) -- 1,474 lines, 29 callbacks, 9 phase states
- [Codebase: `vitest.config.ts`](vitest.config.ts) -- current per-file coverage thresholds
- [Codebase: `error.tsx`](app/error.tsx) -- unsanitized `error.message` rendering
- [Codebase: CONCERNS.md](.planning/codebase/CONCERNS.md) -- full audit of issues being addressed

---
*Pitfalls research for: Production hardening v4.1*
*Researched: 2026-03-19*
