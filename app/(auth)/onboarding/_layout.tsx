// ============================================
// Lampy — Onboarding Layout
// ============================================
// Wraps all 7 onboarding screens in a stack navigator.
// Back gesture enabled for screens 2–7.

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      {/* Intro screen — no back gesture */}
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
