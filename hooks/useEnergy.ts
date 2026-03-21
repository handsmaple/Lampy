// ============================================
// Lampy — Energy Hook
// ============================================
// Manages daily energy check-ins with Supabase sync.
// Determines whether to show the morning check-in prompt.

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { getLocalToday } from '@/lib/date';
import type { EnergyCheckin, EnergyLevel } from '@/types';

export function useEnergy() {
  const user = useUserStore((s) => s.user);
  const todayCheckin = useUserStore((s) => s.todayCheckin);
  const setTodayCheckin = useUserStore((s) => s.setTodayCheckin);
  const setShowEnergyCheckin = useUserStore((s) => s.setShowEnergyCheckin);

  // Check if user already did today's check-in (fresh each render)
  const hasCheckedInToday = todayCheckin?.date === getLocalToday();

  // Fetch today's check-in from Supabase (called on app load)
  const fetchTodayCheckin = useCallback(async () => {
    if (!user) return;

    const today = getLocalToday();
    const { data, error } = await supabase
      .from('energy_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (data && !error) {
      setTodayCheckin(data);
    } else {
      // No check-in today → show prompt only within wake-time window
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [wakeH, wakeM] = (user.wake_time ?? '07:00').split(':').map(Number);
      const wakeMinutes = wakeH * 60 + wakeM;

      if (currentMinutes >= wakeMinutes && currentMinutes <= wakeMinutes + 120) {
        setShowEnergyCheckin(true);
      }
    }
  }, [user, setTodayCheckin, setShowEnergyCheckin]);

  // Submit today's energy level
  const submitCheckin = useCallback(
    async (level: EnergyLevel) => {
      if (!user) return;

      const today = getLocalToday();
      const checkin: EnergyCheckin = {
        id: crypto.randomUUID?.() ?? `checkin-${Date.now()}`,
        user_id: user.id,
        level,
        date: today,
        logged_at: new Date().toISOString(),
      };

      // Optimistic update — also updates orbState via store
      setTodayCheckin(checkin);

      const { error } = await supabase.from('energy_checkins').upsert(checkin);
      if (error) {
        console.error('Failed to save energy check-in:', error);
        Alert.alert('Error', 'Failed to save your energy check-in.');
      }
    },
    [user, setTodayCheckin]
  );

  // Determine if we should show the morning prompt
  // Show if: user exists, hasn't checked in today, and it's after their wake time
  const shouldShowCheckin = useCallback(() => {
    if (!user || hasCheckedInToday) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Parse wake_time (e.g., "07:00")
    const [wakeHour, wakeMinute] = (user.wake_time ?? '07:00').split(':').map(Number);

    // Show check-in from wake time until 2 hours after
    const wakeMinutes = wakeHour * 60 + wakeMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    const windowEnd = wakeMinutes + 120; // 2 hour window

    return currentMinutes >= wakeMinutes && currentMinutes <= windowEnd;
  }, [user, hasCheckedInToday]);

  return {
    todayCheckin,
    hasCheckedInToday,
    fetchTodayCheckin,
    submitCheckin,
    shouldShowCheckin,
  };
}
