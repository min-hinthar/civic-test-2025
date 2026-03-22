# Phase 51 Pre-Context Research: Unit Test Expansion

## 1. Resolved Assumptions

### Technical Approach
- **Test framework:** Vitest 4.0.18 + React Testing Library 16.3.2 + jsdom 28.1.0 (established in Phase 48)
- **Test utility:** `renderWithProviders` with 3 presets (minimal/core/full) — Phase 51 uses `full` preset for provider tests
- **Mock layer:** 28+ vi.mock() declarations already exist in renderWithProviders.test.tsx — no new mock modules needed
- **Coverage provider:** v8 with per-file thresholds floored to actual achieved coverage
- **Test location:** `src/__tests__/contexts/` (centralized pattern for cross-cutting providers)
- **Scope:** Unit tests with mocked Supabase/IndexedDB/localStorage — zero real backend calls

### Scope Boundaries
- **IN:** 8 providers (SupabaseAuth, Language, Theme, SRS, Social, Offline, State, Navigation)
- **IN:** Per-file coverage thresholds added simultaneously with each test file
- **IN:** Dependency audit re-evaluation (DEPS-04) + react-joyride status check (DEPS-05)
- **OUT:** TTSContext (already covered by tts.integration.test.tsx, 394 lines)
- **OUT:** ToastProvider (has a11y test; UI-heavy animation provider)
- **OUT:** E2E flows (Phase 52 scope)
- **OUT:** New provider features or refactoring

### Implementation Order
1. StateContext (simplest — 128 lines, no async, no network, localStorage only)
2. NavigationProvider (medium — 227 lines, tier logic, click-outside, localStorage)
3. LanguageContext (medium — 147 lines, multi-tab sync, keyboard shortcut, SSR safety)
4. OfflineContext (medium — 233 lines, cache lifecycle, auto-sync, toast)
5. ThemeContext (complex — 175 lines, View Transitions API, system pref, DOM)
6. SocialContext (complex — 389 lines, profile sync, streak merge, visibility)
7. SRSContext (very complex — 377 lines, sync orchestration, merge, retry)
8. SupabaseAuthContext (very complex — 573 lines, multi-state auth, LWW merge, offline queue)
9. Dependency audit (DEPS-04, DEPS-05) — run audit, document findings
10. Coverage threshold updates — measure actual, floor to integer, bump global floor

### Backend Requirements
- None. All tests mock Supabase and IndexedDB. No database changes.

## 2. Realistic Data/Scale Analysis

### Provider Complexity Matrix

| Provider | Lines | Public API | useEffects | Async Ops | External Deps | Complexity |
|----------|-------|-----------|-----------|-----------|---------------|------------|
| StateContext | 128 | 3 values | 1 | 0 | localStorage, JSON data | Simple |
| NavigationProvider | 227 | 6 values | 3 | 0 | localStorage, DOM events, 3 hooks | Medium |
| LanguageContext | 147 | 4 values | 3 | 1 (sync) | localStorage, DOM, useAuth, settings sync | Medium |
| OfflineContext | 233 | 6 values | 3 | 4 (cache, sync) | offlineDb, syncQueue, useToast, withRetry | Medium |
| ThemeContext | 175 | 3 values | 3 | 1 (sync) | localStorage, DOM, matchMedia, View Transitions | Complex |
| SocialContext | 389 | 8 values | 2 | 6 (profile, streak, visibility) | socialProfileSync, streakSync, bookmarks, useAuth | Complex |
| SRSContext | 377 | 9 values | 3 | 7 (load, add, remove, grade, sync) | srs (12 functions), useAuth, withRetry | Very Complex |
| SupabaseAuthContext | 573 | 11 values | 1 | 8 (auth, hydrate, save, merge) | supabase, settings, bookmarks, offlineDb | Very Complex |

### Estimated Test Output

| Provider | Est. Test Cases | Est. Test Lines | Coverage Target |
|----------|----------------|-----------------|-----------------|
| StateContext | 6-8 | 60-80 | 95%+ |
| NavigationProvider | 10-12 | 100-130 | 85-90% |
| LanguageContext | 8-10 | 80-100 | 85-90% |
| OfflineContext | 10-12 | 100-120 | 80-85% |
| ThemeContext | 12-15 | 100-150 | 80-85% |
| SocialContext | 12-15 | 120-150 | 80-85% |
| SRSContext | 15-18 | 150-180 | 80-85% |
| SupabaseAuthContext | 15-20 | 150-200 | 75-85% |
| **Total** | **88-110** | **860-1110** | **~83% avg** |

