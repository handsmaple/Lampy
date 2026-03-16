-- ============================================
-- Lampy — Seed: Default Unlockables Catalog
-- ============================================
-- These match the UNLOCKABLES_CATALOG in hooks/useRewards.ts.
-- Run once on a fresh database.

insert into public.unlockables (id, name, type, cost_points, required_streak, required_level, is_default) values
  -- Themes
  ('theme-default',    'Classic Orange',    'THEME',      0,    null, null, true),
  ('theme-ocean',      'Deep Ocean',        'THEME',    100,    null, null, false),
  ('theme-forest',     'Forest Green',      'THEME',    200,    null, null, false),
  ('theme-sunset',     'Sunset Blaze',      'THEME',    350,    null, null, false),
  ('theme-midnight',   'Midnight Purple',   'THEME',    500,       7, null, false),
  ('theme-gold',       'Solid Gold',        'THEME',   1000,      14, null, false),

  -- Orb Skins
  ('orb-default',      'Classic Glow',      'ORB_SKIN',   0,    null, null, true),
  ('orb-crystal',      'Crystal Pulse',     'ORB_SKIN', 150,    null, null, false),
  ('orb-fire',         'Ember Core',        'ORB_SKIN', 300,    null, null, false),
  ('orb-galaxy',       'Galaxy Swirl',      'ORB_SKIN', 500,      14, null, false),
  ('orb-aurora',       'Northern Lights',   'ORB_SKIN', 750,      21, null, false),
  ('orb-nebula',       'Nebula',            'ORB_SKIN',1500,      30, null, false),

  -- Voice Modes
  ('voice-default',        'Standard Voice',          'VOICE_MODE',   0, null, null, true),
  ('voice-chill',          'Extra Chill',             'VOICE_MODE', 200, null, null, false),
  ('voice-sarcastic',      'Maximum Sarcasm',         'VOICE_MODE', 400,    7, null, false),
  ('voice-drill-sergeant', 'Drill Sergeant',          'VOICE_MODE', 600,   14, null, false),
  ('voice-silence',        'Silence Roast Day Pass',  'VOICE_MODE', 100, null, null, false)
on conflict (id) do nothing;
