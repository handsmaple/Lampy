// ============================================
// Onboarding Screen 5 — Interest Tags
// ============================================
// "What's actually interesting to you?" (pick up to 5)

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { INTEREST_TAGS, type InterestTag } from '@/types';

const TAG_EMOJIS: Record<InterestTag, string> = {
  fitness: '💪',
  music: '🎵',
  cooking: '🍳',
  reading: '📚',
  gaming: '🎮',
  travel: '✈️',
  art: '🎨',
  'side-projects': '🚀',
  mindfulness: '🧘',
  learning: '🧠',
  social: '👥',
  outdoors: '🌿',
};

export default function OnboardingInterests() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const updateOnboarding = useUserStore((s) => s.updateOnboarding);
  const [selected, setSelected] = useState<InterestTag[]>([]);

  const toggleTag = (tag: InterestTag) => {
    setSelected((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 5) return prev; // Max 5
      return [...prev, tag];
    });
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    updateOnboarding({ interests: selected });
    router.push('/(auth)/onboarding/big-thing');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          What's actually interesting to you?
        </Text>
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Pick up to 5
        </Text>

        <View style={styles.grid}>
          {INTEREST_TAGS.map((tag) => {
            const isSelected = selected.includes(tag);
            return (
              <Pressable
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected
                      ? Colors.brand.primary
                      : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={styles.tagEmoji}>{TAG_EMOJIS[tag]}</Text>
                <Text
                  style={[
                    styles.tagLabel,
                    { color: isSelected ? '#fff' : theme.text },
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: selected.length > 0 ? Colors.brand.primary : theme.cardBorder },
        ]}
        onPress={handleNext}
        disabled={selected.length === 0}
      >
        <Text style={[styles.buttonText, { opacity: selected.length > 0 ? 1 : 0.5 }]}>
          Next ({selected.length}/5)
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
    paddingTop: 120,
    paddingBottom: Spacing.xxl,
  },
  content: {},
  question: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textTransform: 'capitalize',
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
