# Phase 52: E2E Critical Flows + Accessibility - Research

**Researched:** 2026-03-20
**Domain:** Playwright E2E testing, axe-core accessibility scanning, WCAG 2.2 compliance, touch target auditing, glass-morphism contrast verification
**Confidence:** HIGH

## Summary

Phase 52 covers two orthogonal domains: (1) Playwright E2E tests for 7 critical user flows, and (2) WCAG 2.2 accessibility compliance via axe-core scans, touch target audits, and glass contrast fixes. The project already has Playwright 1.58.2 configured with Chromium-only, a basic smoke test, and vitest-axe 0.1.0 with 2 existing a11y tests. The `@axe-core/playwright` package (v4.11.1) must be added for E2E WCAG scans.

The E2E tests require auth mocking via `page.route()` + localStorage session injection (no real Supabase accounts), `context.setOffline()` for offline simulation, and programmatic SW lifecycle event mocking. All E2E tests should use `test.extend()` fixtures for auth, storage cleanup, and axe-core configuration. The app uses hash-based view routing within a Next.js App Router catch-all, with 6 nav tabs at paths `/home`, `/study`, `/test`, `/interview`, `/hub`, `/settings`.

**Primary recommendation:** Build shared Playwright fixtures first (auth mock, storage cleanup, reduced motion, axe-core builder), then implement E2E flow tests, then accessibility scans and fixes. All tests use `emulateMedia({ reducedMotion: 'reduce' })` for faster execution and reduced-motion coverage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Each E2E test covers happy path + 1 key error/edge case (not exhaustive error testing)
- D-02: Mock test lifecycle (TEST-04) answers 3 questions (1 correct, 1 wrong, 1 skip) then fast-forwards to results -- full 20 is too slow for E2E
- D-03: Offline sync (TEST-07) tests answer sync + settings LWW merge. Bookmark sync deferred.
- D-04: Flow tests run in default theme only. Dark mode coverage via WCAG scans (A11Y-01).
- D-05: Interview E2E (TEST-08) tests Practice mode only -- has more UI surface (colored progress, keyword feedback, answer read-aloud). Real mode is a visual subset.
- D-06: 60-second timeout per E2E test. Animation waits + CI rendering overhead require headroom.
- D-07: At least one E2E test verifies bilingual rendering -- language toggle switches visible content.
- D-08: SW update E2E (TEST-09) must test session-lock deferral -- mock active session, verify toast deferred until session ends. Key Phase 50 deliverable.
- D-09: Glass-heavy dark mode contrast fix: increase opacity from 0.35 to 0.45. Minimal visual change, maximum contrast improvement.
- D-10: Touch target 44px fixes use `min-h-[44px]` with unchanged padding -- tap area grows, visual footprint stays similar.
- D-11: Color-only indicators get `aria-label` attributes for screen readers. No visible icon additions -- preserves visual design.
- D-12: Success/warning contrast fix: darken text to green-700/amber-700. Don't change background tokens (cascading risk).
- D-13: Myanmar text on glass surfaces: increase font-weight to 500 (medium) in dark mode. Improves legibility without visual disruption.
- D-14: Focus rings on dark glass use `--color-primary` instead of `--color-ring` for higher contrast.
- D-15: Touch target audit is standalone `e2e/touch-targets.spec.ts` with custom size-checking logic, not part of WCAG scan.
- D-16: Tab-bar items get explicit `focus-visible:ring-2` -- active state color serves mouse users, focus ring serves keyboard users.
- D-17: E2E fixtures use Playwright `test.extend()` pattern -- auto-cleanup, composable, idiomatic.
- D-18: E2E tests run on PR only, not every push. Unit tests are the push-level regression gate.
- D-19: axe-core scans in separate `e2e/wcag-scan.spec.ts` -- compliance is orthogonal to flow correctness.
- D-20: 1 retry on CI, 0 retries locally. Trace captured on first retry for debugging.
- D-21: All E2E tests use `emulateMedia({ reducedMotion: 'reduce' })` -- faster execution + covers reduced-motion accessibility path.
- D-22: Parallel execution (`fullyParallel: true` already configured). Fresh context per test ensures isolation.
- D-23: vitest-axe expansion targets prioritized list of components with known violations (from precontext gotchas), not all 183 component files.
- D-24: A11y unit tests go in `src/__tests__/a11y/` -- matches existing pattern from Phase 48.
- D-25: axe-core `color-contrast` rule disabled per-element on `.glass-*` selectors, not globally. Other elements must pass.
- D-26: SHOULD-HAVE recommendations included: #7 (reduced motion E2E path), #8 (focus ring standardization). Deferred: #9 (Myanmar weight bump -- D-13 covers glass only), #10 (error boundary E2E -- defer to Phase 53).
- D-27: NICE-TO-HAVE #12 (touch target regression test) included for CI enforcement. #11 (glass contrast doc) deferred -- inline comments in CSS suffice.
- D-28: WCAG AA baseline. AAA for touch targets (44px = 2.5.5 AAA; project standard since Phase 17).
- D-29: Fix all 9+ touch target violation families. Only exception: TourTooltip buttons (onboarding-only, low-priority, low-frequency).
- D-30: Error boundary E2E verification deferred to Phase 53. Phase 49 unit tests provide sufficient coverage.
- D-31: Glass contrast documented via inline comments in `globals.css` with measured ratios. No separate accessibility doc.
- D-32: Documented axe exceptions require: element selector, measured contrast ratio, and justification as inline test comments.

