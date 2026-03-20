# Stack Research: v4.1 Production Hardening

**Domain:** Production hardening for existing bilingual PWA (testing, security, accessibility, resilience, DX)
**Researched:** 2026-03-19
**Confidence:** HIGH (all recommendations verified against official docs and npm registry)

## New Dependencies to Add

### E2E Testing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@playwright/test` | ^1.58.0 | E2E test framework | Next.js officially documents Playwright setup. Free parallelization (Cypress requires paid Cloud). WebKit support critical for iOS PWA testing. ~290ms/action vs Cypress ~420ms. Built-in `webServer` config starts Next.js automatically. |
| `@axe-core/playwright` | ^4.11.1 | Accessibility auditing in E2E | Deque's official Playwright integration. Runs axe-core engine inside Playwright pages. Detects WCAG violations programmatically at full-page level, complementing existing vitest-axe unit tests. |

**Playwright over Cypress because:**
1. Next.js official docs recommend both equally, but Playwright has first-class `webServer` integration
2. Free parallel execution via `--shard` flag (Cypress parallelization requires paid Cypress Cloud)
3. WebKit browser engine support -- critical for a PWA targeting iOS Safari
4. Lower resource usage: ~2.1GB RAM for 10 parallel tests vs Cypress ~3.2GB
5. Native multi-browser testing (Chromium + Firefox + WebKit) without plugins
6. Better CI performance -- headless by default, no Electron overhead

**Playwright config for this project:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Error Boundaries

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| *(none -- use existing custom ErrorBoundary)* | -- | Component-level error boundaries | The existing `ErrorBoundary` class component already has bilingual support, Sentry integration, sanitization, and custom fallback props. Adding `react-error-boundary` (v6.1.1) would duplicate this. Instead, reuse the existing component with `fallback` prop variants per feature. |

**Decision: Do NOT add `react-error-boundary`.**

The project already has a battle-tested `ErrorBoundary` at `src/components/ErrorBoundary.tsx` with:
- Bilingual error messages (reads `localStorage` directly to avoid context dependency)
- `sanitizeError()` for PII stripping
- Sentry reporting via `sanitizeForSentry()`
- `fallback` prop for custom fallback UIs
- Reset and navigate-home actions

To add component-level boundaries, wrap high-risk features with the existing component:
```tsx
<ErrorBoundary fallback={<InterviewErrorFallback />}>
  <InterviewSession />
</ErrorBoundary>
```

React 19 still requires class components for error boundaries (no hooks API). The existing class component is the correct pattern.

### Service Worker Update Notification

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@serwist/window` | ^9.5.6 | Client-side SW lifecycle events | Already a transitive dependency (in pnpm-lock.yaml). Provides `Serwist` class with `waiting`, `controlling`, `installed` events. Use `messageSkipWaiting()` to trigger update. |

**Not a new dependency** -- already in the dependency tree via `@serwist/next`. Just needs explicit import in client code.

**Implementation pattern:**
```typescript
import { Serwist } from '@serwist/window';

const serwist = new Serwist('/sw.js', { scope: '/' });

serwist.addEventListener('waiting', () => {
  // Show "Update available" toast
  serwist.addEventListener('controlling', () => window.location.reload());
  serwist.messageSkipWaiting();
});

