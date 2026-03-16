// ============================================
// Lampy — Onboarding Layout
// ============================================
// Wraps all 7 onboarding screens in a stack navigator.
// No back button — forward-only flow.

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}
