# Feature Research: v4.1 Production Hardening

**Domain:** Production hardening for bilingual PWA -- testing infrastructure, security hardening, architecture resilience, accessibility compliance, dependency cleanup
**Researched:** 2026-03-19
**Confidence:** HIGH
**Supersedes:** v4.0 feature research (retained in git history)

## Context: What Already Exists

This milestone adds NO new user-facing features. It hardens the existing 226-requirement, 78K LOC codebase against regressions, security leaks, and maintenance burden.

**Testing infrastructure (current state):**
- Vitest 4.x with jsdom, 31 test files, ~400 test cases
- Coverage thresholds on 4 files only (shuffle 100%, errorSanitizer 90%, ErrorBoundary 70%, saveSession 70%)
- No E2E framework, no Playwright, no Cypress
- 8 of 10 context providers untested, 0 of 14 page views tested
- No shared `renderWithProviders` utility

**Error handling (current state):**
- Single root ErrorBoundary (class component) with bilingual sanitized messages
- 3 Next.js error.tsx files expose raw `error.message`, English-only, no sanitization
- No component-level error boundaries (InterviewSession crash kills entire app)

**Service worker (current state):**
- Serwist with `skipWaiting: true` + `clientsClaim: true`
- No user notification on version change
- No guard against reload during active sessions

