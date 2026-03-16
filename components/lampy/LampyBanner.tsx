// ============================================
// Lampy — Message Banner
// ============================================
// Slides in from top of Home screen with a
// personality-driven message. Auto-dismisses after 5s.

import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
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
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = MODE_CONFIG[mode];

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      dismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
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
