// ============================================
// Lampy — Task Detail Screen
// ============================================
// Full view of a single task with actions.

import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useTasks } from '@/hooks/useTasks';
import { useUserStore } from '@/store/userStore';

const PRIORITY_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F5A623',
  LOW: '#10B981',
};

const STATUS_LABELS = {
  PENDING: { label: 'Pending', emoji: '⏳' },
  DONE: { label: 'Completed', emoji: '✅' },
  SKIPPED: { label: 'Skipped', emoji: '⏭️' },
};

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { markComplete, markSkipped, deleteTask, rescheduleTask } = useTasks();

  const task = useUserStore((s) => s.tasks.find((t) => t.id === id));

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.textMuted }]}>
            Task not found.
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: Colors.brand.primary }]}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const status = STATUS_LABELS[task.status];
  const isDone = task.status === 'DONE';
  const isSkipped = task.status === 'SKIPPED';
  const isPending = task.status === 'PENDING';

  const isOverdue =
    task.due_date &&
    isPending &&
    task.due_date < new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const handleComplete = async () => {
    await markComplete(task.id);
  };

  const handleSkip = async () => {
    await markSkipped(task.id);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete task?',
      `"${task.title}" will be gone forever.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    // Simple reschedule to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDate = tomorrow.toISOString().split('T')[0];
    rescheduleTask(task.id, newDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backBtnText, { color: Colors.brand.primary }]}>← Back</Text>
        </Pressable>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
            {status.label}
          </Text>
          {isOverdue && (
            <Text style={styles.overdueTag}> · Overdue</Text>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
              textDecorationLine: isDone ? 'line-through' : 'none',
              opacity: isDone || isSkipped ? 0.6 : 1,
            },
          ]}
        >
          {task.title}
        </Text>

        {/* Notes */}
        {task.notes && (
          <Text style={[styles.notes, { color: theme.textSecondary }]}>
            {task.notes}
          </Text>
        )}

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Priority */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Priority</Text>
            <View style={styles.infoValue}>
              <View
                style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
              />
              <Text style={[styles.infoText, { color: theme.text }]}>{task.priority}</Text>
            </View>
          </View>

          {/* Due date */}
          {task.due_date && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Due date</Text>
              <Text
                style={[
                  styles.infoText,
                  { color: isOverdue ? '#EF4444' : theme.text },
                ]}
              >
                {formatDate(task.due_date)}
              </Text>
            </View>
          )}

          {/* Due time */}
          {task.due_time && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Time</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                {formatTime(task.due_time)}
              </Text>
            </View>
          )}

          {/* Estimated time */}
          {task.estimated_minutes && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Estimated</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                {task.estimated_minutes} min
              </Text>
            </View>
          )}

          {/* Recurring */}
          {task.is_recurring && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Recurring</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                🔁 {describeRecurrence(task.recurrence_rule)}
              </Text>
            </View>
          )}

          {/* Created via */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Created</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>
              {task.created_via === 'VOICE' ? '🎤 Voice' : task.created_via === 'SUGGESTION' ? '💡 Suggestion' : '✍️ Manual'}
            </Text>
          </View>

          {/* Times rescheduled */}
          {task.times_rescheduled > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Rescheduled</Text>
              <Text style={[styles.infoText, { color: '#EF4444' }]}>
                {task.times_rescheduled}x
              </Text>
            </View>
          )}

          {/* Completed at */}
          {task.completed_at && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Completed</Text>
              <Text style={[styles.infoText, { color: theme.success || '#10B981' }]}>
                {formatDate(task.completed_at.split('T')[0])}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      {isPending && (
        <View style={[styles.actions, { backgroundColor: theme.background }]}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={handleReschedule}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>📅 Tomorrow</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => router.push(`/task/edit/${task.id}` as any)}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>✏️ Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={handleSkip}
          >
            <Text style={[styles.actionText, { color: theme.textMuted }]}>Skip</Text>
          </Pressable>

          <Pressable
            style={[styles.completeBtn, { backgroundColor: Colors.brand.primary }]}
            onPress={handleComplete}
          >
            <Text style={styles.completeBtnText}>✓ Done</Text>
          </Pressable>
        </View>
      )}

      {/* Delete button (always visible) */}
      {!isPending && (
        <View style={[styles.actions, { backgroundColor: theme.background }]}>
          <Pressable
            style={[styles.deleteBtn, { backgroundColor: '#EF444415' }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>🗑 Delete task</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// --- Helpers ---

function describeRecurrence(rule?: string): string {
  if (!rule) return 'Recurring';
  if (rule === 'FREQ=DAILY') return 'Every day';
  if (rule === 'FREQ=WEEKLY') return 'Every week';
  if (rule.includes('BYDAY=MO,TU,WE,TH,FR')) return 'Weekdays';

  const dayMatch = rule.match(/BYDAY=([A-Z,]+)/);
  if (dayMatch) {
    const dayMap: Record<string, string> = {
      MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun',
    };
    const days = dayMatch[1].split(',').map((d) => dayMap[d] || d);
    return days.join(', ');
  }

  return 'Custom';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 140,
  },
  backBtn: {
    marginBottom: Spacing.lg,
  },
  backBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: Typography.sizes.lg,
    marginBottom: Spacing.md,
  },
  backLink: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  overdueTag: {
    fontSize: Typography.sizes.sm,
    color: '#EF4444',
    fontWeight: Typography.weights.semibold,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.tight,
  },
  notes: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Typography.sizes.sm,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  completeBtn: {
    flex: 1.5,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
});
