# Phase 46: Cross-Device Sync - Research

**Researched:** 2026-03-01
**Domain:** Supabase data sync, offline-first merge strategies, Page Visibility API
**Confidence:** HIGH

## Summary

This phase adds Supabase sync for bookmarks, user settings (theme, language, voice preferences, test date), and enhances the existing streak sync with freeze recalculation and longest-streak recomputation from merged activity dates. The project already has well-established sync patterns: fire-and-forget upserts (streakSync.ts, socialProfileSync.ts), offline queuing with retry (syncQueue.ts, srsSync.ts), merge-on-login (SocialContext.tsx, srsSync.ts), and IndexedDB stores via idb-keyval.

The core work is extending these patterns to two new data domains (bookmarks, settings) and adding a Page Visibility API sync trigger. The project already uses `visibilitychange` in SRSContext, useLeaderboard, and useNavBadges -- so the pattern is proven. No new libraries are needed. The main complexity is the streak merge enhancement: after merging activity dates from two devices, freezes must be recalculated (a freeze on a "missed" day that the other device was active becomes unnecessary) and longest streak must be recomputed from the full merged date set.

**Primary recommendation:** Follow existing streakSync.ts / srsSync.ts patterns exactly. Create `bookmarkSync.ts` and `settingsSync.ts` in the same style. Add a single `useVisibilitySync` hook that triggers re-pull on visibility change for all synced data. Enhance `mergeStreakData()` to recalculate freezes and longest streak from merged dates rather than using `max()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- ALL settings sync across devices: theme, language mode, voice preferences, test date
- Server wins on login -- Supabase overwrites local on app open
- Immediate fire-and-forget saves when user changes a setting (same pattern as streak sync)
- Voice preferences: sync portable settings only (rate, pitch, autoRead, autoReadLang) -- skip `preferredVoiceName` since available voices differ by device/OS
- **Add-wins** conflict resolution for bookmarks -- if bookmarked anywhere, stays bookmarked everywhere; unbookmarking requires explicit action after sync
- Store just question IDs (no metadata, timestamps, notes, or tags) -- matches current IndexedDB schema
- First-time sync: merge local bookmarks into cloud (union of both), no data lost
- Offline support: bookmark locally in IndexedDB, queue and sync to Supabase when back online (same pattern as test results)
- Pull latest from Supabase on login AND on visibility change (Page Visibility API -- when tab becomes visible again)
- Push changes immediately via fire-and-forget (non-blocking, failures silently logged)
- Silent operation with error toast only -- no sync indicators, no loading spinners, no "last synced" timestamp
- Keep existing local-first merge strategy for streaks (union activity dates, dedup by YYYY-MM-DD)
- Same-day activity from two devices: auto-dedup -- two devices reporting same date merge into one entry
- **Recalculate** freezes after merge -- if the other device was active on a "missed" day, the freeze becomes unnecessary and should be returned
- **Recalculate** longest streak from merged activity dates -- more accurate than max(local, remote) since combined dates may reveal a longer run
- Match sync timing to other data: pull on app open + visibility change, fire-and-forget after activity

### Claude's Discretion
- Supabase table schema for bookmarks and user_settings
- Whether to extend existing `profiles` table or create a new `user_settings` table
- Exact implementation of the Page Visibility API sync trigger
- Error retry strategy for failed syncs
- Whether to batch multiple setting changes into a single Supabase call or send individually

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-01 | Answer history (mastery data) syncs to Supabase for cross-device continuity | Already implemented via srsSync.ts (push/pull/merge in SRSContext). Phase 46 enhances with visibility-change re-pull trigger. |
| SYNC-02 | Bookmarks sync to Supabase across devices | New `user_bookmarks` table + `bookmarkSync.ts` following streakSync.ts pattern. Add-wins merge, offline queue via idb-keyval. |
| SYNC-03 | User settings (theme, language, voice, test date) sync to Supabase | New `user_settings` table + `settingsSync.ts`. Server-wins on pull, fire-and-forget on push. |
| SYNC-04 | Study streak data syncs to Supabase for accurate cross-device tracking | Enhance existing `mergeStreakData()` to recalculate freezes and longest streak from merged dates. Add visibility-change trigger. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.97.0 | Already installed -- Supabase client for all DB operations | Project standard, used everywhere |
| idb-keyval | ^6.2.2 | Already installed -- IndexedDB wrapper for offline stores | Project standard for all local persistence |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Page Visibility API | Browser native | Detect tab focus for re-pull trigger | On visibility change to 'visible' |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate `user_settings` table | Extend `profiles` table with settings columns | Separate table is cleaner: profiles is auth-managed (handle_new_user trigger), settings are user-managed. Mixing concerns risks trigger conflicts. |
| Individual setting columns | JSONB `settings` column | Individual columns give type safety via Supabase RLS, but JSONB is simpler for a single upsert of all settings. **Recommendation: individual columns** -- matches project pattern (streak_data has individual columns, not JSONB) and avoids partial-update issues with JSONB in Supabase (requires RPC for partial updates). |
| New offline queue store for bookmarks | Reuse existing srs-sync queue pattern | New dedicated store is simpler -- bookmark sync is just a set of IDs, much simpler than SRS card records. |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── bookmarks/
│   │   ├── bookmarkStore.ts     # EXISTING - IndexedDB CRUD
│   │   ├── bookmarkSync.ts      # NEW - Supabase sync layer
│   │   └── index.ts             # EXISTING - re-exports
│   ├── settings/
│   │   └── settingsSync.ts      # NEW - Supabase settings sync
│   ├── social/
│   │   ├── streakSync.ts        # EXISTING - enhanced mergeStreakData
│   │   └── streakTracker.ts     # EXISTING - pure streak calc (reused)
│   └── sync/
│       └── visibilitySync.ts    # NEW - Page Visibility sync trigger
├── hooks/
│   └── useBookmarks.ts          # EXISTING - enhanced with sync awareness
├── contexts/
│   ├── ThemeContext.tsx          # EXISTING - add sync write hook
│   ├── LanguageContext.tsx       # EXISTING - add sync write hook
│   ├── TTSContext.tsx            # EXISTING - add sync write hook
│   ├── SocialContext.tsx         # EXISTING - enhanced streak merge + visibility trigger
│   └── SupabaseAuthContext.tsx   # EXISTING - trigger settings/bookmark pull on login
└── supabase/
    └── schema.sql               # EXISTING - add user_bookmarks + user_settings tables
```

