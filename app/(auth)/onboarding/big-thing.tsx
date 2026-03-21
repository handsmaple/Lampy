// ============================================
// Onboarding Screen 6 — The One Big Thing
// ============================================
// "What's one thing you keep putting off?"
// This becomes the user's first task.

import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function OnboardingBigThing() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const updateOnboarding = useUserStore((s) => s.updateOnboarding);
  const name = useUserStore((s) => s.onboardingData.name);
  const tone = useUserStore((s) => s.onboardingData.tone_preference);
  const [task, setTask] = useState('');

  const handleNext = () => {
    if (!task.trim()) return;
    updateOnboarding({ first_task: task.trim() });
    router.push('/(auth)/onboarding/permissions');
  };

  // Lampy reacts based on tone preference
  const getReaction = () => {
    if (!task.trim()) return '';
    switch (tone) {
      case 'ROAST':
        return `"${task.trim()}" — and you've been avoiding it. Interesting.`;
      case 'HYPE':
        return `"${task.trim()}" — we're gonna crush that. Let's go.`;
      default:
        return `"${task.trim()}" — noted. We'll get to it together.`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OnboardingHeader step={6} />
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          What's one thing you keep putting off?
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: task.trim() ? Colors.brand.primary : theme.cardBorder,
            },
          ]}
          placeholder="e.g. Start working out, clean my desk..."
          placeholderTextColor={theme.textMuted}
          value={task}
          onChangeText={setTask}
          autoFocus
          multiline
          returnKeyType="done"
        />

        {/* Lampy's reaction based on tone preference */}
        {task.trim() ? (
          <Text style={[styles.reaction, { color: theme.textSecondary }]}>
            {getReaction()}
          </Text>
        ) : null}
      </View>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: task.trim() ? Colors.brand.primary : theme.cardBorder },
        ]}
        onPress={handleNext}
        disabled={!task.trim()}
      >
        <Text style={[styles.buttonText, { opacity: task.trim() ? 1 : 0.5 }]}>
          Next
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
    paddingTop: 0,
    paddingBottom: Spacing.xxl,
  },
  content: {},
  question: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  input: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.lg,
    textAlignVertical: 'top',
  },
  reaction: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
    lineHeight: 20,
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
