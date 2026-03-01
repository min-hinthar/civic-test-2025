# Phase 46: Cross-Device Sync - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync answer history, bookmarks, settings, and streak data to Supabase so users switching devices find their progress, bookmarks, settings, and streaks intact. This phase does NOT add new features — it ensures existing data is available cross-device.

</domain>

<decisions>
## Implementation Decisions

### Settings Sync Scope
- ALL settings sync across devices: theme, language mode, voice preferences, test date
- Server wins on login — Supabase overwrites local on app open
- Immediate fire-and-forget saves when user changes a setting (same pattern as streak sync)
- Voice preferences: sync portable settings only (rate, pitch, autoRead, autoReadLang) — skip `preferredVoiceName` since available voices differ by device/OS

### Bookmark Sync Strategy
- **Add-wins** conflict resolution — if bookmarked anywhere, stays bookmarked everywhere; unbookmarking requires explicit action after sync
- Store just question IDs (no metadata, timestamps, notes, or tags) — matches current IndexedDB schema
- First-time sync: merge local bookmarks into cloud (union of both), no data lost
- Offline support: bookmark locally in IndexedDB, queue and sync to Supabase when back online (same pattern as test results)

### Sync Timing
- Pull latest from Supabase on login AND on visibility change (Page Visibility API — when tab becomes visible again)
- Push changes immediately via fire-and-forget (non-blocking, failures silently logged)
- Silent operation with error toast only — no sync indicators, no loading spinners, no "last synced" timestamp
- Applies to ALL synced data: settings, bookmarks, streaks

### Streak Consistency
- Keep existing local-first merge strategy (union activity dates, dedup by YYYY-MM-DD)
- Same-day activity from two devices: auto-dedup — two devices reporting same date merge into one entry
- **Recalculate** freezes after merge — if the other device was active on a "missed" day, the freeze becomes unnecessary and should be returned
- **Recalculate** longest streak from merged activity dates — more accurate than max(local, remote) since combined dates may reveal a longer run
- Match sync timing to other data: pull on app open + visibility change, fire-and-forget after activity

### Claude's Discretion
- Supabase table schema for bookmarks and user_settings
- Whether to extend existing `profiles` table or create a new `user_settings` table
- Exact implementation of the Page Visibility API sync trigger
- Error retry strategy for failed syncs
- Whether to batch multiple setting changes into a single Supabase call or send individually

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants the sync to be invisible and "just work" without any UI clutter.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OfflineContext` (`src/contexts/OfflineContext.tsx`): Manages offline detection, sync queue, auto-sync on reconnect — can be extended for bookmark/settings sync
- `syncQueue.ts` (`src/lib/sync/syncQueue.ts`): Offline queue with exponential backoff (1s-16s, max 5 retries) — reusable for bookmark queue
- `bookmarkStore.ts` (`src/lib/bookmarks/bookmarkStore.ts`): Existing IndexedDB store for bookmarks — needs Supabase sync layer on top
- `useBookmarks()` hook (`src/hooks/useBookmarks.ts`): Component-level bookmark access — needs sync awareness
- `streakStore.ts` / `SocialContext`: Existing streak merge logic (union + dedup + max) — needs freeze/longest recalculation enhancement

### Established Patterns
- **Fire-and-forget async sync**: Used by streaks and social profile — non-blocking, errors silently logged
- **Offline queue with retry**: Used by test results — exponential backoff, process one-by-one
- **Merge on login**: Used by streaks and SRS cards — pull remote, merge with local, save merged state
- **IndexedDB stores**: Pattern of `civic-prep-{feature}` named stores with typed get/set operations
- **localStorage for settings**: Theme, language, TTS, test date all follow same pattern — read on mount, write on change

### Integration Points
- `SupabaseAuthContext.hydrateFromSupabase()`: Called on login — natural place to trigger settings + bookmark pull
- `ThemeContext`, `LanguageContext`, `TTSContext`, `useTestDate()`: Each manages one setting — needs sync write hook
- `SocialContext.loadAndMergeStreak()`: Existing streak merge — needs freeze recalculation added
- `supabase/schema.sql`: Will need new tables (bookmarks, user_settings or profile extension)
- Page Visibility API: New integration point for re-pull trigger

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 46-cross-device-sync*
*Context gathered: 2026-03-01*