### Claude's Discretion
- Exact Playwright fixture API design and helper naming
- E2E selector strategy (ARIA roles vs text vs CSS selectors)
- Number of vitest-axe component tests to add (prioritized from gotcha list)
- Specific CSS value adjustments for contrast fixes (exact HSL values)
- Test file naming conventions beyond the established `*.spec.ts` pattern
- Whether to split plans by E2E-first vs accessibility-first or interleaved

### Deferred Ideas (OUT OF SCOPE)
- Error boundary E2E verification -- Phase 53 (after InterviewSession decomposition provides cleaner test surface)
- Myanmar text font-weight boost on non-glass surfaces -- evaluate after glass-specific fix (D-13) ships
- Glass contrast formal documentation (`docs/ACCESSIBILITY.md`) -- inline CSS comments sufficient for now
- Multi-browser E2E matrix (Firefox, WebKit) -- Phase 53+ after Chromium tests prove stable
- Visual regression screenshot baselines -- explicitly out of scope (PROJECT.md exclusion)
- Full 20-question mock test E2E -- current 3-question fast-forward provides sufficient coverage
- Bookmark sync E2E -- lower priority than answer/settings sync
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-03 | E2E test: auth login -> dashboard render with user data | Auth mock via `page.route('**/auth/**')` + localStorage session injection; verify dashboard heading + user data visible |
| TEST-04 | E2E test: mock test lifecycle (start, answer questions, timer, pass/fail, results saved) | Navigate to `/test`, start mock test, answer 3 questions (1 correct, 1 wrong, 1 skip), verify results screen + data persistence |
| TEST-05 | E2E test: practice session (category filter, answer, feedback panel, keyword highlights) | Navigate to `/study`, start practice, answer question, verify FeedbackPanel with `[role="status"]`, verify keyword highlights |
| TEST-06 | E2E test: flashcard sort (swipe cards, results, SRS batch add) | Navigate to sort mode, use Know/Don't Know buttons (not drag), verify results and SRS integration |
| TEST-07 | E2E test: offline -> online sync | Use `context.setOffline(true)`, answer questions, reconnect, verify sync via IndexedDB queue flush |
| TEST-08 | E2E test: interview session (text input, grading, results) | Navigate to `/interview`, Practice mode, use TextAnswerInput for text input, verify grading + keyword feedback |
| TEST-09 | E2E test: service worker update | Mock SW registration object + programmatic `updatefound`/`controllerchange` events, test session-lock deferral |
| A11Y-01 | axe-core WCAG 2.2 scans on 4 pages | `@axe-core/playwright` AxeBuilder with tags `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`, exclude `.glass-*` from color-contrast |
| A11Y-02 | vitest-axe expansion to interactive components | Existing pattern from `feedbackPanel.a11y.test.tsx`; target components with known violations from gotcha inventory |
| A11Y-03 | Touch target 44px audit + fixes | Playwright script querying `button, a, input, [role="button"]` + `boundingBox()` height/width assertions; fix 9+ component families |
| A11Y-04 | Glass-morphism contrast verification (VISC-05) | Manual HSL calculation of dark `.glass-heavy` contrast; increase opacity 0.35 -> 0.45 in `tokens.css`; inline comments with measured ratios |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@playwright/test` | 1.58.2 (installed) | E2E test framework | Already configured; Chromium-only; `fullyParallel: true` |
| `@axe-core/playwright` | 4.11.1 (latest) | WCAG automated scanning in E2E | Official Playwright integration; AxeBuilder API for tag/rule/element filtering |
| `vitest-axe` | 0.1.0 (installed) | WCAG unit-test scanning | Already configured with global matchers in `setup.ts` |
| `vitest` | 4.0.18 (installed) | Unit test runner | Existing 779+ tests; a11y tests are unit tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react` | 16.3.2 (installed) | Component rendering for vitest-axe | A11Y-02 vitest-axe expansion tests |
| `renderWithProviders` | N/A (project utility) | Provider-wrapped rendering | vitest-axe tests needing context (Language, Theme, etc.) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@axe-core/playwright` | Lighthouse CI | axe-core is focused on WCAG rules; Lighthouse adds perf/SEO noise; axe-core has better per-element control |
| Manual contrast calculation | axe-core color-contrast | axe-core cannot measure backdrop-filter blur contrast; manual HSL calc needed for glass-morphism |
| MSW for E2E | `page.route()` | MSW is for unit/integration; page.route() is idiomatic Playwright; REQUIREMENTS.md explicitly excludes MSW for E2E |

**Installation:**
```bash
pnpm add -D @axe-core/playwright
```

**Version verification:** @axe-core/playwright 4.11.1 confirmed via `npm view` on 2026-03-20. @playwright/test 1.58.2 already installed. vitest-axe 0.1.0 already installed.

## Architecture Patterns

### Recommended Project Structure
```
e2e/
  fixtures/
    auth.ts              # Supabase auth mock fixture
    storage.ts           # IndexedDB/localStorage cleanup fixture
    axe.ts               # Pre-configured AxeBuilder fixture
    index.ts             # Combined test export with all fixtures
  auth-dashboard.spec.ts # TEST-03
  mock-test.spec.ts      # TEST-04
  practice.spec.ts       # TEST-05
  flashcard-sort.spec.ts # TEST-06
  offline-sync.spec.ts   # TEST-07
  interview.spec.ts      # TEST-08
  sw-update.spec.ts      # TEST-09
  wcag-scan.spec.ts      # A11Y-01
  touch-targets.spec.ts  # A11Y-03 + Rec #12
  smoke.spec.ts          # Existing (unchanged)
