-- ============================================
-- Lampy — Row Level Security Policies
-- ============================================
-- Every table is locked down so users can only
-- read/write their own data. The unlockables
-- catalog is read-only for everyone.

-- =============================================
-- Enable RLS on all tables
-- =============================================

alter table public.users           enable row level security;
alter table public.tasks            enable row level security;
alter table public.energy_checkins  enable row level security;
alter table public.suggestions      enable row level security;
alter table public.rewards          enable row level security;
alter table public.unlockables      enable row level security;
alter table public.user_unlockables enable row level security;
alter table public.lampy_messages   enable row level security;

-- =============================================
-- Users — own row only
-- =============================================

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Insert is handled by the auth trigger (security definer),
-- so no insert policy needed for regular users.

-- =============================================
-- Tasks — own tasks only
-- =============================================

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- =============================================
-- Energy Check-ins — own data only
-- =============================================

create policy "Users can view own checkins"
  on public.energy_checkins for select
  using (auth.uid() = user_id);

create policy "Users can create own checkins"
  on public.energy_checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checkins"
  on public.energy_checkins for update
  using (auth.uid() = user_id);

-- =============================================
-- Suggestions — own suggestions only
-- =============================================

create policy "Users can view own suggestions"
  on public.suggestions for select
  using (auth.uid() = user_id);

create policy "Users can create own suggestions"
  on public.suggestions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own suggestions"
  on public.suggestions for update
  using (auth.uid() = user_id);

-- =============================================
-- Rewards — own rewards only
-- =============================================

create policy "Users can view own rewards"
  on public.rewards for select
  using (auth.uid() = user_id);

create policy "Users can create own rewards"
  on public.rewards for insert
  with check (auth.uid() = user_id);

-- No update/delete — rewards are permanent records

-- =============================================
-- Unlockables catalog — read-only for all authenticated users
-- =============================================

create policy "Anyone can view unlockables catalog"
  on public.unlockables for select
  using (auth.role() = 'authenticated');

-- Only admins (via Supabase dashboard) manage the catalog.
-- No insert/update/delete policies for regular users.

-- =============================================
-- User Unlockables — own unlocks only
-- =============================================

create policy "Users can view own unlocks"
  on public.user_unlockables for select
  using (auth.uid() = user_id);

create policy "Users can create own unlocks"
  on public.user_unlockables for insert
  with check (auth.uid() = user_id);

create policy "Users can update own unlocks"
  on public.user_unlockables for update
  using (auth.uid() = user_id);

-- =============================================
-- Lampy Messages — own messages only
-- =============================================

create policy "Users can view own messages"
  on public.lampy_messages for select
  using (auth.uid() = user_id);

create policy "Users can create own messages"
  on public.lampy_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own messages"
  on public.lampy_messages for update
  using (auth.uid() = user_id);
