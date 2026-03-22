# Phase 50: PWA + Sync Resilience - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Users are notified of app updates without mid-session disruption, offline settings changes survive sync, and stale cached data is invalidated on version mismatch. Specifically: persistent bilingual toast for SW updates with "Update now" CTA, session-lock guard suppressing updates during Real Exam and Realistic Interview, per-field last-write-wins merge for 7 settings fields, and IndexedDB cache versioning with stale data invalidation.

Requirements: ARCH-01, ARCH-02, ARCH-03, ARCH-06.

</domain>

<decisions>
## Implementation Decisions

### SW Update Detection & Notification (ARCH-01)
- Combined detection: `updatefound` for early warning (show toast) + `controllerchange` for actual activation (trigger reload on user action)
- Existing `registration.waiting` check in useNavBadges.ts is supplementary — keep it for Settings badge
- Persistent bilingual toast with "Update now" CTA — requires `duration: null` support in BilingualToast
- Toast type: `info` — warm, anxiety-reducing copy: "A new version is available" / Myanmar equivalent
- Toast has explicit dismiss button + "Update now" action button (44px touch targets)
- Update never activates silently mid-session — user must explicitly tap "Update now"
- When offline: show toast, defer reload until online + user action
- Myanmar text in toast uses `font-myanmar` class with min 12px, line-height 1.6

### Session-Lock Deferral (ARCH-02)
- Only Real Exam (MockTest with `shouldLock=true`) and Realistic Interview defer updates
- Practice, Sort, Drill, and Practice Interview do NOT defer — users can exit these anytime
- Dual detection: check both `NavigationProvider.isLocked` AND `history.state` markers (covers Interview which uses `useInterviewGuard` not `isLocked`)
- Bridge mechanism: module-level mutable ref synced from NavigationProvider via useEffect — SW event handler reads `isSessionLockedRef.current` synchronously
- When deferred session completes: show toast immediately
- Race condition mitigation: debounce update acceptance; verify session save complete before SW activation
- Multi-tab limitation: documented as known limitation for v4.1; Tab A in exam while Tab B accepts update may cause issues. Full fix needs BroadcastChannel (Phase 52+)

### Per-Field LWW Settings Sync (ARCH-03)
- Client-side only — no Supabase schema migration
- Store per-field timestamps in localStorage metadata object (`civic-settings-timestamps`)
- Shape: `{ theme_updated_at: ISO, language_mode_updated_at: ISO, ... }` for all 7 settings fields
- Dirty flag system: `{ theme_dirty: true, ... }` for fields changed while offline
- Merge algorithm: for each field, compare local timestamp vs remote `updated_at`; if local is newer OR dirty, local wins; otherwise remote wins
- `mergeSettingsWithTimestamps()` is a pure function (easily unit-testable, contract to Phase 51)
- Existing `gatherCurrentSettings()` extended to include timestamps
- Each context provider (Language, Theme, TTS) and `useTestDate` records timestamp on setting change
- Wire `pullSettings` callback into `useVisibilitySync` for settings re-sync on tab focus (extends existing pattern from SocialContext)
- Context memoization: force setState in provider after merge completes to propagate changes
- Bookmark sync stays add-wins merge — ARCH-03 is settings only
- SRS sync stays per-card LWW via lastReviewedAt — unchanged
- Timestamp collisions (same millisecond): accepted as LWW limitation; rare on single-device usage

### IndexedDB Cache Versioning (ARCH-06)
- Per-store version constants in centralized `src/lib/db/storageVersions.ts`
- Shape: `STORAGE_VERSIONS = { QUESTIONS: 1, SESSION: 1, SRS_CARD: 1, BOOKMARK: 1, ... }` for all 10 stores
- Questions cache: add version validation in `getCachedQuestions()`; invalidate on mismatch (existing `CacheMeta.version=1` field is written but never checked)
- Session store: already has working version check via `SESSION_VERSION` — generalize pattern
- Per-store isolation: version bump on questions cache does NOT affect SRS cards, bookmarks, or any other store
- On version mismatch: auto-delete stale data from affected store only, log to Sentry with context
- Version bump strategy: manual bump on data structure changes only (not every deploy) — document in deployment checklist
- Content-addressed audio filenames (`q{id}_en.mp3`) mean SW audio cache stays valid across question content updates

### Claude's Discretion
- Exact `swUpdateManager.ts` internal architecture (state machine vs simple flags)
- BilingualToast `duration: null` implementation details
- Exact merge algorithm edge case handling
- Whether to add SW update provider component or inject as useEffect in existing component
- Test file organization (co-located vs centralized)
- Per-file coverage threshold exact numbers for new test files

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ARCH-01, ARCH-02, ARCH-03, ARCH-06 definitions and acceptance criteria

### Precontext Research
- `.planning/phases/50/50-PRECONTEXT-RESEARCH.md` — 12-agent deep analysis: resolved assumptions, gotcha inventory (24 gotchas), data contracts, architectural decisions (AD-01 through AD-04), file map, implementation order, risk assessment
- `.planning/phases/50/50-ENHANCEMENT-RECOMMENDATIONS.md` — Enhancement recommendations