serwist.register();
```

**Current SW uses `skipWaiting: true`** which means new SWs activate immediately. The `@serwist/window` listener catches the brief window between install and activation to notify the user. Consider changing to `skipWaiting: false` and letting the user trigger the update via the toast, which prevents jarring mid-session reload.

## Configuration Changes (No New Dependencies)

### Vitest Coverage Thresholds

**No new package needed.** Vitest 4.x already supports glob-pattern thresholds in `vitest.config.ts`.

**Current state:** 4 files have thresholds. No global minimum.

**Recommended additions to `vitest.config.ts` `coverage.thresholds`:**

```typescript
thresholds: {
  // Existing
  'src/lib/shuffle.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
  'src/lib/errorSanitizer.ts': { lines: 90, functions: 90, branches: 90, statements: 90 },
  'src/components/ErrorBoundary.tsx': { lines: 70, functions: 70, branches: 70, statements: 70 },
  'src/lib/saveSession.ts': { lines: 70, functions: 70, branches: 70, statements: 70 },

  // NEW: business-critical lib modules
  'src/lib/srs/fsrsEngine.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/interview/answerGrader.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/readiness/readinessEngine.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/social/streakTracker.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/social/badgeEngine.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/async/withRetry.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/nba/determineNBA.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
  'src/lib/sort/sortReducer.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
  'src/lib/ttsCore.ts': { lines: 70, functions: 70, branches: 65, statements: 70 },
}
```

**Also add `perFile: true`** to the thresholds config so each matched file is checked individually rather than aggregated.

### Provider Ordering Validation

**No library exists for this.** This is a custom dev-time assertion.

**Recommended approach: runtime dev-only guard in ClientProviders.tsx.**

The pattern is a `useEffect` that validates the context tree at mount time in development:

```typescript
function ProviderOrderGuard({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === 'development') {
    // Attempt to call each hook -- if any throws, the ordering is wrong
    // This catches the error at mount with a clear message
    try {
      useAuth();     // Must be available (AuthProvider above)
      useLanguage(); // Must be available (LanguageProvider above)
      useTheme();    // Must be available (ThemeProvider above)
    } catch {
      throw new Error(
        'Provider ordering violation! Check ClientProviders.tsx nesting order.\n' +
        'Required: ErrorBoundary > Auth > Language > Theme > TTS > Toast > Offline > ...'
      );
    }
  }
  return <>{children}</>;
}
```

**Alternative: ESLint custom rule.** Write a custom ESLint rule that parses JSX nesting in `ClientProviders.tsx` and enforces the ordering. Higher effort, compile-time guarantee. Recommended only if the runtime guard proves insufficient.

**Recommendation:** Start with the runtime dev-only guard. It catches the exact problem that caused the v4.0 crash (adding `useAuth()` to a provider above `AuthProvider`) with zero dependency cost.

## Dependencies to Remove

### DotLottie

| Package | Current Version | Action | Rationale |
|---------|----------------|--------|-----------|
| `@lottiefiles/dotlottie-react` | ^0.18.2 | **REMOVE** | Zero `.lottie` asset files exist in `public/lottie/`. The 150-line `DotLottieAnimation.tsx` component has never rendered visible output. ~200KB WASM renderer is dead weight. Has been flagged since v3.0 (CELB-06). The celebration system works fine without it -- confetti + sound + haptics already fire. |

**If Lottie animations are ever wanted later:**
- Source free `.lottie` files from LottieFiles marketplace
- Re-add `@lottiefiles/dotlottie-react` (currently at 0.18.7, still pre-1.0 but actively maintained with releases every few days)
- The existing `DotLottieAnimation.tsx` code can be recovered from git history

**Files to clean up on removal:**
- `package.json`: remove `@lottiefiles/dotlottie-react`
- `src/components/celebrations/DotLottieAnimation.tsx`: delete
- `src/components/celebrations/CelebrationOverlay.tsx`: remove DotLottie import/usage
- `public/lottie/`: remove empty directory if present

### react-joyride

| Package | Current Version | Action | Rationale |
|---------|----------------|--------|-----------|
| `react-joyride` | 3.0.0-7 (pre-release) | **KEEP pinned** | No stable 3.0.0 has been released. Last npm publish was over a year ago. The 7-step onboarding tour works and is dynamically imported. The pre-release risk is mitigated by pinning and lazy loading. |

**Alternatives evaluated:**

| Library | Verdict | Why Not |
|---------|---------|---------|
| Shepherd.js | NOT recommended | Different API paradigm (imperative), would require full tour rewrite. Larger bundle. The tour works fine. |
| Intro.js | NOT recommended | Commercial license for production use. React wrapper is community-maintained. |
| OnboardJS | NOT recommended | Headless (no UI) -- would require building all tooltip/spotlight UI from scratch. Overkill for a working 7-step tour. |
| Reactour | Possible future option | Simpler API, smaller bundle. If react-joyride causes issues, this is the first alternative to evaluate. |

**Recommendation:** Keep `react-joyride@3.0.0-7` pinned (already pinned without `^`). The tour is dynamically imported, isolated, and working. Replacing a functioning pre-release dependency with a rewrite is not production hardening -- it is scope creep. Revisit only if it causes actual bugs or React 19 incompatibility.

## IndexedDB Cache Versioning

**No new library needed.** The project uses `idb-keyval` which is intentionally a minimal key-value store (~600B). Adding a full IndexedDB migration library like `idb` (1KB) would be over-engineering for the actual need.

**The actual problem:** `src/lib/pwa/offlineDb.ts` stores a `version: 1` field in cache metadata but never checks it on read.

**Recommended fix (no dependency):**

```typescript
const CACHE_VERSION = 2; // Bump when question format changes

async function getCachedQuestions(): Promise<Question[] | null> {
  const cached = await get('questions', questionsStore);
  if (!cached || cached.version !== CACHE_VERSION) {
    // Stale cache -- delete and return null to trigger fresh fetch
    await del('questions', questionsStore);
    return null;
  }
  return cached.data;
}
```

This is a 5-line fix, not a library addition. The `idb-keyval` stores are simple key-value pairs -- there are no object stores or indexes to migrate. Version bumping the cache key invalidates stale data.

## Installation Summary

```bash
# New dev dependencies
pnpm add -D @playwright/test @axe-core/playwright

# Install Playwright browsers (Chromium + WebKit for iOS testing)
pnpm exec playwright install --with-deps chromium webkit

