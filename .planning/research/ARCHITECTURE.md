# Architecture Research: Production Hardening Integration

**Domain:** Production hardening of existing bilingual PWA (Next.js 16 App Router)
**Researched:** 2026-03-19
**Confidence:** HIGH

## System Overview: Current Architecture + Hardening Touchpoints

```
CURRENT ARCHITECTURE                    HARDENING INTEGRATION POINTS
===========================             =============================

Next.js App Router Shell                [H1] error.tsx sanitization + bilingual
  app/layout.tsx ─────────────────────  [H2] global-error.tsx bilingual
  app/(protected)/layout.tsx              (no change)
  app/(protected)/template.tsx            (no change)
  app/error.tsx ──────────────────────  [H1] sanitizeError() + BilingualMessage
  app/(protected)/error.tsx ──────────  [H1] sanitizeError() + BilingualMessage
  app/global-error.tsx ───────────────  [H2] minimal bilingual fallback

ClientProviders.tsx ──────────────────  [H3] ProviderOrderGuard (dev-time)
  ErrorBoundary (root) ──────────────── (keep as-is, outermost)
    AuthProvider
      LanguageProvider
        ThemeProvider
          TTSProvider
            ToastProvider ──────────── [H4] SW update toast target
              OfflineProvider
                SocialProvider
                  SRSProvider
                    StateProvider
                      NavigationProvider

Feature Components ──────────────────  [H5] Component-level ErrorBoundaries
  InterviewSession (1,474 LOC)
  PracticeSession (1,018 LOC)
  TestPage (960 LOC)
  CelebrationOverlay

Service Worker (sw.ts) ──────────────  [H6] skipWaiting: false + SKIP_WAITING
Client SW hook ──────────────────────  [H7] useServiceWorkerUpdate hook

Settings Sync ───────────────────────  [H8] Timestamp-based conflict detection
  ThemeContext -> syncSettingsToSupabase
  LanguageContext -> syncSettingsToSupabase
  TTSContext -> syncSettingsToSupabase
  useTestDate -> syncSettingsToSupabase

Test Infrastructure ─────────────────  [H9] Shared render utility
  34 test files, 0 E2E              [H10] Playwright E2E (separate CI job)
  vitest.config.ts ──────────────────  [H11] Incremental coverage thresholds

CI Pipeline (ci.yml) ────────────────  [H12] lint:css step + Playwright job
```

## Integration Point Details

### H1: error.tsx Sanitization + Bilingual Rendering

**What changes:** 3 files modified (`app/error.tsx`, `app/(protected)/error.tsx`, `app/global-error.tsx`)
**New components:** None -- reuses existing `sanitizeError()` from `src/lib/errorSanitizer.ts`
**Data flow change:** `error.message` no longer rendered raw; passes through `sanitizeError()` and shows `BilingualMessage`

**Composition with existing ErrorBoundary:**
Next.js error.tsx boundaries wrap `page.tsx` and child `layout.tsx`, but NOT the layout at the same level. The existing React `ErrorBoundary` in `ClientProviders.tsx` wraps everything inside the root layout. The two systems are complementary:

```
app/layout.tsx
  global-error.tsx  <-- catches root layout errors (replaces entire <html>)
  ClientProviders
    ErrorBoundary   <-- catches React render errors in all children (bilingual)
    app/(protected)/layout.tsx
      error.tsx     <-- catches page/child errors within protected routes
      page.tsx
```

**Key insight:** error.tsx catches hydration and server component errors that the React ErrorBoundary never sees. The React ErrorBoundary catches client-side render errors that bubble up from context providers and components. Both need sanitization. Both need bilingual support.

**Implementation:** Extract shared `ErrorFallbackUI` component from the existing `ErrorBoundary.tsx`'s `ErrorFallback` function. The error.tsx files import and use this shared UI. The ErrorFallback reads language mode directly from localStorage (already does this -- no context dependency), so it works in both error.tsx and ErrorBoundary contexts.

**New file:** `src/components/ErrorFallbackUI.tsx` (extracted from ErrorBoundary.tsx)
**Modified files:** `app/error.tsx`, `app/(protected)/error.tsx`, `app/global-error.tsx`, `src/components/ErrorBoundary.tsx` (imports shared UI)

