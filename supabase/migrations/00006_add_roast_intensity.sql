-- Add roast_intensity column to users table
-- Defaults to 'MEDIUM' for existing users
alter table public.users
  add column if not exists roast_intensity text not null default 'MEDIUM'
  check (roast_intensity in ('MILD', 'MEDIUM', 'SPICY'));