### Pattern 1: Fire-and-Forget Sync Push (Established)
**What:** Write to Supabase without blocking UI. Errors are logged, never displayed.
**When to use:** Every time a user changes a setting, toggles a bookmark, or completes an activity.
**Example:**
```typescript
// Source: existing streakSync.ts pattern
export async function syncSettingsToSupabase(
  userId: string,
  settings: UserSettings
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await withRetry(
      async () => {
        const { error } = await supabase.from('user_settings').upsert({
          user_id: userId,
          theme: settings.theme,
          language_mode: settings.languageMode,
          tts_rate: settings.ttsRate,
          tts_pitch: settings.ttsPitch,
          tts_auto_read: settings.ttsAutoRead,
          tts_auto_read_lang: settings.ttsAutoReadLang,
          test_date: settings.testDate,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'settingsSync.push', userId });
  }
}
```

### Pattern 2: Server-Wins Pull on Login (For Settings)
**What:** On login, fetch remote settings and overwrite local. Simple conflict resolution.
**When to use:** Settings sync where the most recent device's values should win.
**Example:**
```typescript
// Source: follows hydrateFromSupabase() pattern in SupabaseAuthContext
export async function loadSettingsFromSupabase(
  userId: string
): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapRowToSettings(data);
  } catch (err) {
    captureError(err, { operation: 'settingsSync.pull', userId });
    return null;
  }
}
```