### Coverage Impact Projection
- Current global floor: 40% lines / 40% functions / 30% branches / 40% statements
- After Phase 51: ~45% lines / 45% functions / 35% branches / 45% statements
- 8 provider files move from 0% to 75-95% coverage

## 3. Cross-Phase Contract Inventory

### From Phase 48 (Test Infrastructure)
| Contract | Type | Impact |
|----------|------|--------|
| renderWithProviders 3-preset API | Reuse | All Phase 51 tests use this utility |
| PROVIDER_ORDER array | Honor | Must match ClientProviders.tsx exactly |
| Per-file threshold pattern (floor to integer) | Honor | Add thresholds for 8 new provider files |
| Global coverage floor 40/40/30/40 | Escalate | Raise to 45/45/35/45 after tests added |
| Mock patterns (28+ vi.mock declarations) | Reuse | No new mock modules needed |
| vi.hoisted() pattern for spy introspection | Reuse | Use for asserting mock call args |
| vi.stubEnv() for NODE_ENV | Reuse | Use instead of direct process.env assignment |

### From Phase 49 (Error Handling)
| Contract | Type | Impact |
|----------|------|--------|
| ProviderOrderGuard dev-mode validation | Honor | Tests must not reorder providers |
| SharedErrorFallback bilingual component | Honor | Any error UI must be bilingual |
| ErrorBoundary fallback={null} for CelebrationOverlay | Honor | `if (fallback !== undefined)` check preserved |
| withSessionErrorBoundary HOC | Honor | Session components use this pattern |
| captureError() with operation/component context | Honor | Phase 51 tests verify error capture calls |
| ERRS-04 deviation: no session save in error handlers | Honor | Rely on 5-second auto-save |
| ToastProvider detection impossible (no-op fallback) | Accept | ProviderOrderGuard cannot detect Toast |

### From Phase 50 (PWA + Sync)
| Contract | Type | Impact |
|----------|------|--------|
| STORAGE_VERSIONS per-store isolation | Honor | Do not consolidate version constants |
| Per-field LWW merge (dirty > local-newer > remote-newer) | Test | SupabaseAuthContext merge logic |
| settingsTimestamps pure functions | Test | Already tested in settingsSync.test.ts |
| BilingualToast persistent variant (duration: null) | Honor | Toast tests already cover a11y |
| SW update session-lock deferral | Honor | Not in Phase 51 scope |
| Settings sync fire-and-forget pattern | Honor | Sync errors logged, never thrown |
| Bookmark sync add-wins merge | Honor | SocialContext visibility pull uses this |

### Feeds Into Phase 52
| Contract | Consumer |
|----------|----------|
| Provider test infrastructure | Phase 52 E2E tests build on unit test foundation |
| Coverage baseline | Phase 52 maintains/raises thresholds |
| Mock patterns documented | Phase 52 Playwright tests may reference mocking approach |
| Provider behavior documentation | Phase 53 InterviewSession decomposition needs provider contracts |

## 4. Prototype/Design Analysis

Not applicable — Phase 51 is a testing phase with no UI changes.

## 5. Gotcha Inventory

### Critical (Must fix or test fails)

| # | Issue | Provider | Source | Fix |
|---|-------|----------|--------|-----|
| G1 | AuthProvider MUST wrap Language/Theme/TTS in test tree | Language, Theme | provider-ordering.md | Use `full` preset or ensure Auth in provider override |
| G2 | OfflineProvider MUST be inside ToastProvider | Offline | provider-ordering.md | Use `full` preset for Offline tests |
| G3 | TTSProvider must throw (not no-op) when engine null | TTS (excluded) | provider-ordering.md | Excluded from scope but learning applies if testing TTS consumers |
| G4 | Supabase onAuthStateChange deadlock | SupabaseAuth | Wave2 deep read | setTimeout(0) defers hydration; tests must handle microtask timing |
| G5 | PROVIDER_ORDER array must match ClientProviders.tsx | All | Phase 48 contract | Never reorder; renderWithProviders enforces |

