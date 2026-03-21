// ============================================
// Lampy — Edit Task Screen
// ============================================
// Modify title, notes, priority, due date/time, and recurrence.

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useTasks } from '@/hooks/useTasks';
import { useUserStore } from '@/store/userStore';
import { RecurrenceSelector } from '@/components/tasks/RecurrenceSelector';
import type { TaskPriority } from '@/types';

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'HIGH', label: '🔴 High', color: '#EF4444' },
  { value: 'MEDIUM', label: '🟡 Medium', color: '#F5A623' },
  { value: 'LOW', label: '🟢 Low', color: '#10B981' },
];

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { editTask, deleteTask } = useTasks();
  const insets = useSafeAreaInsets();

  const task = useUserStore((s) => s.tasks.find((t) => t.id === id));

  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [dueTime, setDueTime] = useState(task?.due_time ?? '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimated_minutes?.toString() ?? ''
  );
  const [isRecurring, setIsRecurring] = useState(task?.is_recurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState(task?.recurrence_rule);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Needs a title', "What's the task?");
      return;
    }

    setSaving(true);
    try {
      await editTask(task.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
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
            router.replace('/(tabs)/tasks' as any);
          },
        },
      ]
    );
  };

  const handleRecurrenceChange = (rule: string | undefined) => {
    setRecurrenceRule(rule);
    setIsRecurring(!!rule);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Task</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text
              style={[
                styles.saveText,
                { color: saving ? theme.textMuted : Colors.brand.primary },
              ]}
            >
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Title</Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundSecondary },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          placeholderTextColor={theme.textMuted}
          autoFocus
        />

        {/* Notes */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
        <TextInput
          style={[
            styles.input,
            styles.notesInput,
            { color: theme.text, backgroundColor: theme.backgroundSecondary },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any extra details..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Priority */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p.value}
              style={[
                styles.priorityPill,
                {
                  backgroundColor:
                    priority === p.value ? p.color + '20' : theme.backgroundSecondary,
                  borderColor: priority === p.value ? p.color : 'transparent',
                  borderWidth: priority === p.value ? 1.5 : 0,
                },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <Text
                style={[
                  styles.priorityLabel,
                  { color: priority === p.value ? p.color : theme.text },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Due date */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundSecondary },
          ]}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD (e.g. 2026-03-20)"
          placeholderTextColor={theme.textMuted}
          keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
        />

        {/* Due time */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Due Time</Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundSecondary },
          ]}
          value={dueTime}
          onChangeText={setDueTime}
          placeholder="HH:MM (e.g. 15:00)"
          placeholderTextColor={theme.textMuted}
        />

        {/* Estimated minutes */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Estimated Time (minutes)</Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundSecondary },
          ]}
          value={estimatedMinutes}
          onChangeText={setEstimatedMinutes}
          placeholder="e.g. 30"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
        />

        {/* Recurrence */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Repeat</Text>
        <RecurrenceSelector
          theme={theme}
          value={recurrenceRule}
          onChange={handleRecurrenceChange}
        />

        {/* Delete */}
        <Pressable
          style={[styles.deleteBtn, { backgroundColor: '#EF444415' }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>🗑 Delete this task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  cancelText: {
    fontSize: Typography.sizes.md,
  },
  saveText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
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
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  deleteBtn: {
    marginTop: Spacing.xxl,
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
