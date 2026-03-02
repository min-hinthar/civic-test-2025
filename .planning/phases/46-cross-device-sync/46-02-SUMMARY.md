---
phase: 46-cross-device-sync
plan: 02
subsystem: sync, ui
tags: [supabase, sync, settings, bookmarks, contexts, hooks, fire-and-forget]

# Dependency graph
requires:
  - phase: 46-cross-device-sync
    provides: settingsSync.ts and bookmarkSync.ts push/pull functions
provides:
  - Settings sync push wired into ThemeContext, LanguageContext, TTSContext, useTestDate
  - Bookmark sync push wired into useBookmarks
  - gatherCurrentSettings() utility for centralized localStorage reads
affects: [46-03, cross-device-sync]

# Tech tracking
tech-stack:
  added: []
  patterns: [useRef-useEffect-for-user-id, fire-and-forget-sync-in-callbacks]

key-files:
  created: []
  modified:
    - src/contexts/ThemeContext.tsx
    - src/contexts/LanguageContext.tsx
    - src/contexts/TTSContext.tsx
    - src/hooks/useTestDate.ts
    - src/hooks/useBookmarks.ts
    - src/lib/settings/settingsSync.ts
    - src/lib/settings/index.ts
    - src/__tests__/tts.integration.test.tsx
    - src/components/interview/KeywordHighlight.test.tsx

key-decisions:
  - "useRef+useEffect pattern for user ID to satisfy React Compiler react-hooks/refs rule (no ref writes during render)"
  - "gatherCurrentSettings() centralized in settingsSync.ts to avoid duplicating localStorage key knowledge"

patterns-established:
  - "Settings sync push: gatherCurrentSettings() + syncSettingsToSupabase(userId, settings) after localStorage write"
  - "Bookmark sync push: getAllBookmarkIds().then(ids => syncBookmarksToSupabase(userId, ids)) after IndexedDB persist"
  - "useRef+useEffect for stable user reference in callbacks without re-triggering effects"

requirements-completed: [SYNC-02, SYNC-03]

# Metrics
duration: 11min
completed: 2026-03-01
---

# Phase 46 Plan 02: Context Wiring Summary

**Fire-and-forget settings and bookmark sync pushes wired into all 4 settings contexts and useBookmarks hook with centralized gatherCurrentSettings utility**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-01T23:53:08Z
- **Completed:** 2026-03-02T00:04:39Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Every settings change (theme, language, TTS, test date) fires sync to Supabase immediately
- Bookmark toggle fires sync with full current bookmark set after IndexedDB persist
- All sync calls are non-blocking fire-and-forget (no await, no error UI)
- Centralized gatherCurrentSettings() reads all settings from localStorage in one call
- React Compiler compliant: useRef+useEffect pattern for stable user reference

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire settings sync into ThemeContext, LanguageContext, TTSContext, useTestDate** - `d78f1ba` (feat)
2. **Task 2: Wire bookmark sync into useBookmarks hook** - `6a849fb` (feat)

## Files Created/Modified
- `src/lib/settings/settingsSync.ts` - Added gatherCurrentSettings() utility
- `src/lib/settings/index.ts` - Re-export gatherCurrentSettings
- `src/contexts/ThemeContext.tsx` - Sync push in theme-change useEffect
- `src/contexts/LanguageContext.tsx` - Sync push in setMode callback
- `src/contexts/TTSContext.tsx` - Sync push in updateSettings callback (inside setSettings updater)
- `src/hooks/useTestDate.ts` - Sync push in setTestDate and setPostTestAction (passed)
- `src/hooks/useBookmarks.ts` - Sync push after successful IndexedDB persist
- `src/__tests__/tts.integration.test.tsx` - Mock useAuth for TTSProvider dependency
- `src/components/interview/KeywordHighlight.test.tsx` - Mock useAuth for LanguageProvider dependency

## Decisions Made
- Used useRef+useEffect pattern instead of direct ref.current assignment during render to comply with React Compiler's react-hooks/refs rule
- gatherCurrentSettings() placed in settingsSync.ts (not duplicated per context) for single source of localStorage key mappings
- Bookmark sync sends full ID set (not just toggled ID) for consistency with add-wins merge strategy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TTS and KeywordHighlight tests for new useAuth dependency**
- **Found during:** Task 2 (build verification)
- **Issue:** TTSProvider and LanguageProvider now call useAuth(), causing test failures where these providers are rendered without AuthProvider
- **Fix:** Added vi.mock for @/contexts/SupabaseAuthContext returning { user: null } in both test files
- **Files modified:** src/__tests__/tts.integration.test.tsx, src/components/interview/KeywordHighlight.test.tsx
- **Verification:** All 618 tests pass
- **Committed in:** 6a849fb (Task 2 commit)

**2. [Rule 1 - Bug] Fixed React Compiler react-hooks/refs violation**
- **Found during:** Task 1 (pre-commit hook)
- **Issue:** Direct ref.current assignment during render (userRef.current = user) violates React Compiler's react-hooks/refs rule
- **Fix:** Changed to useEffect(() => { userRef.current = user; }, [user]) pattern across all 4 contexts/hooks
- **Files modified:** ThemeContext.tsx, LanguageContext.tsx, TTSContext.tsx, useTestDate.ts
- **Verification:** ESLint passes, build succeeds
- **Committed in:** d78f1ba (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking test fix, 1 bug fix for linter rule)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All sync pushes wired and working
- Plan 03 can add login hydration (pull settings/bookmarks on sign-in) and visibility sync
- gatherCurrentSettings() utility available for Plan 03's pull-then-update flow

## Self-Check: PASSED

All 9 modified files verified present. Both task commits (d78f1ba, 6a849fb) verified in git log. syncSettingsToSupabase confirmed in all 4 contexts/hooks. syncBookmarksToSupabase confirmed in useBookmarks.

---
*Phase: 46-cross-device-sync*
*Completed: 2026-03-01*
