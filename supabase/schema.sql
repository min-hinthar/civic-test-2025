-- Profiles table keeps the learner's preferred name in sync with Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Profiles are readable by the owner" on public.profiles;
create policy "Profiles are readable by the owner" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Profiles are upsertable by the owner" on public.profiles;
create policy "Profiles are upsertable by the owner" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "Profiles are updateable by the owner" on public.profiles;
create policy "Profiles are updateable by the owner" on public.profiles
  for update using (auth.uid() = id);

-- Automatically hydrate the profiles table whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Store the outcome of each timed mock test
create table if not exists public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  duration_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.mock_tests
  add column if not exists passed boolean not null default false;
alter table public.mock_tests
  add column if not exists incorrect_count integer not null default 0;
alter table public.mock_tests
  add column if not exists end_reason text not null default 'complete';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mock_tests_end_reason_check'
  ) then
    alter table public.mock_tests
      add constraint mock_tests_end_reason_check
      check (end_reason in ('passThreshold', 'failThreshold', 'time', 'complete'));
  end if;
end $$;

alter table public.mock_tests enable row level security;
drop policy if exists "Users can manage their own mock tests" on public.mock_tests;
create policy "Users can manage their own mock tests" on public.mock_tests
  using (auth.uid() = user_id);
drop policy if exists "Users can insert their own mock tests" on public.mock_tests;
create policy "Users can insert their own mock tests" on public.mock_tests
  for insert with check (auth.uid() = user_id);

-- Individual question level analytics for category level insights
create table if not exists public.mock_test_responses (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null references public.mock_tests (id) on delete cascade,
  question_id integer not null,
  category text not null,
  question_en text not null,
  question_my text not null,
  selected_answer_en text not null,
  selected_answer_my text not null,
  correct_answer_en text not null,
  correct_answer_my text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.mock_test_responses enable row level security;
drop policy if exists "Users can access their own responses" on public.mock_test_responses;
create policy "Users can access their own responses" on public.mock_test_responses
  using (auth.uid() = (select user_id from public.mock_tests where id = mock_test_id));
drop policy if exists "Users can insert their own responses" on public.mock_test_responses;
create policy "Users can insert their own responses" on public.mock_test_responses
  for insert with check (auth.uid() = (select user_id from public.mock_tests where id = mock_test_id));

create index if not exists mock_test_responses_category_idx on public.mock_test_responses (category);

-- SRS (Spaced Repetition) card state per user per question
create table if not exists public.srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  -- FSRS Card state fields
  due timestamptz not null default now(),
  stability float8 not null default 0,
  difficulty float8 not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0,  -- 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review timestamptz,
  -- Metadata
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Prevent duplicate cards per user
  unique (user_id, question_id)
);

alter table public.srs_cards enable row level security;

drop policy if exists "Users can read their own SRS cards" on public.srs_cards;
create policy "Users can read their own SRS cards"
  on public.srs_cards for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own SRS cards" on public.srs_cards;
create policy "Users can insert their own SRS cards"
  on public.srs_cards for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own SRS cards" on public.srs_cards;
create policy "Users can update their own SRS cards"
  on public.srs_cards for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own SRS cards" on public.srs_cards;
create policy "Users can delete their own SRS cards"
  on public.srs_cards for delete using (auth.uid() = user_id);

-- Index for due-card queries
create index if not exists srs_cards_due_idx
  on public.srs_cards (user_id, due);
create index if not exists srs_cards_question_idx
  on public.srs_cards (user_id, question_id);

-- Interview simulation session history
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  mode text not null check (mode in ('realistic', 'practice')),
  score integer not null,
  total_questions integer not null default 20,
  duration_seconds integer not null,
  passed boolean not null,
  end_reason text not null,
  created_at timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;

drop policy if exists "Users can view own interview sessions" on public.interview_sessions;
create policy "Users can view own interview sessions"
  on public.interview_sessions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own interview sessions" on public.interview_sessions;
create policy "Users can insert own interview sessions"
  on public.interview_sessions for insert with check (auth.uid() = user_id);

create index if not exists interview_sessions_user_idx
  on public.interview_sessions (user_id, completed_at desc);

-- ============================================================
-- Social Features (Phase 7)
-- ============================================================

-- Social profiles for leaderboard identity and opt-in control
create table if not exists public.social_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  social_opt_in boolean not null default false,
  composite_score numeric not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  top_badge text,
  is_weekly_winner boolean not null default false,
  weekly_score_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_profiles enable row level security;

drop policy if exists "Anyone can view opted-in social profiles" on public.social_profiles;
create policy "Anyone can view opted-in social profiles" on public.social_profiles
  for select using (social_opt_in = true);
drop policy if exists "Users can view own social profile" on public.social_profiles;
create policy "Users can view own social profile" on public.social_profiles
  for select using (auth.uid() = user_id);
drop policy if exists "Users can upsert own social profile" on public.social_profiles;
create policy "Users can upsert own social profile" on public.social_profiles
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own social profile" on public.social_profiles;
create policy "Users can update own social profile" on public.social_profiles
  for update using (auth.uid() = user_id);

create index if not exists social_profiles_score_idx
  on public.social_profiles (composite_score desc) where social_opt_in = true;

-- Add display_name length constraint if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'social_profiles_display_name_length'
  ) then
    alter table public.social_profiles
      add constraint social_profiles_display_name_length
      check (char_length(display_name) between 2 and 30);
  end if;
end $$;

-- Add display_name no-HTML constraint if not exists (SEC-03: XSS prevention)
-- Rejects any value containing < or > characters, preventing HTML/script injection.
-- React JSX auto-escapes on render, but defense-in-depth means we also sanitize at storage.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'social_profiles_display_name_no_html'
  ) then
    alter table public.social_profiles
      add constraint social_profiles_display_name_no_html
      check (display_name !~ '[<>]');
  end if;