### Pattern 3: Add-Wins Merge for Bookmarks
**What:** Union of local and remote bookmark sets. If bookmarked anywhere, stays bookmarked.
**When to use:** Bookmark sync on login and visibility change.
**Example:**
```typescript
// Source: follows mergeStreakData union pattern
export function mergeBookmarks(
  localIds: string[],
  remoteIds: string[]
): string[] {
  return Array.from(new Set([...localIds, ...remoteIds])).sort();
}
```

### Pattern 4: Visibility Change Re-Pull
**What:** When tab becomes visible, pull latest data from Supabase.
**When to use:** After user switches back to the app from another tab/app.
**Example:**
```typescript
// Source: follows SRSContext.tsx and useLeaderboard.ts patterns
useEffect(() => {
  if (!userId) return;
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Pull and merge latest from Supabase
      pullAndMerge(userId);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [userId]);
```

### Pattern 5: Enhanced Streak Merge with Freeze Recalculation
**What:** After merging activity dates from two devices, recalculate which freezes are still needed and recompute longest streak from the full merged set.
**When to use:** Streak merge in SocialContext on login and visibility change.
**Example:**
```typescript
// Enhanced merge: recalculate freezes and longest streak
export function mergeStreakData(local: StreakData, remote: StreakData): StreakData {
  // Union activity dates
  const activityDates = Array.from(
    new Set([...local.activityDates, ...remote.activityDates])
  ).sort();

  // Union freezes used
  const allFreezesUsed = Array.from(
    new Set([...local.freezesUsed, ...remote.freezesUsed])
  ).sort();

  // Recalculate: remove freezes for dates that now have activity
  const activitySet = new Set(activityDates);
  const validFreezes = allFreezesUsed.filter(date => !activitySet.has(date));

  // Return freed freezes to available pool
  const freedCount = allFreezesUsed.length - validFreezes.length;
  const freezesAvailable = Math.min(
    Math.max(local.freezesAvailable, remote.freezesAvailable) + freedCount,
    3 // max cap
  );

  // Recalculate longest from merged dates (not max of both)
  const { longest } = calculateStreak(activityDates, validFreezes);

  return {
    activityDates,
    freezesAvailable,
    freezesUsed: validFreezes,
    longestStreak: longest,
    lastSyncedAt: new Date().toISOString(),
    dailyActivityCounts: local.dailyActivityCounts,
  };
}
```

### Anti-Patterns to Avoid
- **Blocking UI on sync:** Never await Supabase calls in the render path. All pushes are fire-and-forget.
- **Syncing `preferredVoiceName`:** Available voices differ by device/OS. Only sync portable TTS settings (rate, pitch, autoRead, autoReadLang).
- **Polling for changes:** Use visibility change events, not setInterval.
- **JSONB for settings:** Supabase cannot partially update JSONB without RPC. Use individual columns.
- **Syncing on every keystroke:** Batch or debounce if needed, but settings changes in this app are discrete toggles, so fire-and-forget per change is fine.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | Raw IndexedDB API | idb-keyval (already installed) | Handles versioning, transactions, error states |
| Retry with backoff | Custom retry loop | `withRetry()` from `src/lib/async` | Already battle-tested in streakSync, srsSync |
| Online detection | Custom navigator.onLine polling | `useOnlineStatus()` hook (already exists) | Handles edge cases, used by OfflineContext |
| Streak calculation | Manual date math | `calculateStreak()` from streakTracker.ts | Pure function, already tested, handles freezes |

**Key insight:** Every sync pattern needed for this phase already exists in the codebase. The work is extending proven patterns to new data domains, not inventing new infrastructure.

## Common Pitfalls