# Remove unused production dependency
pnpm remove @lottiefiles/dotlottie-react
```

**Net dependency change: -1 production, +2 dev**

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Playwright | Cypress | Paid parallelization, no WebKit, higher resource usage, Electron overhead |
| Existing ErrorBoundary | react-error-boundary v6.1.1 | Would duplicate existing bilingual+Sentry+sanitization. Extra 3.5KB for no gain. |
| @serwist/window events | Manual `navigator.serviceWorker` | @serwist/window already in dep tree, provides cleaner lifecycle API |
| idb-keyval + version field | idb (full IndexedDB wrapper) | Over-engineering. No object stores or indexes to migrate. Version check is 5 lines. |
| Runtime provider guard | ESLint custom rule | Runtime guard is zero-dependency, catches exact crash scenario. Custom rule is high effort. |
| Keep react-joyride pinned | Rewrite with Reactour/Shepherd | Working feature, dynamically imported, isolated. Rewrite has no production value. |
| Remove dotlottie-react | Source .lottie assets | No assets have been sourced in 4 milestones. Celebrations work without it. Remove dead weight. |

## What NOT to Add

| Avoid | Why | Do Instead |
|-------|-----|------------|
| `react-error-boundary` | Duplicates existing custom ErrorBoundary with bilingual support | Reuse existing `<ErrorBoundary fallback={...}>` with feature-specific fallbacks |
| `idb` (full IndexedDB wrapper) | Only need version check on idb-keyval stores | Add 5-line version comparison in `offlineDb.ts` |
| `cypress` | Paid parallelization, no WebKit, heavier CI | Use Playwright |
| `@testing-library/user-event` for E2E | Mixing unit test tools into E2E | Use Playwright's built-in `page.click()`, `page.fill()`, etc. |
| `jest` | Project already on Vitest 4.x with full config | Keep Vitest for unit/component tests |
| `axe-core` standalone | Already have `vitest-axe` for unit tests | Add `@axe-core/playwright` for E2E accessibility only |
| `storybook` | Solo dev, 30+ component dirs, massive config overhead | Use Playwright component tests if visual testing needed |
| Visual regression tools (Percy, Chromatic) | Maintenance burden flagged as out-of-scope in PROJECT.md | Manual visual QA + axe-core automated a11y |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@playwright/test@^1.58` | Node.js 22.x | Requires Node 18+. Project's Node 22.x is fine. |
| `@playwright/test@^1.58` | Next.js 16.1.7 | Tested with App Router. `webServer` config handles build+start. |
| `@axe-core/playwright@^4.11` | `@playwright/test@^1.58` | Peer dependency on `playwright-core`. Must match major version. |
| `@serwist/window@^9.5.6` | `@serwist/next@^9.5.6` | Same package ecosystem, already aligned at 9.5.6. |
| `react-error-boundary@6.1.1` | React 19 | Compatible (peer: `react >= 16.13.1`) but NOT recommended -- see above. |
| `react-joyride@3.0.0-7` | React 19 | Working in production. Pinned without caret. |

## CI Pipeline Changes

Current CI pipeline (`.github/workflows/ci.yml`) needs these additions:

```yaml
# After existing test:coverage step, add E2E:
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium webkit

- name: Build application
  run: pnpm build

- name: Run E2E tests
  run: pnpm exec playwright test

- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7

# Also add lint:css (currently missing from CI):
- name: CSS lint
  run: pnpm run lint:css
```

**New `package.json` scripts:**
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

## Sources

- [Next.js Testing: Playwright](https://nextjs.org/docs/app/guides/testing/playwright) -- official setup guide, verified 2026-03-16 (HIGH confidence)
- [Playwright Release Notes](https://playwright.dev/docs/release-notes) -- v1.58.0 confirmed latest (HIGH confidence)
- [@axe-core/playwright npm](https://www.npmjs.com/package/@axe-core/playwright) -- v4.11.1 verified (HIGH confidence)
- [Vitest Coverage Config](https://vitest.dev/config/coverage) -- glob thresholds, perFile, autoUpdate (HIGH confidence)
- [@serwist/window docs](https://serwist.pages.dev/docs/window) -- waiting/controlling events, messageSkipWaiting (HIGH confidence)
- [react-error-boundary npm](https://www.npmjs.com/package/react-error-boundary) -- v6.1.1, React 19 compatible, not needed (MEDIUM confidence)
- [react-joyride releases](https://github.com/gilbarbara/react-joyride/releases) -- no stable 3.0.0, last publish >1 year (HIGH confidence)
- [@lottiefiles/dotlottie-react npm](https://www.npmjs.com/package/@lottiefiles/dotlottie-react) -- v0.18.7, still pre-1.0 (HIGH confidence)
- [Playwright vs Cypress 2026](https://www.d4b.dev/blog/2026-02-17-why-playwright-seems-to-be-winning-over-cypress-for-end-to-end-testing) -- independent benchmark data (MEDIUM confidence)
- [Serwist SW update patterns](https://developer.chrome.com/docs/workbox/handling-service-worker-updates) -- Workbox/Serwist lifecycle (HIGH confidence)
- [React onboarding tour evaluation](https://sandroroth.com/blog/evaluating-tour-libraries/) -- Shepherd.js, Intro.js, Reactour (MEDIUM confidence)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) -- axe-core integration guide (HIGH confidence)

---
*Stack research for: v4.1 Production Hardening*
*Researched: 2026-03-19*