end $$;

-- Streak data for cross-device streak sync
create table if not exists public.streak_data (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  activity_dates text[] not null default '{}',
  freezes_available int not null default 0,
  freezes_used text[] not null default '{}',
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.streak_data enable row level security;

drop policy if exists "Users can manage own streak data" on public.streak_data;
create policy "Users can manage own streak data" on public.streak_data
  for all using (auth.uid() = user_id);
drop policy if exists "Users can insert own streak data" on public.streak_data;
create policy "Users can insert own streak data" on public.streak_data
  for insert with check (auth.uid() = user_id);

-- Earned badges for per-user achievement tracking
create table if not exists public.earned_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table public.earned_badges enable row level security;

drop policy if exists "Anyone can view opted-in users badges" on public.earned_badges;
create policy "Anyone can view opted-in users badges" on public.earned_badges
  for select using (
    exists (
      select 1 from public.social_profiles sp
      where sp.user_id = earned_badges.user_id
        and sp.social_opt_in = true
    )
  );
drop policy if exists "Users can manage own badges" on public.earned_badges;
create policy "Users can manage own badges" on public.earned_badges
  for all using (auth.uid() = user_id);
drop policy if exists "Users can insert own badges" on public.earned_badges;
create policy "Users can insert own badges" on public.earned_badges
  for insert with check (auth.uid() = user_id);

create index if not exists earned_badges_user_idx
  on public.earned_badges (user_id);

-- ============================================================
-- Push Notification Subscriptions (Phase 2 - PWA)
-- ============================================================
-- NOTE: This table was originally created manually in Supabase.
-- Added to schema.sql in Phase 13 (Security Hardening) with RLS policies.
-- The subscribe API (pages/api/push/subscribe.ts) uses SUPABASE_SERVICE_ROLE_KEY
-- to bypass RLS for upsert/delete operations AFTER verifying the user's JWT.
-- Cron endpoints (send.ts, srs-reminder.ts, weak-area-nudge.ts) also use
-- service role key to read all subscriptions for cross-user notification delivery.

create table if not exists public.push_subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  reminder_frequency text not null default 'daily'
    check (reminder_frequency in ('daily', 'every2days', 'weekly', 'off')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Users can read their own push subscription status
drop policy if exists "Users can view own push subscription" on public.push_subscriptions;
create policy "Users can view own push subscription" on public.push_subscriptions
  for select using (auth.uid() = user_id);

-- Users can manage their own push subscription (insert/update/delete)
drop policy if exists "Users can manage own push subscription" on public.push_subscriptions;
create policy "Users can manage own push subscription" on public.push_subscriptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- User Settings for Cross-Device Sync (Phase 46)
-- ============================================================

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  language_mode text not null default 'bilingual' check (language_mode in ('bilingual', 'english-only')),
  tts_rate text not null default 'normal' check (tts_rate in ('slow', 'normal', 'fast')),
  tts_pitch numeric not null default 1.02,
  tts_auto_read boolean not null default true,
  tts_auto_read_lang text not null default 'both' check (tts_auto_read_lang in ('english', 'burmese', 'both')),
  test_date text,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users can manage own settings" on public.user_settings;
create policy "Users can manage own settings" on public.user_settings
  for all using (auth.uid() = user_id);
drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- User Bookmarks for Cross-Device Sync (Phase 46)
-- ============================================================

create table if not exists public.user_bookmarks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  question_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_bookmarks enable row level security;

drop policy if exists "Users can manage own bookmarks" on public.user_bookmarks;
create policy "Users can manage own bookmarks" on public.user_bookmarks
  for all using (auth.uid() = user_id);
drop policy if exists "Users can insert own bookmarks" on public.user_bookmarks;
create policy "Users can insert own bookmarks" on public.user_bookmarks
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Leaderboard Functions (Phase 7)
-- ============================================================

-- security definer: Required because leaderboard queries all opted-in social_profiles,
-- not just the calling user's row. RLS would restrict to auth.uid() = user_id only.
-- Safe because: only returns display_name, score, streak, badge of opted-in users.
-- Granted to: authenticated, anon (public leaderboard is intentional).
create or replace function public.get_leaderboard(
  board_type text default 'all-time',
  result_limit int default 25
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  composite_score numeric,
  current_streak int,
  top_badge text,
  is_weekly_winner boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    row_number() over (order by sp.composite_score desc)::bigint as rank,
    sp.user_id,
    sp.display_name,
    sp.composite_score,
    sp.current_streak,
    sp.top_badge,
    sp.is_weekly_winner
  from social_profiles sp
  where sp.social_opt_in = true
    and (board_type = 'all-time' or sp.weekly_score_updated_at >= date_trunc('week', now()))
  order by sp.composite_score desc
  limit result_limit;
end;
$$;

-- security definer: Required to compute rank across all opted-in users.
-- RLS would restrict to auth.uid() = user_id only, preventing ranking calculation.
-- Safe because: only returns a single bigint rank number, no PII.
-- Granted to: authenticated only (user must be logged in to see their rank).
create or replace function public.get_user_rank(target_user_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  user_rank bigint;
begin
  select r.rank into user_rank
  from (
    select sp.user_id, row_number() over (order by sp.composite_score desc) as rank
    from social_profiles sp
    where sp.social_opt_in = true
  ) r
  where r.user_id = target_user_id;
  return user_rank;
end;
$$;

-- Grant execution permissions
grant execute on function public.get_leaderboard to authenticated, anon;
grant execute on function public.get_user_rank to authenticated;