### High (Likely to cause test flakiness)

| # | Issue | Provider | Source | Fix |
|---|-------|----------|--------|-----|
| G6 | Cancellation guards (mounted/cancelled flags) | Auth, SRS, Social | Wave2 deep read | Test unmount-during-async; verify no setState after unmount |
| G7 | Multi-tab sync via storage event | Language | Wave2 learnings mapping | Mock `window.addEventListener('storage', ...)` |
| G8 | View Transitions API optional (fallback needed) | Theme | Wave2 learnings mapping | Mock `document.startViewTransition = undefined` |
| G9 | localStorage unavailable (private browsing) | Language, Theme, State, Nav | Wave2 learnings mapping | Test graceful degradation when localStorage throws |
| G10 | SRS retry logic (3 attempts, 500ms backoff) | SRS | Wave2 deep read | Use vi.useFakeTimers() + vi.advanceTimersByTime() |
| G11 | Optimistic updates with remote sync | SRS, Social | Wave2 deep read | Verify in-memory state updates before sync resolves |
| G12 | Network error classification patterns | SupabaseAuth | Wave2 deep read | Mock navigator.onLine, TypeError('fetch'), TypeError('NetworkError') |

### Medium (Edge cases, nice to cover)

| # | Issue | Provider | Source | Fix |
|---|-------|----------|--------|-----|
| G13 | SSR safety (typeof window checks) | Language, Theme | Wave2 learnings mapping | Test with server-like environment |
| G14 | Alt+L keyboard shortcut toggle | Language | Wave2 learnings mapping | Fire keydown event, verify mode toggle |
| G15 | System preference listener (prefers-color-scheme) | Theme | Wave2 learnings mapping | Mock matchMedia listener |
| G16 | Visibility-based refresh (visibilitychange) | SRS, Social | Wave2 deep read | Mock document.visibilityState |
| G17 | Unauthenticated user no-ops | Social | Wave2 deep read | Render without user, verify no Supabase calls |
| G18 | Streak merge first-login (no remote data) | Social | Wave2 deep read | Mock getSocialProfile(null), verify local push |
| G19 | SaveSessionGuard debouncing | SupabaseAuth | Wave2 deep read | Rapid saveTestSession calls, verify guard.save() |
| G20 | Offline test result queueing | SupabaseAuth | Wave2 deep read | Mock navigator.onLine=false, verify queueTestResult |

## 6. Data Contracts

### Provider Context Values (TypeScript Interfaces)

**SupabaseAuthContext value:**
```typescript
{
  user: User | null;              // Hydrated user with testHistory
  isLoading: boolean;             // True during bootstrap
  authError: string | null;       // Login/register error message
  isSavingSession: boolean;       // True during saveTestSession
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  loginWithGoogleIdToken(credential: string, nonce?: string): Promise<void>;
  sendPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  logout(): Promise<void>;
  saveTestSession(payload: TestSessionPayload): Promise<void>;
}
```

**LanguageContext value:**
```typescript
{
  mode: 'bilingual' | 'english-only';
  showBurmese: boolean;           // Derived: mode === 'bilingual'
  setMode(mode: 'bilingual' | 'english-only'): void;
  toggleMode(): void;
}
```

**ThemeContext value:**
```typescript
{
  theme: 'light' | 'dark';
  setTheme(theme: 'light' | 'dark'): void;
  toggleTheme(): void;
}
```

**SRSContext value:**
```typescript
{
  deck: SRSCardRecord[];
  dueCount: number;               // Memoized: deck.filter(isDue).length
  isLoading: boolean;
  addCard(questionId: string): Promise<void>;
  removeCard(questionId: string): Promise<void>;
  gradeCard(questionId: string, isEasy: boolean): Promise<{ card: SRSCardRecord; intervalText: string }>;
  isInDeck(questionId: string): boolean;
  refreshDeck(): Promise<void>;
  getDueCards(): SRSCardRecord[];
}
```

**SocialContext value:**
```typescript
{
  socialProfile: SocialProfile | null;
  isOptedIn: boolean;             // Derived: socialProfile?.socialOptIn ?? false
  displayName: string;            // Derived: socialProfile?.displayName ?? user?.name ?? ''
  isLoading: boolean;
  optIn(displayName: string): Promise<void>;
  optOut(): Promise<void>;
  updateDisplayName(name: string): Promise<void>;
  refreshProfile(): Promise<void>;
}
```

