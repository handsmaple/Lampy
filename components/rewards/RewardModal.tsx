// ============================================
// Lampy — Reward Modal
// ============================================
// Shows a celebration when the user earns a reward.
// Orb pulse animation + confetti-style particles +
// points display. Also used for unlock reveals.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { Reward, Unlockable } from '@/types';

// =============================================
// Reward Modal (Points Earned)
// =============================================

interface RewardModalProps {
  visible: boolean;
  reward: Reward | null;
  theme: ThemeColors;
  onDismiss: () => void;
}

export function RewardModal({ visible, reward, theme, onDismiss }: RewardModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pointsScale = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    if (visible && reward) {
      // Reset
      scale.value = 0;
      opacity.value = 0;
      pointsScale.value = 0;
      glowPulse.value = 0;

      // Entrance animation
      opacity.value = withTiming(1, { duration: 200 });

      // Orb burst → settle
      scale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 80 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );

      // Points counter pop-in (delayed)
      pointsScale.value = withDelay(
        400,
        withSequence(
          withSpring(1.2, { damping: 5, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 120 })
        )
      );

      // Glow pulse
      glowPulse.value = withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );
    }
  }, [visible, reward]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
    opacity: pointsScale.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value * 0.4,
    transform: [{ scale: 1 + glowPulse.value * 0.3 }],
  }));

  if (!reward) return null;

  // Determine celebration color based on reward type
  const celebrationColor =
    reward.type === 'STREAK'
      ? Colors.brand.accent
      : reward.type === 'MILESTONE'
        ? Colors.brand.accent
        : Colors.brand.primary;

  const emoji =
    reward.type === 'STREAK'
      ? '⚡'
      : reward.type === 'MILESTONE'
        ? '🎉'
        : reward.type === 'SUGGESTION_ACCEPTED'
          ? '💡'
          : '✅';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} />
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Glow ring behind orb */}
          <Animated.View
            style={[
              styles.glowRing,
              glowStyle,
              { backgroundColor: celebrationColor + '20' },
            ]}
          />

          {/* Celebration orb */}
          <Animated.View
            style={[
              styles.celebrationOrb,
              orbStyle,
              { backgroundColor: celebrationColor + '30', borderColor: celebrationColor + '60' },
            ]}
          >
            <Text style={styles.orbEmoji}>{emoji}</Text>
          </Animated.View>

          {/* Points display */}
          <Animated.View style={[styles.pointsContainer, pointsStyle]}>
            <Text style={[styles.pointsValue, { color: celebrationColor }]}>
              +{reward.points_earned}
            </Text>
            <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>
              points
            </Text>
          </Animated.View>

          {/* Description */}
          <Text style={[styles.description, { color: theme.text }]}>
            {reward.description}
          </Text>

          {/* Dismiss button */}
          <Pressable
            style={[styles.dismissButton, { backgroundColor: celebrationColor }]}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>Nice!</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

// =============================================
// Unlock Reveal Modal
// =============================================

interface UnlockRevealProps {
  visible: boolean;
  unlockable: Unlockable | null;
  theme: ThemeColors;
  onDismiss: () => void;
}

export function UnlockRevealModal({ visible, unlockable, theme, onDismiss }: UnlockRevealProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const labelScale = useSharedValue(0);

  useEffect(() => {
    if (visible && unlockable) {
      scale.value = 0;
      opacity.value = 0;
      shimmer.value = 0;
      labelScale.value = 0;

      opacity.value = withTiming(1, { duration: 200 });

      // Dramatic reveal: fade in → burst → settle
      scale.value = withSequence(
        withDelay(200, withSpring(1.4, { damping: 3, stiffness: 60 })),
        withSpring(1, { damping: 8, stiffness: 100 })
      );

      // Shimmer effect
      shimmer.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.2, { duration: 600, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );

      // Label pop-in
      labelScale.value = withDelay(
        600,
        withSequence(
          withSpring(1.15, { damping: 6, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 120 })
        )
      );
    }
  }, [visible, unlockable]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const revealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
    opacity: labelScale.value,
  }));

  if (!unlockable) return null;

  const typeLabel =
    unlockable.type === 'THEME'
      ? '🎨 Theme'
      : unlockable.type === 'ORB_SKIN'
        ? '✨ Orb Skin'
        : '🗣️ Voice Mode';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} />
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Shimmer background */}
          <Animated.View
            style={[
              styles.shimmerBg,
              shimmerStyle,
              { backgroundColor: Colors.brand.accent + '15' },
            ]}
          />

          {/* Unlock icon */}
          <Animated.View style={[styles.unlockIcon, revealStyle]}>
            <Text style={styles.unlockEmoji}>🔓</Text>
          </Animated.View>

          {/* Unlockable name */}
          <Animated.View style={labelStyle}>
            <Text style={[styles.unlockTitle, { color: theme.text }]}>
              {unlockable.name}
            </Text>
            <Text style={[styles.unlockType, { color: Colors.brand.accent }]}>
              {typeLabel}
            </Text>
          </Animated.View>

          <Text style={[styles.unlockDesc, { color: theme.textSecondary }]}>
            New item unlocked! Check your collection.
          </Text>

          {/* Action buttons */}
          <View style={styles.unlockActions}>
            <Pressable
              style={[styles.activateButton, { backgroundColor: Colors.brand.accent }]}
              onPress={onDismiss}
            >
              <Text style={styles.activateText}>Awesome!</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

// =============================================
// Level Up Modal
// =============================================

interface LevelUpProps {
  visible: boolean;
  newLevel: number;
  theme: ThemeColors;
  onDismiss: () => void;
}

export function LevelUpModal({ visible, newLevel, theme, onDismiss }: LevelUpProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const ringPulse = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 0;
      opacity.value = 0;
      ringPulse.value = 0;

      opacity.value = withTiming(1, { duration: 200 });

      // Big burst for level up
      scale.value = withSequence(
        withDelay(100, withSpring(1.5, { damping: 3, stiffness: 50 })),
        withSpring(1, { damping: 8, stiffness: 100 })
      );

      // Expanding ring pulse
      ringPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        3
      );
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ringPulse.value * 2 }],
    opacity: (1 - ringPulse.value) * 0.5,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} />
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Expanding ring */}
          <Animated.View
            style={[
              styles.expandingRing,
              ringStyle,
              { borderColor: Colors.brand.accent + '40' },
            ]}
          />

          {/* Level number */}
          <Animated.View style={[styles.levelContainer, levelStyle]}>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </Animated.View>

          <Text style={[styles.levelUpTitle, { color: theme.text }]}>
            Level Up!
          </Text>
          <Text style={[styles.levelUpDesc, { color: theme.textSecondary }]}>
            Your orb has evolved to Level {newLevel}.
            {'\n'}Keep going to unlock new rewards!
          </Text>

          <Pressable
            style={[styles.dismissButton, { backgroundColor: Colors.brand.accent }]}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>Let's go!</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

// =============================================
// Styles
// =============================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: 300,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },

  // --- Reward Modal ---
  glowRing: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  celebrationOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orbEmoji: {
    fontSize: 32,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pointsValue: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
  },
  pointsLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  description: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  dismissButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },

  // --- Unlock Reveal ---
  shimmerBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
  },
  unlockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  unlockEmoji: {
    fontSize: 44,
  },
  unlockTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  unlockType: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  unlockDesc: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  unlockActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  activateButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  activateText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },

  // --- Level Up ---
  expandingRing: {
    position: 'absolute',
    top: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  levelContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand.accent + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  levelNumber: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
    color: Colors.brand.accent,
  },
  levelUpTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  levelUpDesc: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
});
