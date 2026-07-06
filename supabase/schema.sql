-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Table: users (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: challenges
create table public.challenges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type text default 'quantitative' not null,
  initial_metric numeric not null,
  target_metric numeric,
  target_goal text,
  estimated_days text,
  unit text not null,
  streak integer default 0 not null,
  current_metric numeric not null,
  frequency integer[] default '{0,1,2,3,4,5,6}'::integer[] not null,
  initial_context text,
  next_task text,
  last_completed_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: challenge_logs
create table public.challenge_logs (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  metric_achieved numeric not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: routines
create table public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  exercises jsonb not null,
  streak integer default 0 not null,
  last_completed_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workout_sessions
create table public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  routine_id uuid not null,
  routine_name text not null,
  date timestamp with time zone not null,
  duration integer not null,
  total_volume numeric not null,
  exercises jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES

alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_logs enable row level security;
alter table public.routines enable row level security;
alter table public.workout_sessions enable row level security;

-- Users
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Challenges
create policy "Users can view their own challenges" on public.challenges for select using (auth.uid() = user_id);
create policy "Users can insert their own challenges" on public.challenges for insert with check (auth.uid() = user_id);
create policy "Users can update their own challenges" on public.challenges for update using (auth.uid() = user_id);
create policy "Users can delete their own challenges" on public.challenges for delete using (auth.uid() = user_id);

-- Challenge Logs
create policy "Users can view their own logs" on public.challenge_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own logs" on public.challenge_logs for insert with check (auth.uid() = user_id);

-- Routines
create policy "Users can view their own routines" on public.routines for select using (auth.uid() = user_id);
create policy "Users can insert their own routines" on public.routines for insert with check (auth.uid() = user_id);
create policy "Users can update their own routines" on public.routines for update using (auth.uid() = user_id);
create policy "Users can delete their own routines" on public.routines for delete using (auth.uid() = user_id);

-- Workout Sessions
create policy "Users can view their own sessions" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions" on public.workout_sessions for insert with check (auth.uid() = user_id);


-- 4. TRIGGERS

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
