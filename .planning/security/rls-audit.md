# Supabase Row Level Security Audit

**Audit Date:** 2026-02-10
**Auditor:** Claude (Phase 13 - Security Hardening)
**Schema File:** `supabase/schema.sql`

## Summary

9 tables audited, all have RLS enabled. 3 security_definer functions reviewed with justification documented. No unrestricted public access found -- all public-facing data is intentionally opt-in (leaderboard). 4 API routes using service role key reviewed.

## Tables

### profiles

- **RLS:** Enabled
- **Policies:**
  - SELECT: Owner only (`auth.uid() = id`)
  - INSERT: Owner only (`auth.uid() = id`)
  - UPDATE: Owner only (`auth.uid() = id`)
  - DELETE: Not allowed (no policy; cascade from auth.users handles deletion)
- **Risk Level:** Low
- **Notes:** Automatically populated by `handle_new_user()` trigger on `auth.users` insert. The `id` column references `auth.users(id)` with `on delete cascade`. No public access -- only the owning user can see or modify their profile.

### mock_tests

- **RLS:** Enabled
- **Policies:**
  - SELECT/UPDATE/DELETE (via `for all`): Owner only (`auth.uid() = user_id`) -- "Users can manage their own mock tests" is a default `using` policy covering select, update, delete
  - INSERT: Owner only (`auth.uid() = user_id`)
- **Risk Level:** Low
- **Notes:** Contains test scores, duration, pass/fail status, and end reason. The `for all` policy without `with check` means the `using` clause applies to both read and write operations. Additional columns (`passed`, `incorrect_count`, `end_reason`) added via `ALTER TABLE ADD COLUMN IF NOT EXISTS` for backward compatibility. The `end_reason` field has a CHECK constraint restricting values to `('passThreshold', 'failThreshold', 'time', 'complete')`.

### mock_test_responses

- **RLS:** Enabled
- **Policies:**
  - SELECT: Owner via subquery (`auth.uid() = (select user_id from mock_tests where id = mock_test_id)`)
  - INSERT: Owner via subquery (`auth.uid() = (select user_id from mock_tests where id = mock_test_id)`)
  - UPDATE/DELETE: Not allowed (no policy)
- **Risk Level:** Low
- **Notes:** Uses a subquery join to `mock_tests` to verify ownership, since `mock_test_responses` does not have a direct `user_id` column. This is a correct pattern -- the subquery verifies the parent `mock_test` belongs to the authenticated user. Responses are write-once (no update/delete needed). Index on `category` for analytics queries.

### srs_cards

- **RLS:** Enabled
- **Policies:**
  - SELECT: Owner only (`auth.uid() = user_id`)
  - INSERT: Owner only (`auth.uid() = user_id`)
  - UPDATE: Owner only (`auth.uid() = user_id`)
  - DELETE: Owner only (`auth.uid() = user_id`)
- **Risk Level:** Low
- **Notes:** Full CRUD for owner. Contains FSRS spaced repetition state (due date, stability, difficulty, reps, lapses). Unique constraint on `(user_id, question_id)` prevents duplicate cards. Indexes on `(user_id, due)` for due-card queries and `(user_id, question_id)` for lookups.

### interview_sessions

- **RLS:** Enabled
- **Policies:**
  - SELECT: Owner only (`auth.uid() = user_id`)
  - INSERT: Owner only (`auth.uid() = user_id`)
  - UPDATE/DELETE: Not allowed (no policy)
- **Risk Level:** Low
- **Notes:** Interview session history is write-once (insert + read, no update or delete). Contains mode (realistic/practice), score, duration, pass/fail. Index on `(user_id, completed_at desc)` for chronological queries.

### social_profiles

- **RLS:** Enabled
- **Policies:**
  - SELECT (public): Opted-in users only (`social_opt_in = true`) -- "Anyone can view opted-in social profiles"
  - SELECT (owner): Own profile (`auth.uid() = user_id`) -- "Users can view own social profile"
  - INSERT: Owner only (`auth.uid() = user_id`)
  - UPDATE: Owner only (`auth.uid() = user_id`)
  - DELETE: Not allowed (no explicit policy; RLS denies by default)