**OfflineContext value:**
```typescript
{
  isOnline: boolean;
  questions: Question[];           // Cached or constant
  pendingSyncCount: number;
  syncFailed: boolean;
  refreshCache(): Promise<void>;
  refreshPendingCount(): Promise<void>;
  triggerSync(): Promise<void>;
}
```

**StateContext value:**
```typescript
{
  selectedState: string | null;    // 2-letter state code
  stateInfo: StateInfo | null;     // Governor, senators, capital
  setSelectedState(state: string | null): void;
}
```

**NavigationContext value:**
```typescript
{
  isExpanded: boolean;
  isLocked: boolean;
  lockMessage: string | null;
  tier: 'mobile' | 'tablet' | 'desktop';
  toggleSidebar(): void;
  setLock(locked: boolean, message?: string): void;
}
```

## 7. Design Compliance Matrix

Not applicable — Phase 51 is a testing phase. No UI changes. All design tokens, glass-morphism tiers, touch targets, and bilingual rendering remain unchanged.

## 8. Identity/Brand Ethical Framework

### Testing-Relevant Constraints
| Constraint | Verification |
|------------|-------------|
| Bilingual error messages | SupabaseAuth tests verify error strings are bilingual |
| PII sanitization before Sentry | Tests verify captureError() calls, not raw user data |
| Offline-first reliability | OfflineContext tests verify cache lifecycle and sync queue |
| 44px touch targets | Not Phase 51 scope (Phase 52 axe-core) |
| Font-myanmar for Burmese text | Not Phase 51 scope (component rendering tests) |

## 9. Architectural Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Test location | Co-located vs centralized | `src/__tests__/contexts/` | Providers are cross-cutting; follows centralized pattern for integration-adjacent tests |
| Test wrapper | Manual wrapper vs renderWithProviders | renderWithProviders `full` preset | Reuses Phase 48 infrastructure; enforces correct provider ordering |
| Mock strategy | New mocks vs existing | Existing 28+ mocks | All provider dependencies already mocked in renderWithProviders.test.tsx |
| Coverage thresholds | Aspirational vs actual | Floor to actual | Phase 48 contract: never set speculative thresholds |
| Dependency audit | Deep remediation vs re-evaluation | Re-evaluation only | DEPS-04 scope is re-evaluate, not remediate |
| react-joyride | Upgrade vs document | Document as unavailable | 3.0.0 stable not published; 3.0.0-7 prerelease acceptable |

## 10. File Map

### Create
| File | Purpose |
|------|---------|
| `src/__tests__/contexts/SupabaseAuth.test.tsx` | Auth provider unit tests |
| `src/__tests__/contexts/Language.test.tsx` | Language provider unit tests |
| `src/__tests__/contexts/Theme.test.tsx` | Theme provider unit tests |
| `src/__tests__/contexts/SRS.test.tsx` | SRS provider unit tests |
| `src/__tests__/contexts/Social.test.tsx` | Social provider unit tests |
| `src/__tests__/contexts/Offline.test.tsx` | Offline provider unit tests |
| `src/__tests__/contexts/State.test.tsx` | State provider unit tests |
| `src/__tests__/contexts/Navigation.test.tsx` | Navigation provider unit tests |

### Modify
| File | Change |
|------|--------|
| `vitest.config.ts` | Add 8 per-file coverage thresholds; raise global floor to 45/45/35/45 |
| `package.json` | Re-evaluate pnpm.overrides and auditConfig.ignoreCves |

### Read (Reference)
| File | Purpose |
|------|---------|
| `src/contexts/SupabaseAuthContext.tsx` | Auth provider implementation (573 lines) |
| `src/contexts/LanguageContext.tsx` | Language provider (147 lines) |
| `src/contexts/ThemeContext.tsx` | Theme provider (175 lines) |
| `src/contexts/SRSContext.tsx` | SRS provider (377 lines) |
| `src/contexts/SocialContext.tsx` | Social provider (389 lines) |
| `src/contexts/OfflineContext.tsx` | Offline provider (233 lines) |
| `src/contexts/StateContext.tsx` | State provider (128 lines) |
| `src/components/navigation/NavigationProvider.tsx` | Nav provider (227 lines) |
| `src/__tests__/utils/renderWithProviders.tsx` | Test utility (195 lines) |
| `src/__tests__/utils/renderWithProviders.test.tsx` | Mock declarations (339 lines) |

