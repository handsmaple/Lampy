# Lampy — Supabase Setup Guide

Step-by-step instructions to get the backend running.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `lampy`) and set a database password
4. Select the region closest to your users
5. Wait for the project to provision (~2 minutes)

## 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy these two values:
   - **Project URL** — looks like `https://abcdefg.supabase.co`
   - **anon / public key** — starts with `eyJhbG...`

## 3. Set Up Environment Variables

1. Copy `.env.example` to `.env` in the project root:
   ```
   cp .env.example .env
   ```
2. Fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-key
   ```

## 4. Run Database Migrations

Option A — **SQL Editor** (easiest, no CLI needed):
1. In your Supabase dashboard, go to **SQL Editor**
2. Paste and run each file in order:
   - `supabase/migrations/00001_initial_schema.sql` — creates all tables
   - `supabase/migrations/00002_rls_policies.sql` — locks down access
   - `supabase/migrations/00003_seed_unlockables.sql` — adds the reward catalog

Option B — **Supabase CLI**:
```bash
# Install CLI (if not already)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## 5. Deploy the Edge Function

The AI proxy function keeps your Anthropic API key server-side.

```bash
# Set the API key as a secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...

# Deploy the function
supabase functions deploy lampy-ai
```

## 6. Disable Email Confirmation (recommended for dev)

1. In Supabase dashboard → **Authentication → Providers → Email**
2. Toggle OFF **"Confirm email"**
3. This lets you sign up and log in instantly during development

## 7. Verify Everything Works

1. Start the app: `npx expo start`
2. Sign up with any email/password
3. Check Supabase dashboard → **Table Editor → users** — your row should appear
4. Create a task in the app → check **tasks** table
5. If AI suggestions work, the Edge Function is connected

---

## Table Overview

| Table | Purpose |
|---|---|
| `users` | Profile, preferences, points, streaks |
| `tasks` | All tasks (one-time and recurring) |
| `energy_checkins` | Daily energy level log |
| `suggestions` | AI-generated activity suggestions |
| `rewards` | Points earned history |
| `unlockables` | Catalog of purchasable items |
| `user_unlockables` | What each user has unlocked |
| `lampy_messages` | Motivation message log |

## Security

- **RLS enabled** on all tables — users can only access their own data
- **Unlockables** catalog is read-only for all authenticated users
- **Anthropic API key** is stored as a Supabase secret, never in the app
- **Auth trigger** automatically creates a user row on sign-up
