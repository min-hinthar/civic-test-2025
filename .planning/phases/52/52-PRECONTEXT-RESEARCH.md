# Phase 52: E2E Critical Flows + Accessibility — Precontext Research

**Phase Goal:** The 7 most critical user flows have automated regression detection, and WCAG 2.2 compliance gaps in touch targets and glass contrast are identified and resolved.

**Depends on:** Phase 50 (PWA + Sync), Phase 51 (Unit Test Expansion)
**Feeds into:** Phase 53 (InterviewSession decomposition relies on E2E safety net)

---

## 1. Resolved Assumptions

### Technical Approach
- **E2E Framework:** Playwright 1.58.2 already configured (Phase 48). Chromium-only for Phase 52; Firefox/WebKit deferred to Phase 53+.
- **Auth in E2E:** Mock Supabase auth via Playwright `page.route()` request interception + localStorage session injection. No real test accounts needed — questions are bundled in the app (128 hardcoded in `allQuestions` constant).
- **Offline Testing:** Use `context.setOffline(true/false)` — app checks `navigator.onLine` to gate sync. IndexedDB always available; offline detection is network-only.
- **SW Update Testing:** Mock SW registration object and fire `updatefound`/`controllerchange` events programmatically. Do not attempt to serve two SW versions.
- **Interview E2E:** Use `TextAnswerInput.tsx` (text fallback, 126 lines, production-ready) instead of speech recognition. Speech APIs not mockable in Playwright.
- **Flashcard Sort E2E:** Use Know/Don't Know button clicks instead of drag gestures. Playwright `dragTo()` is flaky on motion/react transform elements.
- **axe-core Integration:** Add `@axe-core/playwright` package. Disable `color-contrast` rule on glass-morphism elements; document exceptions manually.
- **Coverage:** E2E tests (Playwright) do NOT count toward Vitest coverage thresholds. A11Y-02 vitest-axe tests DO affect unit test coverage.

### Scope Boundaries
- **IN:** 7 E2E tests, axe-core Playwright scans on 4 pages, vitest-axe expansion, touch target audit + fixes, glass contrast verification + fixes
- **OUT:** Visual regression screenshots, multi-browser matrix, full CRDT sync, Lighthouse perf testing, multi-tab BroadcastChannel
- **AMBIGUOUS → RESOLVED:** Browser matrix = Chromium only (HIGH confidence); touch audit = automated Playwright script + manual fixes (HIGH); VISC-05 = manual HSL contrast calculation (MEDIUM-HIGH)

### Implementation Order
1. Test isolation fixtures (fresh context per test, clear IndexedDB/localStorage)
2. Auth mock fixtures (Supabase route interception)
3. E2E critical flow tests (7 tests, ~1 per requirement)
4. axe-core Playwright integration (A11Y-01)
5. Touch target audit script + fixes (A11Y-03)
6. Glass contrast verification + fixes (A11Y-04)
7. vitest-axe expansion to interactive components (A11Y-02)

---

## 2. Realistic Data/Scale Analysis

| Metric | Value | Source |
|--------|-------|--------|
| Questions in app | 128 (bundled, no API fetch) | `constants/questions/index.ts` |
| Component directories | 30+ | `src/components/` |
| Interactive elements to audit | ~183 component files | Glob analysis |
| Existing E2E tests | 1 smoke test | `e2e/smoke.spec.ts` |
| Existing vitest-axe tests | 2 (FeedbackPanel, Toast) | `src/__tests__/a11y/` |
| Unit tests to preserve | 779+ | Phase 51 verification |
| Per-file coverage thresholds | 26 files | `vitest.config.ts` |
| Global coverage floor | 40/40/30/40 | `vitest.config.ts` |
| Glass-morphism tiers | 3 (light/medium/heavy) | `globals.css` |
| Touch target violations found | 9+ component families | Wave 2 audit |

---

## 3. Cross-Phase Contract Inventory

