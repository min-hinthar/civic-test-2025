---
phase: 07-social-features
plan: 01
subsystem: social-data-layer
tags: [streak, badges, composite-score, indexeddb, gamification]
dependencies:
  requires: []
  provides: [streak-tracking, badge-evaluation, composite-scoring, social-storage]
  affects: [07-02, 07-03, 07-04, 07-05, 07-06]
tech-stack:
  added: []
  patterns: [pure-function-calculation, idb-keyval-store, barrel-export, bilingual-content]
key-files:
  created:
    - src/lib/social/streakTracker.ts
    - src/lib/social/streakStore.ts
    - src/lib/social/badgeDefinitions.ts
    - src/lib/social/badgeEngine.ts
    - src/lib/social/badgeStore.ts
    - src/lib/social/compositeScore.ts
    - src/lib/social/index.ts
  modified: []
decisions:
  - id: "07-01-streak-check"
    decision: "Streak badges check both currentStreak and longestStreak (not just current)"
    rationale: "Users should not lose earned badges if their current streak resets"
  - id: "07-01-daily-counts-reset"
    decision: "Daily activity counts reset when a new day's activity is recorded"
    rationale: "Freeze eligibility is per-day (10 SRS reviews in one day), so counts must reset at day boundaries"
  - id: "07-01-composite-clamp"
    decision: "Composite score inputs clamped to 0-100 range"
    rationale: "Prevents invalid scores from upstream data anomalies"
metrics:
  duration: "5 min"
  completed: "2026-02-08"
---

# Phase 7 Plan 1: Social Data Layer Summary

Pure data layer for social features: streak tracking, badge evaluation, and composite scoring with IndexedDB persistence. Zero UI dependencies.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Streak tracking core and IndexedDB store | 637bacc | streakTracker.ts, streakStore.ts |
| 2 | Badge definitions, engine, store, composite score, barrel export | ee13753 | badgeDefinitions.ts, badgeEngine.ts, badgeStore.ts, compositeScore.ts, index.ts |

## What Was Built

### Streak Tracking (`streakTracker.ts` + `streakStore.ts`)
- `calculateStreak()` walks backwards from today counting consecutive days (activity + freeze days)
- `shouldAutoUseFreeze()` detects when user returns after a missed day and auto-uses a freeze
- `checkFreezeEligibility()` checks if completing a practice test or 10+ SRS reviews earns a freeze
- `getLocalDateString()` returns timezone-safe local date (YYYY-MM-DD)
- `recordStudyActivity()` persists to IndexedDB, handles freeze auto-use, updates longest streak
- `earnFreeze()` manually adds a freeze (capped at 3)
- IndexedDB database: `civic-prep-streaks`

### Badge System (`badgeDefinitions.ts` + `badgeEngine.ts` + `badgeStore.ts`)
- 7 badges across 3 categories with bilingual content:
  - Streak: Week Warrior (7d), Fortnight Focus (14d), Monthly Master (30d)
  - Accuracy: Sharp Shooter (90%), Perfect Score (100%)
  - Coverage: Complete Scholar (100 questions), Category Champion (all categories)
- `evaluateBadges()` returns list of newly earned badges (not yet in earned set)
- `getNewlyEarnedBadge()` returns first uncelebrated badge for modal display
- `markBadgeEarned()` / `markBadgeShown()` persist earned + celebration state
- IndexedDB database: `civic-prep-badges`

### Composite Score (`compositeScore.ts`)
- Weights: accuracy 50%, coverage 30%, streak 20%
- Streak contribution capped at 30 days = 100%
- Returns integer 0-100 for leaderboard ranking

### Barrel Export (`index.ts`)
- Re-exports all public functions, types, and constants from all 6 modules

## Decisions Made

1. **Streak badges check longestStreak too** - Users who earned a 7-day streak but later broke it should keep the badge
2. **Daily activity counts reset on new day** - Freeze eligibility is per-day; counts tracked in StreakData and reset when a new day is detected
3. **Composite score inputs clamped** - bestTestAccuracy and coveragePercent clamped to 0-100 to prevent invalid composite scores

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] `npx tsc --noEmit` passes with zero errors
- [x] All 7 files exist in src/lib/social/
- [x] Barrel export in index.ts re-exports key types and functions
- [x] No UI imports (no React, no components) in any file
- [x] idb-keyval stores use unique database names (civic-prep-streaks, civic-prep-badges)

## Next Phase Readiness

All Wave 2 plans (07-02 through 07-06) can now import from `@/lib/social` for:
- Streak data reading and recording
- Badge evaluation and persistence
- Composite score calculation

No blockers or concerns for subsequent plans.

## Self-Check: PASSED
