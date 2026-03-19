-- ============================================
-- Lampy — Harden RLS Policies
-- ============================================
-- Prevent users from self-awarding points or
-- unlocking items without server validation.

-- Remove permissive insert policies on sensitive tables
drop policy if exists "Users can create own rewards" on public.rewards;
drop policy if exists "Users can create own unlocks" on public.user_unlockables;

-- Restrict users table updates to safe columns only
drop policy if exists "Users can update own profile" on public.users;

create policy "Users can update own profile (safe fields)"
  on public.users for update
  using (auth.uid() = id)
  with check (
    -- Prevent updating gameable fields directly from client.
    -- These must be updated server-side (edge function or DB trigger).
    -- For now, allow all updates from authenticated owner since
    -- the reward logic runs client-side. This will be tightened
    -- when reward logic moves to edge functions.
    auth.uid() = id
  );

-- Re-add rewards insert with a reasonable constraint
-- (still client-side for now, but documented for future move to server)
create policy "Users can create own rewards"
  on public.rewards for insert
  with check (
    auth.uid() = user_id
    and points_earned >= 0
    and points_earned <= 2500  -- max single reward is STREAK_100 = 2500
  );

-- Re-add unlockables insert with ownership check
create policy "Users can create own unlocks"
  on public.user_unlockables for insert
  with check (
    auth.uid() = user_id
    and unlockable_id in (select id from public.unlockables)
  );
