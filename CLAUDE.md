# Lampy — Project Memory

## What Is Lampy
AI-powered mobile planner app that suggests fresh activities, roasts/hypes users like Duolingo, and rewards task completion. Built for burned-out working professionals (25-32) who want their routine to feel interesting again.

## Core Identity
- **Mascot**: Abstract glow orb (no face, no literal lamp) — shifts color based on user energy/state
- **Personality**: Three voice modes — Roast (playful sarcasm), Hype (sharp encouragement), Real (gentle when user is low)
- **Voice rules**: Always short (max 2 sentences), always references real data, never vague, never mean

## Tech Stack
- React Native + Expo SDK 55 + TypeScript
- Expo Router (file-based routing, 4 tabs: Home, Tasks, Rewards, Profile)
- Zustand (state management)
- Supabase (auth + PostgreSQL + edge functions)
- Anthropic Claude API (Haiku for motivations, Sonnet for suggestions)
- React Native Reanimated 3 (orb animations)

## V1 Features
1. Quick Task Capture (NLP-powered)
2. Recurring Tasks (iCal RRULE)
3. Daily Focus View (max 5 tasks)
4. Energy Check-in (Low/Medium/High)
5. AI Motivation Engine (Roast/Hype/Real)
6. Reward System Phase 1 (points, streaks, orb evolution, unlockables)
7. AI Fresh Suggestions (based on free time + interests + patterns)
8. 7-Screen Onboarding (conversational, not form-like)
9. Home Screen Widget (top 3 tasks + orb)

## V1.5 (Post-Launch — DO NOT BUILD YET)
- Focus Timer (Pomodoro), AI Chat Mode, Weekly Review, Habit Tracking, Web App, Reward Phase 2

## Reward System Phases
- Phase 1 (V1): Virtual — orb levels, themes, skins, voice modes, "silence roast" pass
- Phase 2 (Growth): Deeper unlockables tied to streaks
- Phase 3 (Monetization): Partner deals (fitness, food, learning)

## Build Progress
- [x] Phase 1 — Scaffold (Expo init, types, Zustand store, theme, orb colors, tab screens)
- [x] Phase 2 — Auth + Onboarding (login, 7-screen onboarding, auth routing)
- [x] Phase 3 — Core Task System (CRUD, NLP parsing, quick-add, task card, recurrence, detail/edit screens)
- [x] Phase 4 — Home + Daily Focus (energy check-in modal, Lampy banner, energy-aware task limits)
- [x] Phase 5 — Orb Component (animated pulse/glow/color transitions with Reanimated, milestone burst)
- [x] Phase 6 — AI Features (Supabase Edge Functions, suggestions, motivations, 120+ local fallbacks)
- [x] Phase 7 — Notifications (local scheduling, 4 trigger types, quiet hours, personality-driven)
- [x] Phase 8 — Reward System (points, streaks, orb levels, unlockables gallery, celebration modals)
- [ ] Phase 9 — Home Screen Widget
- [ ] Phase 10 — Profile + Settings
- [ ] Phase 11 — Polish

## Key Files
- `types/index.ts` — All TypeScript interfaces
- `store/userStore.ts` — Zustand global store
- `constants/theme.ts` — Design system (colors, spacing, typography)
- `constants/lampy-messages.ts` — Roast/Hype/Real message templates
- `components/orb/OrbColors.ts` — Orb color states + animation configs
- `components/orb/LampyOrb.tsx` — Animated glow orb (Reanimated) + LampyOrbMini
- `components/checkin/EnergyCheckin.tsx` — Morning energy check-in modal
- `components/lampy/LampyBanner.tsx` — Animated slide-in motivation banner
- `hooks/useEnergy.ts` — Energy check-in hook with Supabase sync
- `lib/supabase.ts` — Supabase client
- `lib/ai.ts` — NLP task parsing + AI suggestion/motivation generation (local fallbacks)
- `lib/notifications.ts` — Notification scheduling, triggers, quiet hours
- `hooks/useNotifications.ts` — Foreground listener, tap handler, auto-refresh
- `hooks/useSuggestions.ts` — Suggestion CRUD, max 1/day, accept→task
- `hooks/useRewards.ts` — Points, streaks, orb levels, unlockable purchases
- `components/suggestions/SuggestionCard.tsx` — Accept/dismiss/save suggestion
- `components/rewards/RewardModal.tsx` — Reward celebration + unlock reveal + level up modals
- `supabase/functions/lampy-ai/index.ts` — Edge Function Claude API proxy
- `hooks/useTasks.ts` — Task CRUD hook with Supabase sync
- `components/tasks/TaskCard.tsx` — Task display card
- `components/tasks/TaskQuickAdd.tsx` — Floating add button + NLP input
- `components/tasks/RecurrenceSelector.tsx` — Recurring rule picker
- `app/task/[id].tsx` — Task detail screen
- `app/task/edit/[id].tsx` — Task edit screen
- `app/(auth)/login.tsx` — Supabase email auth
- `app/(auth)/onboarding/*.tsx` — 7-screen onboarding flow

## GitHub
- Repo: https://github.com/handsmaple/Lampy
- Author: Udef Hans <udefed@gmail.com>
- PR workflow: feature branch → PR → merge to master

## User Preferences
- User is the product owner, NOT a developer — explain everything in plain terms
- Never start coding before user says so
- When multiple tasks collide, list them with priority evaluation and let user choose
- Always present recommended priority order

## Tools Available
- GitHub CLI: C:\Users\USER\Desktop\gh-cli\bin\gh.exe
- Node.js: C:\Program Files\nodejs (added to user PATH)
- Expo dev server: npx expo start