### Consumed from Phase 48 (Test Infrastructure)
| Contract | Location | Usage |
|----------|----------|-------|
| `renderWithProviders` utility | `src/__tests__/utils/renderWithProviders.tsx` | 3 presets (minimal/core/full); A11Y-02 vitest-axe tests use this |
| Playwright config | `playwright.config.ts` | webServer, baseURL, Chromium project |
| Coverage thresholds | `vitest.config.ts` | 26 per-file + global floor; must not decrease |
| Sentry fingerprinting | `src/lib/sentry.ts` | 5 categories, 16 tests; E2E error flows must not break |

### Consumed from Phase 49 (Error Handling)
| Contract | Location | Usage |
|----------|----------|-------|
| `SharedErrorFallback` | `src/components/SharedErrorFallback.tsx` | Bilingual error display; E2E verifies no raw errors |
| `sanitizeError()` | `src/lib/errorSanitizer.ts` | Error pages never show SQL/stack/PII |
| `withSessionErrorBoundary` HOC | `src/components/` | Wraps InterviewSession, PracticeSession, TestPage, CelebrationOverlay |
| ProviderOrderGuard | `ClientProviders.tsx` | Dev-mode only; E2E runs production build (guard inactive) |

### Consumed from Phase 50 (PWA + Sync)
| Contract | Location | Usage |
|----------|----------|-------|
| `swUpdateManager` | `src/lib/pwa/swUpdateManager.ts` | SW update detection + session-lock deferral |
| Persistent bilingual toast | `showPersistent()` API | Duration: null, explicit dismiss required |
| Per-field LWW merge | `settingsSync.ts` | 7 fields, dirty flags override remote timestamps |
| IndexedDB cache versioning | `storageVersions.ts` + `offlineDb.ts` | Version mismatch → invalidate + refetch |

### Consumed from Phase 51 (Unit Tests)
| Contract | Location | Usage |
|----------|----------|-------|
| 8 provider test suites | `src/__tests__/contexts/` | 94 tests; mock patterns reusable for E2E |
| Per-file thresholds (8 providers) | `vitest.config.ts` | 47-100% floored to actual; must maintain |

### Feeds into Phase 53
| Deliverable | Consumer Need |
|-------------|--------------|
| 7 E2E tests as safety net | InterviewSession decomposition runs existing E2E to verify no regressions |
| Accessibility baseline | Phase 53 UI changes must not regress WCAG compliance |
| Provider integration proof | Full-stack E2E validates provider tree is stable for refactoring |

### Must NOT Break
- 779+ existing unit tests
- 26 per-file coverage thresholds + 40% global floor
- Provider tree order (ErrorBoundary → Auth → Language → Theme → TTS → Toast → Offline → Social → SRS → State → Navigation)
- Error sanitization pipeline (19 error groups)
- Session persistence (5s auto-save, 24h expiry)
- SW update deferral during locked sessions
- Settings per-field LWW merge with dirty flags

---

## 4. Gotcha Inventory

### Critical (13 items)

