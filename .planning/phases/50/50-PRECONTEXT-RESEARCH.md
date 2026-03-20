# Phase 50: PWA + Sync Resilience — Precontext Research

**Phase Goal:** Users are notified of app updates without mid-session disruption, offline settings changes survive sync, and stale cached data is invalidated on version mismatch.

**Requirements:** ARCH-01, ARCH-02, ARCH-03, ARCH-06

**Research Method:** 12-agent protocol (2 waves of 6 parallel Explore agents)

---

## 1. Resolved Assumptions

### Technical Approach

| Assumption | Resolution | Evidence | Confidence |
|-----------|-----------|---------|-----------|
| SW activates immediately with skipWaiting+clientsClaim | YES — new SW takes control within ~100-200ms, no waiting phase | `src/lib/pwa/sw.ts:16-17` | HIGH |
| Serwist v9.5.6 supports custom update handlers | YES — `controllerchange` event fires normally; skipWaiting does NOT bypass listeners | package.json, ServiceWorker spec | HIGH |
| Per-field LWW needs DB schema migration | NO — client-side only; store per-field timestamps in localStorage, compare on sync | settingsSync.ts architecture, SRS merge pattern | HIGH |
| BilingualToast supports persistent (no auto-dismiss) | YES with minor change — pass `duration: null` to skip timer | BilingualToast.tsx:215-254 | HIGH |
| NavigationProvider.isLocked detects all active sessions | NO — only MockTest (Real Exam) sets isLocked; Interview uses useInterviewGuard separately | TestPage.tsx:266, InterviewSession.tsx:265 | HIGH |
| IndexedDB version should be app version from package.json | NO — use dedicated per-store version constants | offlineDb.ts pattern, sessionStore.ts reference | MEDIUM |
| Practice sessions should defer updates | NO — only Real Exam + Realistic Interview defer; Practice allows exit anytime | ARCH-02 spec: "mock test or interview" | HIGH |
| Bookmark sync needs LWW upgrade | NO — ARCH-03 is settings only; bookmarks keep add-wins merge | REQUIREMENTS.md, ROADMAP.md | HIGH |

### Scope Boundaries

**In scope:**
- SW update detection + persistent bilingual toast with "Update now" CTA
- Session-lock guard suppressing update during Real Exam + Realistic Interview
- Per-field LWW merge for 7 settings fields (theme, languageMode, ttsRate, ttsPitch, ttsAutoRead, ttsAutoReadLang, testDate)
- Questions cache version checking + stale invalidation on read
- Generalized version constant pattern for IndexedDB stores

**Out of scope:**
- Bookmark sync changes (stays add-wins)
- SRS sync changes (already per-card LWW)
- Streak sync changes (already complex merge)
- DB schema migration (per-field timestamps are client-side)
- Multi-tab BroadcastChannel coordination (future enhancement)
- Device ID tracking for conflict attribution (document as known limitation)
- Visual regression testing of toast UI

---

## 2. Cross-Phase Contract Inventory

### Contracts FROM Phase 48 (Test Infrastructure)

| Contract | API | Phase 50 Usage |
|----------|-----|---------------|
| renderWithProviders | `src/__tests__/utils/renderWithProviders.tsx` | Use `core` preset for most tests; `full` for provider interaction tests |
| Coverage thresholds | vitest.config.ts: 40% global floor, 26 per-file | Add per-file thresholds for any new src/lib/ files with tests |
| Playwright E2E | `playwright.config.ts`, `pnpm test:e2e` | Phase 50 PWA tests must run against production build |
| CI pipeline | 9-step: lint → css-lint → format → build → test → e2e | All changes must pass full pipeline |
| Sentry fingerprinting | 19 error pattern groups in beforeSendHandler | Use captureError() with context, never console.error |

### Contracts FROM Phase 49 (Error Handling)

| Contract | API | Phase 50 Usage |
|----------|-----|---------------|
| SharedErrorFallback | `src/components/ui/SharedErrorFallback.tsx` | Use for any error UI; always bilingual, never raw error.message |
| withSessionErrorBoundary | `src/components/withSessionErrorBoundary.tsx` | Wrap any new session-like components |
| ErrorBoundary | fallback check is `!== undefined` (null = silent) | Do NOT create alternative boundary wrappers |
| ProviderOrderGuard | Dev-mode validation in ClientProviders.tsx | Do NOT reorder providers |
| captureError() | `src/lib/sentry.ts` | Include `{ operation, component }` context |
| BilingualMessage type | `{ en: string, my: string }` | All user-facing text in Phase 50 |