### Service Worker
- `src/lib/pwa/sw.ts` — Current SW config: skipWaiting + clientsClaim, Serwist v9.5.6, audio caching, push notifications
- `src/components/navigation/useNavBadges.ts` — Existing `registration.waiting` check for Settings badge

### Settings Sync
- `src/lib/settings/settingsSync.ts` — Current sync: 7 fields, server-wins, fire-and-forget upsert, mapRowToSettings/mapSettingsToRow
- `src/contexts/SupabaseAuthContext.tsx` — `hydrateFromSupabase` call site (currently server-wins; needs merge)
- `src/contexts/LanguageContext.tsx` — Settings sync call site
- `src/contexts/ThemeContext.tsx` — Settings sync call site
- `src/contexts/TTSContext.tsx` — Settings sync call site
- `src/hooks/useTestDate.ts` — Settings sync call site

### IndexedDB Stores
- `src/lib/pwa/offlineDb.ts` — Questions cache with CacheMeta (version=1, never checked on read)
- `src/lib/sessions/sessionStore.ts` — Reference pattern for version check (SESSION_VERSION validated on read)
- `src/lib/sessions/sessionTypes.ts` — SESSION_VERSION constant and snapshot types

### Session Lock
- `src/components/navigation/NavigationProvider.tsx` — `isLocked` API, `setLock()` function
- `src/hooks/useNavigationGuard.ts` — History state markers (markerKey pattern)
- `src/views/TestPage.tsx` — Mock test lock (shouldLock logic at line ~266)
- `src/views/InterviewPage.tsx` — Interview guard (useInterviewGuard, separate from isLocked)

### Error Handling (Phase 49 contracts)
- `src/components/ui/SharedErrorFallback.tsx` — Bilingual error component (use for any error UI)
- `src/components/withSessionErrorBoundary.tsx` — Session error boundary HOC
- `src/lib/sentry.ts` — `captureError()` with operation/component context

### Provider Ordering
- `src/components/ClientProviders.tsx` — Canonical provider nesting (DO NOT reorder)
- `.claude/learnings/provider-ordering.md` — Ordering constraints and history

### Testing Infrastructure (Phase 48 contracts)
- `src/__tests__/utils/renderWithProviders.tsx` — Shared test utility with preset system
- `vitest.config.ts` — Coverage thresholds config (add per-file for new files)

### Prior Phase Context
- `.planning/phases/48/48-CONTEXT.md` — Phase 48 decisions: renderWithProviders, coverage thresholds, CI pipeline
- `.planning/phases/49/49-CONTEXT.md` — Phase 49 decisions: SharedErrorFallback, error boundaries, ProviderOrderGuard

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BilingualToast.tsx`: Toast system with swipe-to-dismiss, haptics, positioned above tab bar — needs `duration: null` for persistent variant
- `useNavBadges.ts`: Already checks `registration.waiting` for SW update badge — integrate with new swUpdateManager
- `sessionStore.ts`: VERSION check pattern (`SESSION_VERSION` validated on every read) — generalize to all stores
- `settingsSync.ts`: Pure mapping functions (`mapRowToSettings`, `mapSettingsToRow`, `gatherCurrentSettings`) — extend with timestamps
- `useVisibilitySync.ts`: Existing pattern for re-sync on tab focus (used by SocialContext) — wire settings sync into this
- `withRetry`: Async retry utility with exponential backoff — use for sync operations
- `captureError()`: Structured Sentry reporting — use for all error logging in Phase 50
- `renderWithProviders`: Phase 48 test utility with core/full presets — use for component tests
- `SharedErrorFallback`: Phase 49 bilingual error component — use for any error UI

### Established Patterns
- Fire-and-forget sync: `syncSettingsToSupabase` upserts silently, logs errors to Sentry, never throws — preserve this pattern
- Per-card LWW in SRS sync (`srsSync.ts:mergeSRSDecks`): Each card has `lastReviewedAt` timestamp — reference for settings LWW design
- Module-level refs for non-React state: Common pattern in codebase for bridging React state to external APIs
- idb-keyval stores: All 10 IndexedDB stores use `createStore(dbName, storeName)` pattern — version constants should follow same convention

### Integration Points
- `ClientProviders.tsx`: Add SW update effect here (no new provider, no reorder — ProviderOrderGuard validates)
- `BilingualToast.tsx`: Add `duration: null` path for persistent toasts
- `settingsSync.ts`: Extend with timestamp-aware merge function
- `offlineDb.ts`: Add version validation in `getCachedQuestions()`
- `useNavBadges.ts`: Integrate with centralized swUpdateManager
- `vitest.config.ts`: Add per-file coverage thresholds for new test files

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase with clear technical scope defined by REQUIREMENTS.md, precontext research, and auto-selected recommended patterns.

</specifics>

<deferred>
## Deferred Ideas

- Multi-tab BroadcastChannel coordination for SW updates — future enhancement beyond v4.1
- Device ID tracking for conflict attribution in settings sync — document as known limitation
- Content hash-based cache versioning (sha256 of data) — complex, not needed when manual version bumps suffice

</deferred>

---

*Phase: 50-pwa-sync-resilience*
*Context gathered: 2026-03-20*
