# Codebase Concerns

**Analysis Date:** 2026-03-19

## 1. Technical Debt

### ESLint/Stylelint Suppressions (26 non-test, 15 test)

**react-hooks/exhaustive-deps (12 production suppressions):**

| File | Line | Justification |
|------|------|---------------|
| `src/contexts/LanguageContext.tsx` | 89 | Dependency intentionally omitted |
| `src/contexts/StateContext.tsx` | 94 | Dependency intentionally omitted |
| `src/contexts/TTSContext.tsx` | 153 | Engine creation runs once on mount |
| `src/contexts/SRSContext.tsx` | 198 | user?.id + isLoading only |
| `src/hooks/useAutoPlay.ts` | 265 | Dependency intentionally omitted |
| `src/hooks/useAutoRead.ts` | 165 | Dependency intentionally omitted |
| `src/hooks/useOrientationLock.ts` | 114 | Dependency intentionally omitted |
| `src/hooks/useSortSession.ts` | 233, 501 | Dependency intentionally omitted |
| `src/hooks/useStreak.ts` | 120 | showInfo stable from context |
| `src/hooks/useTTS.ts` | 88, 162 | Engine/cleanup runs once |
| `src/views/TestPage.tsx` | 259 | Reset on index change only |
| `src/components/celebrations/CelebrationOverlay.tsx` | 229 | Dependency omitted |
| `src/components/practice/PracticeSession.tsx` | 623 | Reset on index change only |
| `src/components/interview/InterviewSession.tsx` | 944 | Dependency omitted |
| `src/components/results/TestResultsScreen.tsx` | 397 | Dependency omitted |
| `src/components/sort/SortModeContainer.tsx` | 173 | Dependency omitted |

- **Severity:** LOW
- **Impact:** These are all justified one-off suppressions with comments. No blanket file-level disables.
- **Fix approach:** None needed -- each has a documented reason. Monitor for React Compiler compatibility.

**react-hooks/set-state-in-effect (3 suppressions):**

| File | Line |
|------|------|
| `src/contexts/ThemeContext.tsx` | 43 |
| `src/hooks/useOnboarding.ts` | 36 |
| `src/views/StudyGuidePage.tsx` | 169 |

- **Severity:** LOW
- **Impact:** Intentional -- hydrating from localStorage/URL on mount requires setState in useEffect.

**no-console (4 suppressions):**
- `src/components/interview/InterviewSession.tsx` lines 501, 579, 694
- `src/components/interview/InterviewResults.tsx` line 317
- **Severity:** LOW

**@typescript-eslint/no-explicit-any (15 test-only suppressions):**
- All in `src/lib/ttsCore.test.ts` and `src/__tests__/tts.integration.test.tsx`
- **Severity:** LOW -- test files only, used for SpeechSynthesis mock typing

**@typescript-eslint/no-unused-vars (1 production):**
- `src/lib/ttsCore.ts` line 46 -- intentional strong ref to prevent GC
- **Severity:** NONE

**stylelint vendor-prefix suppressions (10 in globals.css):**
- Lines 118, 125, 145, 154, 252, 426, 442, 458, 534, 732
- All for `-webkit-` prefixes required by Safari
- **Severity:** NONE -- these are correct

### Zero TODO/FIXME/HACK/XXX Comments

Grep of entire `src/` directory returns zero matches for TODO, FIXME, HACK, XXX, or WORKAROUND. The codebase is clean of deferred work markers.

### Dead Code / Unused Exports

**`safeAsync` utility -- zero production consumers:**
- Files: `src/lib/async/safeAsync.ts`, `src/lib/async/index.ts` (exported)
- Exported from `src/lib/async/index.ts` but imported nowhere in production code
- Has a full test suite (`src/lib/async/safeAsync.test.ts`)
- **Severity:** LOW
- **Impact:** ~50 lines of dead code + ~80 lines of tests. No runtime impact.
- **Fix approach:** Remove or document as infrastructure reserved for future use. Noted in v3.0 audit as intentional.