| ID | Gotcha | Feature | Fix/Workaround |
|----|--------|---------|----------------|
| G-01 | AuthProvider must be above Language/Theme/TTS; useAuth() crashes if called outside | All E2E | E2E uses production build with correct provider tree; verify via smoke test |
| G-02 | OfflineProvider must be inside ToastProvider; sync toasts fail silently otherwise | TEST-07 | Verify ClientProviders.tsx nesting order in production build |
| G-03 | TTSProvider async init must throw when engine not ready, not silently return | TEST-08 | Interview greeting audio depends on throw-then-retry pattern |
| G-04 | Audio gesture policy blocks auto-play from useEffect on mobile | TEST-04, TEST-08 | `unlockAudioSession()` must be called from user gesture handler before auto-play |
| G-05 | Multiple audio players overlap without `cancelAllPlayers()` mutual exclusion | TEST-04, TEST-05, TEST-08 | Verify audio player registry stops prior audio before new play |
| G-06 | Glass-heavy panels in dark mode may fail WCAG AA 4.5:1 contrast | A11Y-04 | Measure effective contrast of `rgba(surface / opacity)` on dark backgrounds |
| G-07 | Glass-heavy opacity 0.35 (dark) with purple tint reduces text luminance | A11Y-04 | May need to increase opacity to 0.45+ or brighten text color |
| G-08 | axe-core cannot measure backdrop-filter blur contrast programmatically | A11Y-01, A11Y-04 | Manual HSL calculation + device testing required |
| G-09 | SW update during active session must be deferred (dual lock check) | TEST-09 | Check both `NavigationProvider.isLocked` AND `history.state.interviewGuard` |
| G-10 | Settings LWW dirty flag must override remote timestamps | TEST-07 | Offline changes always win; dirty flag cleared after sync |
| G-11 | BilingualButton `sm` variant is 40px (below 44px minimum) | A11Y-03 | Change to `min-h-[44px]` |
| G-12 | FlagToggle buttons are 36px × 36px | A11Y-03 | Increase to `min-h-[44px] min-w-[44px]` |
| G-13 | 9+ component families have touch targets below 44px | A11Y-03 | Systematic audit and fix required |

### High (22 items)

| ID | Gotcha | Feature | Fix |
|----|--------|---------|-----|
| G-14 | `.prismatic-border` can override `position: fixed` on Sidebar | E2E visual | Verify Sidebar/BottomTabBar are fixed in production build |
| G-15 | `landscape:` variant fires on desktop 1920×1080 viewports | TEST-08 | Pair with `max-md:landscape:` for mobile-only overlays |
| G-16 | Myanmar text < 12px or with letter-spacing is illegible | All bilingual E2E | Audit font-myanmar class on all Myanmar-rendered components |
| G-17 | Myanmar font-myanmar class missing on dynamically-rendered text | TEST-05, TEST-08 | Grep for Myanmar Unicode `[\u1000-\u109F]` without font-myanmar; 3-pass audit |
| G-18 | Cancelled audio retry-on-error creates zombie playback | TEST-04, TEST-08 | Verify `cancelledFlag` check before retry in audioPlayer catch block |
| G-19 | bilingual sequential audio (EN→400ms→MY) blocks on Burmese failure | TEST-05 | Burmese play must be non-blocking (try-catch swallowed) |
| G-20 | Success text on success-subtle bg (green-50) fails contrast (3.2:1) | A11Y-01 | Change to darker green text or white text on success bg |
| G-21 | Warning text on warning-subtle bg (amber-50) fails contrast (2.9:1) | A11Y-01 | Change to darker amber text or white text on warning bg |
| G-22 | Sidebar/BottomTabBar icons hard to see on glass-heavy dark bg | A11Y-04 | Increase icon opacity or use lighter color |
| G-23 | Focus ring on dark glass background may be below 3:1 contrast | A11Y-04 | Change `--color-ring` to brighter value in dark mode |
| G-24 | Tab-bar items lack explicit focus ring (relies on color change only) | A11Y-02 | Add `focus-visible:ring-2` styles |
| G-25 | Mock Audio in tests must support property handlers (onended, onerror) | A11Y-02 | Use full mock with property handlers, not addEventListener-only |
| G-26 | Race condition: session ends → update fires → data not yet in IndexedDB | TEST-09 | E2E must wait for session save complete before triggering update |
| G-27 | Error boundary relies on 5s auto-save, does NOT re-save on catch | All E2E | Expect max 5s data loss on crash; don't assert explicit save in error handler |
| G-28 | Auth hydration race: SocialContext actions fail before user?.id resolves | TEST-03 | Wait for display-name/email visible before testing actions |
| G-29 | NavBadge uses colored dot only (no icon/text) | A11Y-02, A11Y-03 | Add aria-label or icon alternative |
| G-30 | Category progress bars use color-only mastery indication | A11Y-02 | Add text label alongside color |
| G-31 | Difficulty dots on flashcards use color-only indication | A11Y-02 | Add count text or aria-label |
| G-32 | SubcategoryBar triggers at 36px height | A11Y-03 | Increase to 44px |
| G-33 | InterviewTranscript buttons at 28px height | A11Y-03 | Increase to 44px |
| G-34 | PracticeConfig chips at 36px height | A11Y-03 | Increase to 44px |
| G-35 | RelatedQuestions buttons at 36px height | A11Y-03 | Increase to 44px |