### Contracts TO Phase 51 (Unit Test Expansion)

- New hooks/utilities created in Phase 50 must be testable in isolation
- Per-file coverage thresholds added with actual (not aspirational) values
- mergeSettingsWithTimestamps() must be a pure function (easily unit-testable)

### Contracts TO Phase 52 (E2E Tests)

- TEST-09 (E2E: SW update flow) depends on Phase 50 infrastructure
- Update toast + session deferral must be E2E-testable with Playwright
- IndexedDB cache versioning must be verifiable via E2E

---

## 3. Existing Infrastructure Analysis

### Service Worker (src/lib/pwa/sw.ts)

**Current lifecycle:**
```
Build: sw.ts → public/sw.js (Serwist compiles, injects __SW_MANIFEST)
Install: precache app shell + offline.html
Activate: skipWaiting + clientsClaim → immediate control
Fetch: precache match → runtime cache → network → offline fallback
Push: Show bilingual notification
```

**Key config:**
- `skipWaiting: true` — new SW activates immediately (no waiting state)
- `clientsClaim: true` — claims all open tabs on activation
- `navigationPreload: true` — preloads nav requests during activation
- Runtime caching: audio MP3s CacheFirst (90-day TTL, 1200 entries max)
- Fallback: `/offline.html` for navigation when offline

**Missing for ARCH-01:**
- No `controllerchange` listener on client
- No toast/notification when update activates
- No "Refresh to update" CTA

