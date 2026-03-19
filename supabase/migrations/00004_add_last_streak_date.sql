-- ============================================
-- Lampy — Add last_streak_date to users
-- ============================================
-- Tracks the last date the streak was incremented
-- to prevent double-counting within the same day.

alter table public.users
  add column if not exists last_streak_date date;
