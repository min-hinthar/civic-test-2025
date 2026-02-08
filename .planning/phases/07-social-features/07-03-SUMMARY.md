---
phase: "07"
plan: "03"
subsystem: social-engagement
tags: [streak, badges, dashboard, activity-tracking, indexeddb]
depends_on:
  requires: ["07-01"]
  provides: ["streak-widget", "badge-highlights", "activity-recording"]
  affects: ["07-06", "07-07"]
tech_stack:
  added: []
  patterns: ["fire-and-forget-recording", "session-level-dedup", "dashboard-widget"]
key_files:
  created:
    - src/hooks/useStreak.ts
    - src/components/social/StreakWidget.tsx
    - src/components/social/BadgeHighlights.tsx
  modified:
    - src/lib/mastery/masteryStore.ts
    - src/lib/srs/srsStore.ts
    - src/lib/interview/interviewStore.ts
    - src/pages/StudyGuidePage.tsx
    - src/pages/Dashboard.tsx
decisions:
  - "Activity recording in store functions (not saveSession.ts): saveSession.ts is a generic mutex guard, not test-specific"
  - "SRS activity recorded only when lastReviewedAt is set (differentiates review from adding cards)"
  - "Session-level module variable prevents duplicate freeze auto-use toasts"
metrics:
  duration: "22 min"
  completed: "2026-02-08"
---

# Phase 07 Plan 03: Streak Widget & Activity Recording Summary

**One-liner:** Streak widget with flame icon, badge highlights row, and fire-and-forget activity recording in all 5 study flows.

## Task Commits

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | useStreak hook and activity recording integration | d9367b9 | useStreak.ts, masteryStore.ts, srsStore.ts, interviewStore.ts, StudyGuidePage.tsx |
| 2 | StreakWidget, BadgeHighlights, and Dashboard integration | f963ea2 | StreakWidget.tsx, BadgeHighlights.tsx, Dashboard.tsx |

## What Was Built

### useStreak Hook (src/hooks/useStreak.ts)
- Loads streak data from IndexedDB on mount via getStreakData()
- Returns currentStreak, longestStreak, freezesAvailable, freezesUsed, activityDates, isLoading, refresh
- Derives streak values via useMemo (React Compiler safe)
- On mount, checks if freeze should auto-use for yesterday; shows bilingual toast via showInfo()
- Module-level `freezeAutoUsedThisSession` guard prevents duplicate toasts

### Activity Recording Integration
- **masteryStore.ts**: recordAnswer() now calls recordStudyActivity('test'|'practice') fire-and-forget
- **srsStore.ts**: setSRSCard() calls recordStudyActivity('srs_review') when card has lastReviewedAt
- **interviewStore.ts**: saveInterviewSession() calls recordStudyActivity('interview')
- **StudyGuidePage.tsx**: Mount effect calls recordStudyActivity('study_guide')
- All calls are fire-and-forget with .catch(() => {}) for non-critical failure

### StreakWidget (src/components/social/StreakWidget.tsx)
- Compact dashboard card following SRSWidget/InterviewDashboardWidget pattern
- Shows flame icon (orange-500) + current streak count + bilingual "day streak" text
- Dual display: "Current: N days | Best: M days" with Burmese translation
- Freeze indicator: Snowflake icon (blue-400) + freeze count when available
- Empty state: "Start studying to build your streak!" bilingual message
- Tapping navigates to /social#streak

### BadgeHighlights (src/components/social/BadgeHighlights.tsx)
- Horizontal scrollable row of top 5 earned badges
- Each badge: circular icon container with lucide-react icon, amber/gold for earned
- If no badges earned: 3 locked placeholders with Lock icon and "Keep studying!" message
- Badge count display next to badge row
- Tapping navigates to /social#badges

### Dashboard Integration (src/pages/Dashboard.tsx)
- Widget order: ReadinessIndicator -> StreakWidget -> BadgeHighlights -> SRSWidget -> InterviewDashboardWidget -> CategoryGrid
- FadeIn animation delays staggered (25ms streak, 40ms badges, 50ms SRS, 75ms interview)

## Decisions Made

1. **Activity recording in store functions**: The plan referenced saveSession.ts for test recording, but saveSession.ts is a generic mutex utility (createSaveSessionGuard). Activity recording was added to masteryStore.recordAnswer() instead, which is the actual function called for test/practice answers.

2. **SRS review vs add differentiation**: setSRSCard is called both for adding cards to deck and for grading reviews. Activity recording only fires when `record.lastReviewedAt` is truthy, ensuring only reviews count toward streak.

3. **Session-level freeze dedup**: A module-level `freezeAutoUsedThisSession` boolean prevents the freeze auto-use toast from firing multiple times if the hook remounts during the same session.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] saveSession.ts is not test-specific**
- **Found during:** Task 1
- **Issue:** Plan specified adding recordStudyActivity('test') in saveSession.ts, but that file is a generic mutex guard utility with no test-specific code.
- **Fix:** Added activity recording in masteryStore.ts's recordAnswer() function instead, which is where test/practice answers are actually persisted.
- **Files modified:** src/lib/mastery/masteryStore.ts

## Next Phase Readiness

- Streak data now flows from IndexedDB -> useStreak hook -> StreakWidget
- All 5 study flows (test, practice, SRS review, interview, study guide) record to streak store
- Badge highlights ready for Plan 07-04 badge evaluation integration
- Social hub navigation placeholders (/social#streak, /social#badges) ready for Plan 07-07

## Self-Check: PASSED
