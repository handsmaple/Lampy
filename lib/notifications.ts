// ============================================
// Lampy — Push Notification System
// ============================================
// Handles permission requests, scheduling, and
// motivation-triggered notifications.
// Uses Expo Push Notifications (cross-platform).

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getLocalToday } from '@/lib/date';
import { generateMotivation } from './ai';
import type {
  EnergyLevel,
  TonePreference,
  LampyMode,
  LampyTrigger,
  Task,
} from '@/types';

// =============================================
// Configuration
// =============================================

// Set default notification behavior (show even when app is open)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// =============================================
// Permission Management
// =============================================

/**
 * Request notification permissions.
 * Returns the Expo push token if granted.
 */
export async function requestNotificationPermissions(): Promise<string | null> {
  // Physical device check
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('lampy-default', {
      name: 'Lampy',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('lampy-roast', {
      name: 'Lampy Roasts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: '#EF4444',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('lampy-hype', {
      name: 'Lampy Hype',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 100, 100],
      lightColor: '#FF6B35',
      sound: 'default',
    });
  }

  // Get push token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return token.data;
  } catch {
    return null;
  }
}

// =============================================
// Notification Scheduling
// =============================================

interface ScheduleOptions {
  title: string;
  body: string;
  mode: LampyMode;
  trigger: LampyTrigger;
  delaySeconds?: number;
  scheduledDate?: Date;
}

/**
 * Schedule a local notification.
 */
export async function scheduleNotification(options: ScheduleOptions): Promise<string | null> {
  const { title, body, mode, delaySeconds, scheduledDate } = options;

  const channelId = Platform.OS === 'android'
    ? mode === 'ROAST' ? 'lampy-roast' : mode === 'HYPE' ? 'lampy-hype' : 'lampy-default'
    : undefined;

  try {
    let trigger: Notifications.NotificationTriggerInput;

    if (scheduledDate) {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: scheduledDate };
    } else if (delaySeconds) {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds, repeats: false };
    } else {
      trigger = null; // Immediate
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { mode, trigger: options.trigger },
        ...(channelId ? { channelId } : {}),
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification.
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// =============================================
// Motivation Trigger Logic
// =============================================

interface TriggerContext {
  name: string;
  tone_preference: TonePreference;
  energy_level: EnergyLevel;
  current_streak: number;
  tasks: Task[];
  wake_time: string;
  sleep_time: string;
}

/**
 * Evaluate what notifications should be scheduled based on current state.
 * Called after data fetch / state changes.
 */
export async function evaluateAndScheduleNotifications(
  context: TriggerContext
): Promise<void> {
  // Cancel existing scheduled notifications to avoid duplicates
  await cancelAllNotifications();

  const today = getLocalToday();
  const pendingTasks = context.tasks.filter((t) => t.status === 'PENDING');
  const overdueTasks = pendingTasks.filter(
    (t) => t.due_date && t.due_date < today
  );

  // --- 1. Overdue task roasts ---
  if (overdueTasks.length > 0) {
    const worstTask = overdueTasks.reduce((worst, t) => {
      const worstDays = worst.due_date
        ? Math.floor((Date.now() - new Date(worst.due_date).getTime()) / 86400000)
        : 0;
      const tDays = t.due_date
        ? Math.floor((Date.now() - new Date(t.due_date).getTime()) / 86400000)
        : 0;
      return tDays > worstDays ? t : worst;
    }, overdueTasks[0]);

    const daysOverdue = worstTask.due_date
      ? Math.floor((Date.now() - new Date(worstTask.due_date).getTime()) / 86400000)
      : 1;

    // Only roast if user allows it and task is 2+ days overdue
    if (daysOverdue >= 2 && context.tone_preference !== 'HYPE') {
      const motivation = await generateMotivation({
        name: context.name,
        tone_preference: context.tone_preference,
        trigger: 'OVERDUE',
        energy_level: context.energy_level,
        current_streak: context.current_streak,
        overdue_count: overdueTasks.length,
        overdue_task: worstTask.title,
        days_overdue: daysOverdue,
        completed_today: 0,
      });

      // Schedule for 2 hours from now (don't roast immediately)
      await scheduleNotification({
        title: '🔥 Lampy has thoughts',
        body: motivation.message,
        mode: motivation.mode,
        trigger: 'OVERDUE',
        delaySeconds: 7200,
      });
    }
  }

  // --- 2. Streak milestone hype ---
  const streakMilestones = [3, 7, 14, 21, 30, 50, 100];
  if (streakMilestones.includes(context.current_streak)) {
    const motivation = await generateMotivation({
      name: context.name,
      tone_preference: context.tone_preference,
      trigger: 'STREAK',
      energy_level: context.energy_level,
      current_streak: context.current_streak,
      overdue_count: 0,
      completed_today: 0,
    });

    await scheduleNotification({
      title: `⚡ ${context.current_streak}-day streak!`,
      body: motivation.message,
      mode: 'HYPE',
      trigger: 'STREAK',
    });
  }

  // --- 3. Evening reminder (if pending tasks exist) ---
  if (pendingTasks.length > 0) {
    const [sleepHour] = (context.sleep_time ?? '23:00').split(':').map(Number);
    const reminderHour = sleepHour - 2; // 2 hours before sleep

    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(reminderHour, 0, 0, 0);

    // Only schedule if reminder time is in the future
    if (reminderTime > now) {
      const taskCount = pendingTasks.length;
      const topTask = pendingTasks[0];

      await scheduleNotification({
        title: '📋 Before you wind down',
        body: taskCount === 1
          ? `Still have "${topTask.title}" on the list. Quick one before bed?`
          : `${taskCount} tasks still open. Worth a quick look?`,
        mode: 'REAL',
        trigger: 'CHECKIN',
        scheduledDate: reminderTime,
      });
    }
  }

  // --- 4. Morning check-in reminder ---
  const [wakeHour, wakeMin] = (context.wake_time ?? '07:00').split(':').map(Number);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(wakeHour, wakeMin + 30, 0, 0); // 30 min after wake

  await scheduleNotification({
    title: '☀️ Morning check-in',
    body: `How's your energy today, ${context.name}?`,
    mode: 'REAL',
    trigger: 'CHECKIN',
    scheduledDate: tomorrow,
  });
}

// =============================================
// Quiet Hours
// =============================================

/**
 * Check if current time is within quiet hours.
 * Quiet hours = sleep_time to wake_time.
 */
export function isQuietHours(wakeTime: string, sleepTime: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [wakeH, wakeM] = wakeTime.split(':').map(Number);
  const [sleepH, sleepM] = sleepTime.split(':').map(Number);

  const wakeMinutes = wakeH * 60 + wakeM;
  const sleepMinutes = sleepH * 60 + sleepM;

  if (sleepMinutes > wakeMinutes) {
    // Normal schedule (e.g., wake 7:00, sleep 23:00)
    // Quiet = before wake OR after sleep
    return currentMinutes >= sleepMinutes || currentMinutes < wakeMinutes;
  } else {
    // Overnight schedule (e.g., wake 10:00, sleep 01:00)
    // Quiet = after sleep AND before wake
    return currentMinutes >= sleepMinutes && currentMinutes < wakeMinutes;
  }
}
