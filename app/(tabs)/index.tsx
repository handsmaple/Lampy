// ============================================
// Lampy — Home Screen (Daily Focus)
// ============================================
// Orb + greeting + today's tasks + quick add.

import { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);
  const orbState = useUserStore((s) => s.orbState);
  const tasks = useUserStore((s) => s.tasks);
  const { fetchTasks, markComplete, markSkipped } = useTasks();

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get today's tasks (pending, due today or overdue, max 5)
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks
    .filter((t) => {
      if (t.status !== 'PENDING') return false;
      // Include: due today, overdue, or no date (floating tasks)
      if (!t.due_date) return true;
      return t.due_date <= today;
    })
    .sort((a, b) => {
      // Priority order
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      // Overdue first
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      return 1;
    })
    .slice(0, 5); // Max 5 for Daily Focus

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Orb placeholder — Phase 5 */}
        <View style={[styles.orbPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.orbText, { color: theme.textMuted }]}>
            {orbState}
          </Text>
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: theme.text }]}>
          {getGreeting()}{user?.name ? `, ${user.name}` : ''}.
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {todayTasks.length > 0
            ? `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} to focus on.`
            : "Nothing on your plate. Add something or enjoy the free time."}
        </Text>

        {/* Today's Focus */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Focus
          </Text>
          {todayTasks.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No tasks for today. Tap + to add one.
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

        {/* Suggestion placeholder — Phase 6 */}
        <View style={[styles.suggestionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Fresh Suggestion
          </Text>
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            Suggestions will appear once Lampy knows you better.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TaskQuickAdd />
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
  orbPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  orbText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
  },
  suggestionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  placeholder: {
    fontSize: Typography.sizes.sm,
  },
});
