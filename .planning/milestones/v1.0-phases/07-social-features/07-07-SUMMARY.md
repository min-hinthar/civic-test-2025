---
phase: "07"
plan: "07"
subsystem: social
tags: [leaderboard, social-hub, dashboard-widget, radix-dialog, supabase-rpc]
depends_on:
  requires: ["07-02", "07-04", "07-06"]
  provides: ["social-hub-page", "leaderboard-table", "leaderboard-widget", "leaderboard-profile"]
  affects: ["07-08"]
tech-stack:
  added: []
  patterns: ["hash-based-tabs", "supabase-rpc", "visibility-refresh"]
key-files:
  created:
    - src/hooks/useLeaderboard.ts
    - src/components/social/LeaderboardTable.tsx
    - src/components/social/LeaderboardProfile.tsx
    - src/pages/SocialHubPage.tsx
    - src/components/social/LeaderboardWidget.tsx
  modified: []
decisions:
  - id: "07-07-01"
    description: "Dynamic import for socialProfileSync in SocialHubPage (SocialProvider not yet in tree)"
    rationale: "Plan 08 adds SocialProvider to AppShell; until then, direct import avoids context dependency"
  - id: "07-07-02"
    description: "Opt-in dismissal stored in localStorage key civic-prep-social-optin-dismissed"
    rationale: "Prevents re-showing opt-in flow to users who actively declined"
  - id: "07-07-03"
    description: "LeaderboardWidget uses useLeaderboard with limit=3 for compact display"
    rationale: "Dashboard widget only needs top 3; reduces RPC payload"
metrics:
  duration: "~11 min"
  completed: "2026-02-08"
---

# Phase 7 Plan 7: Social Hub & Leaderboard Summary

Social hub page with tabbed navigation (Leaderboard/Badges/Streak), leaderboard table with weekly/all-time toggle, mini profile popup, and dashboard leaderboard widget.

## One-liner

Social hub with 3-tab hash routing, top-25 leaderboard via Supabase RPC, mini profile dialog, and compact dashboard widget.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | useLeaderboard hook, LeaderboardTable, and LeaderboardProfile | 14143d8 | useLeaderboard.ts, LeaderboardTable.tsx, LeaderboardProfile.tsx |
| 2 | SocialHubPage with tabbed navigation and LeaderboardWidget | 7b57410 | SocialHubPage.tsx, LeaderboardWidget.tsx |

## What Was Built

### useLeaderboard Hook
- Fetches top entries via `supabase.rpc('get_leaderboard', { board_type, result_limit })`
- Fetches user's rank via `supabase.rpc('get_user_rank', { target_user_id })` for authenticated users
- Tab focus/visibility refresh with 30-second minimum interval
- Returns entries, userRank, isLoading, refresh
- Works for both authenticated and unauthenticated users

### LeaderboardTable
- Ranked table with medal colors (gold/silver/bronze) for top 3
- Crown icon for weekly winner via lucide-react
- User's own row highlighted with primary background
- If user rank > 25, shows divider ("...") then user row at bottom
- Skeleton loading state (3 shimmer rows)
- Bilingual column headers (Rank/Name/Score)
- Rows clickable for profile view
- StaggeredList entrance animation

### LeaderboardProfile
- Radix Dialog showing read-only mini profile
- Display name, rank, composite score, current streak with fire icon
- Top badge with icon and name (from BADGE_DEFINITIONS)
- Earned badges loaded from Supabase `earned_badges` table
- Badge icons in horizontal row
- Bilingual content

### SocialHubPage
- Three tabs with hash-based routing: #leaderboard (default), #badges, #streak
- Follows HistoryPage tab pattern exactly (useMemo-derived activeTab, React Compiler safe)
- Leaderboard tab: all-time/weekly pill toggle, LeaderboardTable, opt-in CTA
- Badges tab: BadgeGrid with earned/locked badges, BadgeCelebration modal
- Streak tab: stats cards (current/longest/freezes), StreakHeatmap, freeze explanation
- Social opt-in flow triggers for authenticated users on first visit
- Non-authenticated users see leaderboard (read-only) with "Sign in" CTA

### LeaderboardWidget
- Compact dashboard widget following SRSWidget/InterviewDashboardWidget pattern
- Shows Trophy icon + "Your Rank: #N" or "Not ranked"
- Top 3 entries as mini list with medal colors and crown icons
- Tapping navigates to /social#leaderboard
- Loading/empty states with skeleton shimmer

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Dynamic import for socialProfileSync**: Since SocialProvider is not yet in the component tree (added in plan 08), the SocialHubPage uses dynamic import of `getSocialProfile` directly rather than relying on `useSocial()` context.

2. **Opt-in dismissal in localStorage**: When a user cancels the opt-in flow, we store `civic-prep-social-optin-dismissed=true` in localStorage to prevent re-showing the prompt on subsequent visits.

3. **LeaderboardWidget limit=3**: The dashboard widget passes `limit: 3` to `useLeaderboard` for a compact top-3 display, reducing the Supabase RPC payload.

## Verification Results

1. `npx tsc --noEmit` - PASSED (no errors)
2. ESLint - PASSED (no errors, React Compiler rules satisfied)
3. SocialHubPage has 3 working tabs with hash-based routing
4. Leaderboard shows top 25 + user's rank
5. Weekly/all-time toggle filters leaderboard data (via boardType state)
6. Crown icon appears for weekly winner (isWeeklyWinner flag)
7. LeaderboardProfile dialog opens on row tap
8. LeaderboardWidget ready for dashboard integration
9. Non-authenticated users can view leaderboard (anon RPC access)
10. All text is bilingual (EN + MY)

## Next Phase Readiness

Plan 07-08 (Integration) can proceed immediately:
- SocialHubPage is ready for route registration in AppShell
- LeaderboardWidget is ready for Dashboard placement
- SocialProvider needs to be added to provider hierarchy
- Navigation link to /social needs to be added to AppNavigation

## Self-Check: PASSED
