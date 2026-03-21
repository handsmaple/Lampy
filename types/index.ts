// ============================================
// Lampy — Core TypeScript Types
// ============================================

// --- Enums ---

export type TonePreference = 'ROAST' | 'HYPE' | 'BALANCE';

export type LifeSituation = 'STUDENT' | 'WORKING' | 'FREELANCE' | 'HOME';

export type TaskStatus = 'PENDING' | 'DONE' | 'SKIPPED';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskCreatedVia = 'MANUAL' | 'VOICE' | 'SUGGESTION';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'SAVED';

export type RewardType = 'STREAK' | 'TASK_COMPLETE' | 'MILESTONE' | 'SUGGESTION_ACCEPTED';

export type UnlockableType = 'THEME' | 'ORB_SKIN' | 'VOICE_MODE';

export type RoastIntensity = 'MILD' | 'MEDIUM' | 'SPICY';

export type LampyMode = 'ROAST' | 'HYPE' | 'REAL';

export type LampyTrigger = 'OVERDUE' | 'STREAK' | 'INACTIVITY' | 'CHECKIN' | 'MILESTONE';

export type OrbState = 'LOW' | 'MEDIUM' | 'HIGH' | 'IDLE' | 'MILESTONE';

// --- Interest Tags ---

export const INTEREST_TAGS = [
  'fitness',
  'music',
  'cooking',
  'reading',
  'gaming',
  'travel',
  'art',
  'side-projects',
  'mindfulness',
  'learning',
  'social',
  'outdoors',
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];

// --- Data Models ---

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  tone_preference: TonePreference;
  wake_time: string; // "07:00" format
  sleep_time: string; // "23:00" format
  life_situation: LifeSituation;
  interests: InterestTag[];
  current_orb_level: number;
  total_points: number;
  longest_streak: number;
  current_streak: number;
  last_streak_date?: string; // ISO date "YYYY-MM-DD"
  roast_intensity: RoastIntensity;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string; // ISO date string
  due_time?: string; // "14:30" format
  estimated_minutes?: number;

  // Recurring
  is_recurring: boolean;
  recurrence_rule?: string; // iCal RRULE format
  parent_task_id?: string;

  // AI metadata
  times_rescheduled: number;
  created_via: TaskCreatedVia;

  created_at: string;
  completed_at?: string;
}

export interface EnergyCheckin {
  id: string;
  user_id: string;
  level: EnergyLevel;
  date: string; // ISO date
  logged_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  content: string;
  category: string;
  based_on: string[];
  status: SuggestionStatus;
  generated_at: string;
  responded_at?: string;
  task_id?: string;
}

export interface Reward {
  id: string;
  user_id: string;
  type: RewardType;
  points_earned: number;
  description: string;
  earned_at: string;
}

export interface Unlockable {
  id: string;
  name: string;
  type: UnlockableType;
  cost_points: number;
  required_streak?: number;
  required_level?: number;
  is_default: boolean;
}

export interface UserUnlockable {
  user_id: string;
  unlockable_id: string;
  unlocked_at: string;
  is_active: boolean;
}

export interface LampyMessage {
  id: string;
  user_id: string;
  content: string;
  mode: LampyMode;
  trigger: LampyTrigger;
  delivered_at: string;
  was_opened: boolean;
}

// --- Onboarding State ---

export interface OnboardingData {
  name: string;
  tone_preference: TonePreference;
  life_situation: LifeSituation;
  interests: InterestTag[];
  first_task: string;
  wake_time: string;
  sleep_time: string;
}
