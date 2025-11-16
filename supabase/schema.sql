-- Profiles table keeps the learner's preferred name in sync with Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Profiles are readable by the owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are upsertable by the owner" on public.profiles
  for insert with check (auth.uid() = id);
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

alter table public.mock_tests enable row level security;
create policy "Users can manage their own mock tests" on public.mock_tests
  using (auth.uid() = user_id);
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
create policy "Users can access their own responses" on public.mock_test_responses
  using (auth.uid() = (select user_id from public.mock_tests where id = mock_test_id));
create policy "Users can insert their own responses" on public.mock_test_responses
  for insert with check (auth.uid() = (select user_id from public.mock_tests where id = mock_test_id));

create index if not exists mock_test_responses_category_idx on public.mock_test_responses (category);
