---
phase: 07-social-features
plan: 06
subsystem: social-identity
tags: [supabase, context, sync, opt-in, settings, bilingual]
dependency-graph:
  requires: ["07-01", "07-02"]
  provides: ["SocialContext provider", "streak sync", "social profile sync", "opt-in flow", "social settings"]
  affects: ["07-07", "07-08"]
tech-stack:
  added: []
  patterns: ["fire-and-forget sync", "union merge strategy", "multi-step dialog", "context provider"]
key-files:
  created:
    - src/lib/social/streakSync.ts
    - src/lib/social/socialProfileSync.ts
    - src/contexts/SocialContext.tsx
    - src/components/social/SocialOptInFlow.tsx
    - src/components/social/SocialSettings.tsx
  modified:
    - src/lib/social/streakStore.ts
    - src/lib/social/index.ts
    - src/pages/SettingsPage.tsx
decisions:
  - "Union merge for streak data across devices (activityDates + freezesUsed deduplicated, max for scalars)"
  - "Fire-and-forget sync for all Supabase operations (offline-safe, non-blocking)"
  - "SocialContext returns no-op functions when unauthenticated (safe defaults)"
  - "Captured userId as const string in useEffect for TypeScript narrowing in closures"
  - "SocialSettings placed between Notifications and Review Reminders in Settings page"
metrics:
  duration: ~14 min
  completed: 2026-02-08
---

# Phase 7 Plan 6: Social Identity Layer Summary

Supabase sync modules for streaks/profiles, SocialContext provider with opt-in state management, 3-step bilingual opt-in dialog, and Settings social section with toggle and editable display name.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Supabase sync modules and SocialContext provider | 4cc9efc | streakSync.ts, socialProfileSync.ts, SocialContext.tsx |
| 2 | Social opt-in flow dialog and Settings section | 86abda2 | SocialOptInFlow.tsx, SocialSettings.tsx, SettingsPage.tsx |

## What Was Built

### Streak Sync (streakSync.ts)
- `syncStreakToSupabase()` - upsert streak data to Supabase (fire-and-forget)
- `loadStreakFromSupabase()` - load remote streak data on sign-in
- `mergeStreakData()` - union merge strategy for multi-device consistency
  - activityDates: union (deduplicated, sorted)
  - freezesUsed: union (deduplicated, sorted)
  - freezesAvailable: max of both
  - longestStreak: max of both

### Social Profile Sync (socialProfileSync.ts)
- `getSocialProfile()` - read user's social profile from Supabase
- `upsertSocialProfile()` - create/update display name and opt-in status
- `updateCompositeScore()` - update leaderboard score data
- `toggleSocialOptIn()` - immediately hide/show on leaderboard (RLS-enforced)

### SocialContext Provider
- Loads social profile on authentication
- Bidirectional streak sync on sign-in (merge local + remote)
- Exposes: `optIn()`, `optOut()`, `updateDisplayName()`, `refreshProfile()`
- Safe defaults for unauthenticated users (isOptedIn=false, no-op functions)
- Follows SRSContext.tsx patterns

### Social Opt-In Flow (SocialOptInFlow.tsx)
- 3-step Radix Dialog with AnimatePresence transitions
- Step 1: Privacy notice (bilingual, explains what's shared)
- Step 2: Display name setup (pre-filled, 2-30 char validation)
- Step 3: Confirmation with summary
- Step indicator dots, back navigation, cancel support

### Social Settings (SocialSettings.tsx)
- Toggle switch for leaderboard visibility
- Editable display name (click to edit, Enter to save, Escape to cancel)
- Status text showing visibility state (bilingual)
- Unauthenticated fallback with sign-in prompt
- Integrated into SettingsPage between Notifications and Review Reminders

## Decisions Made

1. **Union merge strategy for streaks**: activityDates and freezesUsed use set union (handles studying on two devices). Scalar fields use max (freezesAvailable, longestStreak).
2. **Fire-and-forget sync pattern**: All Supabase operations skip silently when offline, log errors but never throw (consistent with interviewSync.ts).
3. **No-op functions for unauthenticated**: SocialContext returns empty state and async no-ops when user is not signed in, avoiding null checks in consumers.
4. **Captured userId as const**: TypeScript narrowing doesn't work well across closures, so we capture `user.id` as a `const uid: string` after the null check.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added saveStreakData export to streakStore**

- **Found during:** Task 1
- **Issue:** No way for sync layer to write merged streak data back to IndexedDB
- **Fix:** Added `saveStreakData(data: StreakData)` function and exported from barrel
- **Files modified:** src/lib/social/streakStore.ts, src/lib/social/index.ts
- **Commit:** 4cc9efc

## Verification Results

- TypeScript: `npx tsc --noEmit` passes clean
- ESLint: All files pass (including React Compiler rules)
- SocialContext exports useSocial() hook with complete social state
- Opt-in flow has 3 bilingual steps with animated transitions
- Settings page renders SocialSettings with toggle and name editor
- Streak merge correctly unions activity dates
- Opt-out calls toggleSocialOptIn(false) for immediate leaderboard removal

## Next Phase Readiness

Plan 07-07 (Leaderboard UI) can now consume `useSocial()` for user identity and opt-in state. Plan 07-08 (Integration) will wire SocialProvider into AppShell and connect streak/score updates.

## Self-Check: PASSED
