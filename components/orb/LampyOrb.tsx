// ============================================
// Lampy — Animated Glow Orb
// ============================================
// The abstract glow orb — Lampy's visual identity.
// Pulses, glows, and shifts color based on energy state.
// Uses React Native Reanimated for smooth 60fps animations.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated';
import { ORB_COLORS, type OrbColorConfig } from './OrbColors';
import type { OrbState } from '@/types';

interface LampyOrbProps {
  state: OrbState;
  size?: number;
  onPress?: () => void;
}

export function LampyOrb({ state, size = 120 }: LampyOrbProps) {
  const config = ORB_COLORS[state];

  // --- Shared animation values ---
  const pulse = useSharedValue(1);
  const glowPulse = useSharedValue(0.5);
  const outerGlow = useSharedValue(0.3);
  const innerScale = useSharedValue(0.4);

  // Color transition progress (0 = previous, 1 = current)
  const colorProgress = useSharedValue(0);
  const prevPrimary = useSharedValue(config.primary);
  const prevSecondary = useSharedValue(config.secondary);
  const currentPrimary = useSharedValue(config.primary);
  const currentSecondary = useSharedValue(config.secondary);

  // --- Start pulse animation based on state ---
  useEffect(() => {
    // Cancel previous animations
    cancelAnimation(pulse);
    cancelAnimation(glowPulse);
    cancelAnimation(outerGlow);
    cancelAnimation(innerScale);

    const speed = config.pulseSpeed;

    if (state === 'MILESTONE') {
      // Milestone: burst expand → settle to steady glow
      pulse.value = withSequence(
        withSpring(1.25, { damping: 4, stiffness: 80 }),
        withDelay(200, withSpring(1.05, { damping: 10, stiffness: 100 })),
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: speed, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.02, { duration: speed, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );

      glowPulse.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(500, withTiming(config.glowOpacity, { duration: 600 })),
        withRepeat(
          withSequence(
            withTiming(config.glowOpacity + 0.15, { duration: speed }),
            withTiming(config.glowOpacity - 0.1, { duration: speed })
          ),
          -1,
          true
        )
      );

      innerScale.value = withSequence(
        withSpring(0.7, { damping: 4, stiffness: 60 }),
        withSpring(0.45, { damping: 8, stiffness: 100 })
      );
    } else {
      // Normal states: continuous pulse
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: speed / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.97, { duration: speed / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      // Glow intensity pulse (subtle breathing)
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(config.glowOpacity, {
            duration: speed * 0.6,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(config.glowOpacity * 0.5, {
            duration: speed * 0.6,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      );

      // Outer glow ring pulse
      outerGlow.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: speed * 0.8, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.08, { duration: speed * 0.8, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      // Inner core subtle scale
      innerScale.value = withRepeat(
        withSequence(
          withTiming(0.42, { duration: speed * 0.7, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.35, { duration: speed * 0.7, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [state]);

  // --- Color transition on state change ---
  useEffect(() => {
    prevPrimary.value = currentPrimary.value;
    prevSecondary.value = currentSecondary.value;
    currentPrimary.value = config.primary;
    currentSecondary.value = config.secondary;

    colorProgress.value = 0;
    colorProgress.value = withTiming(1, {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
    });
  }, [state]);

  // --- Animated styles ---

  // Outer glow ring
  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: outerGlow.value,
    transform: [{ scale: pulse.value * 1.3 }],
  }));

  // Main orb body
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowOpacity: glowPulse.value,
    shadowRadius: config.glowRadius,
    shadowColor: config.primary,
  }));

  // Inner core
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    opacity: 0.9,
  }));

  const halfSize = size / 2;
  const innerSize = size * 0.5;
  const outerSize = size * 1.4;

  return (
    <View style={[styles.container, { width: outerSize, height: outerSize }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerGlow,
          outerGlowStyle,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            backgroundColor: config.primary + '20',
            borderColor: config.primary + '15',
          },
        ]}
      />

      {/* Main orb */}
      <Animated.View
        style={[
          styles.orb,
          orbStyle,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            backgroundColor: config.primary + '30',
            borderColor: config.primary + '60',
            shadowColor: config.primary,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          },
        ]}
      >
        {/* Inner bright core */}
        <Animated.View
          style={[
            styles.innerCore,
            innerStyle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: config.primary,
            },
          ]}
        />

        {/* Highlight dot (glass effect) */}
        <View
          style={[
            styles.highlight,
            {
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: size * 0.075,
              top: size * 0.2,
              left: size * 0.3,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

// --- Compact version for widgets / small spaces ---

export function LampyOrbMini({ state, size = 32 }: { state: OrbState; size?: number }) {
  const config = ORB_COLORS[state];
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, {
          duration: config.pulseSpeed / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0.95, {
          duration: config.pulseSpeed / 2,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      true
    );
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.primary + '40',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: config.primary,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    borderWidth: 1,
  },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  innerCore: {
    position: 'absolute',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
