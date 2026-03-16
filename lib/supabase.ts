// ============================================
// Lampy — Supabase Client
// ============================================
// Initialize Supabase client for auth, database, and edge functions.
// IMPORTANT: Replace these with your actual Supabase project credentials.

import { createClient } from '@supabase/supabase-js';

// TODO: Move these to environment variables before production
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