**DotLottie animation infrastructure -- zero visual output:**
- Files: `src/components/celebrations/DotLottieAnimation.tsx`, `src/components/celebrations/CelebrationOverlay.tsx`
- `public/lottie/` directory is empty -- no `.lottie` files present
- Expected files: `checkmark.lottie`, `trophy.lottie`, `badge-glow.lottie`, `star-burst.lottie`
- `@lottiefiles/dotlottie-react` in `package.json` (~200KB WASM renderer never loaded)
- **Severity:** MEDIUM
- **Impact:** Dependency weight with zero output. Graceful degradation via `Suspense fallback={null}`.
- **Fix approach:** Either source `.lottie` files from LottieFiles marketplace or remove the DotLottie dependency and component. Carried since v3.0 (CELB-06).

**Redundant Supabase RLS INSERT policies:**
- Tables: `streak_data`, `earned_badges`
- Both have `ALL` policy AND separate `INSERT` policy. The ALL covers insert.
- **Severity:** LOW
- **Impact:** No functional issue, adds schema complexity.
- **Fix approach:** Remove redundant INSERT policies.

### Console Output in Production

- 36 `console.error/warn/log` calls across 22 source files
- All in error-handling catch blocks, auth flows, or sync operations
- No PII leaked in any console output
- **Severity:** LOW
- **Fix approach:** Replace with `captureError()` wrapper for structured observability. Not urgent.

---

## 2. Known Bugs & Edge Cases

### Carried Audit Gaps (3 from milestone audits -- still open)

**BRMSE-01: Burmese translation naturalness (v2.1 audit):**
- All 128 question translations present, all `showBurmese` guards verified
- Translation quality requires native Myanmar speaker review
- **Severity:** MEDIUM -- affects ~50% of target user base
- **Status:** Infrastructure complete, content quality unverified

**CELB-06: DotLottie animation assets absent (v3.0 audit):**
- Code wired, dependency installed, `public/lottie/` empty
- **Severity:** LOW -- confetti + sound + haptics still fire, this is visual-only
- **Status:** Awaiting asset sourcing

**VISC-05: Dark mode glass panel readability (v3.0 audit):**
- 3-tier glass morphism implemented with CSS custom properties
- Readability under dark mode needs human visual QA on mobile devices
- **Severity:** LOW -- code complete, perceptual testing pending

### Auth State Edge Cases (historically fragile)

**Supabase onAuthStateChange deadlock (FIXED -- verify persistence):**
- Root cause: `hydrateFromSupabase()` made async Supabase calls inside `onAuthStateChange` callback
- Fix: `setTimeout(0)` defer in `src/contexts/SupabaseAuthContext.tsx` line 249
- Debug record: `.planning/debug/session-expired.md`
- **Risk:** If Supabase updates the auth lock behavior, the setTimeout pattern may need adjustment
- **Severity:** LOW (fixed, but fragile pattern)

**Provider ordering crash (FIXED -- structural risk remains):**
- Root cause: Phase 46 added `useAuth()` to Language/Theme/TTS providers that were above AuthProvider
- Fix: Moved AuthProvider to directly after ErrorBoundary in `src/components/ClientProviders.tsx`
- Debug record: `.planning/debug/useauth-provider-missing.md`
- **Risk:** Any future provider that adds `useAuth()` must be below AuthProvider in the tree. The 10-provider chain at `src/components/ClientProviders.tsx` is fragile to reordering.
- **Severity:** MEDIUM

### Offline Sync Edge Cases

**Offline test results use `offline-${Date.now()}` IDs:**
- `src/contexts/SupabaseAuthContext.tsx` line 458
- When synced later, the real server ID replaces this, but local `testHistory` may temporarily show duplicate entries if user comes online and `hydrateFromSupabase` runs before sync queue processes
- **Severity:** LOW -- cosmetic duplication, resolves on next hydration