### H2: global-error.tsx Bilingual Rendering

**Constraint:** `global-error.tsx` replaces the entire `<html>` and `<body>` -- no Tailwind, no design tokens, no providers available.
**Approach:** Inline styles only. Read `civic-test-language-mode` from localStorage in a try/catch. Minimal bilingual text. This is a last-resort fallback.

**Modified file:** `app/global-error.tsx`

### H3: Provider Ordering Guard

**Options evaluated:**

| Approach | Enforcement | DX | Effort |
|----------|------------|-----|--------|
| Runtime assertion in dev | Catches at render time | Clear error message | LOW |
| ESLint rule | Catches in editor | Requires custom rule authoring | HIGH |
| TypeScript constraint | Catches at compile time | Not feasible -- JSX nesting is not typed | N/A |

**Recommendation: Runtime dev-time assertion.** Add a `useProviderOrderGuard()` hook that runs only in `process.env.NODE_ENV === 'development'`. It registers each provider when it mounts (using a module-scoped array), and asserts the mount order matches the expected sequence. If wrong, throws an error with a clear message naming the misplaced provider.

**Why not ESLint:** Custom ESLint rules for JSX nesting depth analysis are fragile, hard to maintain, and the team is one person. A runtime check catches the exact same bug with 10x less code.

**Why not TypeScript:** JSX element nesting order is not expressible in the type system. You cannot create a type that says "LanguageProvider must be a child of AuthProvider."

**Implementation pattern:**

```typescript
// src/lib/providerOrderGuard.ts
const EXPECTED_ORDER = [
  'ErrorBoundary', 'AuthProvider', 'LanguageProvider', 'ThemeProvider',
  'TTSProvider', 'ToastProvider', 'OfflineProvider', 'SocialProvider',
  'SRSProvider', 'StateProvider', 'NavigationProvider',
];

const mountOrder: string[] = [];

export function registerProvider(name: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  mountOrder.push(name);
  const idx = mountOrder.length - 1;
  if (EXPECTED_ORDER[idx] !== name) {
    throw new Error(
      `Provider ordering violation: expected ${EXPECTED_ORDER[idx]} at position ${idx}, got ${name}. ` +
      `Current order: [${mountOrder.join(' > ')}]`
    );
  }
}

export function resetProviderOrder(): void {
  mountOrder.length = 0;
}
```

Each provider calls `registerProvider('ProviderName')` in its useEffect mount. The ErrorBoundary (class component) calls it in `componentDidMount`.

**New file:** `src/lib/providerOrderGuard.ts`
**Modified files:** All 11 provider/context files (1 line each in dev mode)

### H4: Service Worker Update UX

**Current state:** `skipWaiting: true` + `clientsClaim: true` in `sw.ts`. SW activates immediately. No user notification. `useNavBadges` already checks `registration?.waiting` and shows a badge on Settings -- but only detects pre-existing waiting state, does not detect updates that arrive while the app is open.

**Architecture decision: Hook, not Provider.**

The SW update lifecycle is a single boolean (`updateAvailable`) plus one action (`acceptUpdate`). This does not warrant a new context provider. A hook is sufficient.

**Where in the provider tree:** The hook will be consumed in two places:
1. `useNavBadges.ts` (already checks SW update) -- enhanced to use the hook
2. A toast notification triggered from `NavigationShell.tsx`

The toast requires `useToast()`, which means the consumer must be inside `ToastProvider`. `NavigationShell.tsx` is inside all providers, making it the correct mount point.

**SW-side changes:**
1. Change `skipWaiting: false` in `sw.ts` (let client control activation)
2. Add `message` listener for `SKIP_WAITING` in `sw.ts`

**Client-side changes:**
1. New `useServiceWorkerUpdate()` hook in `src/hooks/useServiceWorkerUpdate.ts`
2. Listens for `statechange` on waiting worker + `controllerchange` on navigator.serviceWorker
3. Exposes `{ updateAvailable: boolean; applyUpdate: () => void }`
4. On `controllerchange`: `window.location.reload()`

