// ============================================
// Onboarding Screen 3 — Vibe Check (Tone Preference)
// ============================================
// "How do you want me to talk to you, [Name]?"

import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import type { TonePreference } from '@/types';

const VIBE_OPTIONS: { value: TonePreference; emoji: string; label: string; desc: string }[] = [
  {
    value: 'ROAST',
    emoji: '🔥',
    label: 'Roast me',
    desc: "You've been procrastinating. We both know it.",
  },
  {
    value: 'HYPE',
    emoji: '⚡',
    label: 'Hype me',
    desc: "LET'S GO. YOU GOT THIS.",
  },
  {
    value: 'BALANCE',
    emoji: '⚖️',
    label: 'A little of both',
    desc: 'Sharp when needed, warm when it matters.',
  },
];

export default function OnboardingVibe() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const name = useUserStore((s) => s.onboardingData.name);
  const updateOnboarding = useUserStore((s) => s.updateOnboarding);

  const handleSelect = (tone: TonePreference) => {
    updateOnboarding({ tone_preference: tone });
    router.push('/(auth)/onboarding/situation');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OnboardingHeader step={3} />
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          How do you want me to talk to you{name ? `, ${name}` : ''}?
        </Text>

        <View style={styles.options}>
          {VIBE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleSelect(opt.value)}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                <Text style={[styles.optionDesc, { color: theme.textMuted }]}>{opt.desc}</Text>
              </View>
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
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  optionDesc: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
});