**Sync queue retry has no dead letter queue:**
- `src/lib/pwa/syncQueue.ts` retries 5 times with exponential backoff
- After 5 failures, the result is lost (not removed from IndexedDB, but never retried again in that session)
- `src/contexts/OfflineContext.tsx` auto-syncs on online transition, which re-attempts all pending
- **Severity:** LOW -- the online-transition re-sync provides a safety net

---

## 3. Security Considerations

### Audit Status: STRONG (93 pass, 5 fixed, 5 accepted risk, 1 action needed)

Reference: `.planning/security/security-checklist.md`, `.planning/security/rls-audit.md`

**Sentry Error Fingerprinting -- NOT IMPLEMENTED:**
- Status: ACTION NEEDED (from Phase 38 audit)
- Network/IndexedDB errors create separate Sentry issues instead of grouping
- **Severity:** LOW (operational noise, not a security vulnerability)
- **Fix approach:** Add `beforeSend` fingerprinting rules in `src/lib/sentry.ts`

**In-memory Rate Limiting (subscribe endpoint):**
- `app/api/push/subscribe/route.ts` uses in-memory `Map` for rate limiting
- Resets on serverless function cold start (Vercel)
- **Severity:** LOW -- push subscription is low-value target, JWT + 10/min/user limit provides reasonable protection
- **Fix approach:** Move to Redis/KV store if abuse is observed

**CSP frame-ancestors discrepancy:**
- `proxy.ts` line 21: `frame-ancestors 'self'`
- `.planning/security/security-checklist.md` says `frame-ancestors: 'none'`
- Actual value is `'self'` (allows same-origin framing), not `'none'` (blocks all)
- **Severity:** LOW -- same-origin framing is reasonable for PWA

**Two ignored CVEs in `package.json`:**
- `CVE-2026-26996` and `CVE-2025-69873` -- both assessed as non-exploitable in server-side usage
- Documented in `pnpm.auditConfig.ignoreCves`
- **Severity:** LOW (accepted risk with documentation)

### Error Pages Expose Raw Error Messages

- `app/(public)/error.tsx` renders `{error.message}` directly without sanitization
- `app/(protected)/error.tsx` renders `{error.message}` directly
- `app/error.tsx` renders `{error.message}` directly
- Only `src/components/ErrorBoundary.tsx` uses `sanitizeError()` from `errorSanitizer.ts`
- **Severity:** MEDIUM
- **Impact:** Next.js error.tsx pages could show internal error details (stack traces, SQL errors) to users
- **Fix approach:** Apply `sanitizeError()` in all three `error.tsx` files

---

## 4. Performance Concerns

### Bundle Size

**Dynamic imports in use (good):**
- `src/components/GlobalOverlays.tsx`: CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator
- `src/components/interview/InterviewResults.tsx`: ScoreTrendChart (recharts), Confetti
- `src/components/onboarding/OnboardingTour.tsx`: react-joyride
- `src/components/celebrations/DotLottieAnimation.tsx`: @lottiefiles/dotlottie-react (lazy)

**Missing dynamic imports (opportunities):**
- `recharts` direct import in `src/components/interview/ScoreTrendChart.tsx` -- only used in InterviewResults which is already dynamically imported, so this is transitively lazy. OK.
- `react-canvas-confetti` imported in `src/components/celebrations/Confetti.tsx` -- only used via GlobalOverlays (dynamic). OK.
- `react-countdown-circle-timer` imported in 2 components (`CircularTimer.tsx`, `TestDateCountdownCard.tsx`) -- not dynamically imported but used on frequently visited pages. Acceptable.
- **Severity:** LOW -- heavy deps are already lazy-loaded

**`optimizePackageImports` configured for:**
- `lucide-react`, `recharts` in `next.config.mjs` line 18
- Could add: `@radix-ui/react-dialog`, `@radix-ui/react-progress`, `motion` (minor gains)
- **Severity:** LOW

### Audio Assets: 57MB

- `public/audio/` contains 57MB across `en-US/` (3 subdirs: ava, female, male) and `my-MM/`
- CacheFirst service worker strategy with 1200 entry limit, 90-day expiry
- All audio loaded on-demand, not precached
- **Severity:** LOW -- correct caching strategy in place

