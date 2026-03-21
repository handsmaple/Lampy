// ============================================
// Lampy — Error Toast Component
// ============================================
// Global error toast driven by Zustand store.
// Renders at the top of any screen that includes it.

import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';
import { Spacing, Typography, Radius, Shadows } from '@/constants/theme';

const ERROR_DURATION = 3000;

export function ErrorToast() {
  const insets = useSafeAreaInsets();
  const errorToast = useUserStore((s) => s.errorToast);
  const dismissErrorToast = useUserStore((s) => s.dismissErrorToast);
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (errorToast) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 250 });

      timerRef.current = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(dismissErrorToast, 200);
      }, ERROR_DURATION);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      translateY.value = withTiming(-80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [errorToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!errorToast) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + Spacing.sm },
        animatedStyle,
      ]}
    >
      <Text style={styles.message} numberOfLines={2}>
        {errorToast}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1001,
    backgroundColor: '#DC2626',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    ...Shadows.md,
  },
  message: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
  },
});
