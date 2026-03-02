---
phase: 46-cross-device-sync
plan: 03
subsystem: sync, contexts
tags: [supabase, sync, visibility-api, settings, bookmarks, streaks, hydration, throttle]

# Dependency graph
requires:
  - phase: 46-cross-device-sync
    provides: settingsSync.ts, bookmarkSync.ts, enhanced mergeStreakData from Plan 01
provides:
  - useVisibilitySync hook for throttled tab-focus re-pull
  - Login hydration pull for settings (server-wins) and bookmarks (add-wins merge)
  - Visibility re-pull for settings, bookmarks, and streaks
affects: [cross-device-sync]

# Tech tracking
tech-stack:
  added: []
  patterns: [visibility-sync-throttle, login-hydration-pull, fire-and-forget-pull, callbacksRef-in-effect]

key-files:
  created:
    - src/hooks/useVisibilitySync.ts
  modified:
    - src/contexts/SupabaseAuthContext.tsx
    - src/contexts/SocialContext.tsx

key-decisions:
  - "callbacksRef synced in useEffect (React Compiler safe pattern from usePerQuestionTimer.ts)"
  - "5-second throttle on visibility sync to prevent rapid-fire pulls from quick tab switches"
  - "Settings/bookmark pull fires after setUser (non-blocking, fire-and-forget)"
  - "Bookmark merge pushes merged set back to Supabase when local had extra IDs"
  - "SRS visibility sync (SYNC-01) confirmed already working via existing SRSContext handler"

patterns-established:
  - "Visibility sync: useVisibilitySync hook with throttled callbacksRef pattern"
  - "Login hydration pull: fire-and-forget .then().catch() chains after setUser/setIsLoading"
  - "preferredVoiceName preserved during settings pull (device-local, not synced)"

requirements-completed: [SYNC-01, SYNC-02, SYNC-03, SYNC-04]

# Metrics
duration: 8min
completed: 2026-03-01
---

# Phase 46 Plan 03: Visibility Sync & Login Hydration Summary

**useVisibilitySync hook with 5s throttle for tab-focus re-pull, plus settings/bookmark pull on login hydration in SupabaseAuthContext and SocialContext**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-01T23:53:30Z
- **Completed:** 2026-03-02T00:01:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created useVisibilitySync hook with 5-second throttled visibility change listener
- Settings pulled from Supabase on login (server-wins) and written to localStorage for context hydration
- Bookmarks pulled from Supabase on login (add-wins merge) and new IDs written to IndexedDB
- Visibility re-pull wired in SocialContext for settings, bookmarks, and streaks on tab focus
- Confirmed SRS visibility sync (SYNC-01) already handled by existing SRSContext.refreshDeck()
- All pull operations are fire-and-forget (non-blocking, silent errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useVisibilitySync hook** - `c0a541a` (feat)
2. **Task 2: Integrate settings/bookmark pull on login + wire visibility sync** - `2a430ac` (feat)

## Files Created/Modified
- `src/hooks/useVisibilitySync.ts` - Centralized visibility-change sync trigger with 5s throttle
- `src/contexts/SupabaseAuthContext.tsx` - Login hydration pulls settings (server-wins) and bookmarks (add-wins merge)
- `src/contexts/SocialContext.tsx` - Wires useVisibilitySync for settings/bookmarks/streaks re-pull on tab focus

## Decisions Made
- callbacksRef synced in useEffect instead of during render (React Compiler lint rule: cannot access refs during render)
- Followed usePerQuestionTimer.ts established pattern for callback ref sync
- Settings pull preserves device-local preferredVoiceName (voices differ by device/OS)
- Bookmark merge pushes merged set back to Supabase when local had IDs not yet in cloud
- SRS data sync on visibility change (SYNC-01) confirmed already working -- no changes needed to SRSContext

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed callbacksRef assignment for React Compiler compliance**
- **Found during:** Task 1 (useVisibilitySync hook creation)
- **Issue:** `callbacksRef.current = callbacks` during render triggers React Compiler lint error (`react-hooks/refs`)
- **Fix:** Moved ref sync into a useEffect, matching usePerQuestionTimer.ts project pattern
- **Files modified:** src/hooks/useVisibilitySync.ts
- **Verification:** ESLint + build pass clean
- **Committed in:** c0a541a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor adjustment to follow project React Compiler conventions. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cross-device sync fully wired: Plan 01 (data layer), Plan 02 (push on change), Plan 03 (pull on login + visibility)
- All SYNC requirements completed: answer history (SYNC-01), bookmarks (SYNC-02), settings (SYNC-03), streaks (SYNC-04)
- Phase 46 complete -- ready for Phase 47

## Self-Check: PASSED

All 3 files verified present. Both task commits (c0a541a, 2a430ac) verified in git log.

---
*Phase: 46-cross-device-sync*
*Completed: 2026-03-01*
