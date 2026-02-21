---
phase: 15-progress-hub
plan: 05
subsystem: ui
tags: [motion-react, swipe-gestures, scroll-memory, i18n, localStorage, push-notifications]

# Dependency graph
requires:
  - phase: 15-02
    provides: OverviewTab with stat cards and category mastery
  - phase: 15-03
    provides: HistoryTab with mock test and interview history
  - phase: 15-04
    provides: AchievementsTab with badge gallery and leaderboard
provides:
  - Scroll position memory per Hub tab
  - Swipe gesture navigation between Hub tabs
  - Hub i18n strings (hub.* keys in strings.ts)
  - Hub badge dot indicator via localStorage bridge
  - Push notification URL updated to /home
  - ProgressPage, HistoryPage, SocialHubPage deleted
affects: [15-06, push-notifications, navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - localStorage bridge for cross-component badge state (avoids heavy hook import in nav)
    - requestAnimationFrame for scroll restoration after tab render
    - motion/react drag="x" with dragConstraints for swipe gesture tab switching

key-files:
  created: []
  modified:
    - src/pages/HubPage.tsx
    - src/components/navigation/useNavBadges.ts
    - src/lib/i18n/strings.ts
    - src/components/hub/HubTabBar.tsx
    - src/components/hub/OverviewTab.tsx
    - src/components/hub/HistoryTab.tsx
    - src/components/hub/AchievementsTab.tsx
    - pages/api/push/send.ts

key-decisions:
  - "localStorage bridge (civic-prep-earned-badge-count / civic-prep-seen-badge-count) for nav badge dot -- avoids importing useBadges into NavigationProvider"
  - "rAF-based scroll restoration to avoid race condition with tab content rendering"
  - "50px swipe threshold with 0.2 elastic for natural rubber-band feel"
  - "Stale comments referencing deleted pages updated to remove dead references"

patterns-established:
  - "localStorage bridge pattern: component A writes, component B reads via useEffect+storage event"
  - "Hub i18n strings centralized under strings.hub namespace"

# Metrics
duration: 10min
completed: 2026-02-11
---

# Phase 15 Plan 05: Interaction Polish & Cleanup Summary

**Scroll memory, swipe gestures, hub badge dot wiring, push URL update, and deletion of 3 legacy page components (2137 lines removed)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-11T02:54:38Z
- **Completed:** 2026-02-11T03:04:07Z
- **Tasks:** 2
- **Files modified:** 8 (3 deleted)

## Accomplishments

- Scroll position preserved per tab -- switching away and back restores exact scroll offset via rAF
- Swipe left/right on mobile viewport navigates between adjacent Hub tabs (50px threshold, 0.2 elastic)
- Hub badge dot in bottom nav lights up when user earns badges they haven't seen on the Achievements tab
- Push notification general reminder navigates to /home (was /)
- ProgressPage.tsx (623 lines), HistoryPage.tsx (964 lines), SocialHubPage.tsx (543 lines) deleted -- all content migrated to Hub tabs
- All Hub user-facing strings centralized in strings.hub i18n namespace (11 keys)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add scroll memory, swipe gestures, and hub i18n strings** - `46a220b` (feat)
2. **Task 2: Wire hub badge dot, update push URL, delete old pages** - `db4acc0` (feat)

## Files Created/Modified

- `src/pages/HubPage.tsx` - Added scroll memory state, swipe drag handler, badge localStorage sync, i18n strings
- `src/components/navigation/useNavBadges.ts` - Wired hubHasUpdate to localStorage earned/seen badge counts
- `src/lib/i18n/strings.ts` - Added hub.* namespace with 11 bilingual string keys
- `src/components/hub/HubTabBar.tsx` - Updated tab labels to use strings.hub
- `src/components/hub/OverviewTab.tsx` - Category Mastery heading uses strings.hub.categoryMastery
- `src/components/hub/HistoryTab.tsx` - Section headers and load more buttons use strings.hub
- `src/components/hub/AchievementsTab.tsx` - Leaderboard header and show more/less use strings.hub
- `pages/api/push/send.ts` - Changed push notification URL from '/' to '/home'
- `src/pages/ProgressPage.tsx` - **DELETED**
- `src/pages/HistoryPage.tsx` - **DELETED**
- `src/pages/SocialHubPage.tsx` - **DELETED**

## Decisions Made

- Used localStorage as lightweight bridge for badge dot indicator (civic-prep-earned-badge-count / civic-prep-seen-badge-count) rather than importing useBadges into NavigationProvider
- requestAnimationFrame for scroll restoration to avoid race condition with AnimatePresence render cycle
- 50px swipe threshold balances sensitivity vs accidental triggers; 0.2 dragElastic provides subtle rubber-band
- Updated stale comments referencing deleted pages (Rule 1 - cosmetic cleanup during deletion)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 execution plans for Progress Hub complete
- Hub has full interaction polish: scroll memory, swipe gestures, badge dot, i18n
- Legacy pages deleted with zero broken imports
- Ready for plan 06 (final verification/integration)

## Self-Check: PASSED

- All 8 modified files verified present
- All 3 deleted files confirmed absent
- Both commit hashes (46a220b, db4acc0) verified in git log
- Build succeeds with zero errors

---
*Phase: 15-progress-hub*
*Completed: 2026-02-11*
