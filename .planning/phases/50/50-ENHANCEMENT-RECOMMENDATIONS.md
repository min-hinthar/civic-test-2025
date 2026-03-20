# Phase 50: PWA + Sync Resilience — Enhancement Recommendations

**Phase Goal:** Users are notified of app updates without mid-session disruption, offline settings changes survive sync, and stale cached data is invalidated on version mismatch.

---

## Priority Matrix

| Priority | Count | Description |
|----------|-------|-------------|
| MUST-HAVE | 4 | Core requirements (ARCH-01/02/03/06) |
| SHOULD-HAVE | 4 | Robustness and DX improvements |
| NICE-TO-HAVE | 4 | Future-proofing and polish |

---

## Recommendations

### 1. Persistent Bilingual Update Toast (MUST-HAVE)

**What:** Add `controllerchange` + `updatefound` listeners that trigger a persistent bilingual toast with "Update now" / "Not now" buttons. Toast does not auto-dismiss.

**Why:** Current behavior is silent activation — users get inconsistent UX during cache transition. The existing Settings badge is buried and undiscoverable. ARCH-01 requires explicit user-facing notification.

**Design compliance:** BilingualMessage type for en/my; `.font-myanmar` on Burmese text; 44px touch targets on buttons; warm/encouraging tone ("A new version is ready!"); amber warning color for toast background.

**Implementation hint:** Extend BilingualToast to accept `duration: null` (skip auto-dismiss timer). Create `useSWUpdate` hook that bridges `navigator.serviceWorker` events to React state. Show toast from within ToastProvider subtree.

---

### 2. Session-Lock Update Suppression (MUST-HAVE)

**What:** Suppress SW update toast during active Real Exam or Realistic Interview sessions. Queue the update; show toast when session completes or user exits.

**Why:** Mid-session interruption causes anxiety and potential data loss. ARCH-02 requires session-aware deferral. Users should never see "Update now" while answering exam questions.

**Design compliance:** Anxiety-reducing UX — no interruptions during high-stakes sessions. Consistent with existing NavigationProvider lock pattern.

**Implementation hint:** Module-level ref (`isSessionLockedRef`) synced from NavigationProvider via useEffect. Also check `history.state` for interview guard markers. SW event handler reads ref synchronously. Deferred updates stored in swUpdateManager state; released on session complete.

---

### 3. Per-Field Last-Write-Wins Settings Merge (MUST-HAVE)

**What:** Replace server-wins strategy with per-field LWW. Store per-field timestamps in localStorage. On pull, compare each field's local timestamp vs remote `updated_at`. Keep newer value per-field.

**Why:** Current server-wins loses offline changes. User changes theme offline, logs in on another device, theme reverts. ARCH-03 requires offline changes to survive sync.

**Design compliance:** Silent merge (no user notification on conflict resolution). Fire-and-forget push pattern preserved. SRS merge pattern (mergeSRSDecks) as reference implementation.

**Implementation hint:** New `settingsTimestamps.ts` manages `civic-settings-timestamps` localStorage key. `mergeSettingsWithTimestamps(local, remote)` pure function. Integrate in `hydrateFromSupabase()` replacing direct localStorage writes. Wire `pullSettings` into `useVisibilitySync` for periodic re-sync.

---

### 4. IndexedDB Questions Cache Versioning (MUST-HAVE)

**What:** Add version validation to `getCachedQuestions()`. Compare `CacheMeta.version` against `STORAGE_VERSIONS.QUESTIONS`. Invalidate and re-fetch on mismatch.

**Why:** Current `version: 1` field exists but is never checked. If question data changes (new USCIS content, schema updates), stale cached questions persist forever. ARCH-06 requires stale data invalidation.

**Design compliance:** Silent invalidation — user sees loading state while fresh data loads. No error message unless re-fetch fails.

**Implementation hint:** Create `src/lib/db/storageVersions.ts` with per-store constants. In `offlineDb.ts`, check `meta.version !== STORAGE_VERSIONS.QUESTIONS` before returning cached data. Call `clearQuestionsCache()` on mismatch.

---

### 5. Centralized Storage Version Registry (SHOULD-HAVE)

**What:** Create `STORAGE_VERSIONS` constant object covering all 10 IndexedDB stores. Generalize the sessionStore.ts version-check pattern into a reusable utility.

**Why:** 8 of 10 stores have NO versioning. Schema changes silently corrupt data. The session store has the right pattern but it's not shared.

**Design compliance:** No user-facing changes. Developer-experience improvement.

**Implementation hint:** Export `getWithVersionCheck<T>()` wrapper that auto-deletes stale records. Add version field to SRSCardRecord, StoredAnswer, InterviewSession, StreakData, EarnedBadge types. Use `version?: number` (optional) for backward compat with existing unversioned records.

---

### 6. Visibility-Based Settings Re-Sync (SHOULD-HAVE)

**What:** Wire `pullSettings` callback into `useVisibilitySync` so settings refresh on tab visibility change (5-second throttle). Currently only SocialContext uses this pattern.

**Why:** Without periodic re-sync, a user who changes settings on Device A must fully reload Device B to see changes. The hook exists but isn't integrated for settings.

**Design compliance:** Silent background operation. No user-facing UI. Consistent with existing SocialContext pattern.

**Implementation hint:** Add `pullSettings` to the callbacks object passed to `useVisibilitySync()`. Call `loadSettingsFromSupabase()` → `mergeSettingsWithTimestamps()` → update localStorage → trigger context re-renders.

---