### Context Provider Re-render Cascade

- 10 nested providers in `src/components/ClientProviders.tsx`
- Each provider change propagates through the tree
- All contexts use `useMemo` for their value objects (verified in all 8 context files)
- **Severity:** LOW -- memoization is comprehensive

### Large Component Files

| File | Lines | Concern |
|------|-------|---------|
| `src/components/interview/InterviewSession.tsx` | 1,474 | Complex state machine, multiple phases |
| `src/components/practice/PracticeSession.tsx` | 1,018 | Quiz session logic + UI |
| `src/components/results/TestResultsScreen.tsx` | 1,001 | Results display with charts |
| `src/views/TestPage.tsx` | 960 | Test flow orchestration |
| `src/components/interview/InterviewResults.tsx` | 871 | Results + trend chart |
| `src/components/hub/HistoryTab.tsx` | 800 | History list with filters |

- **Severity:** MEDIUM (maintainability risk, not performance)
- **Impact:** InterviewSession.tsx and PracticeSession.tsx are the most complex -- changes require careful testing
- **Fix approach:** Extract sub-components (e.g., separate phase renderers in InterviewSession)

### IndexedDB Has No Migration Strategy

- `src/lib/pwa/offlineDb.ts` uses `version: 1` in cache metadata
- No migration logic exists for schema changes to IndexedDB stores
- `idb-keyval` uses simple key-value stores (no schema to migrate)
- If question format changes, cached questions become stale
- **Severity:** LOW
- **Fix approach:** The `version` field exists but is never checked. Add version comparison on cache read to invalidate stale data.

---

## 5. Architecture Gray Areas

### Provider Hierarchy Fragility

The 10-provider chain in `src/components/ClientProviders.tsx` has strict ordering constraints:

```
ErrorBoundary
  -> AuthProvider          (MUST be first -- Language/Theme/TTS call useAuth)
    -> LanguageProvider    (uses useAuth for sync)
      -> ThemeProvider     (uses useAuth for sync)
        -> TTSProvider     (uses useAuth for sync)
          -> ToastProvider
            -> OfflineProvider  (MUST be inside ToastProvider -- uses useToast)
              -> SocialProvider (uses useAuth)
                -> SRSProvider  (uses useAuth)
                  -> StateProvider
                    -> NavigationProvider
```

**Fragile constraints:**
1. AuthProvider above Language/Theme/TTS -- violation causes instant crash (experienced in v4.0, debug record exists)
2. OfflineProvider inside ToastProvider -- violation causes useToast crash
3. SocialProvider depends on useAuth indirectly

**No compile-time enforcement** of ordering. A developer reordering providers gets a runtime crash.
- **Severity:** MEDIUM
- **Fix approach:** Add a startup assertion that validates provider ordering, or document ordering constraints as a lint rule.

### Cross-Device Sync Conflict Resolution

**Settings sync: server-wins strategy:**
- `src/contexts/SupabaseAuthContext.tsx` lines 153-194: `loadSettingsFromSupabase` overwrites localStorage
- No merge logic -- remote settings completely replace local on login
- **Risk:** If user changes settings offline, those changes are lost on next login
- **Severity:** MEDIUM

**Bookmark sync: add-wins merge:**
- `src/contexts/SupabaseAuthContext.tsx` lines 197-217: `mergeBookmarks` unions both sets
- Bookmark removal on one device won't propagate (add-wins means deletions are lost)
- **Severity:** LOW -- bookmarks are low-stakes

**Streak sync: merge with local priority:**
- `src/lib/social/streakSync.ts`: `mergeStreakData` takes longer streak
- **Severity:** LOW -- correct behavior for streaks

**SRS card sync:**
- `src/contexts/SRSContext.tsx`: Three-way merge (local + remote -> merged -> push)
- Most sophisticated sync, handles conflicts by preferring the more recent review
- **Severity:** LOW -- well-implemented

### Service Worker Update Strategy