**Existing update detection (partial):**
- `useNavBadges.ts:41-48` checks `registration.waiting`, sets `settingsHasUpdate` flag
- Shows dot badge on Settings nav tab — but buried, not discoverable
- No `controllerchange` listener (doesn't react to actual activation)

**Client-side SW access points:**
- `pushNotifications.ts:35,69,131` — `navigator.serviceWorker.ready` for push
- `useNavBadges.ts:41-48` — `navigator.serviceWorker.getRegistration()` for update check
- No explicit `navigator.serviceWorker.register()` — @serwist/next auto-injects

### Settings Sync (src/lib/settings/settingsSync.ts)

**Current data flow:**

Push: `localStorage → gatherCurrentSettings() → syncSettingsToSupabase() → Supabase upsert`
Pull: `Supabase select → loadSettingsFromSupabase() → mapRowToSettings() → localStorage writes`

**7 synced fields:**

| Field | localStorage Key | Supabase Column | Type |
|-------|-----------------|-----------------|------|
| theme | `civic-theme` | `theme` | 'light' \| 'dark' |
| languageMode | `civic-test-language-mode` | `language_mode` | 'bilingual' \| 'english-only' |
| ttsRate | `civic-prep-tts-settings` (JSON) | `tts_rate` | 'slow' \| 'normal' \| 'fast' |
| ttsPitch | `civic-prep-tts-settings` (JSON) | `tts_pitch` | number |
| ttsAutoRead | `civic-prep-tts-settings` (JSON) | `tts_auto_read` | boolean |
| ttsAutoReadLang | `civic-prep-tts-settings` (JSON) | `tts_auto_read_lang` | 'english' \| 'burmese' \| 'both' |
| testDate | `civic-prep-test-date` | `test_date` | string \| null |

**Current conflict resolution:** Server-wins on login (remote overwrites local)
**Push strategy:** Fire-and-forget upsert on every setting change
**Call sites:** 6 (LanguageContext, ThemeContext, TTSContext, useTestDate ×2)
**Visibility sync:** useVisibilitySync exists but NOT integrated for settings

**Supabase schema (user_settings):**
- Single `updated_at timestamptz` column (no per-field timestamps)
- RLS: users can manage own settings

### IndexedDB Store Inventory

| Database | Object Store | Versioning | Used By |
|----------|-------------|-----------|---------|
| `civic-prep-questions` | `questions` | Partial (CacheMeta.version=1, never checked) | offlineDb.ts |
| `civic-prep-sync` | `pending-results` | NONE | offlineDb.ts |
| `civic-prep-sessions` | `active-sessions` | YES (SESSION_VERSION=1, checked on read) | sessionStore.ts |
| `civic-prep-srs` | `cards` | NONE | srsStore.ts |
| `civic-prep-srs-sync` | `pending-reviews` | NONE | srsSync.ts |
| `civic-prep-bookmarks` | `starred` | NONE | bookmarkStore.ts |
| `civic-prep-mastery` | `answer-history` | NONE | masteryStore.ts |
| `civic-prep-interview` | `sessions` | NONE | interviewStore.ts |
| `civic-prep-streaks` | `streak-data` | NONE | streakStore.ts |
| `civic-prep-badges` | `badge-data` | NONE | badgeStore.ts |

**10 stores total. Only 1 has working version checking (sessions). Questions have version field but never validate it.**

**Reference pattern (sessionStore.ts):**
```typescript
// On every read:
if (snap.version !== SESSION_VERSION) {
  await del(key, sessionStore);  // Auto-delete stale
  continue;
}
```

### Session Lock System

**Mock Test (Real Exam):**
- `TestPage.tsx:266-268` — `setLock(shouldLock, lockMessage)` via NavigationProvider
- `shouldLock = !isPracticeMode && !showPreTest && !isFinished && !showCountdown`
- Also uses `useNavigationGuard` with `markerKey: 'navLock'`

**Interview (both modes):**
- Uses `useInterviewGuard()` (thin wrapper around useNavigationGuard)
- `markerKey: 'interviewGuard'`
- Does NOT use NavigationProvider.setLock

**Practice/Sort/Drill:** No navigation lock (allow exit anytime)

**Error recovery:** `withSessionErrorBoundary` calls `setLock(false)` on crash

### Toast System (BilingualToast.tsx)

- Types: error (6s), success (4s), info (5s), warning (5s)
- Swipe-to-dismiss + manual close button
- Haptic feedback (light/medium)
- Mobile: bottom-center above tab bar; Desktop: top-right
- Auto-dismiss timers managed per-toast
- Persistence: NOT currently supported — needs `duration: null` path

### Provider Hierarchy

```
ErrorBoundary
  → AuthProvider (MUST be above Language/Theme/TTS)
    → LanguageProvider (calls useAuth for sync)
      → ThemeProvider (calls useAuth for sync)
        → TTSProvider (async init, calls useAuth)
          → ToastProvider (bilingual)
            → OfflineProvider (calls useToast — MUST be inside ToastProvider)
              → SocialProvider
                → SRSProvider
                  → StateProvider
                    → NavigationProvider
```

**Phase 50 constraint:** Do NOT reorder. ProviderOrderGuard validates in dev mode.

---

## 4. Gotcha Inventory

### CRITICAL (6)

| ID | Feature | Gotcha | Fix |
|----|---------|--------|-----|
| G-01 | ARCH-02 | Race condition: session ends → update fires → data not yet saved to IndexedDB | Debounce update acceptance; verify session save complete before SW activation |
| G-02 | ARCH-02 | Interview uses useInterviewGuard, NOT NavigationProvider.isLocked — checking only isLocked misses active interviews | Unified detection: check both isLocked AND history.state markers |
| G-03 | ARCH-03 | Offline changes lost if remote timestamp is newer (core problem ARCH-03 solves) | Per-field timestamps in localStorage; local offline field with `_dirty` flag takes priority |
| G-04 | ARCH-03 | Missing per-field timestamps — without them, entire row is atomic (same as current server-wins) | Store `{field}_updated_at` in localStorage metadata object; include in merge |
| G-05 | ARCH-06 | CacheMeta.version=1 exists but NEVER checked on read — questions cache serves stale data forever | Add version validation in getCachedQuestions(); invalidate on mismatch |
| G-06 | ARCH-06 | SRS cards destroyed on global cache clear — user loses entire review history | Per-store versioning; only invalidate affected store (questions), never SRS |

### HIGH (9)

| ID | Feature | Gotcha | Fix |
|----|---------|--------|-----|
| G-07 | ARCH-01 | Toast auto-dismisses before user notices update | Add `duration: null` persistent toast variant; require explicit dismiss/action |
| G-08 | ARCH-01 | useToast no-op fallback needed outside provider tree during cold start | Toast is fire-and-forget — use no-op fallback pattern (never throw) |
| G-09 | ARCH-02 | SW lifecycle events fire outside React — can't read context hooks in event listeners | Bridge via module-level ref/flag synced from NavigationProvider via useEffect |
| G-10 | ARCH-02 | Multi-tab: Tab A in exam, Tab B accepts update → Tab A crashes | Document as known limitation for v4.1; full fix needs BroadcastChannel (Phase 52+) |
| G-11 | ARCH-03 | Context memoization: LanguageContext/ThemeContext cache prevents re-render after merge | Force setState in provider after merge completes; don't rely on memoization for external changes |
| G-12 | ARCH-03 | Visibility sync not integrated for settings — only SocialContext uses useVisibilitySync | Wire pullSettings callback into useVisibilitySync; extend existing pattern |
| G-13 | ARCH-06 | Version constant not bumped on deploy → stale cache persists forever | Document version bump in deployment checklist; consider content hash alternative |
| G-14 | ARCH-06 | SW audio cache (CacheFirst, 90-day TTL) may serve stale audio after questions update | Audio filenames are content-addressed (`q{id}_en.mp3`); safe if question IDs don't change |
| G-15 | ARCH-06 | 8 of 10 IndexedDB stores have NO versioning — schema changes corrupt silently | Generalize SESSION_VERSION pattern; add version field to all store records |

### MEDIUM (9)

| ID | Feature | Gotcha | Fix |
|----|---------|--------|-----|
| G-16 | ARCH-01 | CSS specificity: toast positioning may be overridden by custom classes in production | Use `!fixed !z-50` on critical toast styles |
| G-17 | ARCH-01 | Myanmar text in toast needs font-myanmar class with min 12px, line-height 1.6 | Apply `.font-myanmar` wrapper; verify Burmese text rendering in toast |
| G-18 | ARCH-01 | English-only toast text if language check missing | Use BilingualMessage type; conditional render based on useLanguage() |
| G-19 | ARCH-02 | Offline user in exam when SW updates — version mismatch on later sync | Tag session snapshots with SW/app version for forward-compat |
| G-20 | ARCH-03 | Timestamp collisions (same millisecond on same device) | Rare; deterministic tie-break by field name or accept as LWW limitation |
| G-21 | ARCH-03 | Supabase onAuthStateChange deadlock — nested API calls block auth lock | Use existing `setTimeout(0)` defer pattern (already fixed in SupabaseAuthContext.tsx:249) |
| G-22 | ARCH-06 | Dev/test version mismatch: local DB already cleared, can't verify invalidation | Test with fixture data at old version; add Playwright E2E for cache invalidation |
| G-23 | ARCH-06 | Version bump on every deploy causes unnecessary cache churn | Use content-specific versions (not app version); bump only on data structure changes |
| G-24 | ALL | Provider hierarchy fragility — 10-provider chain with strict constraints | Phase 50 must not reorder ClientProviders.tsx; ProviderOrderGuard validates in dev |

---

## 5. Data Contracts

### New Types for ARCH-01 (SW Update)

```typescript
// src/lib/pwa/swUpdateManager.ts
interface SWUpdateState {
  updateAvailable: boolean;
  isSessionLocked: boolean;  // Bridges React state to SW lifecycle
  deferredUpdate: boolean;   // True when update suppressed during session
}
```

### New Types for ARCH-03 (Per-Field LWW)

```typescript
// src/lib/settings/settingsSync.ts (extended)
interface SettingsTimestamps {
  theme_updated_at: string;           // ISO timestamp
  language_mode_updated_at: string;
  tts_rate_updated_at: string;
  tts_pitch_updated_at: string;
  tts_auto_read_updated_at: string;
  tts_auto_read_lang_updated_at: string;
  test_date_updated_at: string;
}

interface LocalSettingsState extends UserSettings {
  timestamps: SettingsTimestamps;
  dirty: Partial<Record<keyof UserSettings, boolean>>;  // Fields changed offline
}
```

### New Types for ARCH-06 (Cache Versioning)

```typescript
// src/lib/db/storageVersions.ts
export const STORAGE_VERSIONS = {
  QUESTIONS: 1,
  SESSION: 1,  // Already exists as SESSION_VERSION
  SRS_CARD: 1,
  BOOKMARK: 1,
  ANSWER_HISTORY: 1,
  INTERVIEW: 1,
  STREAK: 1,
  BADGE: 1,
} as const;
```

### Existing Contracts (Must Not Change)

| Contract | File | Constraint |
|----------|------|-----------|
| SessionSnapshot types | sessionTypes.ts | SESSION_VERSION=1, 4 session types |
| Session auto-save | sessionStore.ts | 5-second interval, 24-hour expiry |
| UserSettings interface | settingsSync.ts | 7 fields, mapRowToSettings/mapSettingsToRow |
| gatherCurrentSettings | settingsSync.ts | Reads all settings from localStorage |
| SRS merge pattern | srsSync.ts:mergeSRSDecks | Per-card LWW via lastReviewedAt |
| Error sanitization | errorSanitizer.ts | 19 pattern groups, BilingualMessage output |
| captureError | sentry.ts | Structured reporting with operation/component context |

---

## 6. Design Compliance Matrix

| Design Principle | Phase 50 Application | Compliance |
|-----------------|---------------------|------------|
| Bilingual (en/my) | Update toast, sync notifications, error messages | Required — use BilingualMessage type |
| Myanmar typography | font-myanmar class, min 12px, line-height 1.6 | Required — apply to all Burmese text in toasts |
| 44px touch targets | "Update now" button, toast dismiss button | Required — `min-h-[44px]` |
| Glass-morphism | Toast uses solid background (not glass) | Correct — toasts are solid `bg-destructive`/`bg-warning` |
| Anxiety-reducing tone | "Update available" not "CRITICAL UPDATE" | Required — warm, friendly copy |
| Offline-first | All features work offline; sync on reconnect | Required — update toast shows offline, defers reload |
| Spring animations | Toast enter/exit animations | Use existing toast animation pattern |
| Warm coral for errors | `--color-destructive` token | Use for sync error states |
| Amber for warnings | `--color-warning` token | Use for offline/update indicators |

---

## 7. Architectural Decisions

### AD-01: SW Update Detection Method

**Options:**
- A. `registration.waiting` check (polling) — already exists in useNavBadges
- B. `controllerchange` event listener — fires when new SW takes control
- C. `updatefound` + `statechange` chain — fires during installation

**Chosen: B + C combined.** Listen to `updatefound` for early detection (show toast), and `controllerchange` for actual activation (trigger reload on user action). The existing `registration.waiting` check in useNavBadges is supplementary.

**Rationale:** `controllerchange` is the definitive signal that the new SW is active. `updatefound` provides early warning. Together they cover the full lifecycle.

### AD-02: Session Lock Bridge (React ↔ SW Events)

**Options:**
- A. Module-level mutable ref synced from NavigationProvider via useEffect
- B. Custom event dispatched on lock/unlock
- C. localStorage flag checked by SW event handler

**Chosen: A (module-level ref).** Simplest approach; SW event handler reads `isSessionLockedRef.current` to decide whether to show or defer toast.

**Rationale:** Custom events add complexity. localStorage is async. Module ref is synchronous and trivially testable.

### AD-03: Per-Field Timestamp Storage

**Options:**
- A. Supabase per-field timestamp columns (DB migration)
- B. localStorage metadata object (`civic-settings-timestamps`)
- C. Supabase JSONB column for timestamps

**Chosen: B (localStorage metadata).** Store `{ theme_updated_at: ISO, ... }` in dedicated localStorage key. Compare with Supabase `updated_at` on pull.

**Rationale:** No DB migration needed. Client-side LWW is sufficient for single-user-at-a-time app. Supabase row `updated_at` serves as remote baseline.

### AD-04: Cache Version Strategy

**Options:**
- A. Single global APP_VERSION constant
- B. Per-store version constants (STORAGE_VERSIONS object)
- C. Content hash (sha256 of data)

**Chosen: B (per-store constants).** Each store has independent version. Questions cache version bumps don't affect SRS cards.

**Rationale:** Per-store isolation prevents data loss. Content hash is complex and requires build-time computation. Per-store constants are simple, explicit, and match the existing SESSION_VERSION pattern.

---

## 8. File Map

### Create

| File | Purpose |
|------|---------|
| `src/lib/pwa/swUpdateManager.ts` | SW update detection, session-lock bridge, toast trigger |
| `src/hooks/useSWUpdate.ts` | React hook wrapping swUpdateManager for components |
| `src/lib/db/storageVersions.ts` | Centralized version constants for all IndexedDB stores |
| `src/lib/settings/settingsTimestamps.ts` | Per-field timestamp management for LWW |
| `src/__tests__/settingsSync.test.ts` | Unit tests for mergeSettingsWithTimestamps |
| `src/__tests__/swUpdateManager.test.ts` | Unit tests for SW update logic |
| `src/__tests__/storageVersions.test.ts` | Unit tests for cache versioning |

### Modify

| File | Changes |
|------|---------|
| `src/lib/pwa/sw.ts` | Remove skipWaiting (or keep + add message handler for controlled activation) |
| `src/components/BilingualToast.tsx` | Add `duration: null` persistent toast support |
| `src/lib/settings/settingsSync.ts` | Add mergeSettingsWithTimestamps(), update types |
| `src/contexts/SupabaseAuthContext.tsx` | Use merge instead of server-wins in hydrateFromSupabase |
| `src/contexts/LanguageContext.tsx` | Include timestamp in gatherCurrentSettings |
| `src/contexts/ThemeContext.tsx` | Include timestamp in gatherCurrentSettings |
| `src/contexts/TTSContext.tsx` | Include timestamp in gatherCurrentSettings |
| `src/hooks/useTestDate.ts` | Include timestamp in gatherCurrentSettings |
| `src/hooks/useVisibilitySync.ts` | Wire pullSettings callback for settings re-sync |
| `src/lib/pwa/offlineDb.ts` | Add version check in getCachedQuestions |
| `src/components/navigation/useNavBadges.ts` | Integrate with swUpdateManager |
| `src/components/ClientProviders.tsx` | Add SWUpdateProvider or effect (no reorder!) |
| `vitest.config.ts` | Add per-file thresholds for new test files |

### Read (reference only)

| File | Why |
|------|-----|
| `src/lib/srs/srsSync.ts` | LWW merge reference pattern |
| `src/lib/sessions/sessionStore.ts` | VERSION check reference pattern |
| `src/components/navigation/NavigationProvider.tsx` | isLocked API |
| `src/hooks/useNavigationGuard.ts` | History state markers |
| `src/components/withSessionErrorBoundary.tsx` | Error boundary session save pattern |

---

## 9. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence |
|---|-----------|-----------|-----------|
| 1 | SW activation timing | Immediate (~100-200ms) with skipWaiting+clientsClaim | HIGH |
| 2 | Session lock scope | Dual check: NavigationProvider.isLocked + history.state markers | HIGH |
| 3 | Per-field LWW schema | Client-side only; localStorage timestamps, no DB migration | HIGH |
| 4 | IndexedDB version source | Per-store constants in storageVersions.ts | HIGH |
| 5 | Toast persistence | Supported via duration: null (minor BilingualToast change) | HIGH |
| 6 | Update during offline | Show toast, defer reload until online + user action | HIGH |
| 7 | Practice session deferral | NO deferral — only Real Exam + Realistic Interview | HIGH |
| 8 | Bookmark LWW scope | Settings only; bookmarks stay add-wins | HIGH |
| 9 | Multi-device conflict | LWW with documented limitation; no device ID tracking for v4.1 | HIGH |
| 10 | Serwist compatibility | v9.5.6 fully supports custom update handlers | HIGH |

---

## 10. Implementation Order

**Recommended sequence:**

1. **ARCH-06 first** (IndexedDB cache versioning) — Foundation; no UI changes; low risk; establishes per-store version pattern used by subsequent work
2. **ARCH-01 second** (SW update toast) — Builds on ARCH-06 infrastructure; adds visible UX
3. **ARCH-02 third** (Session-lock deferral) — Extends ARCH-01 with session awareness; needs ARCH-01 toast to exist
4. **ARCH-03 last** (Per-field LWW) — Most complex; independent of SW update work; benefits from testing infrastructure established in earlier plans

---

## 11. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Provider ordering broken by new SW update component | HIGH | Inject as useEffect in existing component, not new provider |
| Multi-tab version mismatch on update | MEDIUM | Document limitation; defer BroadcastChannel to future |
| Settings merge loses data on simultaneous offline edits | LOW | Per-field LWW preserves most changes; documented limitation for same-field conflicts |
| Cache version not bumped on deploy | MEDIUM | Document in deployment checklist; CI could warn |
| Tests break from IndexedDB mocking complexity | MEDIUM | Use existing renderWithProviders mocks; test merge functions as pure logic |

---

*Research completed: 2026-03-20*
*Agents: 12 (6 Wave 1 + 6 Wave 2)*
*Sources: 40+ files read across codebase, git history, planning artifacts*
