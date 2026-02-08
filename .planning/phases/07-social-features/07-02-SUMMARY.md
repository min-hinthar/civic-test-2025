---
phase: "07"
plan: "02"
subsystem: "database"
tags: ["supabase", "schema", "rls", "leaderboard", "rpc", "social"]
dependency-graph:
  requires: ["profiles table (01-03)"]
  provides: ["social_profiles table", "streak_data table", "earned_badges table", "get_leaderboard RPC", "get_user_rank RPC"]
  affects: ["07-04 (badge engine)", "07-05 (composite score)", "07-06 (streak sync + social opt-in)", "07-07 (leaderboard display)"]
tech-stack:
  added: []
  patterns: ["SECURITY DEFINER for server-side ranking", "partial index on opt-in filter", "RLS public read for opted-in data"]
key-files:
  created: []
  modified: ["supabase/schema.sql"]
decisions:
  - id: "07-02-01"
    decision: "Public SELECT uses social_opt_in = true (not USING true) for privacy-by-default"
    context: "Unauthenticated users see only opted-in profiles on leaderboard"
  - id: "07-02-02"
    decision: "SECURITY DEFINER on RPC functions bypasses RLS for consistent ranking"
    context: "Server-side row_number() needs to read all opted-in rows regardless of caller"
  - id: "07-02-03"
    decision: "get_user_rank granted to authenticated only (not anon)"
    context: "Rank lookup requires a user_id target, meaningless for anonymous callers"
metrics:
  duration: "2 min"
  completed: "2026-02-08"
---

# Phase 7 Plan 02: Social Schema Foundation Summary

**Social tables (social_profiles, streak_data, earned_badges) with RLS policies and leaderboard RPC functions using SECURITY DEFINER for server-side ranking.**

## What Was Done

### Task 1: Social tables with RLS policies
Added three new tables to `supabase/schema.sql`:

- **social_profiles**: Leaderboard identity with display name, composite score, streak info, opt-in control. RLS allows public read of opted-in profiles and owner-only writes.
- **streak_data**: Cross-device streak sync with activity dates, freeze tracking. Owner-only access via RLS.
- **earned_badges**: Per-user achievement tracking with badge_id uniqueness constraint. Public read for opted-in users' badges, owner-only writes.

Indexes: partial index on `composite_score DESC WHERE social_opt_in = true` for leaderboard queries, user index on earned_badges.

### Task 2: Leaderboard RPC functions
- **get_leaderboard(board_type, result_limit)**: Returns top N opted-in users ranked by composite score. Supports `'all-time'` (default) and `'weekly'` board types. Granted to both `authenticated` and `anon` roles.
- **get_user_rank(target_user_id)**: Returns a specific user's rank among opted-in users. Granted to `authenticated` only.

Both functions use `SECURITY DEFINER` to bypass RLS for consistent server-side ranking.

## Task Commits

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Social tables with RLS policies | 8c23279 | 3 tables, RLS policies, indexes |
| 2 | Leaderboard RPC functions | be59936 | 2 RPC functions, GRANT statements |

## Decisions Made

1. **Public SELECT uses `social_opt_in = true`** (not `USING (true)`) -- privacy-by-default ensures only users who explicitly opt in appear on leaderboard
2. **SECURITY DEFINER on RPC functions** -- server-side `row_number()` needs all opted-in rows regardless of caller identity
3. **get_user_rank granted to authenticated only** -- rank lookup requires a target user_id, meaningless for anonymous callers

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

1. schema.sql has 3 new tables: social_profiles, streak_data, earned_badges
2. All tables have RLS enabled with appropriate policies
3. Public SELECT on social_profiles uses `USING (social_opt_in = true)` (not `USING (true)`)
4. get_leaderboard supports 'all-time' and 'weekly' board types
5. GRANT allows anon to call get_leaderboard (public leaderboard viewing)
6. All DDL is idempotent (IF NOT EXISTS, CREATE OR REPLACE, DROP POLICY IF EXISTS)

## Next Phase Readiness

No blockers. The social schema is ready for:
- **07-04** (Badge Engine): Can insert into `earned_badges` table
- **07-05** (Composite Score): Can update `social_profiles.composite_score`
- **07-06** (Streak Sync + Social Opt-in): Can sync to `streak_data` and manage `social_profiles`
- **07-07** (Leaderboard Display): Can call `get_leaderboard` and `get_user_rank` RPCs

## Self-Check: PASSED
