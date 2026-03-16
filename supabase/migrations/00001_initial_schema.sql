-- ============================================
-- Lampy — Initial Database Schema
-- ============================================
-- Run this migration against your Supabase project:
--   supabase db push
-- Or paste into the Supabase SQL Editor.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- Custom ENUM types
-- =============================================

create type tone_preference as enum ('ROAST', 'HYPE', 'BALANCE');
create type life_situation  as enum ('STUDENT', 'WORKING', 'FREELANCE', 'HOME');
create type task_status     as enum ('PENDING', 'DONE', 'SKIPPED');
create type task_priority   as enum ('HIGH', 'MEDIUM', 'LOW');
create type task_created_via as enum ('MANUAL', 'VOICE', 'SUGGESTION');
create type energy_level    as enum ('LOW', 'MEDIUM', 'HIGH');
create type suggestion_status as enum ('PENDING', 'ACCEPTED', 'DISMISSED', 'SAVED');
create type reward_type     as enum ('STREAK', 'TASK_COMPLETE', 'MILESTONE', 'SUGGESTION_ACCEPTED');
create type unlockable_type as enum ('THEME', 'ORB_SKIN', 'VOICE_MODE');
create type lampy_mode      as enum ('ROAST', 'HYPE', 'REAL');
create type lampy_trigger   as enum ('OVERDUE', 'STREAK', 'INACTIVITY', 'CHECKIN', 'MILESTONE');

-- =============================================
-- 1. Users
-- =============================================

create table public.users (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null default '',
  email             text not null unique,
  created_at        timestamptz not null default now(),
  tone_preference   tone_preference not null default 'BALANCE',
  wake_time         text not null default '07:00',
  sleep_time        text not null default '23:00',
  life_situation    life_situation not null default 'WORKING',
  interests         text[] not null default '{}',
  current_orb_level int not null default 1,
  total_points      int not null default 0,
  longest_streak    int not null default 0,
  current_streak    int not null default 0
);

-- Link to Supabase Auth — auto-create user row on sign-up
-- (handled by trigger below)

-- =============================================
-- 2. Tasks
-- =============================================

create table public.tasks (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  title             text not null,
  notes             text,
  status            task_status not null default 'PENDING',
  priority          task_priority not null default 'MEDIUM',
  due_date          date,
  due_time          text,                -- "14:30" format
  estimated_minutes int,

  -- Recurring
  is_recurring      boolean not null default false,
  recurrence_rule   text,                -- iCal RRULE format
  parent_task_id    uuid references public.tasks(id) on delete set null,

  -- AI metadata
  times_rescheduled int not null default 0,
  created_via       task_created_via not null default 'MANUAL',

  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_status  on public.tasks(status);
create index idx_tasks_due     on public.tasks(due_date);

-- =============================================
-- 3. Energy Check-ins
-- =============================================

create table public.energy_checkins (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references public.users(id) on delete cascade,
  level     energy_level not null,
  date      date not null,
  logged_at timestamptz not null default now(),

  -- One check-in per user per day
  unique (user_id, date)
);

create index idx_energy_user_date on public.energy_checkins(user_id, date);

-- =============================================
-- 4. Suggestions
-- =============================================

create table public.suggestions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  content      text not null,
  category     text not null,
  based_on     text[] not null default '{}',
  status       suggestion_status not null default 'PENDING',
  generated_at timestamptz not null default now(),
  responded_at timestamptz,
  task_id      uuid references public.tasks(id) on delete set null
);

create index idx_suggestions_user on public.suggestions(user_id);

-- =============================================
-- 5. Rewards
-- =============================================

create table public.rewards (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  type          reward_type not null,
  points_earned int not null default 0,
  description   text not null default '',
  earned_at     timestamptz not null default now()
);

create index idx_rewards_user on public.rewards(user_id);
create index idx_rewards_earned on public.rewards(earned_at desc);

-- =============================================
-- 6. Unlockables (catalog — shared across all users)
-- =============================================

create table public.unlockables (
  id              text primary key,    -- e.g. 'theme-ocean'
  name            text not null,
  type            unlockable_type not null,
  cost_points     int not null default 0,
  required_streak int,
  required_level  int,
  is_default      boolean not null default false
);

-- =============================================
-- 7. User Unlockables (join table — what each user owns)
-- =============================================

create table public.user_unlockables (
  user_id       uuid not null references public.users(id) on delete cascade,
  unlockable_id text not null references public.unlockables(id) on delete cascade,
  unlocked_at   timestamptz not null default now(),
  is_active     boolean not null default false,

  primary key (user_id, unlockable_id)
);

create index idx_user_unlockables_user on public.user_unlockables(user_id);

-- =============================================
-- 8. Lampy Messages (motivation log)
-- =============================================

create table public.lampy_messages (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  content      text not null,
  mode         lampy_mode not null,
  trigger      lampy_trigger not null,
  delivered_at timestamptz not null default now(),
  was_opened   boolean not null default false
);

create index idx_messages_user on public.lampy_messages(user_id);
create index idx_messages_delivered on public.lampy_messages(delivered_at desc);

-- =============================================
-- Auto-create user row on Supabase Auth sign-up
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