**Sync (current state):**
- Settings: server-wins (offline changes lost on login)
- Bookmarks: add-wins merge (deletions don't propagate)
- SRS: three-way merge with recency preference (well-implemented)
- Streaks: longer-streak-wins (correct)

---

## Table Stakes (Users Expect These)

Features that prevent regressions, data loss, and broken experiences. Missing these means production incidents go undetected.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Error.tsx sanitization + bilingual rendering | 3 error.tsx files render raw `error.message` -- potential SQL/stack trace leak. Half the user base reads Burmese but sees English-only errors. | LOW | Existing `sanitizeError()` and `BilingualMessage` from ErrorBoundary.tsx | Apply `sanitizeError()` in all 3 error.tsx files. Read language mode from localStorage (same pattern as ErrorBoundary.tsx line 143). Add "Return home" navigation. No new dependencies. |
| Component-level error boundaries | Single root ErrorBoundary means InterviewSession crash kills entire app. Users expect graceful feature-level recovery, not a full-app error screen. | MEDIUM | `react-error-boundary` v5 library | Wrap 4 high-risk components: InterviewSession, PracticeSession, TestPage, CelebrationOverlay. Use library's `resetKeys` + `FallbackComponent` API. Each fallback is bilingual with retry + "return to dashboard". CelebrationOverlay gets `fallback={null}` (silent -- non-critical). |
| Service worker update notification | `skipWaiting: true` silently swaps versions. Users see stale cached pages or broken state mid-session with no explanation. 68% of PWAs use skipWaiting but best practice is to notify users. | MEDIUM | `controllerchange` event listener, existing BilingualToast | `useServiceWorkerUpdate` hook listens for `controllerchange`. Shows persistent toast: "New version available -- Tap to refresh". Guards against reload during active mock test/interview (check NavigationProvider.isLocked). Defers toast until session ends if locked. |
| Shared test render utility | Each test file defines its own provider wrapper. Adding a new provider dependency means updating every test file. This blocks efficient test writing for providers and views. | LOW | New `src/__tests__/utils/renderWithProviders.tsx` | Configurable provider stack with sensible defaults (mocked auth=null, English language, light theme). Accept overrides: `renderWithProviders(<Component />, { language: 'bilingual', user: mockUser })`. Pattern from Testing Library docs. |
| Coverage thresholds on business-critical files | Only 4 files have coverage enforcement. `readinessEngine.ts`, `fsrsEngine.ts`, `answerGrader.ts` have tests but no threshold -- coverage can silently regress. | LOW | `vitest.config.ts` threshold configuration | Add 80%+ thresholds for all `src/lib/` files with existing test suites (~15 files). Add global minimum floor (e.g., 40% lines). Prevents regressions. |
| lint:css in CI pipeline | CI runs `lint`, `format:check`, `typecheck`, `test:coverage`, `build` but skips `lint:css`. CSS regressions only caught locally. | LOW | `.github/workflows/ci.yml` one-line addition | Add `pnpm run lint:css` step after `lint` step. |
| Dead code cleanup | `safeAsync` (50 LOC + 80 LOC tests, zero consumers), `@lottiefiles/dotlottie-react` (~200KB WASM renderer, zero `.lottie` files in `public/lottie/`), redundant RLS INSERT policies on `streak_data` and `earned_badges`. | LOW | Knip for detection, manual removal | Run Knip to find all dead exports/dependencies. Remove safeAsync or document as reserved infrastructure. Remove DotLottie dependency (no assets sourced after 2 milestones -- CELB-06). Drop redundant INSERT policies. |
| Sentry error fingerprinting | Network/IndexedDB errors create separate Sentry issues instead of grouping. Noise obscures real errors in the dashboard. | LOW | `beforeSend` rules in `src/lib/sentry.ts` | Group by error class: network errors -> one issue, IndexedDB quota -> one issue, Supabase timeout -> one issue. Pattern: `event.fingerprint = ['network-error']`. |

### E2E Test Coverage (Table Stakes, HIGH complexity)

This is broken out separately due to its scope. Playwright E2E tests are the highest-impact addition for regression prevention.

| Critical Flow | What to Test | Flake Risk | Approach |
|---------------|-------------|------------|----------|
| Auth: login -> dashboard | Email login, session persistence, dashboard renders with user data | LOW | Use Playwright `storageState` for auth reuse across tests |
| Mock test lifecycle | Start test, answer 20 questions, timer behavior, pass/fail, results saved to history | MEDIUM | Timer-dependent: use Playwright `page.clock` API for deterministic time |
| Practice session | Category filter, answer question, check answer, feedback panel, keyword highlights | LOW | Stable flow, straightforward assertions |
| Flashcard sort | Select category, swipe cards (Know/Don't Know), results, SRS batch add | MEDIUM | Touch gesture simulation via `page.touchscreen` |
| Offline -> online sync | Go offline, answer questions, reconnect, verify sync queue processes | HIGH | `context.setOffline(true/false)` + route interception for Supabase |
| Interview session | Setup -> questions -> speech/text input -> grading -> results (Practice mode) | HIGH | Must mock SpeechRecognition API; use text input fallback path |
| Service worker update | Detect new version, show toast, user-triggered reload | MEDIUM | Requires building 2 app versions to test SW transition |

**Setup requirements:**
- `playwright.config.ts` with `webServer` pointing to `pnpm build && pnpm start` (test production build, not dev)
- `e2e/` directory mirroring app route structure
- Auth state saved to `storageState` file for test reuse
- Supabase test project or route interception for deterministic data
- CI integration: run E2E on PR, not every push (slow)

---

## Differentiators (Competitive Advantage)

Features that go beyond minimum viability. These make the codebase resilient and maintainable long-term.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Provider ordering guard | Dev-time validation catches provider reordering before runtime crash. The 10-provider chain has caused 2 production bugs already (auth deadlock, useAuth missing). | MEDIUM | New `ProviderOrderGuard` or `useProviderOrderCheck` | In dev mode, each provider registers itself in a global array on mount. A guard component verifies order matches expected sequence. Only runs in `NODE_ENV === 'development'`. Zero production overhead. |
| Context provider unit tests (8 untested) | 8 of 10 providers have zero test coverage. Provider bugs (auth deadlock, ordering crash) reached production. Testing providers catches state machine bugs early. | HIGH | Shared render utility, Supabase/localStorage/idb-keyval mocks | Test each provider independently with `renderHook` + wrapper. Key: SupabaseAuthContext (login, hydration, session save, offline queue), LanguageContext (switch + sync), SRSContext (deck load, card ops, remote merge), OfflineContext (cache init, online transition). |
| InterviewSession decomposition | 1,474 lines with 9 QuestionPhase states. Changes require understanding entire file. Testing individual phases is impossible without rendering the whole component. | HIGH | Careful state lifting, sub-component extraction | Extract by phase: `InterviewGreeting`, `InterviewQuestioning`, `InterviewFeedback`, `InterviewTransition`. Create `useInterviewStateMachine` hook for shared state. Target: parent under 400 lines, sub-components under 200 each. |
| Settings sync conflict resolution | Server-wins strategy silently drops offline settings changes on login. User changes theme/language offline, logs in, all changes vanish. | MEDIUM | Supabase schema change (`updated_at` column) | Per-field last-write-wins with timestamps. Store `{ value, updatedAt }` in localStorage. Compare local vs remote `updated_at` per field. No CRDTs needed -- settings are single-writer, conflict window is small (offline duration only). |
| Automated WCAG 2.2 accessibility audit | Glass-morphism contrast unverified (VISC-05). Touch target audit incomplete (A11Y-03). No systematic check across 30+ component directories. Axe-core catches ~57% of issues automatically. | MEDIUM | `@axe-core/playwright` for E2E, existing `vitest-axe` for unit | Two-tier: (1) Expand vitest-axe to cover all interactive components. (2) Add Playwright axe scans on dashboard, test page, interview, settings pages. Tag `wcag22aa`. Run comprehensive scans in nightly CI, smoke checks per commit. |
| IndexedDB cache versioning | `version: 1` field exists in cache metadata but is never checked. Stale question format after content updates goes undetected. | LOW | `src/lib/pwa/offlineDb.ts` modification | On cache read, compare stored version against current app version constant. If mismatched, invalidate and re-fetch. Bump version when question schema changes. |

---

## Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Visual regression testing (Playwright screenshots) | Catch glass-morphism / animation rendering changes | Maintenance burden extreme for solo dev: baseline images break on OS/font/browser updates, require manual approval workflow, slow CI. PROJECT.md lists this as out of scope. | Component-level vitest-axe for structural regressions + manual visual QA at milestone boundaries. |
| Full CRDT sync engine | Proper conflict-free data merging, no data loss ever | CRDTs add 30-100KB (Yjs/Automerge). App sync data is simple key-value settings + append-only history. CRDT solves concurrent editing that doesn't exist here (single user, one device at a time). | Per-field last-write-wins with timestamps for settings. Existing append-only merge for history. Existing add-wins for bookmarks. |
| 100% test coverage target | Comprehensive safety net | Diminishing returns past ~70-80% for UI code. View components are mostly declarative JSX. Forces testing implementation details over behavior. | Tiered thresholds: 80%+ for `src/lib/`, 70%+ for `src/contexts/`, no threshold for `src/views/` (covered by E2E). |
| Cypress instead of Playwright | Familiar, good DX, time-travel debugging | Playwright is faster (parallel by default), better multi-browser support, better Next.js integration (official docs recommend it), better PWA/service worker testing. | Playwright. Official Next.js recommendation. |
| MSW (Mock Service Worker) for E2E tests | Mock all API calls for deterministic E2E | E2E should hit real endpoints to catch integration bugs. MSW creates false confidence -- tests pass but real Supabase calls fail. | Use MSW only for unit/integration tests. E2E uses Playwright route interception (`page.route()`) for specific flaky endpoints only. |
| react-joyride replacement | Pre-release dependency (3.0.0-7) is risky | Onboarding tour works, is dynamically imported, non-critical. Replacing means rewriting 7-step tour config and testing on all devices. | Pin to stable 3.0.0 when released. If 3.0.0 never ships in 6+ months, evaluate Shepherd.js. |
| Console output replacement (36 calls) | Replace console.error/warn with structured logging | All 36 calls are in error-handling catch blocks and auth flows. No PII leaked. Low severity with no user impact. | Defer. Replace incrementally if Sentry fingerprinting reveals gaps. Not worth a dedicated effort. |

---

## Feature Dependencies

```
[Shared test render utility]
    |--enables--> [Context provider unit tests]
    |--enables--> [Page-level view tests (future)]
    |--used by--> [Playwright E2E setup] (for consistent mocking patterns)

[Playwright E2E setup]
    |--enables--> [E2E critical flow tests]
    |--enables--> [Automated WCAG audit via @axe-core/playwright]
    |--enables--> [E2E offline->online sync verification]
    |--enables--> [Service worker update UX verification]

[Error.tsx sanitization]
    |--independent--> (no dependencies, immediate fix)

[Component-level error boundaries]
    |--enhances--> [Error.tsx sanitization] (consistent error UX)
    |--independent of--> [E2E tests] (parallel work)

[InterviewSession decomposition]
    |--enables--> [InterviewSession error boundary] (wraps smaller sub-components)
    |--enables--> [InterviewSession unit tests] (test phases independently)
    |--independent of--> [E2E tests] (refactoring, not new behavior)

[Settings sync conflict resolution]
    |--requires--> [Supabase schema: updated_at column on user_settings]
    |--enables--> [E2E offline settings sync test]

[Provider ordering guard]
    |--independent--> (dev-time only, no production deps)

[Dead code cleanup]
    |--independent--> (removal, not addition)
    |--should precede--> [Coverage thresholds] (remove dead code before measuring)

[Sentry fingerprinting]
    |--independent--> (configuration change only)

[IndexedDB cache versioning]
    |--independent--> (internal improvement)

[lint:css in CI]
    |--independent--> (CI config change)
```

### Dependency Notes

- **Dead code cleanup should precede coverage thresholds:** Removing safeAsync and DotLottie eliminates dead test files from coverage calculations. Clean up first, then set thresholds.
- **InterviewSession decomposition enables both testing and error boundaries:** Cannot add granular error boundaries or phase-level tests until the 1,474-line component is split. Highest-effort prerequisite.
- **Settings sync requires schema change:** Adding `updated_at` timestamps to `user_settings` table means a Supabase migration. Plan early since it affects production data.
- **Playwright E2E and shared render utility are soft dependencies:** E2E uses different mocking (route interception) from unit tests (vi.mock), so they can start in parallel.

---

## Milestone Phase Structure

### Phase 1: Foundation (Infrastructure + Quick Wins)

Core infrastructure that unblocks everything else.

- [ ] Shared test render utility (`renderWithProviders`)
- [ ] Playwright setup (`playwright.config.ts`, `e2e/` directory, CI integration)
- [ ] Dead code cleanup via Knip (safeAsync, DotLottie, redundant RLS)
- [ ] lint:css in CI pipeline
- [ ] Coverage thresholds expanded to all tested `src/lib/` files

### Phase 2: Security + Error Resilience

Harden error handling and recovery.

- [ ] Error.tsx sanitization + bilingual rendering (3 files)
- [ ] Component-level error boundaries (4 components)
- [ ] Sentry error fingerprinting
- [ ] Provider ordering guard (dev-time)

### Phase 3: Architecture Improvements

Reduce complexity before testing complex components.

- [ ] InterviewSession decomposition (9 phases -> sub-components + state machine hook)
- [ ] Settings sync conflict resolution (LWW with per-field timestamps)
- [ ] Service worker update UX (controllerchange + toast)
- [ ] IndexedDB cache versioning

### Phase 4: Test Coverage Expansion

Architecture is cleaner -- test it.

- [ ] Context provider unit tests (8 providers)
- [ ] E2E critical flow tests (7 flows)
- [ ] Automated WCAG 2.2 audit (vitest-axe expansion + Playwright axe scans)

---

## Feature Prioritization Matrix

| Feature | User Value | Impl Cost | Risk if Skipped | Priority |
|---------|------------|-----------|-----------------|----------|
| Error.tsx sanitization + bilingual | HIGH | LOW | Raw errors leak to users | P1 |
| Shared test render utility | HIGH (enables) | LOW | Every test reinvents wrappers | P1 |
| lint:css in CI | MEDIUM | LOW | CSS regressions undetected | P1 |
| Dead code cleanup (Knip) | MEDIUM | LOW | 200KB unused WASM, dead tests | P1 |
| Coverage thresholds expansion | MEDIUM | LOW | Coverage silently regresses | P1 |
| Component-level error boundaries | HIGH | MEDIUM | Feature crash kills entire app | P1 |
| Service worker update UX | HIGH | MEDIUM | Stale pages, broken mid-session | P1 |
| Sentry error fingerprinting | MEDIUM | LOW | Error noise obscures real issues | P1 |
| Playwright E2E setup + critical flows | HIGH | HIGH | Auth/study/sync regressions undetected | P1 |
| Provider ordering guard | MEDIUM | MEDIUM | Next reorder causes prod crash | P2 |
| Context provider unit tests (8) | HIGH | HIGH | Provider bugs reach production | P2 |
| InterviewSession decomposition | MEDIUM | HIGH | 1,474 lines untestable | P2 |
| Settings sync conflict resolution | MEDIUM | MEDIUM | Offline settings silently lost | P2 |
| Automated WCAG 2.2 audit | MEDIUM | MEDIUM | Contrast, touch targets unverified | P2 |
| IndexedDB cache versioning | LOW | LOW | Stale questions after update | P2 |
| Page-level view tests | LOW | HIGH | E2E covers critical paths | P3 |
| Hook unit tests (20+) | LOW | HIGH | Low-risk hooks, high test cost | P3 |
| react-joyride stable migration | LOW | LOW | Wait for upstream release | P3 |

---

## Implementation Patterns

### Provider Testing Approach

Test each provider in isolation with minimal wrapper, NOT all 10 together:

```
SupabaseAuthContext: mock Supabase client + onAuthStateChange
LanguageContext:     mock useAuth (returns user or null)
ThemeContext:        mock useAuth, mock matchMedia
TTSContext:          mock useAuth, mock speechSynthesis
SRSContext:          mock useAuth, mock Supabase, mock idb-keyval
SocialContext:       mock useAuth, mock Supabase
OfflineContext:      wrap in real ToastProvider (lightweight), mock navigator.onLine
StateContext:        mock localStorage
NavigationProvider:  mock usePathname from next/navigation
```

### Error Boundary Placement

```
ClientProviders (root ErrorBoundary -- keep existing class component)
  |
  +-- InterviewSession
  |     react-error-boundary with FallbackComponent: bilingual "Interview crashed" + return to setup
  |     resetKeys: [mode, sessionId]
  |
  +-- PracticeSession
  |     react-error-boundary with FallbackComponent: bilingual "Practice error" + return to study guide
  |     resetKeys: [categoryId]
  |
  +-- TestPage
  |     react-error-boundary with FallbackComponent: bilingual "Test error, progress auto-saved"
  |     resetKeys: [testId]
  |
  +-- CelebrationOverlay
        react-error-boundary with fallback={null} (silent, non-critical)
```

### Service Worker Update UX Flow

```
1. User opens app (existing SW active)
2. Browser checks for SW update in background
3. New SW installs, activates (skipWaiting: true)
4. controllerchange fires on existing page
5. useServiceWorkerUpdate hook detects change
6. Check NavigationProvider.isLocked:
   - If locked (active test/interview): defer toast, show badge on Settings tab
   - If unlocked: show persistent BilingualToast
     EN: "New version available"
     MY: "ဗားရှင်းသစ် ရနိုင်ပါပြီ"
     Action: "Update now" / "ယခု အပ်ဒိတ်လုပ်ရန်"
7. On action click: window.location.reload()
```

### Settings Sync: Per-Field LWW

```
Current (server-wins):
  Login -> pull remote -> overwrite localStorage -> done
  Problem: offline changes lost silently

Proposed (per-field LWW):
  Login -> pull remote settings with updated_at
  For each field (theme, language, ttsRate, ttsPitch, ttsAutoRead, testDate):
    if remote.updated_at > local.updatedAt: use remote
    else: use local, queue push to remote

  localStorage format: { value: 'dark', updatedAt: 1710849600000 }
  Supabase: ALTER TABLE user_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

No CRDTs. Per-field timestamps suffice: single-writer (one user), conflict window is small (offline duration).

### InterviewSession Decomposition Target

```
InterviewSession.tsx (1,474 lines)
  -> useInterviewStateMachine.ts (~300 lines: state, transitions, timer)
  -> InterviewSession.tsx (~400 lines: layout, phase routing)
  -> InterviewGreeting.tsx (~100 lines: greeting phase UI)
  -> InterviewQuestioning.tsx (~250 lines: reading + responding phases)
  -> InterviewFeedback.tsx (~200 lines: grading + feedback phases)
  -> InterviewTransition.tsx (~100 lines: transition between questions)
```

Each sub-component receives phase-specific props. State machine hook manages transitions. Parent routes to correct sub-component based on current phase.

---

## Sources

- [Next.js Playwright Testing Guide](https://nextjs.org/docs/app/guides/testing/playwright) -- official E2E testing docs (HIGH confidence)
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) -- error.tsx patterns (HIGH confidence)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary) -- resetKeys, onReset, FallbackComponent API (HIGH confidence)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) -- @axe-core/playwright integration (HIGH confidence)
- [Playwright Service Workers](https://playwright.dev/docs/service-workers) -- SW testing support (HIGH confidence)
- [Playwright Network](https://playwright.dev/docs/network) -- offline simulation, route interception (HIGH confidence)
- [Knip](https://knip.dev) -- dead code detection for TypeScript, 100+ plugins including Next.js (HIGH confidence)
- [Serwist Registration Docs](https://serwist.pages.dev/docs/next/configuring/register) -- manual SW registration options (HIGH confidence)
- [PWA Update Patterns (web.dev)](https://web.dev/learn/pwa/update) -- service worker update UX (HIGH confidence)
- [Testing Library React Context](https://testing-library.com/docs/example-react-context/) -- provider testing patterns (HIGH confidence)
- [WCAG 2.2 Guide (2026)](https://www.vervali.com/blog/accessibility-testing-services-in-2026-the-complete-guide-to-wcag-2-2-ada-section-508-and-eaa-compliance/) -- WCAG 2.2 AA criteria and axe coverage (MEDIUM confidence)
- [LWW vs CRDTs](https://dzone.com/articles/conflict-resolution-using-last-write-wins-vs-crdts) -- conflict resolution strategies (MEDIUM confidence)
- [React Component Decomposition](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da) -- extraction patterns (MEDIUM confidence)
- [Modularizing React Apps (Martin Fowler)](https://martinfowler.com/articles/modularizing-react-apps.html) -- architecture patterns (HIGH confidence)
- [Slack Automated Accessibility Testing](https://slack.engineering/automated-accessibility-testing-at-slack/) -- enterprise a11y CI patterns (MEDIUM confidence)
- [CRDT Toolkits for Offline-First](https://medium.com/@2nick2patel2/typescript-crdt-toolkits-for-offline-first-apps-conflict-free-sync-without-tears-df456c7a169b) -- why CRDTs are overkill for simple sync (MEDIUM confidence)

---
*Feature research for: v4.1 Production Hardening*
*Researched: 2026-03-19*
