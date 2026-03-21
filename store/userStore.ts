// ============================================
// Lampy — Global User Store (Zustand)
// ============================================
// Central state for user data, tasks, energy,
// suggestions, rewards, and Lampy messages.

import { create } from 'zustand';
import { getLocalToday } from '@/lib/date';
import type {
  User,
  Task,
  EnergyCheckin,
  Suggestion,
  Reward,
  LampyMessage,
  EnergyLevel,
  OrbState,
  OnboardingData,
  TonePreference,
  TaskStatus,
  SuggestionStatus,
  UserUnlockable,
} from '@/types';

// --- Store Interface ---

interface UserState {
  // Auth
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;

  // Onboarding (temporary, before account creation)
  onboardingData: Partial<OnboardingData>;

  // Core data
  tasks: Task[];
  todayCheckin: EnergyCheckin | null;
  suggestions: Suggestion[];
  rewards: Reward[];
  messages: LampyMessage[];
  unlocked: UserUnlockable[];

  // UI state
  orbState: OrbState;
  showEnergyCheckin: boolean;
  activeLampyMessage: LampyMessage | null;
  errorToast: string | null;

  // --- Auth Actions ---
  setUser: (user: User) => void;
  clearUser: () => void;
  setOnboarded: (value: boolean) => void;

  // --- Onboarding Actions ---
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;

  // --- Task Actions ---
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  completeTask: (id: string) => void;
  skipTask: (id: string) => void;

  // --- Energy Actions ---
  setTodayCheckin: (checkin: EnergyCheckin) => void;
  setShowEnergyCheckin: (show: boolean) => void;

  // --- Orb Actions ---
  setOrbState: (state: OrbState) => void;

  // --- Suggestion Actions ---
  setSuggestions: (suggestions: Suggestion[]) => void;
  updateSuggestionStatus: (id: string, status: SuggestionStatus, taskId?: string) => void;

  // --- Reward Actions ---
  addReward: (reward: Reward) => void;
  setRewards: (rewards: Reward[]) => void;

  // --- Lampy Message Actions ---
  setActiveLampyMessage: (message: LampyMessage | null) => void;
  dismissLampyMessage: () => void;

  // --- Unlockable Actions ---
  setUnlocked: (unlocked: UserUnlockable[]) => void;
  addUnlocked: (unlockable: UserUnlockable) => void;

  // --- Error Toast ---
  showErrorToast: (message: string) => void;
  dismissErrorToast: () => void;

  // --- Computed Helpers ---
  getTodayTasks: () => Task[];
  getPendingTasks: () => Task[];
  getStreak: () => number;
}

// --- Store Implementation ---

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
  onboardingData: {},
  tasks: [],
  todayCheckin: null,
  suggestions: [],
  rewards: [],
  messages: [],
  unlocked: [],
  orbState: 'IDLE',
  showEnergyCheckin: false,
  activeLampyMessage: null,
  errorToast: null,

  // --- Auth Actions ---
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({
    user: null,
    isAuthenticated: false,
    tasks: [],
    suggestions: [],
    rewards: [],
    messages: [],
    unlocked: [],
    todayCheckin: null,
    orbState: 'IDLE',
  }),
  setOnboarded: (value) => set({ isOnboarded: value }),

  // --- Onboarding Actions ---
  updateOnboarding: (data) => set((state) => ({
    onboardingData: { ...state.onboardingData, ...data },
  })),
  resetOnboarding: () => set({ onboardingData: {} }),

  // --- Task Actions ---
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { ...t, status: 'DONE' as TaskStatus, completed_at: new Date().toISOString() }
        : t
    ),
  })),
  skipTask: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, status: 'SKIPPED' as TaskStatus } : t
    ),
  })),

  // --- Energy Actions ---
  setTodayCheckin: (checkin) => {
    const orbState: OrbState = checkin.level;
    set({ todayCheckin: checkin, orbState, showEnergyCheckin: false });
  },
  setShowEnergyCheckin: (show) => set({ showEnergyCheckin: show }),

  // --- Orb Actions ---
  setOrbState: (state) => set({ orbState: state }),

  // --- Suggestion Actions ---
  setSuggestions: (suggestions) => set({ suggestions }),
  updateSuggestionStatus: (id, status, taskId) => set((state) => ({
    suggestions: state.suggestions.map((s) =>
      s.id === id ? { ...s, status, task_id: taskId, responded_at: new Date().toISOString() } : s
    ),
  })),

  // --- Reward Actions ---
  addReward: (reward) => set((state) => ({
    rewards: [reward, ...state.rewards],
    user: state.user
      ? { ...state.user, total_points: state.user.total_points + reward.points_earned }
      : null,
  })),
  setRewards: (rewards) => set({ rewards }),

  // --- Lampy Message Actions ---
  setActiveLampyMessage: (message) => set({ activeLampyMessage: message }),
  dismissLampyMessage: () => set({ activeLampyMessage: null }),

  // --- Unlockable Actions ---
  setUnlocked: (unlocked) => set({ unlocked }),
  addUnlocked: (unlockable) => set((state) => ({
    unlocked: [...state.unlocked, unlockable],
  })),

  // --- Error Toast ---
  showErrorToast: (message) => set({ errorToast: message }),
  dismissErrorToast: () => set({ errorToast: null }),

  // --- Computed Helpers ---
  getTodayTasks: () => {
    const today = getLocalToday();
    return get().tasks.filter(
      (t) => t.status === 'PENDING' && t.due_date === today
    );
  },
  getPendingTasks: () => {
    return get().tasks.filter((t) => t.status === 'PENDING');
  },
  getStreak: () => {
    return get().user?.current_streak ?? 0;
  },
}));