**Toast integration:** `NavigationShell.tsx` calls `useServiceWorkerUpdate()`, and when `updateAvailable` transitions to true, calls `showToast()` with bilingual "New version available / Refresh" message. Dismissible but persistent across navigations.

`@serwist/window` is not installed on the client (only `@serwist/next` + `serwist` for build/SW), so use the raw ServiceWorker API directly. No new dependencies needed.

**New file:** `src/hooks/useServiceWorkerUpdate.ts`
**Modified files:** `src/lib/pwa/sw.ts`, `src/components/navigation/NavigationShell.tsx`, `src/components/navigation/useNavBadges.ts`

### H5: Component-Level Error Boundaries

**Which components need boundaries:**

| Component | Risk | Crash Impact | Boundary Location |
|-----------|------|-------------|-------------------|
| InterviewSession | HIGH (1,474 LOC, speech API, audio) | Entire app crashes | Wrap in InterviewPage view |
| PracticeSession | HIGH (1,018 LOC, quiz state machine) | Entire app crashes | Wrap in PracticePage view |
| TestPage quiz flow | MEDIUM (960 LOC) | Entire app crashes | Wrap quiz section in TestPage |
| CelebrationOverlay | LOW (DotLottie, audio, confetti) | Entire app crashes | Already has Suspense; add boundary |

**Approach: Use Next.js 16 `unstable_catchError` or the existing `ErrorBoundary` class?**

The existing `ErrorBoundary` class component already has bilingual fallback, Sentry reporting, and reset/home actions. Next.js `unstable_catchError` is still unstable API. **Use the existing `ErrorBoundary` component** with a custom `fallback` prop tailored to each feature context.

```tsx
// In InterviewPage.tsx view
<ErrorBoundary
  fallback={<InterviewErrorFallback />}
  onError={(err) => captureError(err, { feature: 'interview' })}
>
  <InterviewSession {...props} />
</ErrorBoundary>
```

**The root ErrorBoundary remains.** Component-level boundaries catch feature-specific errors and show contextual recovery (e.g., "Return to Study Guide" instead of "Return to Home"). Uncaught errors still bubble to root.

**Composition hierarchy:**

```
Root ErrorBoundary (ClientProviders.tsx)
  ...providers...
    Next.js error.tsx (route-level, catches server/hydration errors)
      InterviewPage
        ErrorBoundary (feature-level, catches render errors in InterviewSession)
          InterviewSession
```

**New files:** Feature-specific fallback components (can be inline or shared)
**Modified files:** `src/views/InterviewPage.tsx`, `src/views/PracticePage.tsx`, `src/views/TestPage.tsx`

### H6+H7: SW Configuration Changes

**sw.ts changes:**

```typescript
// BEFORE
const serwist = new Serwist({
  skipWaiting: true,
  clientsClaim: true,
  ...
});

// AFTER
const serwist = new Serwist({
  skipWaiting: false,      // Let client control activation
  clientsClaim: true,       // Keep: take control of uncontrolled clients
  ...
});

// Add message handler for client-initiated skipWaiting
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**Risk:** Changing `skipWaiting` from `true` to `false` means existing users won't auto-update until they accept the prompt. First deploy after this change will still auto-activate (old SW has `skipWaiting: true`). Second deploy onward will show the update prompt.

### H8: Settings Sync Conflict Detection

**Current state:** 4 call sites independently call `gatherCurrentSettings()` + `syncSettingsToSupabase()`:
- `ThemeContext.tsx` line 64-65
- `LanguageContext.tsx` line 72-73
- `TTSContext.tsx` line 178-179
- `useTestDate.ts` line 89-90, 105-106

**Problem:** Server-wins strategy (`loadSettingsFromSupabase` overwrites localStorage on login). Offline changes are silently lost.

**Minimal conflict detection without touching all 4 providers:**

Add a `localSettingsVersion` timestamp to `settingsSync.ts`:

```typescript
// In settingsSync.ts -- new exports
const LOCAL_VERSION_KEY = 'civic-prep-settings-version';

export function markLocalSettingsChanged(): void {
  localStorage.setItem(LOCAL_VERSION_KEY, new Date().toISOString());
}

export function getLocalSettingsVersion(): string | null {
  return localStorage.getItem(LOCAL_VERSION_KEY);
}