### Medium (12 items)

| ID | Gotcha | Feature | Notes |
|----|--------|---------|-------|
| G-36 | `landscape:` variant on desktop can show unwanted overlays | TEST-08 | Use `max-md:landscape:flex` |
| G-37 | Tailwind class conflicts on flip card bg in light theme | TEST-05 | Ensure `!bg-black/20` has `!important` |
| G-38 | Glass noise texture (3% opacity SVG) visible in high-contrast mode | A11Y-01 | Acceptable; decorative element |
| G-39 | Prismatic border blur hides text at border edges | A11Y-04 | Reduce glow intensity or increase text margin |
| G-40 | No explicit focus ring offset token (hardcoded 2px) | A11Y-02 | Standardize across components |
| G-41 | Glass opacity not exposed as Tailwind utility | A11Y-04 | Use CSS variable directly; not blocking |
| G-42 | Myanmar text pushes button height > 44px (line-height 1.6) | A11Y-03 | Acceptable (min is 44px, not max) |
| G-43 | TourTooltip buttons at 36px | A11Y-03 | Low priority (onboarding only) |
| G-44 | Streak flame indicator is visual-only (no text) | A11Y-02 | Add aria-label "Streak active" |

---

## 5. Data Contracts

### E2E Test Data Flow
```
allQuestions (128, bundled) → TestPage/PracticeSession/SortMode/InterviewSession
  → quizReducer state machine → results array
  → saveTestSession() → Supabase (online) OR queueTestResult() → IndexedDB (offline)
  → syncAllPendingResults() → Supabase (on reconnect)
```

### Key TypeScript Types
```typescript
// Quiz state machine (quizReducer.ts)
type QuizPhase = 'answering' | 'checked' | 'feedback' | 'transitioning' | 'skipped-review' | 'finished';
type QuizAction = 'CHECK' | 'SHOW_FEEDBACK' | 'CONTINUE' | 'TRANSITION_COMPLETE' | 'RESUME_SESSION';

// Session persistence (sessionStore.ts)
type SessionType = 'mock-test' | 'practice' | 'interview' | 'sort';
interface SessionSnapshot { type, version, savedAt, data: MockTestSnapshot | PracticeSnapshot | ... }

// SRS (fsrsEngine.ts)
gradeCard(card: Card, isEasy: boolean) → RecordLogItem
isDue(card: Card) → boolean

// Answer grading (answerGrader.ts)
gradeAnswer(transcript, expectedAnswers, threshold=0.35) → { isCorrect, confidence, matchedKeywords, missingKeywords }

// Settings merge (settingsSync.ts)
mergeSettingsWithTimestamps(input) → { merged, changedFields }
// Priority: dirty > local-newer > remote-newer

// Navigation lock (useNavigationGuard.ts)
useNavigationGuard({ active, onBackAttempt, markerKey }) → pushes history state with marker
```

### Network Requests E2E Can Intercept
| Endpoint | Method | Flow |
|----------|--------|------|
| `*/auth/**` | POST | Login/register |
| `*/mock_tests*` | POST | Save test results |
| `*/mock_test_responses*` | POST | Save individual answers |
| `*/srs_cards*` | PUT/DELETE | Sync SRS deck |
| `*/user_settings*` | SELECT/UPSERT | Settings sync |
| `*/user_bookmarks*` | SELECT/UPSERT | Bookmark sync |

---

## 6. Design Compliance Matrix

### Glass-Morphism Contrast Audit