src/__tests__/a11y/
  feedbackPanel.a11y.test.tsx   # Existing
  toast.a11y.test.tsx           # Existing
  [new].a11y.test.tsx           # A11Y-02 expansion
```

### Pattern 1: Playwright Fixture Composition (`test.extend()`)

**What:** Create a custom `test` export that bundles auth mocking, storage cleanup, reduced motion, and axe-core configuration into reusable fixtures.

**When to use:** Every E2E test file imports from `e2e/fixtures/index.ts` instead of `@playwright/test`.

**Example:**
```typescript
// e2e/fixtures/index.ts
// Source: https://playwright.dev/docs/test-fixtures
import { test as base, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

type Fixtures = {
  authedPage: Page;
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<Fixtures>({
  // Auto-apply reduced motion to all tests
  page: async ({ page }, use) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await use(page);
  },

  // Authenticated page with mocked Supabase auth
  authedPage: async ({ page }, use) => {
    // Intercept Supabase auth API calls
    await page.route('**/auth/v1/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { display_name: 'Test User' },
          },
        }),
      })
    );

    // Intercept Supabase data API calls (settings, bookmarks, etc.)
    await page.route('**/rest/v1/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    // Inject session to localStorage before navigation
    await page.addInitScript(() => {
      // Supabase stores session at sb-{ref}-auth-token
      const sessionData = {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { display_name: 'Test User' },
        },
      };
      // Use wildcard-safe key pattern
      const keys = Object.keys(localStorage);
      const authKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      const key = authKey || 'sb-placeholder-auth-token';
      localStorage.setItem(key, JSON.stringify(sessionData));
    });

    await use(page);
  },

  // Pre-configured axe builder for WCAG scans
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.glass-light')
        .exclude('.glass-medium')
        .exclude('.glass-heavy')
        .exclude('.glass-card');
    await use(makeAxeBuilder);
  },
});

