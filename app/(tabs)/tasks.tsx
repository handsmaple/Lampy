// ============================================
// Lampy — Tasks Screen (Full Task List)
// ============================================

import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const tasks = useUserStore((s) => s.tasks);
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header stats */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>All Tasks</Text>
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {pendingCount} pending
          </Text>
        </View>

        {/* Task list placeholder — Phase 3 */}
        {tasks.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Nothing here yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Add your first task from the Home screen.
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <View
              key={task.id}
              style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
              <Text style={[styles.taskMeta, { color: theme.textMuted }]}>
                {task.priority} · {task.status}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  count: {
    fontSize: Typography.sizes.sm,
  },
  emptyState: {
    borderRadius: 16,
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
  taskCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  taskTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  taskMeta: {
    fontSize: Typography.sizes.xs,
  },
});
