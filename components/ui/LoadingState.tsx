// ============================================
// Lampy — Loading States
// ============================================
// Skeleton placeholders and loading indicators
// for smooth transitions while data loads.

import { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

// --- Skeleton shimmer block ---

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  theme: ThemeColors;
}

export function Skeleton({ width, height, borderRadius = Radius.md, theme }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.separator,
        },
      ]}
    />
  );
}

// --- Task card skeleton ---

export function TaskCardSkeleton({ theme }: { theme: ThemeColors }) {
  return (
    <View
      style={[
        styles.taskSkeleton,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.taskSkeletonRow}>
        <Skeleton width={24} height={24} borderRadius={12} theme={theme} />
        <View style={styles.taskSkeletonContent}>
          <Skeleton width="80%" height={16} theme={theme} />
          <View style={{ height: 6 }} />
          <Skeleton width="50%" height={12} theme={theme} />
        </View>
      </View>
    </View>
  );
}

// --- Full-screen loading ---

export function FullScreenLoading({ theme, message }: { theme: ThemeColors; message?: string }) {
  return (
    <View style={[styles.fullScreen, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={Colors.brand.primary} />
      {message && (
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// --- Empty state ---

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  theme: ThemeColors;
}

export function EmptyState({ emoji, title, subtitle, theme }: EmptyStateProps) {
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// --- Offline banner ---

export function OfflineBanner({ theme }: { theme: ThemeColors }) {
  return (
    <View style={[styles.offlineBanner, { backgroundColor: theme.error ?? '#EF4444' }]}>
      <Text style={styles.offlineText}>
        You're offline. Changes will sync when you reconnect.
      </Text>
    </View>
  );
}

// =============================================
// Styles
// =============================================

const styles = StyleSheet.create({
  taskSkeleton: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  taskSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  taskSkeletonContent: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
  },
  emptyState: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  offlineBanner: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
