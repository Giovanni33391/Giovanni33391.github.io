-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Table: users (extends auth.users)
-- (We use a trigger to automatically create a profile row when a user signs up)
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
  initial_metric numeric not null,
  target_metric numeric,
  target_goal text,
  estimated_days text,
  unit text not null,
  streak integer default 0 not null,
  current_metric numeric not null,
  frequency integer[] default '{0,1,2,3,4,5,6}'::integer[] not null,
  initial_context text,
  last_completed_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: challenge_logs
-- Immutable log of daily completions for analytical / offline-sync purposes
create table public.challenge_logs (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  metric_achieved numeric not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_logs enable row level security;

-- Policies for public.users
create policy "Users can view their own profile" 
on public.users for select 
using (auth.uid() = id);

create policy "Users can update their own profile" 
on public.users for update 
using (auth.uid() = id);

-- Policies for public.challenges
create policy "Users can view their own challenges" 
on public.challenges for select 
using (auth.uid() = user_id);

create policy "Users can insert their own challenges" 
on public.challenges for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own challenges" 
on public.challenges for update 
using (auth.uid() = user_id);

create policy "Users can delete their own challenges" 
on public.challenges for delete 
using (auth.uid() = user_id);

-- Policies for public.challenge_logs
create policy "Users can view their own logs" 
on public.challenge_logs for select 
using (auth.uid() = user_id);

create policy "Users can insert their own logs" 
on public.challenge_logs for insert 
with check (auth.uid() = user_id);


-- 4. TRIGGERS

-- Automatically create a user profile when a new user signs up in Supabase Auth
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