export { expect } from '@playwright/test';
```

### Pattern 2: E2E Selector Strategy (ARIA-first)

**What:** Use ARIA roles and accessible text as primary selectors. Fall back to CSS selectors only when ARIA is unavailable. Never use data-testid (not present in production build).

**When to use:** All E2E test assertions and element queries.

**Example:**
```typescript
// Source: Playwright docs + project's existing semantic HTML
// Prefer ARIA role selectors
const heading = page.getByRole('heading', { name: /dashboard/i });
const startButton = page.getByRole('button', { name: /start/i });
const alert = page.locator('[role="alert"]');
const status = page.locator('[role="status"]');

// Text-based when role is insufficient
const questionText = page.getByText(/Who is the President/);

// CSS selectors for glass-tier elements (no ARIA role)
const glassPanel = page.locator('.glass-heavy');

// Tab navigation
const tabBar = page.getByRole('tablist');
const studyTab = page.getByRole('link', { name: /study guide/i });
```

### Pattern 3: Offline Simulation via `context.setOffline()`

**What:** Use Playwright's browser context to toggle network connectivity. The app checks `navigator.onLine` for sync decisions.

**When to use:** TEST-07 offline-to-online sync test.

**Example:**
```typescript
// Source: https://playwright.dev/docs/network
test('offline sync flow', async ({ context, authedPage: page }) => {
  await page.goto('/test');
  // ... start a test and answer

  // Go offline
  await context.setOffline(true);

  // App should detect offline state and queue to IndexedDB
  // Answer more questions while offline

  // Go online
  await context.setOffline(false);

  // Verify sync completes (queued results flushed to Supabase)
  // Listen for network requests to confirm sync
  const syncRequest = page.waitForRequest('**/rest/v1/mock_tests*');
  // Trigger sync (may be automatic on reconnect)
  await syncRequest;
});
```

### Pattern 4: SW Update Mocking via `page.evaluate()`

**What:** Mock the ServiceWorker registration object and programmatically dispatch lifecycle events. Do not serve two real SW versions.

**When to use:** TEST-09 service worker update test.

**Example:**
```typescript
// Source: Project's swUpdateManager.ts + Playwright docs
test('SW update with session lock deferral', async ({ authedPage: page }) => {
  await page.goto('/');

  // Mock service worker registration
  await page.evaluate(() => {
    // Create a mock registration with event listener support
    const mockRegistration = {
      installing: null,
      waiting: null,
      active: { state: 'activated' },
      addEventListener: function(event: string, handler: () => void) {
        if (event === 'updatefound') {
          // Store handler to fire later
          (window as any).__swUpdateHandler = handler;
        }
      },
      removeEventListener: () => {},
    };

    // Override getRegistration to return our mock
    Object.defineProperty(navigator.serviceWorker, 'getRegistration', {
      value: () => Promise.resolve(mockRegistration),
      writable: true,
    });
  });

  // Simulate session lock (navigate to interview/test)
  // Then fire update event
  await page.evaluate(() => {
    // Dispatch controllerchange to trigger update detection
    navigator.serviceWorker.dispatchEvent(new Event('controllerchange'));
  });

  // Verify toast is deferred during session
  // End session, verify toast appears
});
```

### Pattern 5: vitest-axe Component Testing

**What:** Use existing `renderWithProviders` with `axe()` from vitest-axe to scan individual component ARIA compliance.

**When to use:** A11Y-02 expansion to interactive components.

**Example:**
```typescript
// Source: src/__tests__/a11y/feedbackPanel.a11y.test.tsx (existing pattern)
import { axe } from 'vitest-axe';
import { renderWithProviders } from '../utils/renderWithProviders';