- `src/lib/pwa/sw.ts` uses `skipWaiting: true` and `clientsClaim: true`
- New service worker takes control immediately on activation
- **No user notification** when a new version is available
- No "update available, reload?" prompt
- **Risk:** Users may get inconsistent behavior during the brief window between old cache and new worker
- **Severity:** MEDIUM
- **Fix approach:** Add a `controllerchange` listener and show a "New version available" toast

### Error Boundary Coverage

**Single ErrorBoundary at root level:**
- `src/components/ClientProviders.tsx` wraps everything in one `<ErrorBoundary>`
- Next.js `error.tsx` files exist at 3 levels: root, protected, public
- **Gap:** No component-level error boundaries for individual features
- If InterviewSession crashes, the entire app shows the error fallback
- **Severity:** MEDIUM
- **Fix approach:** Add error boundaries around high-risk components: InterviewSession, PracticeSession, TestPage, CelebrationOverlay

**Next.js error.tsx pages lack sanitization (repeated from Security):**
- 3 error.tsx files render raw `error.message` without `sanitizeError()`

---

## 6. Testing Gaps

Reference: `.planning/codebase/TESTING.md` for current coverage details.

### Critical Untested Paths

**Context providers (8 of 10 have no tests):**
- `SupabaseAuthContext` -- auth flow, hydration, session save, offline queuing
- `LanguageContext` -- language switching, sync
- `ThemeContext` -- theme switching, sync
- `SRSContext` -- deck loading, card operations, remote sync
- `SocialContext` -- opt-in, streak merge, profile load
- `OfflineContext` -- cache init, auto-sync on online
- `StateContext` -- state selection persistence
- `NavigationProvider` -- route tracking
- Only `TTSContext` has integration test coverage via `tts.integration.test.tsx`
- **Severity:** HIGH
- **Impact:** Provider bugs (like the auth deadlock and ordering crash) were caught by users, not tests

**Page-level views (0 of 14 tested):**
- `src/views/Dashboard.tsx`, `TestPage.tsx`, `StudyGuidePage.tsx`, etc.
- No render tests, no interaction tests, no route-change tests
- **Severity:** HIGH

**Most hooks untested (20+ hooks without test files):**
- `useBadges`, `useBookmarks`, `useSRSDeck`, `useSRSReview`, `useStreak`, `useReadinessScore`, `useCelebration`, `useCategoryMastery`, `useNextBestAction`, `useStudyPlan`, `useTestDate`, `usePushNotifications`, `useOrientationLock`, `useNavigationGuard`, `useInstallPrompt`, `useLeaderboard`, `useSortSession` (some logic tested via sortReducer.test.ts), `useSyncQueue`, `useVisibilitySync`
- **Severity:** MEDIUM

**Navigation system completely untested:**
- `src/components/navigation/NavigationShell.tsx`, `BottomTabBar.tsx`, `Sidebar.tsx`, `NavigationProvider.tsx`
- **Severity:** MEDIUM

### No E2E Tests

- No Playwright, Cypress, or other E2E framework
- All 11 E2E flows verified manually during milestone audits
- Regressions in auth flow, navigation, sync would go undetected between audits
- **Severity:** HIGH
- **Fix approach:** Add Playwright for critical flows: login -> dashboard, study session, mock test, offline -> online sync

### Coverage Thresholds Too Narrow

- Only 4 files have coverage thresholds: `shuffle.ts` (100%), `errorSanitizer.ts` (90%), `ErrorBoundary.tsx` (70%), `saveSession.ts` (70%)
- No global coverage minimum
- Business-critical files like `readinessEngine.ts`, `fsrsEngine.ts`, `answerGrader.ts` have tests but no threshold enforcement
- **Severity:** MEDIUM
- **Fix approach:** Add thresholds for all files in `src/lib/` that have test suites

### Mock Fidelity Concerns

**Toast a11y test uses inline mock:**
- `src/__tests__/a11y/toast.a11y.test.tsx` tests inline mock, not actual `BilingualToast` component
- Noted in v2.1 audit as tech debt
- **Severity:** LOW