export function clearLocalSettingsVersion(): void {
  localStorage.removeItem(LOCAL_VERSION_KEY);
}
```

Each existing `syncSettingsToSupabase` call site adds one line: `markLocalSettingsChanged()`. This is the minimal touch.

In `loadSettingsFromSupabase`, compare `getLocalSettingsVersion()` against `row.updated_at`:
- If local version > remote `updated_at`: local settings are newer (changed offline). Merge by keeping local values and pushing them to remote.
- If local version <= remote `updated_at` or no local version: server wins (current behavior).

**Modified files:** `src/lib/settings/settingsSync.ts` (add timestamp tracking + merge logic), plus 1-line additions to the 4 call sites.
**No new providers, no new hooks, no structural changes.**

### H9: Shared Test Render Utility

**Current test pattern (repeated in every test):**

```typescript
// Each test mocks individually:
vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ user: null }),
}));
```

**Problem:** 8 of 10 context providers have no tests. Writing tests for them requires wrapping in the full provider tree. Each test file reinvents the wheel.

**Shared utility architecture:**

```typescript
// src/__tests__/utils/renderWithProviders.tsx
import { render, type RenderOptions } from '@testing-library/react';

interface ProviderOverrides {
  auth?: Partial<AuthContextValue>;
  language?: Partial<LanguageContextValue>;
  theme?: Partial<ThemeContextValue>;
  srs?: Partial<SRSContextValue>;
  // ... etc
}

function createTestProviders(overrides: ProviderOverrides = {}) {
  // Returns a wrapper component that provides mock contexts
  // Uses real providers where possible, mocks where needed
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { providerOverrides?: ProviderOverrides }
) {
  const Wrapper = createTestProviders(options?.providerOverrides);
  return render(ui, { wrapper: Wrapper, ...options });
}
```

**Mock strategy for 10 providers:**

| Provider | Test Strategy | Why |
|----------|--------------|-----|
| ErrorBoundary | Use real | Class component, already tested |
| AuthProvider | Mock via context value | Supabase client not available in jsdom |
| LanguageProvider | Use real with localStorage mock | Pure localStorage, no side effects |
| ThemeProvider | Use real with localStorage mock | Pure localStorage, no side effects |
| TTSProvider | Mock via context value | speechSynthesis API not real in jsdom |
| ToastProvider | Use real | Pure React state, no external deps |
| OfflineProvider | Mock via context value | IndexedDB not available in jsdom |
| SocialProvider | Mock via context value | Supabase dependency |
| SRSProvider | Mock via context value | IndexedDB + Supabase dependency |
| StateProvider | Use real | Pure static data, no side effects |
| NavigationProvider | Mock via context value | DOM measurement APIs |

**Principle:** Use real providers when they have no external dependencies. Mock providers that depend on browser APIs not available in jsdom (IndexedDB, speechSynthesis, Supabase).

**New files:** `src/__tests__/utils/renderWithProviders.tsx`, `src/__tests__/utils/mockContextValues.ts`

### H10: Playwright E2E Integration

**CI pipeline architecture: Separate job, parallel with unit tests.**

```yaml
# .github/workflows/ci.yml
jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --prod --audit-level=high
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run lint:css        # [NEW]
      - run: pnpm run format:check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - run: pnpm run test:coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage-report, path: coverage/, retention-days: 7 }

  e2e-tests:                            # [NEW JOB]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm run build
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with: { name: playwright-report, path: playwright-report/, retention-days: 7 }
```

**Why separate jobs, not separate steps:**
1. Jobs run in parallel. Unit tests and E2E tests have no dependency on each other.
2. E2E failures don't block seeing lint/type/unit results.
3. E2E requires browser binaries (`playwright install`) which adds 1-2 min overhead. No reason to pay that cost for unit-only runs.
4. Build artifact can be shared between unit-tests and e2e-tests if needed via `actions/upload-artifact`.

**Why Chromium only:** Single browser covers 90%+ of PWA users. Firefox and WebKit add CI minutes with diminishing returns for a solo-dev project. Can expand later.

**Playwright config:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test directory:** `e2e/` at project root (Playwright convention, separate from `src/` Vitest tests).

**New files:** `playwright.config.ts`, `e2e/` directory with test files
**Modified files:** `.github/workflows/ci.yml`, `package.json` (add `test:e2e` script), `.gitignore` (add playwright artifacts)

### H11: Incremental Coverage Thresholds

**Current state:** 4 per-file thresholds. No global minimum.

**Strategy: Ratcheting thresholds.**

1. Set a LOW global floor (e.g., 20% lines) that won't block CI today
2. Add per-file thresholds for all files that already have test suites (currently 34 test files covering ~30 source files)
3. Enable `autoUpdate: true` in Vitest config -- when coverage improves, thresholds automatically ratchet up
4. Each milestone, raise the global floor by 5-10%

```typescript
// vitest.config.ts coverage.thresholds additions
thresholds: {
  // Global floor -- won't block CI now, ratchets up over time
  lines: 20,
  functions: 20,
  branches: 15,
  statements: 20,

  // Per-file (existing)
  'src/lib/shuffle.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
  'src/lib/saveSession.ts': { lines: 70, functions: 70, branches: 70, statements: 70 },
  'src/lib/errorSanitizer.ts': { lines: 90, functions: 90, branches: 90, statements: 90 },
  'src/components/ErrorBoundary.tsx': { lines: 70, functions: 70, branches: 70, statements: 70 },

  // Per-file (new -- business-critical)
  'src/lib/srs/fsrsEngine.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
  'src/lib/readiness/readinessEngine.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
  'src/lib/interview/answerGrader.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
  'src/lib/mastery/calculateMastery.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
  'src/lib/sort/sortReducer.ts': { lines: 70, functions: 70, branches: 60, statements: 70 },
},
autoUpdate: true,
```

**Why autoUpdate matters:** Solo dev won't remember to bump thresholds. Auto-ratchet captures progress automatically.

**Modified file:** `vitest.config.ts`

### H12: lint:css in CI

**Trivial addition.** Add `pnpm run lint:css` step to the lint-typecheck job between `lint` and `format:check`.

**Modified file:** `.github/workflows/ci.yml`

## Data Flow Changes

### New: SW Update Notification Flow

```
[New SW installed]
    |
    v