| Tier | Light Mode | Dark Mode | Text Contrast (est.) | Status |
|------|-----------|-----------|---------------------|--------|
| `.glass-light` | blur 16px, opacity 0.65 | blur 18px, opacity 0.55 | ~12:1 (light), ~8:1 (dark) | Likely PASS |
| `.glass-medium` | blur 24px, opacity 0.55 | blur 28px, opacity 0.45 | ~10:1 (light), ~6:1 (dark) | Likely PASS |
| `.glass-heavy` | blur 32px, opacity 0.45 | blur 36px, opacity 0.35 | ~8:1 (light), ~3.5-4:1 (dark) | BORDERLINE |

**Action:** Dark mode `.glass-heavy` needs manual measurement. If < 4.5:1, increase opacity to 0.45 or brighten text.

### Touch Target Compliance

| Status | Count | Components |
|--------|-------|------------|
| Compliant (≥44px) | ~174 | Primary buttons, SpeechButton, BottomTabBar, PostTestPrompt |
| Non-compliant (<44px) | 9+ families | BilingualButton sm, FlagToggle, SubcategoryBar, InterviewTranscript, PracticeConfig, RelatedQuestions, AchievementsTab chips, TourTooltip, InterviewSession inline buttons |

### Color-Only Indicators (WCAG 1.4.1 violations)

| Component | Indicator | Fix |
|-----------|-----------|-----|
| NavBadge | Colored dot (green/gray/blue) | Add aria-label or icon |
| CategoryBreakdown | Bar color (green/amber) | Add text label |
| Flashcard difficulty | Yellow dots | Add count text |
| SyncStatusIndicator | Color block | Add aria-label |
| StreakReward flame | Animation only | Add "Streak active" aria-label |

---

## 7. Accessibility Architecture

### Existing A11Y Infrastructure
- **Announcer:** `src/lib/a11y/announcer.ts` — persistent `aria-live` regions (polite + assertive)
- **Focus rings:** 3px solid `hsl(var(--color-ring))` with 2px offset
- **Reduced motion:** CSS `@media (prefers-reduced-motion: reduce)` + `useReducedMotion()` hook
- **High contrast:** `@media (prefers-contrast: more)` bumps secondary text + borders
- **Radix primitives:** Dialog, Tabs with built-in WCAG compliance
- **Semantic HTML:** `role="tablist"`, `role="radiogroup"`, `role="img"`, `role="status"`

### E2E Selector Strategy (no data-testid in production)
```typescript
page.locator('[role="heading"]')           // Headings
page.locator('[role="button"]')            // Buttons
page.locator('[role="alert"]')             // Error messages
page.locator('[role="status"]')            // Live regions
page.locator('[role="dialog"]')            // Modals
page.locator('[role="tablist"]')           // Tab bars
page.locator('button:has-text("Start")')   // Text-based
page.locator('.glass-light')               // Glass tiers
```

---

## 8. Animation Timing for E2E Waits

| Component | Phase | Duration | E2E Wait Strategy |
|-----------|-------|----------|-------------------|
| FeedbackPanel enter | Spring | ~350-450ms | `waitFor('[role="status"]', { state: 'visible' })` |
| SwipeableCard fling | Spring | ~300ms + 1500ms safety | Use button clicks instead of drag |
| CelebrationOverlay peak | Level-based | 800-2500ms | Wait for overlay visible, then hidden |
| TestResultsScreen choreography | Multi-stage | ~3-4s total | Wait for action buttons to be enabled |
| StreakReward display | Bounce spring | 2000ms auto-hide | Wait for `[role="status"]` content |
| ExaminerCharacter state | CSS keyframe | 400-4000ms per state | Check class attribute for state |
| InterviewSession typing | Typing indicator | 1200ms | Wait for indicator visible then hidden |

**Reduced Motion:** All animations resolve instantly; use `page.emulateMedia({ reducedMotion: 'reduce' })` for faster tests.

---

## 9. Architectural Decisions

