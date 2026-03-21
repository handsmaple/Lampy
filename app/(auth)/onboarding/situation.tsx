// ============================================
// Onboarding Screen 4 — Life Situation
// ============================================
// "What does your week mostly look like?"

import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import type { LifeSituation } from '@/types';

const SITUATIONS: { value: LifeSituation; emoji: string; label: string }[] = [
  { value: 'STUDENT', emoji: '🎓', label: 'Student' },
  { value: 'WORKING', emoji: '💼', label: 'Working' },
  { value: 'FREELANCE', emoji: '🌀', label: 'Freelance / Mixed' },
  { value: 'HOME', emoji: '🏠', label: 'Mostly at home' },
];

export default function OnboardingSituation() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const updateOnboarding = useUserStore((s) => s.updateOnboarding);

  const handleSelect = (situation: LifeSituation) => {
    updateOnboarding({ life_situation: situation });
    router.push('/(auth)/onboarding/interests');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OnboardingHeader step={4} />
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          What does your week mostly look like?
        </Text>

        <View style={styles.options}>
          {SITUATIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleSelect(opt.value)}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, { color: theme.text }]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  options: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
  },
});
