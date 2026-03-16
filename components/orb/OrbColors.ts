// ============================================
// Lampy — Orb Color System
// ============================================
// The orb is Lampy's visual identity. It shifts color
// based on user energy, activity, and milestones.

import { OrbState } from '@/types';

export interface OrbColorConfig {
  primary: string;       // Main glow color
  secondary: string;     // Outer glow / shadow color
  background: string;    // Subtle background tint
  pulseSpeed: number;    // Animation duration in ms (lower = faster)
  glowRadius: number;    // Shadow blur radius
  glowOpacity: number;   // Glow intensity (0-1)
}

export const ORB_COLORS: Record<OrbState, OrbColorConfig> = {
  LOW: {
    primary: '#5B8FB9',      // Muted cool blue
    secondary: '#3A6B8C',
    background: '#1A2F3F',
    pulseSpeed: 3000,         // Slow, calm pulse
    glowRadius: 20,
    glowOpacity: 0.4,
  },
  MEDIUM: {
    primary: '#F5A623',      // Warm amber
    secondary: '#D4891A',
    background: '#3F2F1A',
    pulseSpeed: 2000,         // Steady pulse
    glowRadius: 25,
    glowOpacity: 0.6,
  },
  HIGH: {
    primary: '#FF6B35',      // Bright orange-red
    secondary: '#E54D1B',
    background: '#3F1F15',
    pulseSpeed: 1200,         // Fast, energetic pulse
    glowRadius: 35,
    glowOpacity: 0.8,
  },
  IDLE: {
    primary: '#E8E8E8',      // Soft white
    secondary: '#B0B0B0',
    background: '#2A2A2A',
    pulseSpeed: 4000,         // Slow breathing
    glowRadius: 15,
    glowOpacity: 0.3,
  },
  MILESTONE: {
    primary: '#9B59B6',      // Deep violet
    secondary: '#7D3C98',
    background: '#2A1A3F',
    pulseSpeed: 800,          // Burst then settle
    glowRadius: 45,
    glowOpacity: 1.0,
  },
};

/**
 * Maps energy check-in level to orb state
 */
export function energyToOrbState(energy: 'LOW' | 'MEDIUM' | 'HIGH'): OrbState {
  return energy;
}

/**
 * Gets the orb config for a given state
 */
export function getOrbConfig(state: OrbState): OrbColorConfig {
  return ORB_COLORS[state];
}
