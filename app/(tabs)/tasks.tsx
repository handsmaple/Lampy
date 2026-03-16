// ============================================
// Lampy — Tasks Screen (Full Task List)
// ============================================
// Shows all tasks with filter tabs, uses TaskCard + TaskQuickAdd.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskQuickAdd } from '@/components/tasks/TaskQuickAdd';

type FilterTab = 'ALL' | 'PENDING' | 'DONE' | 'SKIPPED';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DONE', label: 'Done' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const tasks = useUserStore((s) => s.tasks);
  const { fetchTasks, markComplete, markSkipped } = useTasks();
  const [filter, setFilter] = useState<FilterTab>('ALL');

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks
  const filteredTasks = filter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === filter);

  // Sort: pending first (overdue → by date → no date), then done/skipped
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Pending tasks first
    const statusOrder = { PENDING: 0, DONE: 1, SKIPPED: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Within pending: overdue first, then by due date
    if (a.status === 'PENDING' && b.status === 'PENDING') {
      const today = new Date().toISOString().split('T')[0];
      const aOverdue = a.due_date && a.due_date < today;
      const bOverdue = b.due_date && b.due_date < today;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // By due date (earlier first)
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      // By priority
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Within done/skipped: most recent first
    return (b.completed_at ?? b.created_at).localeCompare(a.completed_at ?? a.created_at);
  });

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header stats */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>All Tasks</Text>
          <View style={styles.statsRow}>
            <Text style={[styles.stat, { color: theme.textSecondary }]}>
              {pendingCount} pending
            </Text>
            <Text style={[styles.statDot, { color: theme.textMuted }]}> · </Text>
            <Text style={[styles.stat, { color: theme.success }]}>
              {doneCount} done
            </Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.value}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    filter === tab.value ? Colors.brand.primary : theme.backgroundSecondary,
                },
              ]}
              onPress={() => setFilter(tab.value)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: filter === tab.value ? '#fff' : theme.text },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Task list */}
        {sortedTasks.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {filter === 'ALL' ? 'Nothing here yet' : `No ${filter.toLowerCase()} tasks`}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {filter === 'ALL'
                ? 'Tap + to add your first task.'
                : 'Try a different filter.'}
            </Text>
          </View>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              theme={theme}
              onComplete={markComplete}
              onSkip={markSkipped}
            />
          ))
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    fontSize: Typography.sizes.sm,
  },
  statDot: {
    fontSize: Typography.sizes.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  filterLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  emptyState: {
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
});