### Pitfall 1: Race Condition on Visibility Change
**What goes wrong:** Multiple rapid visibility changes (e.g., user quickly switching tabs) trigger concurrent pull operations that interleave and corrupt state.
**Why it happens:** `visibilitychange` fires on every tab switch, and Supabase fetches are async.
**How to avoid:** Use a simple `isSyncing` flag or `lastSyncTime` throttle (e.g., minimum 5-second gap between pulls). The existing `useLeaderboard.ts` uses a 30-second minimum interval pattern that can be adapted.
**Warning signs:** Duplicate data, flickering UI, console errors about concurrent operations.

### Pitfall 2: Freeze Recalculation Edge Cases
**What goes wrong:** After merge, freed freeze count exceeds the 3-freeze cap, or freezes are double-returned.
**Why it happens:** Two devices both have freeze state, and naive addition of freed freezes doesn't respect the cap.
**How to avoid:** Cap `freezesAvailable` at 3 after recalculation. Use `Math.min(calculated, 3)`.
**Warning signs:** `freezesAvailable > 3` in streak data.

### Pitfall 3: Settings Overwrite Before First Sync
**What goes wrong:** User logs in on Device B. App loads, reads localStorage defaults. Then sync pulls remote settings. But a context already wrote the local default to Supabase, overwriting the correct remote value.
**Why it happens:** Fire-and-forget push runs before pull completes.
**How to avoid:** On login, pull first (server wins). Only enable fire-and-forget push AFTER initial pull completes. Use a `hasSynced` flag.
**Warning signs:** Settings reset to defaults on second device.

### Pitfall 4: Bookmark Sync State Mismatch After Unbookmark
**What goes wrong:** User unbookmarks on Device A, but Device B still has the bookmark. On sync, add-wins merge re-adds the bookmark.
**Why it happens:** Add-wins means "if bookmarked anywhere, stays bookmarked." Unbookmarks only take effect after sync delivers the deletion.
**How to avoid:** This is intended behavior per user decision. The unbookmark action must update Supabase (remove from the bookmark set), and the next pull on Device B will reflect the removal. The add-wins rule applies only during initial merge; after that, the Supabase state is authoritative.
**Warning signs:** None -- this is the designed behavior. Document for users if confusion arises.

### Pitfall 5: localStorage Key Fragmentation
**What goes wrong:** Settings sync reads/writes to Supabase, but individual contexts still read from their own localStorage keys (`civic-theme`, `civic-test-language-mode`, etc.). Two sources of truth.
**Why it happens:** Each context has its own localStorage key established before sync existed.
**How to avoid:** On pull, write the synced values to the existing localStorage keys so contexts hydrate correctly on next mount. The contexts continue to own their localStorage keys; the sync layer bridges to/from Supabase.
**Warning signs:** Settings reverting after page reload.

## Code Examples

Verified patterns from existing codebase:

### Supabase Upsert with withRetry (from streakSync.ts)
```typescript
// Source: src/lib/social/streakSync.ts lines 49-74
export async function syncStreakToSupabase(userId: string, streakData: StreakData): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await withRetry(
      async () => {
        const { error } = await supabase.from('streak_data').upsert({
          user_id: userId,
          activity_dates: streakData.activityDates,
          freezes_available: streakData.freezesAvailable,
          freezes_used: streakData.freezesUsed,
          longest_streak: streakData.longestStreak,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'streakSync.syncStreakToSupabase', userId });
  }
}
```

### Visibility Change with Throttle (from useLeaderboard.ts)
```typescript
// Source: src/hooks/useLeaderboard.ts lines 182-200
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - lastFetchRef.current < MIN_REFRESH_INTERVAL_MS) return;
    // ... fetch latest data
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [/* deps */]);
```