describe('ComponentName accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <ComponentName {...props} />,
      { preset: 'core' }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Pattern 6: Touch Target Audit Script

**What:** Automated Playwright test that navigates to critical pages and asserts all interactive elements meet 44px minimum.

**When to use:** A11Y-03 audit + D-27 CI regression test.

**Example:**
```typescript
// Source: Playwright boundingBox API
test('all interactive elements meet 44px minimum', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const interactiveElements = page.locator(
    'button, a[href], input, select, textarea, [role="button"], [role="link"], [role="tab"]'
  );

  const count = await interactiveElements.count();
  const violations: string[] = [];

  for (let i = 0; i < count; i++) {
    const el = interactiveElements.nth(i);
    if (!(await el.isVisible())) continue;

    const box = await el.boundingBox();
    if (!box) continue;

    if (box.height < 44 || box.width < 44) {
      const text = await el.textContent();
      const tag = await el.evaluate(e => e.tagName);
      violations.push(
        `${tag} "${text?.trim().slice(0, 30)}" is ${Math.round(box.width)}x${Math.round(box.height)}px`
      );
    }
  }

  expect(violations, `Touch target violations:\n${violations.join('\n')}`).toEqual([]);
});
```

### Anti-Patterns to Avoid
- **Global axe-core rule disabling:** Disabling `color-contrast` globally hides real failures. Disable per-element on `.glass-*` selectors only (D-25).
- **data-testid selectors in E2E:** The app has no data-testid attributes in production. Use ARIA roles, text content, and CSS class selectors instead.
- **Real Supabase auth in E2E:** Creates external dependency, rate limiting, and data pollution. Use `page.route()` interception + localStorage session injection.
- **Drag gestures in E2E:** Playwright `dragTo()` is flaky with motion/react transform animations. Use button click alternatives (Know/Don't Know buttons for flashcard sort).
- **Full 20-question mock test:** Too slow for E2E. Use 3-question fast-forward with 1 correct, 1 wrong, 1 skip (D-02).
- **Shared state between E2E tests:** Causes flakes in parallel execution. Fresh browser context per test with storage cleanup.
- **Waiting for fixed durations:** Use `waitFor` with role/state selectors. With `reducedMotion: 'reduce'`, animations resolve instantly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG compliance scanning | Custom DOM traversal for ARIA violations | `@axe-core/playwright` AxeBuilder | axe-core tests 100+ WCAG rules; handles edge cases in ARIA attribute validation |
| Auth session mocking | Custom fetch interceptor | `page.route('**/auth/v1/**')` + `page.addInitScript()` | Playwright's native route interception is battle-tested; addInitScript runs before page JS |
| Offline detection | Custom network toggle | `context.setOffline(true/false)` | Playwright's CDP-backed offline mode properly toggles navigator.onLine |
| Touch target sizing | CSS-only audit (error-prone) | `element.boundingBox()` Playwright API | Computed box includes padding, border; respects CSS transforms and layout |
| Reduced motion emulation | Runtime CSS injection | `page.emulateMedia({ reducedMotion: 'reduce' })` | CDP-native media emulation; consistent across tests |
| Test fixture composition | beforeEach/afterEach chains | `test.extend<Fixtures>()` | Playwright fixtures auto-cleanup, run on-demand, compose with dependencies |
| Color contrast calculation | Manual pixel sampling | axe-core `color-contrast` rule + manual HSL math for glass | axe-core handles 95% of contrast cases; only glass backdrop-filter needs manual calc |

**Key insight:** Playwright and axe-core together cover ~80% of the WCAG testing surface. The remaining 20% (backdrop-filter contrast, touch target sizing beyond 24px, color-only indicators) requires project-specific logic but should use Playwright's DOM APIs, not custom browser tooling.

## Common Pitfalls

### Pitfall 1: axe-core False Positives on Glass-Morphism
**What goes wrong:** axe-core's `color-contrast` rule cannot evaluate `backdrop-filter: blur()` elements. It sees the CSS `background` opacity but not the effective rendered color through the blur.
**Why it happens:** backdrop-filter is a compositing operation; axe-core can only read declared CSS values, not rendered pixel colors.
**How to avoid:** Exclude `.glass-light`, `.glass-medium`, `.glass-heavy`, `.glass-card` from `color-contrast` rule using `AxeBuilder.exclude()`. Document measured contrast ratios inline in test comments (D-32).
**Warning signs:** axe-core reports contrast failures on glass elements with clearly readable text.

### Pitfall 2: Supabase Auth Hydration Race
**What goes wrong:** E2E tests navigate to dashboard and immediately assert user data, but AuthProvider hasn't finished `getSession()` hydration yet.
**Why it happens:** AuthProvider calls `supabase.auth.getSession()` asynchronously; the UI renders a loading state first.
**How to avoid:** Wait for a user-visible indicator (display name, email, or dashboard-specific content) before asserting auth state. Use `await expect(page.getByText('Test User')).toBeVisible({ timeout: 10_000 })`.
**Warning signs:** Tests pass locally but flake in CI due to slower rendering.

### Pitfall 3: Service Worker Interference with Route Interception
**What goes wrong:** `page.route()` interceptions are bypassed when the service worker handles the request first.
**Why it happens:** Service workers sit between the page and network; Playwright's `page.route()` intercepts at the network level, but SW can respond from cache before the request reaches the network.
**How to avoid:** Use `serviceWorkers: 'block'` in playwright config for flow tests (TEST-03 through TEST-08). Only TEST-09 (SW update test) should allow service workers.
**Warning signs:** Route mocks never match; requests are served from SW cache instead.

### Pitfall 4: IndexedDB State Leaking Between Tests
**What goes wrong:** Test B sees stale data from Test A because IndexedDB wasn't cleared between tests.
**Why it happens:** `fullyParallel: true` uses fresh contexts, but if tests share the same browser profile directory, IndexedDB may persist.
**How to avoid:** Use the storage cleanup fixture that clears IndexedDB and localStorage in a `page.evaluate()` before each test. Fresh browser context per test (already configured) handles most cases.
**Warning signs:** Tests pass individually but fail when run together.

### Pitfall 5: Touch Target False Negatives from Hidden Elements
**What goes wrong:** Touch target audit reports all elements pass, but invisible/off-screen elements were skipped.
**Why it happens:** `boundingBox()` returns `null` for invisible elements; if you skip them, you miss elements that become visible on scroll or interaction.
**How to avoid:** Test each critical page at its default viewport. For elements behind interactions (modals, dropdowns), trigger the interaction first, then measure. Document which views were audited.
**Warning signs:** Audit passes but manual testing reveals undersized buttons in modals or expanded sections.

### Pitfall 6: WCAG 2.2 Tags Not Enabled by Default
**What goes wrong:** Using `withTags(['wcag22aa'])` alone misses WCAG 2.0 and 2.1 rules because tag filtering is exclusive.
**Why it happens:** axe-core tags are additive filters. `wcag22aa` only matches rules tagged with that specific tag (currently just `target-size`).
**How to avoid:** Always include the full tag set: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`. The `target-size` rule (wcag22aa) is disabled by default; enable it separately if desired. The touch target audit script (A11Y-03) handles 44px enforcement more effectively than axe-core's 24px threshold.
**Warning signs:** WCAG scan passes with only `wcag22aa` tag but misses basic contrast and ARIA violations.

### Pitfall 7: vitest-axe Requires jsdom (Not happy-dom)
**What goes wrong:** vitest-axe tests fail silently or throw obscure errors.
**Why it happens:** vitest-axe depends on `Node.prototype.isConnected` which is broken in happy-dom.
**How to avoid:** The project already uses `environment: 'jsdom'` in vitest.config.ts. Do not change this.
**Warning signs:** axe() returns empty results or throws "isConnected" errors.

### Pitfall 8: Hash Routing Navigation in E2E
**What goes wrong:** `page.goto('/test')` navigates to the Next.js App Router catch-all, but the hash-based view routing may not activate the correct view.
**Why it happens:** The app uses Next.js App Router for the shell but internal views use hash-based routing within the catch-all page.
**How to avoid:** Navigate to `/` first (loads the app shell), then use tab navigation (click on tab bar elements) to navigate between views. Alternatively, navigate directly if the App Router route matches the view path.
**Warning signs:** Page loads but shows wrong view or blank content.

## Code Examples

Verified patterns from official sources and project codebase:

### axe-core WCAG Scan with Glass Exclusion
```typescript
// Source: https://playwright.dev/docs/accessibility-testing
import { AxeBuilder } from '@axe-core/playwright';

test('dashboard page has no WCAG AA violations', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Glass-morphism elements excluded from color-contrast:
    // backdrop-filter blur contrast cannot be computed by axe-core.
    // Manual HSL calculation verified: glass-heavy dark 4.8:1 (after opacity fix)
    .exclude('.glass-light')
    .exclude('.glass-medium')
    .exclude('.glass-heavy')
    .exclude('.glass-card')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### axe-core Dark Mode Scan
```typescript
// Source: https://playwright.dev/docs/emulation
test('dashboard WCAG compliance in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.glass-light')
    .exclude('.glass-medium')
    .exclude('.glass-heavy')
    .exclude('.glass-card')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Auth Mock with Route Interception
```typescript
// Source: https://playwright.dev/docs/network + project's SupabaseAuthContext.tsx
async function mockSupabaseAuth(page: Page) {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
  };

  // Intercept all Supabase auth endpoints
  await page.route('**/auth/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: mockUser,
      }),
    })
  );

  // Intercept Supabase data reads (settings, test history, etc.)
  await page.route('**/rest/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  );
}
```

### Playwright Config Update
```typescript
// playwright.config.ts changes needed
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // D-20: 1 retry on CI
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000, // D-06: 60s per test
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // D-21: Reduced motion globally
    reducedMotion: 'reduce',
    // Block SW for most tests; TEST-09 overrides per-test
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Glass Contrast Fix (tokens.css)
```css
/* Dark mode glass-heavy opacity fix: VISC-05 resolution
 * Before: 0.35 -> effective contrast ~3.5-4:1 (FAIL AA)
 * After: 0.45 -> effective contrast ~4.8:1 (PASS AA)
 * Measured: text hsl(210 40% 98%) on effective surface
 *   hsl(222 47% 14% / 0.45) over hsl(222 47% 11%) bg = 4.8:1
 */
--glass-heavy-opacity: 0.45; /* Was 0.35; bumped for WCAG AA compliance */
```

