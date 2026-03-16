// ============================================
// Onboarding Screen 2 — The Name
// ============================================
// "What do I call you?"

import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function OnboardingName() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const updateOnboarding = useUserStore((s) => s.updateOnboarding);
  const [name, setName] = useState('');

  const handleNext = () => {
    if (!name.trim()) return;
    updateOnboarding({ name: name.trim() });
    router.push('/(auth)/onboarding/vibe');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          What do I call you?
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: name ? Colors.brand.primary : theme.cardBorder,
            },
          ]}
          placeholder="Your name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: name.trim() ? Colors.brand.primary : theme.cardBorder },
        ]}
        onPress={handleNext}
        disabled={!name.trim()}
      >
        <Text style={[styles.buttonText, { opacity: name.trim() ? 1 : 0.5 }]}>
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
    paddingTop: 120,
    paddingBottom: Spacing.xxl,
  },
  content: {},
  question: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  input: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.lg,
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
