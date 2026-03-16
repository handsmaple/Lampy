// ============================================
// Onboarding Screen 7 — Permissions + Schedule
// ============================================
// Notification permission, wake/sleep time, finish.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

const WAKE_TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00'];
const SLEEP_TIMES = ['21:00', '22:00', '23:00', '00:00', '01:00'];

export default function OnboardingPermissions() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setUser = useUserStore((s) => s.setUser);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const addTask = useUserStore((s) => s.addTask);
  const resetOnboarding = useUserStore((s) => s.resetOnboarding);

  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [notifGranted, setNotifGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'No worries',
        "You can enable notifications later in Settings. But I can't roast you without them."
      );
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Build complete user profile
      const updatedUser = {
        ...user,
        name: onboardingData.name ?? '',
        tone_preference: onboardingData.tone_preference ?? 'BALANCE',
        life_situation: onboardingData.life_situation ?? 'WORKING',
        interests: onboardingData.interests ?? [],
        wake_time: wakeTime,
        sleep_time: sleepTime,
      };

      // Save profile to Supabase
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        name: updatedUser.name,
        email: updatedUser.email,
        tone_preference: updatedUser.tone_preference,
        life_situation: updatedUser.life_situation,
        interests: updatedUser.interests,
        wake_time: updatedUser.wake_time,
        sleep_time: updatedUser.sleep_time,
        current_orb_level: 1,
        total_points: 0,
        longest_streak: 0,
        current_streak: 0,
      });

      if (error) throw error;

      // Create first task from onboarding
      if (onboardingData.first_task) {
        const taskId = crypto.randomUUID?.() ?? `task-${Date.now()}`;
        const newTask = {
          id: taskId,
          user_id: user.id,
          title: onboardingData.first_task,
          status: 'PENDING' as const,
          priority: 'HIGH' as const,
          is_recurring: false,
          times_rescheduled: 0,
          created_via: 'MANUAL' as const,
          created_at: new Date().toISOString(),
        };

        await supabase.from('tasks').insert(newTask);
        addTask(newTask);
      }

      // Update local state
      setUser(updatedUser);
      setOnboarded(true);
      resetOnboarding();

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          Almost done.
        </Text>

        {/* Notification permission */}
        <Pressable
          style={[
            styles.permissionCard,
            {
              backgroundColor: notifGranted
                ? Colors.brand.primary + '15'
                : theme.backgroundSecondary,
            },
          ]}
          onPress={requestNotifications}
        >
          <Text style={styles.permEmoji}>{notifGranted ? '✅' : '🔔'}</Text>
          <View style={styles.permText}>
            <Text style={[styles.permLabel, { color: theme.text }]}>
              {notifGranted ? 'Notifications enabled' : 'Let me actually reach you'}
            </Text>
            <Text style={[styles.permDesc, { color: theme.textMuted }]}>
              {notifGranted
                ? "I'll use this wisely. Mostly."
                : 'For roasts, hype, and suggestions.'}
            </Text>
          </View>
        </Pressable>

        {/* Wake time */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          I wake up around
        </Text>
        <View style={styles.timeRow}>
          {WAKE_TIMES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.timePill,
                {
                  backgroundColor: wakeTime === t ? Colors.brand.primary : theme.backgroundSecondary,
                },
              ]}
              onPress={() => setWakeTime(t)}
            >
              <Text style={[styles.timeText, { color: wakeTime === t ? '#fff' : theme.text }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sleep time */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          I sleep around
        </Text>
        <View style={styles.timeRow}>
          {SLEEP_TIMES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.timePill,
                {
                  backgroundColor: sleepTime === t ? Colors.brand.primary : theme.backgroundSecondary,
                },
              ]}
              onPress={() => setSleepTime(t)}
            >
              <Text style={[styles.timeText, { color: sleepTime === t ? '#fff' : theme.text }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: Colors.brand.primary }]}
        onPress={handleFinish}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Setting up...' : "I'm ready"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
    paddingBottom: Spacing.xxl,
  },
  content: {},
  question: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  permEmoji: {
    fontSize: 28,
  },
  permText: {
    flex: 1,
  },
  permLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  permDesc: {
    fontSize: Typography.sizes.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timePill: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  timeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  button: {
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