### Reuse
| File | Reuse |
|------|-------|
| `src/__tests__/setup.ts` | Global mocks (matchMedia, speechSynthesis) |
| `src/__tests__/utils/renderWithProviders.tsx` | Provider wrapping for all tests |

## 11. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence |
|---|-----------|------------|------------|
| 1 | NavigationProvider in components/ not contexts/ | Include — roadmap explicitly lists it as 8th provider | HIGH |
| 2 | TTSContext exclusion | Confirmed — tts.integration.test.tsx (394 lines) provides coverage | HIGH |
| 3 | ToastProvider exclusion | Confirmed — has a11y test; UI animation provider, not business logic | MEDIUM |
| 4 | "Core behaviors" definition | Initialization + state management + derived state + context value exposure | HIGH |
| 5 | DEPS-04 audit depth | Re-evaluation only, not deep remediation | HIGH |
| 6 | react-joyride 3.0.0 | Stable 3.0.0 not yet published; keep 3.0.0-7 prerelease | HIGH |
| 7 | Coverage threshold strategy | Measure actual coverage, floor to integer, add simultaneously | HIGH |
| 8 | Test file location | `src/__tests__/contexts/` (centralized, cross-cutting pattern) | HIGH |
| 9 | Phase 52 boundary | No E2E flows, no real backend, no Playwright in Phase 51 | HIGH |
| 10 | Existing indirect coverage | Zero direct tests; renderWithProviders.test.tsx is shallow preset verification only | HIGH |

## 12. Animation/Ceremony Implementation Patterns

Not applicable — Phase 51 is a testing phase with no animation work.

## 13. Core Domain Architecture

### Provider Dependency Graph (Test-Relevant)

```
SupabaseAuthContext (standalone - no provider deps)
  ├── supabase.auth (getSession, onAuthStateChange, signIn*, signUp, signOut, updateUser)
  ├── supabase.from() (profiles, mock_tests, mock_test_responses)
  ├── settings (loadSettingsRow, mergeSettingsWithTimestamps, syncSettings, clearDirtyFlags)
  ├── bookmarks (loadBookmarks, mergeBookmarks, setBookmark, syncBookmarks)
  └── offlineDb (queueTestResult)

LanguageContext (depends: Auth)
  ├── useAuth() → user.id for sync
  ├── localStorage → language mode persistence
  ├── settings (gatherCurrentSettings, syncSettingsToSupabase)
  ├── settingsTimestamps (setFieldTimestamp, markFieldDirty)
  └── DOM (document.documentElement.lang, window.addEventListener)

ThemeContext (depends: Auth)
  ├── useAuth() → user.id for sync
  ├── localStorage → theme persistence
  ├── settings (gatherCurrentSettings, syncSettingsToSupabase)
  ├── settingsTimestamps (setFieldTimestamp, markFieldDirty)
  ├── DOM (document.documentElement class/style, meta tag, flushSync)
  └── View Transitions API (document.startViewTransition, optional)

SRSContext (depends: Auth)
  ├── useAuth() → user.id for sync
  ├── srs (12 functions: FSRS engine + IndexedDB + Supabase sync)
  ├── withRetry() → retry wrapper for deck loading
  └── DOM (document.addEventListener('visibilitychange'))

SocialContext (depends: Auth)
  ├── useAuth() → user object
  ├── socialProfileSync (getSocialProfile, upsertSocialProfile, toggleSocialOptIn)
  ├── streakSync (loadStreakFromSupabase, mergeStreakData, syncStreakToSupabase)
  ├── streakStore (getStreakData, saveStreakData)
  ├── useVisibilitySync() → multi-tab re-sync
  ├── settings (loadSettingsFromSupabase) → visibility pull
  └── bookmarks (loadBookmarksFromSupabase, mergeBookmarks) → visibility pull

OfflineContext (depends: Toast)
  ├── useToast() → bilingual toast notifications
  ├── useOnlineStatus() → network state
  ├── offlineDb (cacheQuestions, getCachedQuestions, hasQuestionsCache)
  ├── syncQueue (syncAllPendingResults, getPendingSyncCount)
  └── withRetry() → retry wrapper

StateContext (standalone)
  ├── localStorage → state selection persistence
  └── state-representatives.json → static state data

NavigationProvider (standalone)
  ├── useMediaTier() → responsive tier detection
  ├── useNavBadges() → badge counts
  ├── useScrollDirection() → scroll visibility
  └── localStorage → sidebar preference
```

