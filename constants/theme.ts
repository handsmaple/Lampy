// ============================================
// Lampy — Theme Constants
// ============================================
// Design system: colors, spacing, typography, shadows

export const Colors = {
  // === Brand Colors ===
  brand: {
    primary: '#FF6B35',       // Lampy orange — energy, action
    secondary: '#F5A623',     // Warm amber — warmth, comfort
    accent: '#9B59B6',        // Violet — milestones, rewards
    blue: '#5B8FB9',          // Cool blue — calm, low energy
  },

  // === Light Theme ===
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    card: '#FFFFFF',
    cardBorder: '#F3F4F6',
    separator: '#E5E7EB',
    tint: '#FF6B35',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF6B35',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  // === Dark Theme ===
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    background: '#0F0F1A',
    backgroundSecondary: '#1A1A2E',
    card: '#1A1A2E',
    cardBorder: '#2D2D44',
    separator: '#2D2D44',
    tint: '#FF6B35',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FF6B35',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
} as const;

/** Theme color type — works for both light and dark */
export type ThemeColors = typeof Colors.light | typeof Colors.dark;

// === Spacing System ===
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// === Border Radius ===
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// === Typography ===
export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// === Shadows ===
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: (color: string, opacity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: 20,
    elevation: 8,
  }),
} as const;

// === Animation Durations ===
export const Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  pulse: {
    slow: 4000,
    normal: 2000,
    fast: 1200,
  },
} as const;