sw.ts: self.addEventListener('install', ...) -- SW enters waiting state
    |
    v
useServiceWorkerUpdate: registration.waiting detected
    |
    v
NavigationShell: calls showToast("New version available")
    |
    v
[User taps "Refresh"]
    |
    v
useServiceWorkerUpdate: postMessage({ type: 'SKIP_WAITING' })
    |
    v
sw.ts: self.skipWaiting() -> activate -> controllerchange
    |
    v
useServiceWorkerUpdate: navigator.serviceWorker.controllerchange -> window.location.reload()
```

### Modified: Settings Sync Flow (with conflict detection)

```
[Settings changed locally]
    |
    v
ThemeContext/LanguageContext/TTSContext/useTestDate
    |
    v
markLocalSettingsChanged() -- writes timestamp to localStorage  [NEW]
    |
    v
gatherCurrentSettings() + syncSettingsToSupabase()  (unchanged)

---

[User logs in on another device]
    |
    v
loadSettingsFromSupabase(userId)
    |
    v
Compare getLocalSettingsVersion() vs row.updated_at             [NEW]
    |
    v
IF local newer: push local to remote (local wins)              [NEW]
IF remote newer OR no local version: apply remote (server wins) (unchanged)
    |
    v
clearLocalSettingsVersion()                                     [NEW]
```

### Error Handling Data Flow (with component boundaries)

```
[Error in InterviewSession render]
    |
    v
Feature ErrorBoundary catches
    |
    v
Shows InterviewErrorFallback (contextual: "Return to Study Guide")
Reports to Sentry via captureError()
    |
    v
[User clicks "Try again" or "Return to Study Guide"]

---