### Decision 1: Auth Mocking Strategy
- **Options:** (a) Real Supabase test account, (b) Mock at API level, (c) Mock at localStorage level
- **Chosen:** (b) Mock at API level via `page.route('**/auth/**')` + inject session to localStorage
- **Rationale:** No external dependency, no rate limiting, deterministic, no data pollution

### Decision 2: E2E Test Isolation
- **Options:** (a) Shared state between tests, (b) Fresh context per test
- **Chosen:** (b) Fresh browser context with IndexedDB/localStorage cleanup
- **Rationale:** Parallel tests with shared state cause flakes; cleanup is cheap

### Decision 3: Touch Target Audit Method
- **Options:** (a) Manual visual inspection, (b) Automated Playwright script, (c) Both
- **Chosen:** (c) Automated script identifies violations, manual fixes applied
- **Rationale:** 183 components too many for manual-only; script provides confidence

### Decision 4: Glass Contrast Verification
- **Options:** (a) axe-core with exceptions, (b) Manual HSL calculation, (c) Device testing
- **Chosen:** All three — axe-core scans exclude glass elements, HSL calc verifies, device confirms
- **Rationale:** No single tool handles backdrop-filter contrast; defense-in-depth

### Decision 5: Browser Matrix
- **Options:** (a) Chromium only, (b) Chromium + Firefox, (c) All three
- **Chosen:** (a) Chromium only for Phase 52
- **Rationale:** Phase 52 scope already large; expand in Phase 53 after tests prove stable

---

## 10. File Map

### Create
| File | Purpose |
|------|---------|
| `e2e/fixtures/auth.ts` | Supabase auth mock helper |
| `e2e/fixtures/storage.ts` | IndexedDB/localStorage cleanup fixture |
| `e2e/auth-dashboard.spec.ts` | TEST-03: Auth login → dashboard |
| `e2e/mock-test.spec.ts` | TEST-04: Mock test lifecycle |
| `e2e/practice.spec.ts` | TEST-05: Practice session |
| `e2e/flashcard-sort.spec.ts` | TEST-06: Flashcard sort |
| `e2e/offline-sync.spec.ts` | TEST-07: Offline → online sync |
| `e2e/interview.spec.ts` | TEST-08: Interview session (text input) |
| `e2e/sw-update.spec.ts` | TEST-09: Service worker update |
| `e2e/wcag-scan.spec.ts` | A11Y-01: axe-core scans on 4 pages |
| `e2e/touch-targets.spec.ts` | A11Y-03: Automated touch target audit |
| `src/__tests__/a11y/*.a11y.test.tsx` | A11Y-02: vitest-axe for interactive components |

### Modify
| File | Change |
|------|--------|
| `package.json` | Add `@axe-core/playwright` |
| `playwright.config.ts` | Add E2E project config if needed |
| `src/components/bilingual/BilingualButton.tsx` | Fix sm variant 40px → 44px |
| `src/components/ui/FlagToggle.tsx` | Fix 36px → 44px |
| `src/components/hub/AchievementsTab.tsx` | Fix chip 36px → 44px |
| `src/components/hub/SubcategoryBar.tsx` | Fix trigger 36px → 44px |
| `src/components/interview/InterviewTranscript.tsx` | Fix buttons 28px → 44px |
| `src/components/interview/InterviewSession.tsx` | Fix inline buttons 32px → 44px |
| `src/components/practice/PracticeConfig.tsx` | Fix chips 36px → 44px |
| `src/components/explanations/RelatedQuestions.tsx` | Fix buttons 36px → 44px |
| `src/styles/tokens.css` | Adjust glass opacity/text color if contrast fails |
| `src/styles/globals.css` | Fix color-only indicators, focus rings |
| `vitest.config.ts` | Add per-file thresholds for new a11y test files |