### Mock Boundary Summary

All external dependencies are already mocked in renderWithProviders.test.tsx. Phase 51 tests can import renderWithProviders and use existing mocks. New mocks needed: **NONE**.

State fixture factories needed for each provider (authenticated user, SRS cards, social profile, streak data) — create as test-local constants.

## 14. Expanded Gotcha Inventory (Wave 2 Findings Merged)

### From Git History

| # | Issue | Origin | Impact |
|---|-------|--------|--------|
| G21 | AuthProvider was below Language/Theme in v4.0 — caused crash on every page | Commit e2dfdb9 | Fixed; test must verify ordering |
| G22 | speechSynthesis mock needed addEventListener (not just speak/cancel) | Phase 48-03 | Fixed in renderWithProviders.test.tsx |
| G23 | Sentry fingerprint precedence bug (app overwrote noise filters) | Phase 48-04 | Fixed with `if (!event.fingerprint)` guard |
| G24 | NODE_ENV assignment fails in strict TypeScript — use vi.stubEnv() | Phase 48-04 | Pattern established |
| G25 | ProviderOrderGuard with ErrorBoundary wrapper (infinite re-render) | Phase 49-02 | Test rendering approach documented |

### From Mock Patterns Analysis

| # | Issue | Impact |
|---|-------|--------|
| G26 | renderWithProviders does NOT mock individual provider hooks (useAuth, useLanguage) | Tests must import providers or use full preset |
| G27 | No __mocks__ directories — all mocking is inline vi.mock() | Consistent pattern; follow it |
| G28 | vi.clearAllMocks() vs vi.restoreAllMocks() — different behaviors | Use clearAllMocks in beforeEach, restoreAllMocks in afterEach |
| G29 | Audio mock must support property handlers (onended, onerror) not just addEventListener | Relevant if testing TTS-adjacent code |
| G30 | withRetry mock passes through directly: `withRetry(fn) => fn()` | Retry logic not tested in provider tests; test separately |

## 15. Design Token Audit Results

Not applicable — Phase 51 is a testing phase with no design token changes. All tokens verified in Phases 29-38.

---

## Dependency Audit Status (DEPS-04, DEPS-05)

### Current Override Status
| Override | Version | Purpose | Still Needed |
|----------|---------|---------|-------------|
| bn.js | >=5.2.3 | Transitive CVE patch | Re-evaluate with `pnpm audit` |
| rollup | >=4.59.0 | Transitive CVE patch | Re-evaluate with `pnpm audit` |
| serialize-javascript | >=7.0.3 | XSS prevention | Re-evaluate with `pnpm audit` |

### Ignored CVEs
| CVE | Status | Assessment |
|-----|--------|------------|
| CVE-2026-26996 | Ignored | Re-evaluate: non-exploitable in server-side context |
| CVE-2025-69873 | Ignored | Re-evaluate: known false positive |

### Production Audit: 0 vulnerabilities
### Dev Audit: 9 vulnerabilities (all in transitive devDep chains — eslint/jsdom, unfixable)

### react-joyride Status (DEPS-05)
- Current: `3.0.0-7` (prerelease)
- Stable 3.0.0: NOT yet published
- Action: Document as unavailable; continue with prerelease
- Risk: MEDIUM (dynamically imported, SSR-gated, 100KB, non-critical feature)

### Unused Code (Knip Findings)
- 5 unused files (952 LOC): WhyButton, BadgeGrid, ReviewHeatmap, SRSWidget, sw.ts
- 141 unused exports across core libraries
- 9 duplicate exports (named + default)
- Cleanup opportunity: batch removal in Phase 51 dependency plan

---

*Research completed: 2026-03-20*
*Agents: 12 (6 Wave 1 + 6 Wave 2)*
*Confidence: 10/10 HIGH, 2/10 MEDIUM, 0/10 LOW*
