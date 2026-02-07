---
phase: 04-learning-explanations-category-progress
plan: 09
subsystem: ui
tags: [nudges, weak-area-detection, push-notifications, mastery, bilingual, study-guide, practice-sessions]

# Dependency graph
requires:
  - phase: 04-07
    provides: "Category progress tracking, Dashboard CategoryGrid, ProgressPage"
  - phase: 04-08
    provides: "Practice mode, PracticePage, practice session recording"
  - phase: 04-02
    provides: "detectWeakAreas, detectStaleCategories, calculateCategoryMastery"
  - phase: 04-06
    provides: "useCategoryMastery hook, CategoryRing, MasteryBadge"
provides:
  - "SuggestedFocus dashboard section with weak/stale/unattempted category nudges"
  - "WeakAreaNudge component with Practice Now and Review in Study Guide buttons"
  - "nudgeMessages.ts with 12+ bilingual encouraging message functions"
  - "StudyGuideHighlight with CategoryHeaderBadge and QuestionAccuracyDot"
  - "HistoryPage practice sessions tab"
  - "Push notification endpoint for weak area reminders"
  - "Level-up mode when all categories above threshold"
  - "Post-test weak area nudge in TestPage results"
affects: [phase-05, phase-06, phase-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deterministic message rotation using simple hash for variety without randomness"
    - "Session grouping from flat answer history using 5-minute gap detection"
    - "Tab system pattern with conditional rendering for multi-view pages"

key-files:
  created:
    - "src/lib/mastery/nudgeMessages.ts"
    - "src/components/nudges/SuggestedFocus.tsx"
    - "src/components/nudges/WeakAreaNudge.tsx"
    - "src/components/nudges/StudyGuideHighlight.tsx"
    - "pages/api/push/weak-area-nudge.ts"
  modified:
    - "src/lib/mastery/index.ts"
    - "src/pages/Dashboard.tsx"
    - "src/pages/TestPage.tsx"
    - "src/pages/StudyGuidePage.tsx"
    - "src/pages/HistoryPage.tsx"

key-decisions:
  - "Deterministic hash-based message selection for consistent nudge display per category"
  - "Practice session grouping by 5-minute timestamp gaps (no explicit session IDs in answer store)"
  - "CategoryHeaderBadge as main USCIS category mastery (matches category mapping granularity)"
  - "QuestionAccuracyDot based on most recent answer (not overall accuracy) for simple signal"
  - "Unattempted categories get primary (blue) styling, weak get warning (orange) for distinct treatment"

patterns-established:
  - "Nudge component pattern: category + mastery + isUnattempted + action callbacks"
  - "Tab-based page sections with activeTab state and conditional rendering"
  - "Answer history loading pattern: useEffect with getAnswerHistory() and cancellation"

# Metrics
duration: 13min
completed: 2026-02-07
---

# Phase 4 Plan 9: Weak Area Nudges, Study Guide Highlighting & Practice History Summary

**Weak area detection intelligence layer with SuggestedFocus dashboard section, study guide mastery badges, accuracy dots, practice sessions history tab, and push notification nudge endpoint**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-07T10:51:15Z
- **Completed:** 2026-02-07T11:04:15Z
- **Tasks:** 2/2
- **Files modified:** 10

## Accomplishments
- Dashboard SuggestedFocus section shows top 3 weak/stale/unattempted categories with bilingual nudge messages, Practice Now and Review buttons, and level-up mode when all above threshold
- Study guide category overview and detail views show mastery badges (CategoryHeaderBadge) and individual question accuracy dots (green/orange QuestionAccuracyDot)
- HistoryPage has Tests | Practice Sessions tab system with practice session grouping from answer history
- Post-test results show contextual weak area nudge with FadeIn animation
- Push notification endpoint for targeted weak area reminders with bilingual messages
- 12+ bilingual encouraging messages with deterministic rotation

## Task Commits

Each task was committed atomically:

1. **Task 1: Nudge components, messages pool, Dashboard and post-test integration** - `2f7f3dd` (feat)
2. **Task 2: Study guide highlighting, history practice tab, push nudge endpoint** - `3a1c9eb` (feat)

## Files Created/Modified
- `src/lib/mastery/nudgeMessages.ts` - Pool of 12+ bilingual nudge messages with getEncouragingMessage, getNudgeMessage, getLevelUpMessage, getUnattemptedMessage
- `src/components/nudges/SuggestedFocus.tsx` - Dashboard section showing weak/stale categories with smart prioritization and level-up mode
- `src/components/nudges/WeakAreaNudge.tsx` - Individual nudge card with Practice Now + Review in Study Guide buttons
- `src/components/nudges/StudyGuideHighlight.tsx` - CategoryHeaderBadge (mastery badge) and QuestionAccuracyDot (green/orange indicator)
- `pages/api/push/weak-area-nudge.ts` - Push notification endpoint for targeted weak area reminders
- `src/lib/mastery/index.ts` - Added nudge message exports to barrel
- `src/pages/Dashboard.tsx` - Integrated SuggestedFocus section below Category Progress
- `src/pages/TestPage.tsx` - Added post-test weak area nudge in result view
- `src/pages/StudyGuidePage.tsx` - Added CategoryHeaderBadge on category cards and QuestionAccuracyDot on flip cards
- `src/pages/HistoryPage.tsx` - Added Tests | Practice Sessions tab system

## Decisions Made
- **Deterministic message rotation:** Used simple character code hash for consistent but varied message selection per category, avoiding random flickering on re-renders
- **Practice session grouping:** Used 5-minute timestamp gap detection to group flat answer history into sessions, since masteryStore doesn't store explicit session IDs
- **QuestionAccuracyDot uses most recent answer:** Simplest meaningful signal (correct/incorrect/unattempted) rather than overall accuracy percentage
- **Distinct unattempted vs weak styling:** Unattempted categories use primary (blue) tint to feel inviting, weak categories use warning (orange) to feel encouraging but attention-drawing

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 complete: all 9 plans executed
- Full mastery system operational: calculation, storage, visualization, weak area detection, nudges, practice mode, push notifications
- Ready for Phase 5 (Testing & Quality) or Phase 6 (Analytics & Reporting)
- Push notification scheduling (cron) not implemented - endpoint created but automated triggering is a future enhancement

## Self-Check: PASSED

---
*Phase: 04-learning-explanations-category-progress*
*Completed: 2026-02-07*
