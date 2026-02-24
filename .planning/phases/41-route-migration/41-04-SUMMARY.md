---
phase: 41-route-migration
plan: 04
subsystem: ui
tags: [next-navigation, react-router-dom, useRouter, useSearchParams, next-link, route-migration]

# Dependency graph
requires:
  - phase: 41-01
    provides: App Router page.tsx wrappers that provide next/navigation context
provides:
  - 20 component files fully migrated from react-router-dom to next/navigation
  - Badge deep-linking via search params (BadgeHighlights writes, AchievementsTab reads)
affects: [41-05-cleanup, 41-03-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRouter from next/navigation replaces useNavigate from react-router-dom"
    - "next/link with href replaces react-router-dom Link with to"
    - "useSearchParams replaces location.state for cross-page data passing"
    - "usePathname replaces useLocation for pathname access"

key-files:
  created: []
  modified:
    - src/components/dashboard/CategoryPreviewCard.tsx
    - src/components/dashboard/CompactStatRow.tsx
    - src/components/dashboard/DashboardEmptyState.tsx
    - src/components/dashboard/NBAHeroCard.tsx
    - src/components/dashboard/RecentActivityCard.tsx
    - src/components/hub/AchievementsTab.tsx
    - src/components/hub/HistoryTab.tsx
    - src/components/hub/OverviewTab.tsx
    - src/components/hub/WelcomeState.tsx
    - src/components/srs/DeckManager.tsx
    - src/components/srs/ReviewDeckCard.tsx
    - src/components/srs/ReviewSession.tsx
    - src/components/srs/SRSWidget.tsx
    - src/components/interview/InterviewResults.tsx
    - src/components/practice/PracticeResults.tsx
    - src/components/test/PreTestScreen.tsx
    - src/components/results/TestResultsScreen.tsx
    - src/components/sessions/UnfinishedBanner.tsx
    - src/components/social/BadgeHighlights.tsx
    - src/components/onboarding/OnboardingTour.tsx

key-decisions:
  - "Badge deep-linking uses search params (?focusBadge=id) instead of location.state"
  - "InterviewResults navigate('/') updated to canonical /home route"
  - "SRSWidget navigate({pathname,hash}) simplified to router.push('/study#deck')"
  - "usePathname null-coalesced to /home for OnboardingTour"
  - "useSearchParams null-coalesced in AchievementsTab (Next.js types return possibly null)"

patterns-established:
  - "Search params for cross-component data: writer uses router.push('?key=value'), reader uses useSearchParams().get('key')"
  - "Canonical route audit: / -> /home, paths verified during migration"

requirements-completed: [MIGR-05, MIGR-06]

# Metrics
duration: 7min
completed: 2026-02-24
---

# Phase 41 Plan 04: Component Migration Summary

**20 component files migrated from react-router-dom to next/navigation with badge deep-linking via search params**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-24T14:03:05Z
- **Completed:** 2026-02-24T14:09:49Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- All 20 component files migrated with zero react-router-dom imports remaining
- Badge deep-linking migrated from location.state to search params (BadgeHighlights writes focusBadge param, AchievementsTab reads it)
- All Link destinations audited for canonical paths (navigate('/') corrected to /home)
- TypeScript typecheck passes clean after migration

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate dashboard and hub components** - `9c57229` (feat)
2. **Task 2: Migrate SRS, interview, practice, test, session, social, and onboarding components** - `a667ffa` (feat)

**Plan metadata:** `b798e99` (docs: complete plan)

## Files Created/Modified
- `src/components/dashboard/CategoryPreviewCard.tsx` - useNavigate -> useRouter
- `src/components/dashboard/CompactStatRow.tsx` - useNavigate -> useRouter (in StatItem child component)
- `src/components/dashboard/DashboardEmptyState.tsx` - useNavigate -> useRouter
- `src/components/dashboard/NBAHeroCard.tsx` - Link from react-router-dom -> next/link with href
- `src/components/dashboard/RecentActivityCard.tsx` - useNavigate -> useRouter
- `src/components/hub/AchievementsTab.tsx` - useLocation.state.focusBadge -> useSearchParams for badge deep-linking
- `src/components/hub/HistoryTab.tsx` - useNavigate -> useRouter
- `src/components/hub/OverviewTab.tsx` - useNavigate -> useRouter
- `src/components/hub/WelcomeState.tsx` - useNavigate -> useRouter
- `src/components/srs/DeckManager.tsx` - useNavigate -> useRouter
- `src/components/srs/ReviewDeckCard.tsx` - useNavigate -> useRouter
- `src/components/srs/ReviewSession.tsx` - useNavigate -> useRouter
- `src/components/srs/SRSWidget.tsx` - useNavigate -> useRouter, navigate({pathname,hash}) -> router.push
- `src/components/interview/InterviewResults.tsx` - useNavigate -> useRouter, / -> /home
- `src/components/practice/PracticeResults.tsx` - useNavigate -> useRouter
- `src/components/test/PreTestScreen.tsx` - Link from react-router-dom -> next/link with href
- `src/components/results/TestResultsScreen.tsx` - useNavigate -> useRouter
- `src/components/sessions/UnfinishedBanner.tsx` - useNavigate -> useRouter
- `src/components/social/BadgeHighlights.tsx` - navigate with state.focusBadge -> router.push with search params
- `src/components/onboarding/OnboardingTour.tsx` - useLocation -> usePathname

## Decisions Made
- Badge deep-linking migrated from `location.state.focusBadge` to `?focusBadge=id` search params (AchievementsTab reads, BadgeHighlights writes)
- InterviewResults `navigate('/')` updated to canonical `/home` route to avoid redirect chain
- SRSWidget `navigate({ pathname, hash })` simplified to `router.push('/study#deck')` (next/navigation accepts hash in URL string)
- OnboardingTour `usePathname()` null-coalesced to `/home` per Next.js typing convention (STATE.md decision)
- AchievementsTab `useSearchParams()` null-coalesced per Next.js return type

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale navigate dependency in PracticeResults callback**
- **Found during:** Task 2 (PracticeResults migration)
- **Issue:** After replacing `useNavigate` with `useRouter`, the `useCallback` dependency array still referenced the old `navigate` variable
- **Fix:** Updated dependency from `[navigate]` to `[router]`
- **Files modified:** src/components/practice/PracticeResults.tsx
- **Verification:** TypeScript typecheck passes
- **Committed in:** a667ffa (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial mechanical fix, no scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All component files in src/components/ now use next/navigation (only ProtectedRoute.tsx and PageTransition.tsx still import react-router-dom, both deleted in Plan 05)
- Pages Router files in src/pages/ still import react-router-dom (Plan 03 scope)
- Plan 05 (final cleanup) can safely remove react-router-dom dependency after Plans 03+04 complete

## Self-Check: PASSED

- All 20 modified files verified present on disk
- Commit 9c57229 (Task 1) verified in git log
- Commit a667ffa (Task 2) verified in git log
- Zero react-router-dom imports in src/components/ (excluding ProtectedRoute.tsx and PageTransition.tsx)

---
*Phase: 41-route-migration*
*Completed: 2026-02-24*
