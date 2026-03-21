// ============================================
// Lampy — Undo Toast Component
// ============================================
// Shows a temporary toast with undo action after
// task complete, skip, or delete.

import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography, Radius, Shadows } from '@/constants/theme';

const TOAST_DURATION = 4000;

export interface UndoToastState {
  message: string;
  onUndo: () => void;
}

interface UndoToastProps {
  toast: UndoToastState | null;
  onDismiss: () => void;
}

export function UndoToast({ toast, onDismiss }: UndoToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (toast) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 250 });

      timerRef.current = setTimeout(() => {
        dismiss();
      }, TOAST_DURATION);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [toast]);

  const dismiss = () => {
    translateY.value = withTiming(100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(onDismiss, 200);
  };

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    toast?.onUndo();
    dismiss();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: insets.bottom + 80 },
        animatedStyle,
      ]}
    >
      <View style={[styles.toast, Shadows.md]}>
        <Text style={styles.message} numberOfLines={1}>
          {toast.message}
        </Text>
        <Pressable onPress={handleUndo} style={styles.undoBtn}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  message: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  undoBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  undoText: {
    color: '#6C63FF',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
});
