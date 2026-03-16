// ============================================
// Onboarding Screen 1 — The Hook
// ============================================
// "Hey. I'm Lampy."

import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';

export default function OnboardingHook() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Orb preview */}
        <View style={[styles.orb, { backgroundColor: Colors.brand.primary }]} />

        <Text style={[styles.greeting, { color: theme.text }]}>
          Hey. I'm Lampy.
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          I'm not your average planner. I'll push you, roast you a little, and occasionally suggest you do something different with your life.
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary, marginTop: Spacing.md }]}>
          But first — let's see what we're working with.
        </Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: Colors.brand.primary }]}
        onPress={() => router.push('/(auth)/onboarding/name')}
      >
        <Text style={styles.buttonText}>Let's go</Text>
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
  content: {
    alignItems: 'center',
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
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