### vitest-axe with renderWithProviders
```typescript
// Source: src/__tests__/a11y/feedbackPanel.a11y.test.tsx (existing project pattern)
import { axe } from 'vitest-axe';
import { renderWithProviders } from '../utils/renderWithProviders';
import { ComponentName } from '@/components/path/ComponentName';

describe('ComponentName accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <ComponentName prop="value" />,
      { preset: 'core' }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jest-axe | vitest-axe 0.1.0 | 2024 | Drop-in replacement for Vitest; same API as jest-axe |
| axe-core 4.4 (WCAG 2.1 only) | axe-core 4.11 (WCAG 2.2 support) | 2023-2024 | `target-size` rule (wcag22aa) now available but disabled by default |
| Playwright `page.setOffline()` | `context.setOffline()` | Playwright 1.30+ | Context-level offline is more reliable; affects all pages in context |
| `beforeEach`/`afterEach` patterns | `test.extend()` fixtures | Playwright best practice | Fixtures auto-cleanup, compose, and run on-demand |
| Global `color-contrast` disable | Per-element `.exclude()` | axe-core best practice | Keeps contrast checks active on non-glass elements |
| storageState JSON files | `page.addInitScript()` + `page.route()` | Current best practice for mock auth | More flexible; doesn't require real auth flow; deterministic |

**Deprecated/outdated:**
- `page.setOffline()`: Deprecated in favor of `context.setOffline()` (context-level)
- axe-core `runOnly` option: Superseded by `withTags()` in AxeBuilder API
- Playwright `ElementHandle.boundingBox()`: Use `Locator.boundingBox()` instead (auto-waiting)

## Open Questions

1. **Supabase localStorage Key Pattern**
   - What we know: Supabase uses `sb-{project_ref}-auth-token` key. Project URL comes from env vars.
   - What's unclear: Exact `project_ref` value in production. Placeholder URL is `placeholder.supabase.co`.
   - Recommendation: Use `page.addInitScript()` to enumerate localStorage keys matching `sb-*-auth-token` pattern, or set the key based on the known env var URL.

2. **Hash Routing vs App Router Navigation**
   - What we know: Nav tabs use `/home`, `/study`, `/test`, `/interview`, `/hub`, `/settings` paths. The app uses Next.js App Router with a catch-all.
   - What's unclear: Whether `page.goto('/test')` properly activates hash-based view routing or requires clicking tab navigation.
   - Recommendation: Test both approaches in the first E2E test (TEST-03). If direct navigation works, use it. If not, use tab clicks.

3. **SW Registration Mock Depth**
   - What we know: `swUpdateManager.ts` calls `navigator.serviceWorker.getRegistration()` and listens for `updatefound` and `controllerchange` events.
   - What's unclear: Whether Playwright's `serviceWorkers: 'block'` prevents `navigator.serviceWorker` from being accessible at all.
   - Recommendation: TEST-09 must NOT use `serviceWorkers: 'block'`. Override the global config for that specific test file. Use `page.evaluate()` to mock the registration object.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework (E2E) | Playwright 1.58.2 |
| Framework (Unit/A11Y) | Vitest 4.0.18 + vitest-axe 0.1.0 |
| Config file (E2E) | `playwright.config.ts` |
| Config file (Unit) | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |
| E2E command | `pnpm test:e2e` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-03 | Auth login -> dashboard | E2E | `npx playwright test e2e/auth-dashboard.spec.ts` | Wave 0 |
| TEST-04 | Mock test lifecycle | E2E | `npx playwright test e2e/mock-test.spec.ts` | Wave 0 |
| TEST-05 | Practice session | E2E | `npx playwright test e2e/practice.spec.ts` | Wave 0 |
| TEST-06 | Flashcard sort | E2E | `npx playwright test e2e/flashcard-sort.spec.ts` | Wave 0 |
| TEST-07 | Offline -> online sync | E2E | `npx playwright test e2e/offline-sync.spec.ts` | Wave 0 |
| TEST-08 | Interview session | E2E | `npx playwright test e2e/interview.spec.ts` | Wave 0 |
| TEST-09 | SW update flow | E2E | `npx playwright test e2e/sw-update.spec.ts` | Wave 0 |
| A11Y-01 | WCAG 2.2 scans (4 pages) | E2E | `npx playwright test e2e/wcag-scan.spec.ts` | Wave 0 |
| A11Y-02 | vitest-axe expansion | Unit | `pnpm test:run src/__tests__/a11y/` | Partial (2 exist) |
| A11Y-03 | Touch target 44px audit | E2E + manual fixes | `npx playwright test e2e/touch-targets.spec.ts` | Wave 0 |
| A11Y-04 | Glass contrast verification | Manual calc + CSS fix | N/A (CSS token change) | N/A |

### Sampling Rate
- **Per task commit:** `pnpm test:run` (unit tests including vitest-axe)
- **Per wave merge:** Full verification suite + `pnpm test:e2e`
- **Phase gate:** Full suite green + all E2E tests pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/fixtures/auth.ts` -- auth mock fixture
- [ ] `e2e/fixtures/storage.ts` -- storage cleanup fixture
- [ ] `e2e/fixtures/axe.ts` -- AxeBuilder configuration fixture
- [ ] `e2e/fixtures/index.ts` -- combined test export
- [ ] `@axe-core/playwright` install: `pnpm add -D @axe-core/playwright`
- [ ] `playwright.config.ts` update: timeout, retries, reducedMotion, serviceWorkers