[Error in InterviewSession that feature boundary misses]
    |  (shouldn't happen, but defensive)
    v
Next.js error.tsx catches
    |
    v
Shows sanitized bilingual error UI
    |
    v
[Error in root layout]
    |
    v
global-error.tsx catches (inline styles, minimal bilingual)
```

## Build Order: Dependency-Aware Sequencing

The hardening tasks have dependencies between them. Build in this order:

### Phase 1: Foundations (no dependencies, enables everything else)

| Task | Files | Rationale |
|------|-------|-----------|
| Shared test render utility | `src/__tests__/utils/` | Every subsequent test needs this |
| ErrorFallbackUI extraction | `src/components/ErrorFallbackUI.tsx` | Needed by error.tsx fixes AND feature boundaries |
| Provider order guard | `src/lib/providerOrderGuard.ts` + 11 providers | Pure addition, zero risk |
| lint:css in CI | `.github/workflows/ci.yml` | Trivial, ship immediately |

### Phase 2: Error Handling (depends on Phase 1 ErrorFallbackUI)

| Task | Files | Rationale |
|------|-------|-----------|
| error.tsx sanitization + bilingual | 3 error.tsx files | Uses extracted ErrorFallbackUI |
| global-error.tsx bilingual | `app/global-error.tsx` | Independent of ErrorFallbackUI (inline styles) |
| Component-level error boundaries | 3-4 view files | Uses existing ErrorBoundary + ErrorFallbackUI |

### Phase 3: SW Update UX (independent of Phase 1-2)

| Task | Files | Rationale |
|------|-------|-----------|
| sw.ts skipWaiting change | `src/lib/pwa/sw.ts` | Must deploy before client hook works |
| useServiceWorkerUpdate hook | `src/hooks/useServiceWorkerUpdate.ts` | Depends on sw.ts change |
| NavigationShell toast integration | `src/components/navigation/NavigationShell.tsx` | Depends on hook + ToastProvider |
| useNavBadges update | `src/components/navigation/useNavBadges.ts` | Depends on hook |

### Phase 4: Settings Sync (independent of Phase 1-3)

| Task | Files | Rationale |
|------|-------|-----------|
| Timestamp tracking in settingsSync.ts | `src/lib/settings/settingsSync.ts` | Core logic change |
| 4 call site additions | 3 contexts + 1 hook (1 line each) | Minimal touch |

### Phase 5: Test Infrastructure (depends on Phase 1 render utility)

| Task | Files | Rationale |
|------|-------|-----------|
| Coverage thresholds | `vitest.config.ts` | No code changes, just config |
| Playwright setup | `playwright.config.ts`, `e2e/`, CI | Independent framework |
| Context provider tests | `src/contexts/*.test.tsx` | Uses shared render utility |
| View-level tests | `src/views/*.test.tsx` | Uses shared render utility |
| E2E critical flows | `e2e/*.spec.ts` | Uses built app |

### Phase 6: Cleanup (independent, lowest priority)

| Task | Files | Rationale |
|------|-------|-----------|
| DotLottie dependency removal | `package.json`, related files | Remove dead code |
| react-joyride version pin | `package.json` | Wait for stable release |
| Dead code removal (safeAsync) | `src/lib/async/` | Low-risk cleanup |
| Sentry fingerprinting | `src/lib/sentry.ts` | Operational improvement |
| IndexedDB cache versioning | `src/lib/pwa/offlineDb.ts` | Add version check |

## Anti-Patterns

### Anti-Pattern 1: New Provider for SW Updates

**What people do:** Create a `ServiceWorkerProvider` and add it to the 11-provider chain.
**Why it's wrong:** The SW update state is a single boolean consumed in 1-2 places. A provider adds nesting depth, potential re-render cascading, and another entry in the fragile ordering chain.
**Do this instead:** A hook (`useServiceWorkerUpdate`) consumed directly where needed.

### Anti-Pattern 2: Centralized Settings Sync Hook Replacing All Call Sites

**What people do:** Create `useSettingsSync()` hook that watches all localStorage keys and consolidates the 4 sync call sites into 1.
**Why it's wrong:** Sounds clean, but requires ripping sync logic out of 4 providers, breaking their self-contained update-and-sync pattern. Introduces timing issues (does the watcher debounce? What if two settings change in the same frame?).
**Do this instead:** Keep the distributed pattern. Add `markLocalSettingsChanged()` (1 line per call site) for conflict detection. The existing pattern is clear: each provider owns its own sync. Adding a centralized watcher creates a hidden dependency.

### Anti-Pattern 3: Per-File Coverage Thresholds Without autoUpdate

**What people do:** Set high thresholds manually, coverage drops below during refactoring, CI blocks for weeks.
**Why it's wrong:** Thresholds become a nuisance instead of a ratchet. Developer wastes time writing low-value tests to satisfy the threshold.
**Do this instead:** Start LOW, enable `autoUpdate: true`. Coverage naturally ratchets up as real tests are added.

### Anti-Pattern 4: E2E Tests Against Dev Server

**What people do:** Run `pnpm dev` and then Playwright against it.
**Why it's wrong:** Dev server has different behavior than production (no caching, different error pages, HMR interference, slower). Tests pass in CI but bugs appear in prod.
**Do this instead:** Always test against `pnpm build && pnpm start`. The `webServer` config in Playwright handles this automatically.

### Anti-Pattern 5: Testing Providers by Mocking Everything

**What people do:** Mock every dependency of every provider, test passes but verifies nothing real.
**Why it's wrong:** The mock shapes diverge from real implementations over time. Tests pass but production breaks.
**Do this instead:** Use real providers where possible (LanguageProvider, ThemeProvider, ToastProvider, StateProvider have no external deps). Only mock external APIs (Supabase, speechSynthesis, IndexedDB).

## New vs Modified Component Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/ErrorFallbackUI.tsx` | Shared bilingual error fallback (extracted) |
| `src/lib/providerOrderGuard.ts` | Dev-time provider ordering assertion |
| `src/hooks/useServiceWorkerUpdate.ts` | SW update detection + apply |
| `src/__tests__/utils/renderWithProviders.tsx` | Shared test render utility |
| `src/__tests__/utils/mockContextValues.ts` | Default mock context values |
| `playwright.config.ts` | Playwright E2E configuration |
| `e2e/` | E2E test directory |

### Modified Files

| File | Change |
|------|--------|
| `app/error.tsx` | Sanitization + bilingual UI |
| `app/(protected)/error.tsx` | Sanitization + bilingual UI |
| `app/global-error.tsx` | Bilingual + inline styles |
| `src/components/ErrorBoundary.tsx` | Import shared ErrorFallbackUI |
| `src/components/ClientProviders.tsx` | Import providerOrderGuard reset |
| `src/lib/pwa/sw.ts` | skipWaiting: false + SKIP_WAITING handler |
| `src/components/navigation/NavigationShell.tsx` | SW update toast |
| `src/components/navigation/useNavBadges.ts` | Use useServiceWorkerUpdate |
| `src/lib/settings/settingsSync.ts` | Timestamp tracking + merge logic |
| `src/contexts/ThemeContext.tsx` | +1 line: markLocalSettingsChanged() |
| `src/contexts/LanguageContext.tsx` | +1 line: markLocalSettingsChanged() |
| `src/contexts/TTSContext.tsx` | +1 line: markLocalSettingsChanged() |
| `src/hooks/useTestDate.ts` | +2 lines: markLocalSettingsChanged() |
| `src/views/InterviewPage.tsx` | Wrap InterviewSession in ErrorBoundary |
| `src/views/PracticePage.tsx` | Wrap PracticeSession in ErrorBoundary |
| `src/views/TestPage.tsx` | Wrap quiz section in ErrorBoundary |
| `vitest.config.ts` | Coverage thresholds + autoUpdate |
| `.github/workflows/ci.yml` | lint:css step + e2e-tests job |
| `package.json` | test:e2e script |
| 11 provider/context files | +1 line each: registerProvider() in dev |

## Sources

- [Next.js Playwright Testing Guide](https://nextjs.org/docs/app/guides/testing/playwright) (v16.2.0, 2026-02-11)
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) (v16.2.0, 2026-03-17)
- [Vitest Coverage Configuration](https://vitest.dev/config/coverage)
- [@serwist/window Documentation](https://serwist.pages.dev/docs/window)
- [Playwright CI Integration](https://playwright.dev/docs/ci)
- [Chrome Developers: Handling SW Updates](https://developer.chrome.com/docs/workbox/handling-service-worker-updates)

---
*Architecture research for: Production hardening integration of bilingual PWA*
*Researched: 2026-03-19*