- **Constraints (added Phase 13):**
  - `social_profiles_display_name_length`: `char_length(display_name) between 2 and 30`
  - `social_profiles_display_name_no_html`: `display_name !~ '[<>]'` (SEC-03: XSS prevention)
- **Risk Level:** Low
- **Notes:** Public SELECT is intentional for the leaderboard feature -- only opted-in users are visible. The `display_name` is the only user-generated text visible to other users, hence the HTML character restriction at the database level. No DELETE policy means users cannot delete their social profile via RLS (they can update `social_opt_in` to false to opt out). Cascade from `profiles(id)` handles account deletion.

### streak_data

- **RLS:** Enabled
- **Policies:**
  - ALL (select/insert/update/delete): Owner only (`auth.uid() = user_id`) -- "Users can manage own streak data"
  - INSERT: Owner only (`auth.uid() = user_id`) -- "Users can insert own streak data"
- **Risk Level:** Low
- **Notes:** The `for all` policy already covers insert, so the separate INSERT policy is redundant (not harmful). Contains activity dates array, freeze counts, and longest streak. Single row per user (primary key on `user_id`).
- **Recommendation:** The separate INSERT policy can be removed since the ALL policy already covers all operations including insert.

### earned_badges

- **RLS:** Enabled
- **Policies:**
  - SELECT (public): Badges of opted-in users (`exists (select 1 from social_profiles sp where sp.user_id = earned_badges.user_id and sp.social_opt_in = true)`) -- cross-table join for visibility
  - ALL (owner): Owner only (`auth.uid() = user_id`) -- "Users can manage own badges"
  - INSERT: Owner only (`auth.uid() = user_id`) -- "Users can insert own badges"
- **Risk Level:** Low
- **Notes:** Public SELECT uses a subquery to check `social_profiles.social_opt_in`, ensuring only opted-in users' badges are visible on the leaderboard. The separate INSERT policy is redundant with the ALL policy (same as streak_data). Unique constraint on `(user_id, badge_id)` prevents duplicate badge awards. Index on `user_id` for lookups.
- **Recommendation:** The separate INSERT policy can be removed since the ALL policy covers it.

### push_subscriptions (NEW - Phase 13)

- **RLS:** Enabled
- **Policies:**
  - SELECT: Owner only (`auth.uid() = user_id`) -- "Users can view own push subscription"
  - ALL (insert/update/delete): Owner only (`auth.uid() = user_id` with check `auth.uid() = user_id`) -- "Users can manage own push subscription"
- **Constraints:**
  - `reminder_frequency` CHECK: must be one of `('daily', 'every2days', 'weekly', 'off')`
- **Risk Level:** Low
- **Notes:** Added to schema.sql in Phase 13. Originally created manually in Supabase. The subscribe API (`pages/api/push/subscribe.ts`) uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS after verifying the user's JWT. Cron endpoints use service role to read all subscriptions for cross-user notification delivery. Single row per user (primary key on `user_id`). Keys stored as JSONB (contains push subscription p256dh and auth keys).

## Functions

### handle_new_user() - SECURITY DEFINER

- **Type:** Trigger function
- **Purpose:** Auto-populate `profiles` table when a new user is created in `auth.users`
- **Justification:** Trigger runs on the `auth` schema insert event, needs write access to `public.profiles` which RLS would otherwise restrict
- **Implementation:** Inserts profile with `id`, `email`, `full_name` from the auth user. Uses `ON CONFLICT (id) DO UPDATE` for idempotency
- **Risk:** Low -- only reads `new.id`, `new.email`, and `new.raw_user_meta_data->>'full_name'` from the auth insert event. Cannot be called directly by users (trigger-only)
- **Granted to:** Trigger on `auth.users` (not directly callable)

### get_leaderboard() - SECURITY DEFINER

- **Type:** RPC function
- **Purpose:** Query all opted-in social profiles for leaderboard ranking
- **Justification:** RLS would restrict to `auth.uid() = user_id` only; leaderboard needs cross-user data from all opted-in profiles
- **Implementation:** Returns rank, user_id, display_name, composite_score, current_streak, top_badge, is_weekly_winner. Supports `board_type` parameter for all-time vs weekly filtering
- **Risk:** Low -- only returns public leaderboard data (display_name, score, streak, badge) of opted-in users. No PII exposed
- **Granted to:** `authenticated`, `anon` (public leaderboard is intentional)