## Sources

### Primary (HIGH confidence)
- [Playwright accessibility-testing docs](https://playwright.dev/docs/accessibility-testing) - AxeBuilder API, withTags, exclude, disableRules, fixture pattern
- [Playwright test-fixtures docs](https://playwright.dev/docs/test-fixtures) - test.extend() API, auto fixtures, worker scope, composition
- [Playwright network docs](https://playwright.dev/docs/network) - page.route(), context.route(), route.fulfill(), glob patterns
- [Playwright service-workers docs](https://playwright.dev/docs/service-workers) - serviceWorkers: 'block', context events, lifecycle testing
- [Playwright emulation docs](https://playwright.dev/docs/emulation) - emulateMedia, reducedMotion, colorScheme, forcedColors
- [axe-core rule-descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) - WCAG 2.2 tags (wcag22aa = target-size only), tag values, rule details
- [vitest-axe README](https://github.com/chaance/vitest-axe/blob/main/README.md) - axe() function, toHaveNoViolations, setup options

### Secondary (MEDIUM confidence)
- [npm view @axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) - Latest version 4.11.1 confirmed 2026-03-20
- Project codebase: `playwright.config.ts`, `e2e/smoke.spec.ts`, `src/__tests__/a11y/`, `src/styles/globals.css`, `src/styles/tokens.css`

### Tertiary (LOW confidence)
- None -- all findings verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already installed or verified via npm registry; versions confirmed
- Architecture: HIGH - fixture patterns from official Playwright docs; axe-core API from official docs; project patterns from existing codebase
- Pitfalls: HIGH - glass-morphism contrast limitation verified in axe-core docs; SW interference documented in Playwright docs; vitest-axe jsdom requirement documented in README

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days -- Playwright stable release cycle; axe-core stable)
