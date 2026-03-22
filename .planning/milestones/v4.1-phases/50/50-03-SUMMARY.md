---
phase: 50-pwa-sync-resilience
plan: 03
subsystem: sync
tags: [lww, merge, settings, timestamps, dirty-flags, offline, localStorage]

# Dependency graph
requires:
  - phase: 50-01
    provides: storage version infrastructure and cache invalidation
  - phase: 46
    provides: settings sync (settingsSync.ts, SupabaseAuthContext server-wins pattern)
provides:
  - Per-field LWW merge algorithm for settings sync
  - Timestamp tracking on all 7 settings fields
  - Dirty flag tracking for offline changes
  - loadSettingsRowFromSupabase for raw row access with updated_at
affects: [settings, auth-context, sync, offline]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-field-lww-merge, dirty-flag-tracking, pure-merge-function]

key-files:
  created:
    - src/lib/settings/settingsTimestamps.ts
    - src/__tests__/settingsSync.test.ts
  modified:
    - src/contexts/LanguageContext.tsx
    - src/contexts/ThemeContext.tsx
    - src/contexts/TTSContext.tsx
    - src/hooks/useTestDate.ts
    - src/lib/settings/settingsSync.ts
    - src/lib/settings/index.ts
    - src/contexts/SupabaseAuthContext.tsx
    - vitest.config.ts

key-decisions:
  - "Pure merge function (no side effects) for testability -- localStorage helpers separated from merge logic"
  - "TTS field mapping: TTSSettings keys (rate/pitch/autoRead/autoReadLang) mapped to UserSettings keys (ttsRate/ttsPitch/ttsAutoRead/ttsAutoReadLang) for per-field timestamp tracking"
  - "Dirty flags take absolute priority over timestamps -- offline changes always win regardless of remote timestamp"

patterns-established:
  - "Per-field LWW merge: dirty > local-newer > remote-newer for each field independently"
  - "Timestamp+dirty recording pattern: setFieldTimestamp then markFieldDirty if !navigator.onLine"

requirements-completed: [ARCH-03]

# Metrics
duration: 9min
completed: 2026-03-20
---

# Phase 50 Plan 03: Settings LWW Merge Summary

**Per-field last-write-wins settings merge with localStorage timestamps, dirty flags, and pure merge function replacing server-wins pattern**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-20T08:51:25Z
- **Completed:** 2026-03-20T09:00:32Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Pure merge function with 17 unit tests covering all LWW scenarios (dirty wins, local newer, remote newer, no timestamp defaults, independent fields)
- All 4 settings providers/hooks record per-field timestamps on change and mark dirty when offline
- SupabaseAuthContext now uses per-field LWW merge instead of server-wins, only writes changed fields to localStorage, clears dirty flags after merge, and pushes merged result back to Supabase

## Task Commits

Each task was committed atomically:

1. **Task 1: Create settingsTimestamps module with pure merge function (TDD)** - `730d54b` (feat)
2. **Task 2: Wire timestamps into providers and replace server-wins with LWW merge** - `8b10de1` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/lib/settings/settingsTimestamps.ts` - Per-field timestamp management, dirty flag tracking, pure LWW merge function
- `src/__tests__/settingsSync.test.ts` - 17 test cases for merge algorithm and localStorage helpers
- `src/contexts/LanguageContext.tsx` - Added setFieldTimestamp/markFieldDirty calls for languageMode
- `src/contexts/ThemeContext.tsx` - Added setFieldTimestamp/markFieldDirty calls for theme
- `src/contexts/TTSContext.tsx` - Added setFieldTimestamp/markFieldDirty calls for ttsRate/ttsPitch/ttsAutoRead/ttsAutoReadLang
- `src/hooks/useTestDate.ts` - Added setFieldTimestamp/markFieldDirty calls for testDate (both set and clear paths)
- `src/lib/settings/settingsSync.ts` - Added loadSettingsRowFromSupabase for raw row with updated_at
- `src/lib/settings/index.ts` - Added loadSettingsRowFromSupabase to barrel export
- `src/contexts/SupabaseAuthContext.tsx` - Replaced server-wins with LWW merge, imports from settingsTimestamps
- `vitest.config.ts` - Added per-file coverage threshold for settingsTimestamps.ts (97/94/100/97)

## Decisions Made
- Pure merge function (no side effects) for testability -- localStorage helpers separated from merge logic
- TTS field mapping: TTSSettings keys mapped to UserSettings keys for per-field timestamp tracking via ttsFieldMap
- Dirty flags take absolute priority over timestamps -- offline changes always win regardless of remote timestamp

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Settings sync now supports offline-first with per-field conflict resolution
- Phase 50 complete -- all 3 plans executed
- Ready for next milestone phase

## Self-Check: PASSED

All 9 created/modified files verified present. Both task commits (730d54b, 8b10de1) verified in git log.

---
*Phase: 50-pwa-sync-resilience*
*Completed: 2026-03-20*