**Supabase mock is simplified chain:**
- Tests mock `supabase.from().select().eq()` chains with manual mock objects
- Real Supabase client has different error shapes, pagination, real-time behavior
- **Severity:** LOW -- acceptable for unit tests, but integration tests would catch gaps

---

## 7. Accessibility Gaps

### Reduced-Motion Celebration Announce Gap

- `src/components/celebrations/CelebrationOverlay.tsx` line 201: `announce('Celebration!')` fires
- `src/components/celebrations/Confetti.tsx` line 217: `announce('Celebration!')` fires
- Under `prefers-reduced-motion`, `CelebrationOverlay` renders `ReducedMotionTimer` instead of `Confetti`
- The `announce()` in `Confetti.tsx` never fires because Confetti isn't mounted
- `CelebrationOverlay` has its own announce, so this is partially mitigated
- `BadgeCelebration` and `MasteryMilestone` have independent `announce()` calls (work correctly)
- **Severity:** LOW (carried from v3.0 audit, STAT-06)

### Error Pages Not Bilingual

- `app/(protected)/error.tsx`, `app/(public)/error.tsx`, `app/error.tsx` show English-only error messages
- `src/components/ErrorBoundary.tsx` correctly shows bilingual messages via `sanitizeError()`
- **Severity:** MEDIUM -- Burmese-primary users see English-only errors on Next.js error boundaries
- **Fix approach:** Use `sanitizeError()` + bilingual display in all error.tsx files

### Focus Management Coverage

- `src/hooks/useFocusOnNavigation.ts` moves focus to `h1` or `main` on route change -- good
- Used in `src/components/navigation/NavigationShell.tsx`
- Dialog components use Radix UI which handles focus trapping automatically
- **Gap:** Toast notifications (`BilingualToast`) have `aria-live` but no focus management for action buttons
- **Severity:** LOW

### WCAG 2.2 Touch Target Audit Incomplete

- v2.1 audit noted A11Y-03 (44px touch targets) only confirmed for `TimerExtensionToast`
- No systematic audit of all interactive elements across 30+ component directories
- **Severity:** MEDIUM
- **Fix approach:** Run axe-core audit across all pages, or add automated touch-target size assertions

### Color Contrast in Glass Morphism

- 3-tier glass system (light/medium/heavy) in `src/styles/globals.css` lines 420-540
- `backdrop-filter: blur()` with semi-transparent backgrounds
- Contrast ratio depends on underlying content -- not statically verifiable
- Dark mode readability specifically flagged (VISC-05)
- **Severity:** MEDIUM (requires human visual QA)

---

## 8. Mobile/PWA Concerns

### Service Worker Update UX Missing

- `skipWaiting: true` + `clientsClaim: true` in `src/lib/pwa/sw.ts`
- No user-facing notification when new version activates
- No "refresh to update" prompt
- Stale cached pages may render briefly before new worker takes over
- **Severity:** MEDIUM
- **Fix approach:** Listen for `controllerchange` event, show toast with refresh action

### iOS Safari Audio Autoplay Restrictions

- TTS uses `window.speechSynthesis` which requires user gesture on iOS
- `src/hooks/useAutoRead.ts` delays auto-read by 300ms but doesn't verify gesture
- Pre-generated audio files at `public/audio/` use HTML5 Audio API
- iOS may block auto-play of audio elements without user interaction
- **Severity:** MEDIUM (iOS-specific)
- **Fix approach:** Ensure first audio play is triggered by user tap; gate auto-play behind user gesture flag

### Push Notification Token Refresh

- `src/hooks/usePushNotifications.ts` checks subscription status on mount
- No periodic re-check for expired push subscriptions
- Browser may invalidate push subscription (especially on iOS after app suspension)
- **Severity:** LOW
- **Fix approach:** Re-check subscription on visibility change (similar to `useVisibilitySync` pattern)

### Offline Feature Degradation

**Graceful degradation:**
- Questions cached in IndexedDB -- study/practice work offline
- Test results queued in IndexedDB sync queue -- auto-sync on reconnect
- `OfflineBanner` shows status with three states

