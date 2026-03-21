// ============================================
// Lampy — Message Banner
// ============================================
// Slides in from top of Home screen with a
// personality-driven message. Auto-dismisses after 5s.

import { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { LampyMode } from '@/types';

interface LampyBannerProps {
  message: string;
  mode: LampyMode;
  theme: ThemeColors;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const MODE_CONFIG: Record<LampyMode, { emoji: string; accentColor: string }> = {
  ROAST: { emoji: '🔥', accentColor: '#EF4444' },
  HYPE: { emoji: '⚡', accentColor: Colors.brand.primary },
  REAL: { emoji: '🤝', accentColor: Colors.brand.blue },
};

export function LampyBanner({
  message,
  mode,
  theme,
  onDismiss,
  autoDismissMs = 5000,
}: LampyBannerProps) {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = MODE_CONFIG[mode];

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  }, [onDismiss]);

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto-dismiss
    timerRef.current = setTimeout(dismiss, autoDismissMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={[
          styles.banner,
          {
            backgroundColor: theme.card,
            borderColor: config.accentColor + '40',
            borderLeftColor: config.accentColor,
          },
        ]}
        onPress={dismiss}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
          <Text style={[styles.tapHint, { color: theme.textMuted }]}>tap to dismiss</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: Spacing.md,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  tapHint: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
});
