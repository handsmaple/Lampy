// ============================================
// Lampy — Home Screen (Daily Focus)
// ============================================
// Orb + greeting + energy check-in + Lampy banner +
// energy-aware daily focus + quick add.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useTasks } from '@/hooks/useTasks';
import { useEnergy } from '@/hooks/useEnergy';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';
import { EnergyCheckinModal } from '@/components/checkin/EnergyCheckin';
import { LampyBanner } from '@/components/lampy/LampyBanner';
import { LampyOrb } from '@/components/orb/LampyOrb';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { generateMessage } from '@/constants/lampy-messages';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useNotifications } from '@/hooks/useNotifications';
import type { EnergyLevel, LampyMode } from '@/types';

// --- Energy-aware task limit ---
const TASK_LIMITS: Record<EnergyLevel, number> = {
  LOW: 2,
  MEDIUM: 4,
  HIGH: 5,
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);
  const orbState = useUserStore((s) => s.orbState);
  const tasks = useUserStore((s) => s.tasks);
  const showEnergyCheckin = useUserStore((s) => s.showEnergyCheckin);
  const setShowEnergyCheckin = useUserStore((s) => s.setShowEnergyCheckin);
  const activeLampyMessage = useUserStore((s) => s.activeLampyMessage);
  const dismissLampyMessage = useUserStore((s) => s.dismissLampyMessage);

  const { fetchTasks, markComplete, markSkipped } = useTasks();
  const { todayCheckin, fetchTodayCheckin, submitCheckin } = useEnergy();
  const {
    todaySuggestion,
    fetchSuggestions,
    generateNewSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    saveSuggestion,
  } = useSuggestions();
  const { setupPermissions } = useNotifications();

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerMode, setBannerMode] = useState<LampyMode>('HYPE');

  // Fetch data on mount + setup notifications
  useEffect(() => {
    fetchTasks();
    fetchTodayCheckin();
    fetchSuggestions();
    setupPermissions();
  }, [fetchTasks, fetchTodayCheckin, fetchSuggestions]);

  // Generate a suggestion once energy is checked in
  useEffect(() => {
    if (todayCheckin && !todaySuggestion) {
      generateNewSuggestion();
    }
  }, [todayCheckin, todaySuggestion]);

  // Determine energy level (default to MEDIUM if no check-in)
  const energyLevel: EnergyLevel = todayCheckin?.level ?? 'MEDIUM';
  const taskLimit = TASK_LIMITS[energyLevel];

  // Get today's tasks — energy-aware limiting
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks
    .filter((t) => {
      if (t.status !== 'PENDING') return false;
      // Include: due today, overdue, or no date (floating tasks)
      if (!t.due_date) return true;
      return t.due_date <= today;
    })
    .sort((a, b) => {
      // Overdue tasks always first
      const aOverdue = a.due_date && a.due_date < today;
      const bOverdue = b.due_date && b.due_date < today;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Priority order
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;

      // Tasks with due dates before those without
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      return 1;
    })
    .slice(0, taskLimit);

  // Count overdue tasks (for roast trigger)
  const overdueCount = tasks.filter(
    (t) => t.status === 'PENDING' && t.due_date && t.due_date < today
  ).length;

  // Handle energy check-in submission
  const handleEnergySubmit = (level: EnergyLevel) => {
    submitCheckin(level);

    // Generate a Lampy message based on energy level
    const tone = user?.tone_preference ?? 'BALANCE';
    let mode: LampyMode;
    let msg: string;

    if (level === 'LOW') {
      mode = 'REAL';
      msg = generateMessage('REAL', 'CHECKIN', { name: user?.name ?? '' });
    } else if (level === 'HIGH') {
      mode = 'HYPE';
      msg = generateMessage('HYPE', 'CHECKIN', {
        name: user?.name ?? '',
        count: tasks.filter((t) => t.status === 'PENDING').length.toString(),
      });
    } else {
      // Medium — use user's preference
      mode = tone === 'ROAST' ? 'ROAST' : tone === 'HYPE' ? 'HYPE' : 'HYPE';
      msg = generateMessage(mode, 'CHECKIN', { name: user?.name ?? '' });
    }

    setBannerMessage(msg);
    setBannerMode(mode);
  };

  // Generate overdue roast on mount (if applicable)
  useEffect(() => {
    if (overdueCount > 0 && todayCheckin && !bannerMessage) {
      const tone = user?.tone_preference ?? 'BALANCE';
      if (tone === 'ROAST' || tone === 'BALANCE') {
        const mostOverdue = tasks.find(
          (t) => t.status === 'PENDING' && t.due_date && t.due_date < today
        );
        if (mostOverdue) {
          const daysOverdue = Math.floor(
            (new Date(today).getTime() - new Date(mostOverdue.due_date!).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const msg = generateMessage('ROAST', 'OVERDUE', {
            task: mostOverdue.title,
            days: daysOverdue,
            times: mostOverdue.times_rescheduled,
          });
          setBannerMessage(msg);
          setBannerMode('ROAST');
        }
      }
    }
  }, [overdueCount, todayCheckin]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Energy label for subtitle
  const getEnergyContext = () => {
    if (!todayCheckin) return '';
    switch (todayCheckin.level) {
      case 'LOW':
        return ' Keeping it light today.';
      case 'HIGH':
        return ' You\'re on fire — here\'s the full load.';
      default:
        return '';
    }
  };

  // Orb colors for energy badge
  const orbBadgeColors: Record<string, string> = {
    LOW: Colors.brand.blue,
    MEDIUM: Colors.brand.secondary,
    HIGH: Colors.brand.primary,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Lampy Banner */}
      {bannerMessage && (
        <LampyBanner
          message={bannerMessage}
          mode={bannerMode}
          theme={theme}
          onDismiss={() => setBannerMessage(null)}
        />
      )}

      {/* Active Lampy Message from store */}
      {activeLampyMessage && !bannerMessage && (
        <LampyBanner
          message={activeLampyMessage.content}
          mode={activeLampyMessage.mode}
          theme={theme}
          onDismiss={dismissLampyMessage}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Lampy Orb */}
        <View style={styles.orbContainer}>
          <LampyOrb state={orbState} size={120} />
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: theme.text }]}>
          {getGreeting()}{user?.name ? `, ${user.name}` : ''}.
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {todayTasks.length > 0
            ? `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} to focus on.${getEnergyContext()}`
            : `Nothing on your plate.${getEnergyContext() || ' Add something or enjoy the free time.'}`}
        </Text>

        {/* Energy status badge (if checked in) */}
        {todayCheckin && (
          <Pressable
            style={[
              styles.energyBadge,
              { backgroundColor: orbBadgeColors[todayCheckin.level] + '15' },
            ]}
            onPress={() => setShowEnergyCheckin(true)}
          >
            <Text style={styles.energyEmoji}>
              {todayCheckin.level === 'LOW' ? '😴' : todayCheckin.level === 'HIGH' ? '🔥' : '😊'}
            </Text>
            <Text style={[styles.energyText, { color: orbBadgeColors[todayCheckin.level] }]}>
              Energy: {todayCheckin.level}
            </Text>
            <Text style={[styles.energyChange, { color: theme.textMuted }]}>
              tap to change
            </Text>
          </Pressable>
        )}

        {/* Today's Focus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Today's Focus
            </Text>
            <Text style={[styles.sectionLimit, { color: theme.textMuted }]}>
              {todayTasks.length}/{taskLimit}
            </Text>
          </View>

          {todayTasks.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {todayCheckin?.level === 'LOW'
                  ? "Clean slate. Rest up or tackle one small thing."
                  : "No tasks for today. Tap + to add one."}
              </Text>
            </View>
          ) : (
            todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                theme={theme}
                onComplete={markComplete}
                onSkip={markSkipped}
              />
            ))
          )}
        </View>

        {/* Fresh Suggestion */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Fresh Suggestion
          </Text>
          {todaySuggestion ? (
            <SuggestionCard
              suggestion={todaySuggestion}
              theme={theme}
              onAccept={acceptSuggestion}
              onDismiss={dismissSuggestion}
              onSave={saveSuggestion}
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {todayCheckin
                  ? 'Generating something fresh for you...'
                  : 'Check in your energy to unlock suggestions.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TaskQuickAdd />

      {/* Energy Check-in Modal */}
      <EnergyCheckinModal
        visible={showEnergyCheckin}
        theme={theme}
        userName={user?.name}
        onSubmit={handleEnergySubmit}
        onDismiss={() => setShowEnergyCheckin(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 120,
  },
  orbContainer: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  energyEmoji: {
    fontSize: 14,
  },
  energyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  energyChange: {
    fontSize: Typography.sizes.xs,
    marginLeft: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  sectionLimit: {
    fontSize: Typography.sizes.xs,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
});