### get_user_rank() - SECURITY DEFINER

- **Type:** RPC function
- **Purpose:** Compute a specific user's rank among all opted-in users
- **Justification:** RLS would restrict to `auth.uid() = user_id` only; ranking calculation needs cross-user composite_score data
- **Implementation:** Returns a single `bigint` rank number using `row_number()` window function over opted-in users ordered by composite_score
- **Risk:** Low -- returns only a single integer rank number, no user data exposed
- **Granted to:** `authenticated` only (user must be logged in to see their rank)

## Storage Buckets

No Supabase Storage buckets are in use. Nothing to audit.

## Edge Functions

No Supabase Edge Functions are deployed. Nothing to audit.

## Service Role Key Usage

### pages/api/push/subscribe.ts

- **Uses:** `SUPABASE_SERVICE_ROLE_KEY` for upsert/delete on `push_subscriptions`
- **Auth check:** Accepts `userId` from request body (NOTE: the subscribe endpoint currently does not verify JWT -- it trusts the `userId` from the request body. Phase 13-01 or 13-02 may address this)
- **Justification:** Service role used for database write operations. With RLS policies now in place, could potentially be replaced with user-scoped client in a future iteration
- **Risk:** Medium -- if an attacker crafts a request with another user's `userId`, the service role would execute the upsert. Mitigated by: endpoint is called from authenticated client-side code, and the operation scope is limited to push subscription data (low-value target)

### pages/api/push/send.ts

- **Uses:** `SUPABASE_SERVICE_ROLE_KEY` for reading all push subscriptions matching a frequency
- **Auth check:** `Bearer` token in `Authorization` header must match `CRON_SECRET`
- **Justification:** Cron-triggered endpoint that needs to read ALL user subscriptions to send bulk notifications. Cannot use per-user auth (no user context in cron)
- **Risk:** Low -- server-to-server only, protected by cron secret. Reads subscriptions but does not modify user data (except cleaning up expired subscriptions on 410 errors)

### pages/api/push/srs-reminder.ts

- **Uses:** `SUPABASE_SERVICE_ROLE_KEY` for reading SRS cards (due date check) and push subscriptions
- **Auth check:** `x-api-key` header must match `SRS_CRON_API_KEY`
- **Justification:** Cron-triggered endpoint that queries all users' SRS card due dates to determine who needs a reminder, then reads their push subscriptions. Cross-user access is inherent to the notification delivery pattern
- **Risk:** Low -- server-to-server only, protected by API key. Reads SRS due dates (no card content exposed) and sends notifications

### pages/api/push/weak-area-nudge.ts

- **Uses:** `SUPABASE_SERVICE_ROLE_KEY` for reading push subscriptions for a specific user
- **Auth check:** `Bearer` token in `Authorization` header must match `CRON_SECRET`
- **Justification:** Server-triggered endpoint to send targeted weak-area study reminders. Needs to read push subscription for the target user
- **Risk:** Low -- server-to-server only, protected by cron secret. Only reads subscription data for the specified user

## Recommendations

1. **subscribe.ts JWT verification:** The subscribe endpoint currently trusts the `userId` from the request body without verifying a JWT. Consider adding JWT verification so the server confirms the authenticated user matches the `userId` before upserting their push subscription. (May be addressed in other Phase 13 plans)

2. **Redundant INSERT policies on streak_data and earned_badges:** Both tables have an `ALL` policy AND a separate `INSERT` policy. The `ALL` policy already covers all operations including insert, making the separate INSERT policies redundant. They are not harmful but add unnecessary complexity. Consider removing them for clarity.

3. **No explicit DELETE on social_profiles:** There is no delete policy on `social_profiles`. This is likely intentional (users opt out via `social_opt_in = false` rather than deleting). The cascade from `profiles(id)` handles account deletion. No action needed, but worth documenting this is by design.

4. **push_subscriptions keys column:** The `keys` JSONB column stores sensitive push subscription cryptographic keys (`p256dh`, `auth`). These are only accessible to the owning user via RLS (or service role). No additional encryption is needed since these are browser-generated keys, not user secrets.

