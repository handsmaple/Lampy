// ============================================
// Lampy — Notifications Hook
// ============================================
// Manages notification permissions, scheduling,
// and handling notification responses (taps).

import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '@/store/userStore';
import {
  requestNotificationPermissions,
  evaluateAndScheduleNotifications,
} from '@/lib/notifications';
import type { LampyMode, LampyTrigger } from '@/types';

export function useNotifications() {
  const user = useUserStore((s) => s.user);
  const tasks = useUserStore((s) => s.tasks);
  const todayCheckin = useUserStore((s) => s.todayCheckin);
  const setActiveLampyMessage = useUserStore((s) => s.setActiveLampyMessage);
  const setShowEnergyCheckin = useUserStore((s) => s.setShowEnergyCheckin);

  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  // Setup notification listeners
  useEffect(() => {
    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as {
          mode?: LampyMode;
          trigger?: LampyTrigger;
        };

        // Show as in-app banner
        if (data.mode) {
          setActiveLampyMessage({
            id: notification.request.identifier,
            user_id: user?.id ?? '',
            content: notification.request.content.body ?? '',
            mode: data.mode,
            trigger: data.trigger ?? 'CHECKIN',
            delivered_at: new Date().toISOString(),
            was_opened: true,
          });
        }
      }
    );

    // Listen for notification taps (background/killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          mode?: LampyMode;
          trigger?: LampyTrigger;
        };

        // Navigate based on trigger type
        if (data.trigger === 'CHECKIN') {
          setShowEnergyCheckin(true);
        }
        // Default: open home screen (app is already launching)
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  // Request permissions on first launch
  const setupPermissions = useCallback(async () => {
    const token = await requestNotificationPermissions();
    if (token && user) {
      // TODO: Save push token to Supabase for remote push notifications
      console.log('Push token:', token);
    }
  }, [user]);

  // Re-evaluate notifications when state changes
  const refreshSchedule = useCallback(async () => {
    if (!user) return;

    await evaluateAndScheduleNotifications({
      name: user.name,
      tone_preference: user.tone_preference,
      energy_level: todayCheckin?.level ?? 'MEDIUM',
      current_streak: user.current_streak,
      tasks,
      wake_time: user.wake_time,
      sleep_time: user.sleep_time,
    });
  }, [user, tasks, todayCheckin]);

  // Auto-refresh schedule when tasks or energy changes
  useEffect(() => {
    if (user) {
      refreshSchedule();
    }
  }, [tasks.length, todayCheckin, user?.current_streak]);

  return {
    setupPermissions,
    refreshSchedule,
  };
}
