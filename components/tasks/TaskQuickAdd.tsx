// ============================================
// Lampy — Task Quick Add (Floating Button + Input)
// ============================================
// One tap to open, natural language to create.

import { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Keyboard,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { useTasks } from '@/hooks/useTasks';
import { parseTaskInput } from '@/lib/ai';

export function TaskQuickAdd() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { createTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setInput('');
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const parsed = parseTaskInput(input);
    await createTask({
      title: parsed.title,
      priority: parsed.priority,
      due_date: parsed.due_date,
      due_time: parsed.due_time,
      created_via: 'MANUAL',
    });

    handleClose();

    // Quick bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (isOpen) {
    return (
      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: theme.backgroundSecondary, borderColor: Colors.brand.primary },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text }]}
            placeholder='e.g. "dentist Friday 3pm" or "urgent: finish report"'
            placeholderTextColor={theme.textMuted}
            value={input}
            onChangeText={setInput}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            autoCorrect={false}
          />
        </View>
        <View style={styles.inputActions}>
          <Pressable onPress={handleClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            style={[
              styles.addBtn,
              { backgroundColor: input.trim() ? Colors.brand.primary : theme.cardBorder },
            ]}
            disabled={!input.trim()}
          >
            <Text style={[styles.addText, { opacity: input.trim() ? 1 : 0.5 }]}>Add</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[styles.fab, Shadows.lg, { backgroundColor: Colors.brand.primary }]}
        onPress={handleOpen}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    ...Shadows.lg,
  },
  inputRow: {
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
  },
  input: {
    height: 48,
    fontSize: Typography.sizes.md,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelBtn: {
    padding: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.sizes.sm,
  },
  addBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  addText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
