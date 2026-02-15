---
phase: 20-session-persistence
plan: 04
subsystem: ui
tags: [dashboard, nav-badges, session-persistence, bilingual, motion-react, indexeddb]

# Dependency graph
requires:
  - phase: 20-01
    provides: "SessionSnapshot types, sessionStore CRUD, useSessionPersistence hook, timeAgo utility"
provides:
  - "UnfinishedBanner component with amber cards for unfinished session reminders"
  - "Extended NavBadges with testSessionCount and interviewSessionCount"
  - "Startup session cleanup via cleanExpiredSessions in AppShell"
affects: [20-05, 20-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["AnimatePresence exit animations for dismissible cards", "IndexedDB session counts in nav badge hook"]

key-files:
  created:
    - src/components/sessions/UnfinishedBanner.tsx
  modified:
    - src/pages/Dashboard.tsx
    - src/components/navigation/navConfig.ts
    - src/components/navigation/useNavBadges.ts
    - src/components/navigation/NavItem.tsx
    - src/AppShell.tsx

key-decisions:
  - "NavItem TabBadge uses switch cases (not dynamic lookup) for type safety with new badge keys"
  - "Session counts fetched in same runCheck function as other badge checks for consistency"
  - "Practice sessions count toward testSessionCount badge (both use /test or /practice routes)"
  - "AppShell cleanup effect has empty catch for environments without IndexedDB"

patterns-established:
  - "Dismissible banner pattern: local Set state for per-visit dismiss, not persisted"
  - "Session-aware nav badges: IndexedDB async query in periodic runCheck"

# Metrics
duration: 7min
completed: 2026-02-15
---

# Phase 20 Plan 04: Dashboard Banners and Nav Badges Summary

**Amber unfinished session banners on Dashboard with animated dismiss, bilingual labels, nav badge counts on test/interview tabs, and automatic expired session cleanup on app startup**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-15T00:25:56Z
- **Completed:** 2026-02-15T00:32:42Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 5

## Accomplishments
- UnfinishedBanner component with amber cards showing session type icon, bilingual name, and relative timestamp per session
- AnimatePresence-powered slide-in entrance and slide-out exit animations for banner cards
- Dashboard integration placing banners above NBA hero card with per-visit dismiss state
- NavBadges extended with testSessionCount and interviewSessionCount, wired into useNavBadges hook
- NavItem TabBadge switch extended with count badges for test and interview tabs
- AppShell startup cleanup effect calling cleanExpiredSessions on mount

## Task Commits

Each task was committed atomically:

1. **Task 1: UnfinishedBanner component and Dashboard integration** - `78ff2cf` (feat)
2. **Task 2: Nav badge extension and startup cleanup** - `3bb38fc` (feat)

## Files Created/Modified
- `src/components/sessions/UnfinishedBanner.tsx` - Amber banner cards for unfinished sessions with type icon, bilingual label, relative timestamp, dismiss, and navigation
- `src/pages/Dashboard.tsx` - Integrated UnfinishedBanner above NBA hero card with useSessionPersistence and local dismiss state
- `src/components/navigation/navConfig.ts` - Extended NavBadges interface with testSessionCount and interviewSessionCount; added badgeKey to test and interview tabs
- `src/components/navigation/useNavBadges.ts` - Added getAllSessions import and session count state/fetch in runCheck
- `src/components/navigation/NavItem.tsx` - Added TabBadge switch cases for testSessionCount and interviewSessionCount
- `src/AppShell.tsx` - Added useEffect calling cleanExpiredSessions on mount for automatic 24h expiry enforcement

## Decisions Made
- NavItem TabBadge uses explicit switch cases rather than dynamic lookup for type safety
- Practice sessions count toward testSessionCount (both mock-test and practice types) since practice is accessed via test nav area
- Session count fetch added to existing runCheck function (runs on mount + visibility change) for consistency with other badge checks
- cleanExpiredSessions catch block silently ignores errors (IndexedDB may not be available in all environments)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added NavItem TabBadge cases for new badge keys**
- **Found during:** Task 2 (Nav badge extension)
- **Issue:** Plan specified adding badgeKey to navConfig tabs and extending useNavBadges, but did not mention updating the TabBadge switch in NavItem.tsx. Without new cases, the badges would not render despite correct data flow.
- **Fix:** Added `testSessionCount` and `interviewSessionCount` cases to TabBadge switch, both rendering NavBadge with type="count" and color="warning"
- **Files modified:** src/components/navigation/NavItem.tsx
- **Verification:** TypeScript typecheck passes, all switch cases exhaustive
- **Committed in:** 3bb38fc (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix -- without the NavItem switch cases, badges would never render. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dashboard banners and nav badges ready for end-to-end testing with actual saved sessions
- Plans 20-05 and 20-06 can proceed with page-level session save/restore integration
- cleanExpiredSessions runs on startup ensuring stale sessions never accumulate

## Self-Check: PASSED

- [x] src/components/sessions/UnfinishedBanner.tsx -- FOUND
- [x] src/pages/Dashboard.tsx -- FOUND
- [x] src/components/navigation/navConfig.ts -- FOUND
- [x] src/components/navigation/useNavBadges.ts -- FOUND
- [x] src/components/navigation/NavItem.tsx -- FOUND
- [x] src/AppShell.tsx -- FOUND
- [x] Commit 78ff2cf -- FOUND
- [x] Commit 3bb38fc -- FOUND

---
*Phase: 20-session-persistence*
*Completed: 2026-02-15*