### 7. Update Toast Offline Awareness (SHOULD-HAVE)

**What:** When SW update is detected while user is offline, show modified toast: "App updated. Will reload when you're back online." Defer reload action until online.

**Why:** Showing "Update now" while offline is misleading — the reload may fail or serve stale content without network. Offline-aware messaging reduces confusion.

**Design compliance:** Bilingual; anxiety-reducing; acknowledges offline status gracefully.

**Implementation hint:** Check `useOffline().isOnline` in update toast handler. Conditional message text. Add online-status listener that auto-shows reload prompt when connectivity returns.

---

### 8. SW Update Integration Tests (SHOULD-HAVE)

**What:** Unit tests for swUpdateManager (mock `navigator.serviceWorker`), mergeSettingsWithTimestamps (pure function), and getWithVersionCheck (mock idb-keyval). Add per-file coverage thresholds.

**Why:** These are critical-path functions. mergeSettingsWithTimestamps must handle 7 fields × 3 scenarios (local-wins, remote-wins, no-local). Cache versioning must handle version mismatch, missing version, and clean data.

**Design compliance:** TDD approach validated in retrospective (Phase 43 readiness engine caught edge cases early).

**Implementation hint:** Test mergeSettingsWithTimestamps as pure function with table-driven tests. Mock `navigator.serviceWorker` for useSWUpdate hook tests. Use renderWithProviders `core` preset.

---

### 9. Deferred Update Queue with Retry (NICE-TO-HAVE)

**What:** When update is suppressed during session, queue the intent. On session complete, show toast automatically. If user dismisses, re-show on next app startup.

**Why:** Users may dismiss the update toast and forget. Re-showing ensures eventual adoption of new versions.

**Design compliance:** Non-intrusive — show once per session, not repeatedly. Respect user's "Not now" choice within same session.

**Implementation hint:** Store `pendingUpdate: true` in localStorage. Check on app startup in ClientProviders useEffect. Clear flag after successful update.

---

### 10. Settings Sync Conflict Indicator (NICE-TO-HAVE)

**What:** After merge, if any field was resolved via LWW (remote won over dirty local), show a subtle toast: "Settings synced from another device."

**Why:** Users may be confused if their setting silently changes. A brief notification builds trust in cross-device sync.

**Design compliance:** Bilingual; info-level toast (not warning); auto-dismiss after 3 seconds; non-blocking.

**Implementation hint:** `mergeSettingsWithTimestamps()` returns `{ merged, conflicts: string[] }`. If conflicts.length > 0, show info toast.

---

### 11. Stale Audio Cache Handling (NICE-TO-HAVE)

**What:** When questions cache version bumps, also purge the SW audio cache for any removed/changed question IDs.

**Why:** Audio files are CacheFirst with 90-day TTL. If a question is removed or its audio re-recorded, the old MP3 persists. Audio filenames are `q{id}_{lang}.mp3` — stable if IDs don't change, but problematic if they do.

**Design compliance:** Silent background operation. No UX change unless audio fails (existing TTS fallback handles this).

**Implementation hint:** On questions cache invalidation, compare old vs new question IDs. Send `postMessage({ type: 'PURGE_AUDIO', ids: [...] })` to SW. SW deletes matching cache entries.

---

### 12. Multi-Tab Update Coordination (NICE-TO-HAVE)

**What:** Use BroadcastChannel API to coordinate SW updates across multiple open tabs. If any tab has an active session, suppress update in all tabs.

**Why:** Without coordination, Tab B can accept an update while Tab A is mid-exam, causing Tab A to crash or lose state.

**Design compliance:** Invisible to user — coordination happens silently. Prevents worst-case data loss scenario.

**Implementation hint:** Create `BroadcastChannel('civic-sw-update')`. Each tab broadcasts `{ type: 'SESSION_ACTIVE' | 'SESSION_IDLE' }`. Update handler checks channel for active sessions before proceeding. Defer to Phase 52+ if complexity is too high for Phase 50.

---

## Summary Table

| # | Recommendation | Priority | Req | Complexity | Impact |
|---|---------------|----------|-----|-----------|--------|
| 1 | Persistent bilingual update toast | MUST-HAVE | ARCH-01 | Medium | HIGH |
| 2 | Session-lock update suppression | MUST-HAVE | ARCH-02 | Medium | HIGH |
| 3 | Per-field LWW settings merge | MUST-HAVE | ARCH-03 | High | HIGH |
| 4 | Questions cache versioning | MUST-HAVE | ARCH-06 | Low | HIGH |
| 5 | Centralized storage version registry | SHOULD-HAVE | ARCH-06 | Medium | MEDIUM |
| 6 | Visibility-based settings re-sync | SHOULD-HAVE | ARCH-03 | Low | MEDIUM |
| 7 | Update toast offline awareness | SHOULD-HAVE | ARCH-01 | Low | MEDIUM |
| 8 | SW update integration tests | SHOULD-HAVE | ALL | Medium | HIGH |
| 9 | Deferred update queue with retry | NICE-TO-HAVE | ARCH-01 | Low | LOW |
| 10 | Settings sync conflict indicator | NICE-TO-HAVE | ARCH-03 | Low | LOW |
| 11 | Stale audio cache handling | NICE-TO-HAVE | ARCH-06 | Medium | LOW |
| 12 | Multi-tab update coordination | NICE-TO-HAVE | ARCH-02 | High | MEDIUM |

---

*Recommendations generated: 2026-03-20*
*Based on 12-agent deep research across 40+ codebase files*
