// ============================================
// Lampy — Rewards Hook
// ============================================
// Points, streaks, orb evolution, and unlockable
// management. Syncs with Supabase.

import { useCallback, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import type { Reward, RewardType, Unlockable, UserUnlockable } from '@/types';

// =============================================
// Points Configuration
// =============================================

const POINTS = {
  TASK_COMPLETE: 10,
  TASK_HIGH_PRIORITY: 5,      // Bonus for completing HIGH priority
  STREAK_3: 25,
  STREAK_7: 75,
  STREAK_14: 150,
  STREAK_21: 300,
  STREAK_30: 500,
  STREAK_50: 1000,
  STREAK_100: 2500,
  SUGGESTION_ACCEPTED: 15,
  FIRST_TASK_OF_DAY: 5,
} as const;

// Orb level thresholds — total points needed to reach each level
const ORB_LEVELS = [
  { level: 1, points: 0 },
  { level: 2, points: 50 },
  { level: 3, points: 150 },
  { level: 4, points: 350 },
  { level: 5, points: 600 },
  { level: 6, points: 1000 },
  { level: 7, points: 1500 },
  { level: 8, points: 2500 },
  { level: 9, points: 4000 },
  { level: 10, points: 6000 },
] as const;

// Streak milestones that trigger rewards
const STREAK_MILESTONES: Record<number, number> = {
  3: POINTS.STREAK_3,
  7: POINTS.STREAK_7,
  14: POINTS.STREAK_14,
  21: POINTS.STREAK_21,
  30: POINTS.STREAK_30,
  50: POINTS.STREAK_50,
  100: POINTS.STREAK_100,
};

// =============================================
// Built-in Unlockables Catalog
// =============================================

export const UNLOCKABLES_CATALOG: Unlockable[] = [
  // --- Themes ---
  { id: 'theme-default', name: 'Classic Orange', type: 'THEME', cost_points: 0, is_default: true },
  { id: 'theme-ocean', name: 'Deep Ocean', type: 'THEME', cost_points: 100, is_default: false },
  { id: 'theme-forest', name: 'Forest Green', type: 'THEME', cost_points: 200, is_default: false },
  { id: 'theme-sunset', name: 'Sunset Blaze', type: 'THEME', cost_points: 350, is_default: false },
  { id: 'theme-midnight', name: 'Midnight Purple', type: 'THEME', cost_points: 500, required_streak: 7, is_default: false },
  { id: 'theme-gold', name: 'Solid Gold', type: 'THEME', cost_points: 1000, required_streak: 14, is_default: false },

  // --- Orb Skins ---
  { id: 'orb-default', name: 'Classic Glow', type: 'ORB_SKIN', cost_points: 0, is_default: true },
  { id: 'orb-crystal', name: 'Crystal Pulse', type: 'ORB_SKIN', cost_points: 150, is_default: false },
  { id: 'orb-fire', name: 'Ember Core', type: 'ORB_SKIN', cost_points: 300, is_default: false },
  { id: 'orb-galaxy', name: 'Galaxy Swirl', type: 'ORB_SKIN', cost_points: 500, required_streak: 14, is_default: false },
  { id: 'orb-aurora', name: 'Northern Lights', type: 'ORB_SKIN', cost_points: 750, required_streak: 21, is_default: false },
  { id: 'orb-nebula', name: 'Nebula', type: 'ORB_SKIN', cost_points: 1500, required_streak: 30, is_default: false },

  // --- Voice Modes ---
  { id: 'voice-default', name: 'Standard Voice', type: 'VOICE_MODE', cost_points: 0, is_default: true },
  { id: 'voice-chill', name: 'Extra Chill', type: 'VOICE_MODE', cost_points: 200, is_default: false },
  { id: 'voice-sarcastic', name: 'Maximum Sarcasm', type: 'VOICE_MODE', cost_points: 400, required_streak: 7, is_default: false },
  { id: 'voice-drill-sergeant', name: 'Drill Sergeant', type: 'VOICE_MODE', cost_points: 600, required_streak: 14, is_default: false },
  { id: 'voice-silence', name: 'Silence Roast Day Pass', type: 'VOICE_MODE', cost_points: 100, is_default: false },
];

// =============================================
// Hook
// =============================================

export function useRewards() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const rewards = useUserStore((s) => s.rewards);
  const addReward = useUserStore((s) => s.addReward);
  const setRewards = useUserStore((s) => s.setRewards);
  const setOrbState = useUserStore((s) => s.setOrbState);
  const unlocked = useUserStore((s) => s.unlocked);
  const setUnlocked = useUserStore((s) => s.setUnlocked);
  const addUnlocked = useUserStore((s) => s.addUnlocked);
  const tasks = useUserStore((s) => s.tasks);

  // Track if we've already rewarded the first task today
  const firstTaskRewardedToday = useRef<string | null>(null);

  // ---- Fetch rewards from Supabase ----
  const fetchRewards = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch rewards:', error);
      return;
    }
    if (data) setRewards(data);
  }, [user, setRewards]);

  // ---- Fetch user's unlocked items ----
  const fetchUnlocked = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_unlockables')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch unlockables:', error);
      return;
    }
    if (data) setUnlocked(data);
  }, [user, setUnlocked]);

  // ---- Award points (creates reward record) ----
  const awardPoints = useCallback(
    async (
      type: RewardType,
      points: number,
      description: string
    ): Promise<Reward | null> => {
      if (!user) return null;

      const reward: Reward = {
        id: crypto.randomUUID?.() ?? `reward-${Date.now()}`,
        user_id: user.id,
        type,
        points_earned: points,
        description,
        earned_at: new Date().toISOString(),
      };

      // Optimistic update — addReward also bumps user.total_points
      addReward(reward);

      // Check for level up after adding points
      const newTotal = (user.total_points ?? 0) + points;
      const currentLevel = user.current_orb_level ?? 1;
      const newLevel = calculateOrbLevel(newTotal);

      if (newLevel > currentLevel) {
        // Level up! Update user and trigger milestone animation
        const updates = {
          ...user,
          total_points: newTotal,
          current_orb_level: newLevel,
        };
        setUser(updates);
        setOrbState('MILESTONE');

        // Reset orb state after animation
        setTimeout(() => {
          const checkinLevel = useUserStore.getState().todayCheckin?.level;
          setOrbState(checkinLevel ?? 'IDLE');
        }, 3000);

        // Persist level up
        await supabase
          .from('users')
          .update({ current_orb_level: newLevel, total_points: newTotal })
          .eq('id', user.id);
      } else {
        // Just update points
        await supabase
          .from('users')
          .update({ total_points: newTotal })
          .eq('id', user.id);
      }

      // Persist reward
      const { error } = await supabase.from('rewards').insert(reward);
      if (error) {
        console.error('Failed to save reward:', error);
      }

      return reward;
    },
    [user, addReward, setUser, setOrbState]
  );

  // ---- Reward for completing a task ----
  const rewardTaskComplete = useCallback(
    async (taskId: string) => {
      if (!user) return null;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return null;

      let points = POINTS.TASK_COMPLETE;
      let desc = `Completed "${task.title}"`;

      // Bonus for high priority
      if (task.priority === 'HIGH') {
        points += POINTS.TASK_HIGH_PRIORITY;
        desc += ' (High priority bonus!)';
      }

      // First task of the day bonus
      const today = new Date().toISOString().split('T')[0];
      if (firstTaskRewardedToday.current !== today) {
        const completedToday = tasks.filter(
          (t) => t.status === 'DONE' && t.completed_at?.startsWith(today)
        );
        // If this is the first completion today (including the one we just completed)
        if (completedToday.length <= 1) {
          points += POINTS.FIRST_TASK_OF_DAY;
          desc += ' First task of the day!';
          firstTaskRewardedToday.current = today;
        }
      }

      return awardPoints('TASK_COMPLETE', points, desc);
    },
    [user, tasks, awardPoints]
  );

  // ---- Check and reward streak milestones ----
  const checkStreakMilestone = useCallback(
    async (streak: number) => {
      if (!user) return null;

      const bonus = STREAK_MILESTONES[streak];
      if (!bonus) return null;

      // Check if we already rewarded this streak milestone
      const existing = rewards.find(
        (r) =>
          r.type === 'STREAK' &&
          r.description.includes(`${streak}-day`)
      );
      if (existing) return null;

      return awardPoints(
        'STREAK',
        bonus,
        `${streak}-day streak! Keep it going!`
      );
    },
    [user, rewards, awardPoints]
  );

  // ---- Reward for accepting a suggestion ----
  const rewardSuggestionAccepted = useCallback(
    async (suggestionContent: string) => {
      return awardPoints(
        'SUGGESTION_ACCEPTED',
        POINTS.SUGGESTION_ACCEPTED,
        `Accepted suggestion: "${suggestionContent.substring(0, 40)}..."`
      );
    },
    [awardPoints]
  );

  // ---- Update streak (called on task complete) ----
  const updateStreak = useCallback(async () => {
    if (!user) return;

    // Use local date to avoid timezone issues
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Guard: already counted today
    if (user.last_streak_date === today) return;

    const completedToday = tasks.filter(
      (t) => t.status === 'DONE' && t.completed_at?.startsWith(today)
    );

    if (completedToday.length === 0) return;

    // Check if yesterday had activity (streak continuation vs reset)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let newStreak: number;
    if (user.last_streak_date === yesterdayStr) {
      // Consecutive day — continue streak
      newStreak = (user.current_streak ?? 0) + 1;
    } else if (!user.last_streak_date) {
      // First ever streak day
      newStreak = 1;
    } else {
      // Missed a day — reset streak
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, user.longest_streak ?? 0);

    const updates = {
      ...user,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_streak_date: today,
    };

    setUser(updates);

    // Check for streak milestone
    await checkStreakMilestone(newStreak);

    // Persist
    await supabase
      .from('users')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_streak_date: today,
      })
      .eq('id', user.id);
  }, [user, tasks, setUser, checkStreakMilestone]);

  // ---- Purchase / unlock an item ----
  const purchaseUnlockable = useCallback(
    async (unlockable: Unlockable): Promise<boolean> => {
      if (!user) return false;

      // Check if already owned
      const isOwned = unlocked.some(
        (u) => u.unlockable_id === unlockable.id
      );
      if (isOwned) return false;

      // Check if user has enough points
      if ((user.total_points ?? 0) < unlockable.cost_points) return false;

      // Check streak requirement
      if (
        unlockable.required_streak &&
        (user.longest_streak ?? 0) < unlockable.required_streak
      ) {
        return false;
      }

      // Deduct points
      const newPoints = (user.total_points ?? 0) - unlockable.cost_points;
      setUser({ ...user, total_points: newPoints });

      // Create unlock record
      const record: UserUnlockable = {
        user_id: user.id,
        unlockable_id: unlockable.id,
        unlocked_at: new Date().toISOString(),
        is_active: false,
      };

      addUnlocked(record);

      // Persist
      await Promise.all([
        supabase
          .from('users')
          .update({ total_points: newPoints })
          .eq('id', user.id),
        supabase.from('user_unlockables').insert(record),
      ]);

      // Trigger milestone animation for unlock
      setOrbState('MILESTONE');
      setTimeout(() => {
        const checkinLevel = useUserStore.getState().todayCheckin?.level;
        setOrbState(checkinLevel ?? 'IDLE');
      }, 2500);

      return true;
    },
    [user, unlocked, setUser, addUnlocked, setOrbState]
  );

  // ---- Activate an unlockable (set as active, deactivate others of same type) ----
  const activateUnlockable = useCallback(
    async (unlockableId: string) => {
      if (!user) return;

      const item = UNLOCKABLES_CATALOG.find((u) => u.id === unlockableId);
      if (!item) return;

      // Deactivate all of same type, activate this one
      const updated = unlocked.map((u) => {
        const catalog = UNLOCKABLES_CATALOG.find(
          (c) => c.id === u.unlockable_id
        );
        if (!catalog) return u;

        if (catalog.type === item.type) {
          return {
            ...u,
            is_active: u.unlockable_id === unlockableId,
          };
        }
        return u;
      });

      setUnlocked(updated);

      // Persist
      // First deactivate all of same type
      await supabase
        .from('user_unlockables')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .in(
          'unlockable_id',
          UNLOCKABLES_CATALOG.filter((c) => c.type === item.type).map(
            (c) => c.id
          )
        );

      // Then activate the selected one
      await supabase
        .from('user_unlockables')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('unlockable_id', unlockableId);
    },
    [user, unlocked, setUnlocked]
  );

  // ---- Calculate orb level from total points ----
  function calculateOrbLevel(totalPoints: number): number {
    let level = 1;
    for (const entry of ORB_LEVELS) {
      if (totalPoints >= entry.points) {
        level = entry.level;
      }
    }
    return level;
  }

  // ---- Get progress to next level ----
  const getLevelProgress = useCallback(() => {
    const total = user?.total_points ?? 0;
    const currentLevel = user?.current_orb_level ?? 1;
    const currentEntry = ORB_LEVELS.find((l) => l.level === currentLevel);
    const nextEntry = ORB_LEVELS.find((l) => l.level === currentLevel + 1);

    if (!nextEntry) {
      return { current: total, needed: total, progress: 1, isMaxLevel: true };
    }

    const currentThreshold = currentEntry?.points ?? 0;
    const nextThreshold = nextEntry.points;
    const progressPoints = total - currentThreshold;
    const neededPoints = nextThreshold - currentThreshold;

    return {
      current: progressPoints,
      needed: neededPoints,
      progress: Math.min(progressPoints / neededPoints, 1),
      isMaxLevel: false,
    };
  }, [user]);

  // ---- Get catalog items with ownership status ----
  const getCatalogWithStatus = useCallback(() => {
    return UNLOCKABLES_CATALOG.map((item) => {
      const userItem = unlocked.find((u) => u.unlockable_id === item.id);
      const isOwned = !!userItem || item.is_default;
      const isActive = userItem?.is_active ?? item.is_default;
      const canAfford = (user?.total_points ?? 0) >= item.cost_points;
      const meetsStreak =
        !item.required_streak ||
        (user?.longest_streak ?? 0) >= item.required_streak;

      return {
        ...item,
        isOwned,
        isActive,
        canAfford,
        meetsStreak,
        canPurchase: !isOwned && canAfford && meetsStreak,
      };
    });
  }, [user, unlocked]);

  return {
    rewards,
    unlocked,
    fetchRewards,
    fetchUnlocked,
    awardPoints,
    rewardTaskComplete,
    rewardSuggestionAccepted,
    checkStreakMilestone,
    updateStreak,
    purchaseUnlockable,
    activateUnlockable,
    getLevelProgress,
    getCatalogWithStatus,
    UNLOCKABLES_CATALOG,
    ORB_LEVELS,
  };
}
