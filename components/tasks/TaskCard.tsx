// ============================================
// Lampy — Task Card Component
// ============================================
// Displays a single task with swipe-to-complete/skip.

import { memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { Task } from '@/types';
import type { ThemeColors } from '@/constants/theme';

interface TaskCardProps {
  task: Task;
  theme: ThemeColors;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
}

const PRIORITY_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F5A623',
  LOW: '#10B981',
};

export const TaskCard = memo(function TaskCard({ task, theme, onComplete, onSkip }: TaskCardProps) {
  const router = useRouter();

  const formatDueInfo = () => {
    const parts: string[] = [];
    if (task.due_date) {
      const date = new Date(task.due_date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (task.due_date === today.toISOString().split('T')[0]) {
        parts.push('Today');
      } else if (task.due_date === tomorrow.toISOString().split('T')[0]) {
        parts.push('Tomorrow');
      } else {
        parts.push(
          date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        );
      }
    }
    if (task.due_time) {
      const [h, m] = task.due_time.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      parts.push(`${displayHour}:${m} ${ampm}`);
    }
    return parts.join(' · ');
  };

  const isDone = task.status === 'DONE';
  const isOverdue =
    task.due_date &&
    task.status === 'PENDING' &&
    task.due_date < new Date().toISOString().split('T')[0];

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isOverdue ? '#EF444440' : theme.cardBorder,
          opacity: isDone ? 0.5 : 1,
        },
      ]}
      onPress={() => router.push(`/task/${task.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}, ${task.priority} priority${isOverdue ? ', overdue' : ''}`}
    >
      <View style={styles.row}>
        {/* Complete button */}
        <Pressable
          style={[
            styles.checkbox,
            {
              borderColor: isDone ? Colors.brand.primary : theme.textMuted,
              backgroundColor: isDone ? Colors.brand.primary : 'transparent',
            },
          ]}
          onPress={() => !isDone && onComplete(task.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDone }}
          accessibilityLabel={`Mark ${task.title} as complete`}
        >
          {isDone && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        {/* Task content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                textDecorationLine: isDone ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <View style={styles.meta}>
            {/* Priority dot */}
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: PRIORITY_COLORS[task.priority] },
              ]}
            />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {task.priority}
            </Text>

            {/* Due info */}
            {formatDueInfo() ? (
              <>
                <Text style={[styles.metaText, { color: theme.textMuted }]}> · </Text>
                <Text
                  style={[
                    styles.metaText,
                    { color: isOverdue ? '#EF4444' : theme.textMuted },
                  ]}
                >
                  {formatDueInfo()}
                </Text>
              </>
            ) : null}

            {/* Recurring indicator */}
            {task.is_recurring && (
              <Text style={[styles.metaText, { color: theme.textMuted }]}> 🔁</Text>
            )}

            {/* Rescheduled count */}
            {task.times_rescheduled > 0 && (
              <Text style={[styles.metaText, { color: '#EF4444' }]}>
                {' '}
                · moved {task.times_rescheduled}x
              </Text>
            )}
          </View>
        </View>

        {/* Skip button */}
        {!isDone && task.status === 'PENDING' && (
          <Pressable
            style={styles.skipBtn}
            onPress={() => onSkip(task.id)}
            accessibilityRole="button"
            accessibilityLabel={`Skip ${task.title}`}
          >
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  metaText: {
    fontSize: Typography.sizes.xs,
  },
  skipBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.sizes.xs,
  },
});