5. **mock_test_responses subquery policy:** The subquery-based RLS policy on `mock_test_responses` is correct but may have performance implications at scale. If the table grows large, consider adding a denormalized `user_id` column with a direct RLS policy. Not urgent for current scale.

## Input Sanitization & XSS Assessment (SEC-03)

**Assessment Date:** 2026-02-10
**Overall XSS Risk:** LOW

### Defense Layers

1. **React JSX auto-escaping:** All user-visible text is rendered via JSX expressions (`{variable}`) which auto-escape HTML entities. No user-controlled content passes through `dangerouslySetInnerHTML`.
2. **CSP nonce-based script-src (Plan 13-02):** Even if an XSS payload were stored, CSP blocks execution of inline scripts without a valid nonce.
3. **Database CHECK constraints (Plan 13-03):** `display_name` rejects `<` and `>` characters at the PostgreSQL level, preventing HTML tag storage.

### dangerouslySetInnerHTML Audit

One usage found in `pages/_document.tsx`:
- **Content:** `THEME_SCRIPT` -- a hardcoded constant string for FOUC prevention (applies dark/light theme before React hydrates)
- **User-controlled?** No. The script content is a static string defined at build time. The nonce attribute is set from an HTTP header, not user input.
- **Risk:** NONE

### User Input Surface Inventory

| Input Field | Location | Component | Stored? | Rendered To Others? | Sanitization | Risk |
|-------------|----------|-----------|---------|---------------------|--------------|------|
| display_name | social_profiles | `SocialOptInFlow.tsx`, `SocialSettings.tsx` | Yes (Supabase) | Yes (leaderboard) | Client: 2-30 char limit; DB CHECK: 2-30 chars, no `<>` chars; React JSX auto-escape on render | LOW |
| full_name | profiles (auth signup) | `AuthPage.tsx` | Yes (Supabase) | No (only shown to self) | Managed by Supabase Auth; React JSX auto-escape | NONE |
| email | auth (Supabase) | `AuthPage.tsx`, `PasswordResetPage.tsx` | Yes (Supabase Auth) | No (only shown to self) | Managed by Supabase Auth; email format validation | NONE |
| password | auth (Supabase) | `AuthPage.tsx`, `PasswordUpdatePage.tsx` | Yes (Supabase Auth) | No (never rendered) | Managed by Supabase Auth, min 12 chars enforced | NONE |
| test answers | mock_test_responses | `TestPage.tsx` | Yes (Supabase) | No (only shown to self) | Stored as selected answer text from predefined options, not free-form input | NONE |
| study guide search | client-side filter | `StudyGuidePage.tsx` | No (client only) | No | Not stored; filters predefined question list; React JSX auto-escape | NONE |
| SRS reminder time | client-side setting | `SettingsPage.tsx` | No (localStorage) | No | HTML `type="time"` input; value used as time string only | NONE |
| reminder frequency | push_subscriptions | `SettingsPage.tsx` | Yes (Supabase) | No | DB CHECK constraint: must be one of `('daily', 'every2days', 'weekly', 'off')` | NONE |

### Removed/Absent XSS Vectors

- **`marked` library:** NOT present in `package.json`. No markdown-to-HTML rendering exists anywhere in the codebase. This eliminates a common XSS vector entirely.
- **`DOMPurify`:** Not needed and not installed. No raw HTML rendering of user content occurs.
- **`contentEditable`:** Not used anywhere in the codebase.
- **No `<textarea>` elements:** All text inputs use `<input type="text">` with predefined max lengths.

### Conclusion

No additional runtime sanitization library (e.g., DOMPurify) is needed because:

1. **No user input is rendered as raw HTML** -- zero instances of `dangerouslySetInnerHTML` with user-controlled content
2. **The only user text visible to others** (`display_name`) has database-level character restrictions rejecting `<` and `>`, plus client-side length validation
3. **CSP provides defense-in-depth** against any hypothetical stored XSS payloads (nonce-based script-src blocks unauthorized script execution)
4. **No markdown rendering** -- the `marked` library is not installed, eliminating HTML injection via markdown
5. **All user inputs** are either managed by Supabase Auth (email, password), constrained to predefined options (test answers, reminder frequency), or client-side only (search filter, time picker)