### IndexedDB Store with idb-keyval (from bookmarkStore.ts)
```typescript
// Source: src/lib/bookmarks/bookmarkStore.ts
import { createStore, get, set, del, keys } from 'idb-keyval';
const bookmarkDb = createStore('civic-prep-bookmarks', 'starred');

export async function getAllBookmarkIds(): Promise<string[]> {
  const allKeys = await keys(bookmarkDb);
  return allKeys as string[];
}
```

### Merge with Union + Dedup (from streakSync.ts)
```typescript
// Source: src/lib/social/streakSync.ts lines 138-156
export function mergeStreakData(local: StreakData, remote: StreakData): StreakData {
  const activityDates = Array.from(
    new Set([...local.activityDates, ...remote.activityDates])
  ).sort();
  const freezesUsed = Array.from(
    new Set([...local.freezesUsed, ...remote.freezesUsed])
  ).sort();
  return {
    activityDates,
    freezesAvailable: Math.max(local.freezesAvailable, remote.freezesAvailable),
    freezesUsed,
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    lastSyncedAt: new Date().toISOString(),
    dailyActivityCounts: local.dailyActivityCounts,
  };
}
```

## Discretion Recommendations

### 1. Schema Design: Separate `user_settings` and `user_bookmarks` Tables

**Recommendation: Create two new tables** rather than extending `profiles`.

**`user_settings` table:**
```sql
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  language_mode text not null default 'bilingual' check (language_mode in ('bilingual', 'english-only')),
  tts_rate text not null default 'normal' check (tts_rate in ('slow', 'normal', 'fast')),
  tts_pitch numeric not null default 1.02,
  tts_auto_read boolean not null default true,
  tts_auto_read_lang text not null default 'both' check (tts_auto_read_lang in ('english', 'burmese', 'both')),
  test_date text,  -- YYYY-MM-DD or null
  updated_at timestamptz not null default now()
);
```

**`user_bookmarks` table:**
```sql
create table if not exists public.user_bookmarks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  question_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);
```

**Rationale:**
- `profiles` is managed by the `handle_new_user()` trigger and auth flow. Adding settings columns there risks trigger conflicts.
- Separate tables follow the project pattern: `streak_data`, `srs_cards`, `social_profiles` are all separate from `profiles`.
- Single-row-per-user with `user_id` as primary key allows simple `upsert` operations.
- `user_bookmarks` stores the full set of bookmarked question IDs as a `text[]` array. This is simple, atomic (whole-set replace), and avoids per-bookmark rows.

### 2. Page Visibility API Implementation

**Recommendation: Create a `useVisibilitySync` hook** that handles visibility-triggered re-pulls for all synced data types.

```typescript
// Single hook that triggers re-pull for settings, bookmarks, and streaks
// when tab becomes visible. Uses a minimum interval (5s) to throttle.
function useVisibilitySync(userId: string | undefined, callbacks: {
  pullSettings: () => Promise<void>;
  pullBookmarks: () => Promise<void>;
  pullStreaks: () => Promise<void>;
}) { ... }
```

**Alternative considered:** Individual visibility listeners in each context. Rejected because it would create 3+ separate event listeners doing the same thing.

### 3. Error Retry Strategy

**Recommendation: Follow the existing `withRetry` pattern** -- 3 attempts, 1s base delay, exponential backoff. This is already used consistently across streakSync.ts, srsSync.ts, and OfflineContext.tsx. No reason to deviate.

### 4. Setting Change Batching

**Recommendation: Send individually** (no batching). Each setting change in this app is a discrete user action (toggle theme, switch language, change TTS rate). These are infrequent (seconds to minutes apart) and each triggers a full `upsert` of the settings row. The overhead of batching (debounce timers, flush-on-unmount) is not justified for ~1 setting change per minute at most.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| max(local, remote) for longest streak | Recalculate from merged dates | Phase 46 | More accurate -- combined dates may reveal longer run |
| max(local, remote) for freezes | Recalculate: return freed freezes | Phase 46 | More fair -- if other device filled a "missed" day, freeze returns |
| No settings sync | Server-wins pull + fire-and-forget push | Phase 46 | Cross-device settings consistency |
| Local-only bookmarks | Add-wins merge + Supabase persistence | Phase 46 | Cross-device bookmark access |

