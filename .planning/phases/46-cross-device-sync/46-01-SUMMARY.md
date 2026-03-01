---
phase: 46-cross-device-sync
plan: 01
subsystem: database, sync
tags: [supabase, sync, settings, bookmarks, streaks, merge, rls, tdd]

# Dependency graph
requires:
  - phase: 07-social
    provides: streak_data table and streakSync.ts patterns
provides:
  - user_settings and user_bookmarks Supabase tables with RLS
  - settingsSync.ts with push/pull/mapping functions
  - bookmarkSync.ts with push/pull/merge functions
  - Enhanced mergeStreakData with freeze recalculation and longest recomputation
affects: [46-02, 46-03, cross-device-sync]

# Tech tracking
tech-stack:
  added: []
  patterns: [settings-sync-push-pull, bookmark-add-wins-merge, freeze-recalculation, longest-streak-recomputation]

key-files:
  created:
    - supabase/schema.sql (user_settings + user_bookmarks tables)
    - src/lib/settings/settingsSync.ts
    - src/lib/settings/settingsSync.test.ts
    - src/lib/settings/index.ts
    - src/lib/bookmarks/bookmarkSync.ts
    - src/lib/bookmarks/bookmarkSync.test.ts
    - src/lib/social/streakSync.test.ts
  modified:
    - supabase/schema.sql
    - src/lib/bookmarks/index.ts
    - src/lib/social/streakSync.ts

key-decisions:
  - "Separate user_settings and user_bookmarks tables (not extending profiles) to avoid trigger conflicts"
  - "Individual columns for settings (not JSONB) matching project pattern for type safety and simple upserts"
  - "Add-wins merge for bookmarks: union via Set, sorted output"
  - "Freeze recalculation removes freezes on dates that now have activity after merge, returns freed to pool capped at 3"
  - "Longest streak recomputed from merged dates via calculateStreak (not max of both)"

patterns-established:
  - "Settings sync: mapRowToSettings/mapSettingsToRow pure mapping, fire-and-forget push, server-wins pull"
  - "Bookmark sync: mergeBookmarks pure union, fire-and-forget push, empty array fallback on pull"
  - "Freeze recalculation: filter freezes against merged activity set, return freed count to available pool"

requirements-completed: [SYNC-02, SYNC-03, SYNC-04]

# Metrics
duration: 8min
completed: 2026-03-01
---

# Phase 46 Plan 01: Data Layer Summary

**Settings/bookmark sync functions with Supabase schema (RLS), add-wins bookmark merge, and enhanced streak merge with freeze recalculation and longest recomputation via calculateStreak**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-01T23:40:30Z
- **Completed:** 2026-03-01T23:49:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- user_settings table with 7 setting columns (theme, language, TTS rate/pitch/autoRead/lang, test date) and RLS policies
- user_bookmarks table with question_ids text[] column and RLS policies
- settingsSync.ts with push/pull/mapping following established streakSync.ts pattern
- bookmarkSync.ts with add-wins merge (union+dedup+sort), fire-and-forget push, graceful pull
- Enhanced mergeStreakData: freeze recalculation removes unnecessary freezes, returns freed to pool (capped at 3), recomputes longest streak from merged dates via calculateStreak
- 30 new tests across 3 test files (9 settings, 11 bookmarks, 10 streak)

## Task Commits

Each task was committed atomically:

1. **Task 1: Supabase schema + settingsSync + bookmarkSync with tests** - `a9918e8` (feat)
2. **Task 2: Enhanced mergeStreakData with freeze recalculation** - `2543269` (feat)

_TDD: Tests written first (RED), verified failing, then implementation (GREEN)._

## Files Created/Modified
- `supabase/schema.sql` - Added user_settings and user_bookmarks table definitions with RLS
- `src/lib/settings/settingsSync.ts` - Settings push/pull/mapping functions (UserSettings, UserSettingsRow types)
- `src/lib/settings/settingsSync.test.ts` - 9 tests for mapping functions and sync behavior
- `src/lib/settings/index.ts` - Barrel export for settings module
- `src/lib/bookmarks/bookmarkSync.ts` - Bookmark push/pull/merge functions (add-wins strategy)
- `src/lib/bookmarks/bookmarkSync.test.ts` - 11 tests for merge logic and sync behavior
- `src/lib/bookmarks/index.ts` - Updated barrel to re-export bookmarkSync
- `src/lib/social/streakSync.ts` - Enhanced mergeStreakData with freeze recalc + longest recomputation
- `src/lib/social/streakSync.test.ts` - 10 tests for enhanced merge including edge cases

## Decisions Made
- Separate user_settings and user_bookmarks tables (not extending profiles) to avoid handle_new_user trigger conflicts
- Individual columns for settings (not JSONB) matching project pattern (streak_data uses individual columns)
- Skip preferredVoiceName sync (voices differ by device/OS per user decision)
- loadSettingsFromSupabase does not use withRetry (simple select, unlike the upsert push)
- Test for freeze union fixed: freezes not on activity dates correctly remain after recalculation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for freeze union behavior**
- **Found during:** Task 2 (TDD GREEN phase)
- **Issue:** Test expected freeze dates not on activity dates to be removed, but freeze recalculation only removes freezes on dates WITH activity
- **Fix:** Corrected test expectation to include all three freeze dates that don't overlap with activity dates
- **Files modified:** src/lib/social/streakSync.test.ts
- **Verification:** All 10 streak sync tests pass
- **Committed in:** 2543269 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test)
**Impact on plan:** Minor test correction. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Tables are defined in schema.sql for Supabase migration.

## Next Phase Readiness
- Data layer complete: settings sync, bookmark sync, and enhanced streak merge ready for wiring
- Plan 02 can wire these into React contexts (ThemeContext, LanguageContext, TTSContext, SocialContext, useBookmarks)
- Plan 03 can add Page Visibility API sync trigger using these sync functions

## Self-Check: PASSED

All 9 files verified present. Both task commits (a9918e8, 2543269) verified in git log.

---
*Phase: 46-cross-device-sync*
*Completed: 2026-03-01*
