// ============================================
// Lampy — Onboarding Header
// ============================================
// Back button + progress dots for screens 2–7.

import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/components/useColorScheme';

const TOTAL_STEPS = 7;

interface OnboardingHeaderProps {
  step: number; // 1-indexed (1 = intro, 2 = name, ... 7 = permissions)
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
      >
        <View style={[styles.backArrow, { borderColor: theme.text }]} />
      </Pressable>

      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i + 1 <= step
                ? { backgroundColor: Colors.brand.primary }
                : { backgroundColor: theme.cardBorder },
            ]}
          />
        ))}
      </View>

      {/* Spacer to balance the back button */}
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    transform: [{ rotate: '45deg' }],
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