**Features that silently fail offline:**
- Cross-device settings sync (settings changes lost if made offline then overwritten on login)
- Leaderboard (network-only)
- Badge sync to Supabase
- Push notification subscription
- **Severity:** LOW -- all non-critical features

### No Landscape Orientation Support

- `src/hooks/useOrientationLock.ts` shows rotation overlay on landscape
- Mobile PWA forces portrait
- Desktop hides overlay via CSS media query
- **Severity:** LOW -- intentional design decision for mobile-first PWA

---

## 9. Dependency Risks

### Pre-release Dependency

**`react-joyride@3.0.0-7` (pre-release/RC):**
- Used in `src/components/onboarding/OnboardingTour.tsx`
- Dynamically imported (won't block main bundle)
- Pre-release packages may have breaking changes or bugs
- **Severity:** MEDIUM
- **Fix approach:** Pin to stable release when 3.0.0 ships, or evaluate alternatives

### Heavy Dependencies

| Package | Purpose | Bundle Impact | Risk |
|---------|---------|---------------|------|
| `recharts@3.7.0` | Score trend chart | ~200KB (tree-shaken via optimizePackageImports, dynamic import) | LOW |
| `@lottiefiles/dotlottie-react@0.18.2` | Animation (unused) | ~200KB WASM (lazy-loaded, never triggered) | MEDIUM -- pure waste |
| `react-joyride@3.0.0-7` | Onboarding tour | ~100KB (dynamic import) | MEDIUM -- pre-release |
| `@sentry/nextjs@10.39.0` | Error tracking | ~150KB client | LOW -- critical infra |
| `motion@12.34.3` | Animations | ~50KB | LOW -- core feature |

### Two Ignored CVEs

- `CVE-2026-26996` (high) and `CVE-2025-69873` (high) in `pnpm.auditConfig.ignoreCves`
- Three `pnpm.overrides`: `bn.js >=5.2.3`, `rollup >=4.59.0`, `serialize-javascript >=7.0.3`
- **Severity:** LOW (documented acceptable risk)
- **Fix approach:** Re-evaluate with each milestone; check if upstream packages have patched

### Next.js 16 Maturity

- `next@16.1.7` -- relatively new major version
- Using `--webpack` flag for builds (not Turbopack default)
- `proxy.ts` instead of `middleware.ts` (Next.js 16 rename)
- **Severity:** LOW -- stable enough after 5 milestones of usage

---

## 10. Improvement Opportunities

### Code Simplification

**Shared test render utility:**
- Each test file defines its own wrapper function for provider context
- No shared `renderWithProviders()` utility
- **Fix:** Create `src/__tests__/utils/renderWithProviders.tsx` with configurable provider stack
- **Impact:** Reduces boilerplate in every new test file

**InterviewSession.tsx decomposition:**
- 1,474 lines with 7+ phase states (GREETING, QUESTIONING, FEEDBACK, RESULTS, etc.)
- Each phase could be a separate component
- **Fix:** Extract `InterviewGreeting`, `InterviewQuestioning`, `InterviewFeedback` sub-components
- **Impact:** Easier testing, faster code navigation

**Settings sync centralization:**
- Settings sync push is distributed across ThemeContext, LanguageContext, TTSContext, useTestDate
- Each independently calls sync functions
- `src/lib/settings/settingsSync.ts` has `gatherCurrentSettings()` but it reads localStorage directly
- **Fix:** Create a single `useSettingsSync` hook that watches all settings keys
- **Impact:** Eliminates 4 separate sync call sites

### Missing Abstractions

**No shared Supabase query error handler:**
- Each context handles Supabase errors independently with `captureError()`
- Pattern: `if (error) captureError(error, { operation: '...' })`
- **Fix:** Create `handleSupabaseError(error, operation)` utility
- **Impact:** Consistent error reporting, DRY

**No IndexedDB store abstraction beyond idb-keyval:**
- 5+ separate stores created across files (questions, sync, SRS deck, bookmarks, sessions, badges, milestones)
- Each has its own get/set/del patterns
- **Fix:** Not urgent -- idb-keyval is intentionally simple. Consider if schema versioning becomes needed.

### Performance Quick Wins

**Add `@lottiefiles/dotlottie-react` to `optimizePackageImports`:**
- Or remove it entirely since no .lottie files exist
- Saves ~200KB from the dependency graph

**Consider replacing `react-countdown-circle-timer` with CSS-only:**
- Used in 2 components for simple countdown circles
- A CSS-only approach with `conic-gradient` would eliminate the dependency
- **Impact:** Minor bundle reduction

### Developer Experience

**No development error overlay for provider ordering:**
- Provider ordering violations cause cryptic "useX must be used within XProvider" errors
- **Fix:** Add a `ProviderOrderGuard` component that validates at dev time

**Missing `lint:css` from CI pipeline:**
- `.github/workflows/ci.yml` runs `lint`, `format:check`, `typecheck`, `test:coverage`, `build`
- Does NOT run `lint:css` (stylelint)
- Local verification command includes it: `pnpm lint:css`
- **Severity:** LOW
- **Fix:** Add `pnpm run lint:css` step to CI workflow

**Missing `test:run` vs `test:coverage` clarity:**
- CI runs `test:coverage` which includes all tests
- Local verification runs `test:run` (no coverage)
- Threshold failures would only surface in CI, not local dev
- **Fix:** Run `test:coverage` locally too, or add coverage to pre-commit

### Over-Engineered vs Under-Engineered

**Over-engineered:**
- DotLottieAnimation component (150 lines) with frame-rate adaptation, glow effects, reduced-motion handling -- for an asset that doesn't exist
- `safeAsync` utility with full test suite but zero consumers

**Under-engineered:**
- Error.tsx pages (3 files, all English-only, no sanitization, no retry with navigation)
- Service worker update UX (skipWaiting with no user notification)
- IndexedDB versioning (field exists, never checked)
- Settings sync conflict resolution (server-wins with no offline change preservation)

---

## Summary: Priority Matrix

### CRITICAL (0)

None.

### HIGH (3)

| Issue | Section | Files |
|-------|---------|-------|
| No E2E test framework | Testing Gaps | N/A -- needs Playwright setup |
| Context providers untested (8/10) | Testing Gaps | `src/contexts/*.tsx` |
| Page-level views untested (0/14) | Testing Gaps | `src/views/*.tsx` |

### MEDIUM (12)

| Issue | Section | Files |
|-------|---------|-------|
| Provider ordering fragility (10 providers) | Architecture | `src/components/ClientProviders.tsx` |
| Error.tsx pages expose raw messages | Security | `app/**/error.tsx` (3 files) |
| Error.tsx pages English-only | Accessibility | `app/**/error.tsx` (3 files) |
| Service worker update UX missing | Mobile/PWA | `src/lib/pwa/sw.ts` |
| Settings sync server-wins loses offline changes | Architecture | `src/contexts/SupabaseAuthContext.tsx` |
| BRMSE-01 native speaker review pending | Known Bugs | Translation content |
| InterviewSession.tsx 1,474 lines | Performance | `src/components/interview/InterviewSession.tsx` |
| react-joyride pre-release dependency | Dependencies | `package.json` |
| DotLottie dependency with zero output | Dependencies | `package.json`, `public/lottie/` |
| Missing component-level error boundaries | Architecture | Feature components |
| WCAG touch target audit incomplete | Accessibility | App-wide |
| Glass morphism contrast unverified | Accessibility | `src/styles/globals.css` |

### LOW (15+)

ESLint suppressions (justified), console output, redundant RLS policies, safeAsync dead code, offline ID duplication, Sentry fingerprinting, in-memory rate limiting, CSP frame-ancestors, audio autoplay iOS, push token refresh, no lint:css in CI, IndexedDB versioning, reduced-motion announce gap, toast focus management, coverage thresholds narrow.

---

*Concerns audit: 2026-03-19*