### Read (reference during implementation)
| File | Reason |
|------|--------|
| `src/lib/quiz/quizReducer.ts` | Quiz state machine for E2E assertions |
| `src/lib/pwa/swUpdateManager.ts` | SW update mocking strategy |
| `src/lib/pwa/offlineDb.ts` | IndexedDB operations for offline E2E |
| `src/lib/pwa/syncQueue.ts` | Sync flow for online reconnection |
| `src/contexts/SupabaseAuthContext.tsx` | Auth flow for E2E mocking |
| `src/contexts/NavigationContext.tsx` | Session lock for SW deferral testing |
| `src/lib/answerGrader.ts` | Interview grading for E2E assertions |
| `src/lib/settings/settingsSync.ts` | LWW merge for offline settings E2E |

---

## 11. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence |
|---|-----------|-----------|------------|
| 1 | Auth in E2E | Mock Supabase via `page.route()` + localStorage session injection | HIGH |
| 2 | Offline simulation | `context.setOffline()` + verify IndexedDB sync queue | HIGH |
| 3 | SW update testing | Mock registration object, fire events programmatically | HIGH |
| 4 | axe-core + glass exceptions | Disable `color-contrast` on glass elements; manual verification | HIGH |
| 5 | Test isolation | Fresh browser context per test; clear storage in afterEach | HIGH |
| 6 | Browser matrix | Chromium only (Phase 52); expand in Phase 53 | HIGH |
| 7 | Interview text input | TextAnswerInput.tsx production-ready; use in E2E | HIGH |
| 8 | Flashcard swipe | Button clicks for E2E stability; component tests cover swipe | HIGH |
| 9 | Coverage impact | E2E doesn't affect Vitest thresholds; A11Y-02 does | HIGH |
| 10 | Touch audit scope | Automated Playwright script + manual fix per violation | HIGH |
| 11 | VISC-05 method | HSL math + axe exceptions + device testing (defense-in-depth) | MEDIUM-HIGH |
| 12 | Data seeding | Questions bundled in app; no seeding infrastructure needed | HIGH |

---

## 12. Test Infrastructure Patterns

### Playwright E2E Patterns (from existing smoke test)
```typescript
import { test, expect } from '@playwright/test';

test('flow name', async ({ page }) => {
  await page.goto('/route');
  await expect(page.locator('[role="heading"]').first()).toBeVisible({ timeout: 10_000 });
});
```

### vitest-axe Pattern (from existing a11y tests)
```typescript
import { axe } from 'vitest-axe';
import { renderWithProviders } from '../utils/renderWithProviders';

it('has no a11y violations', async () => {
  const { container } = renderWithProviders(<Component />, { preset: 'core' });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Mock Patterns (from provider tests)
```typescript
// Supabase auth chain mock
const mockFrom = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

// Session fixture
function setupSessionMock(userId = 'test-user-id') {
  mockGetSession.mockResolvedValue({
    data: { session: { user: { id: userId, email: 'test@example.com' } } },
    error: null,
  });
}
```

---

## 13. Design Token Audit Results

### Token Gaps Found
| Gap | Impact | Fix |
|-----|--------|-----|
| Glass opacity not in Tailwind utilities | Can't use `opacity-glass-light` | Use CSS variable directly |
| High-contrast border only in media query | Can't use Tailwind for high-contrast borders | Acceptable; CSS media query handles it |
| No text-shadow token for glass fallback | Inconsistent shadow across glass elements | Create token if needed during contrast fixes |
| TTS color (`--color-tts`) not in Tailwind config | Unused in utilities | Low priority; not blocking |

### Accent Color Contrast Failures
| Pair | Ratio | WCAG | Fix Needed |
|------|-------|------|-----------|
| Success text (green-500) on green-50 bg | 3.2:1 | FAIL AA | Darken to green-700 or use white text |
| Warning text (amber-500) on amber-50 bg | 2.9:1 | FAIL AA | Darken to amber-700 or use white text |
| Destructive text (red-500) on white | 4.2:1 | Borderline AA | Acceptable but monitor |

---

*Research completed: 2026-03-20*
*12 parallel research agents, 2 waves*
*Sources: 50+ files read, git history, 4 learnings files, 4 completed phase directories*