**Deprecated/outdated:**
- None -- this is new functionality.

## Open Questions

1. **Post-test action sync**
   - What we know: `useTestDate` manages both `testDate` and `postTestAction` (pending/passed/rescheduled) in localStorage.
   - What's unclear: Should `postTestAction` also sync, or is it transient state?
   - Recommendation: Sync `testDate` only. `postTestAction` is UI-workflow state (what to show after test completion), not a persistent preference. If the user passed a test on Device A and opens Device B, the test date will already be cleared (since `passed` clears the date). This naturally handles the cross-device case.

2. **SYNC-01 already implemented?**
   - What we know: SRS card sync (srsSync.ts) already handles answer history/mastery data sync to Supabase. The SRSContext does pull/push/merge on login.
   - What's unclear: Does SYNC-01 require any additional work beyond adding the visibility-change re-pull?
   - Recommendation: SYNC-01 is functionally complete. This phase adds the visibility-change trigger to SRS pull (minor enhancement) to align with the sync timing decision.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- --run` |
| Full suite command | `pnpm test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-01 | SRS cards appear on second device after sync | unit (merge logic already tested) | `pnpm test -- --run src/lib/srs/srsSync.ts` | Existing srsSync.ts has mergeSRSDecks -- no new test needed |
| SYNC-02 | Bookmarks merge correctly across devices | unit | `pnpm test -- --run src/lib/bookmarks/bookmarkSync.test.ts` | Wave 0 |
| SYNC-03 | Settings pull overwrites local, push fires on change | unit | `pnpm test -- --run src/lib/settings/settingsSync.test.ts` | Wave 0 |
| SYNC-04 | Streak merge recalculates freezes and longest streak | unit | `pnpm test -- --run src/lib/social/streakSync.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- --run`
- **Per wave merge:** `pnpm test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/bookmarks/bookmarkSync.test.ts` -- covers SYNC-02 (mergeBookmarks, sync push/pull)
- [ ] `src/lib/settings/settingsSync.test.ts` -- covers SYNC-03 (mapRowToSettings, mapSettingsToRow)
- [ ] `src/lib/social/streakSync.test.ts` -- covers SYNC-04 (enhanced mergeStreakData with freeze recalculation)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/social/streakSync.ts`, `src/lib/srs/srsSync.ts`, `src/lib/pwa/syncQueue.ts` -- established sync patterns
- Existing codebase: `src/contexts/SRSContext.tsx`, `src/hooks/useLeaderboard.ts` -- established visibility change patterns
- Existing codebase: `src/lib/bookmarks/bookmarkStore.ts`, `src/hooks/useBookmarks.ts` -- bookmark store structure
- Existing codebase: `src/contexts/ThemeContext.tsx`, `src/contexts/LanguageContext.tsx`, `src/contexts/TTSContext.tsx`, `src/hooks/useTestDate.ts` -- settings localStorage patterns
- Existing codebase: `supabase/schema.sql` -- existing table patterns with RLS
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) -- visibilitychange event
- [MDN: visibilitychange event](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) -- event details

### Secondary (MEDIUM confidence)
- [Supabase: Upsert data](https://supabase.com/docs/reference/javascript/upsert) -- upsert API reference
- [Supabase: Managing JSON data](https://supabase.com/docs/guides/database/json) -- confirms JSONB partial update limitation

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all patterns exist in codebase
- Architecture: HIGH -- extending existing patterns (streakSync, srsSync) to new data domains
- Pitfalls: HIGH -- based on actual codebase analysis of race conditions and state management
- Streak enhancement: MEDIUM -- freeze recalculation logic needs careful testing (edge cases around cap and double-return)

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable domain, no external dependency changes expected)
