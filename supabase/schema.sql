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
