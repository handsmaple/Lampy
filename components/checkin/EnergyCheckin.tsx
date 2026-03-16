// ============================================
// Lampy — Energy Check-in Modal
// ============================================
// "How are you feeling today?" — one tap, sets the vibe.
// Shows at wake time if user hasn't checked in today.

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { EnergyLevel } from '@/types';

interface EnergyCheckinProps {
  visible: boolean;
  theme: ThemeColors;
  userName?: string;
  onSubmit: (level: EnergyLevel) => void;
  onDismiss: () => void;
}

const ENERGY_OPTIONS: {
  level: EnergyLevel;
  emoji: string;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    level: 'LOW',
    emoji: '😴',
    label: 'Low',
    desc: "Not my best. Let's keep it light.",
    color: Colors.brand.blue,
  },
  {
    level: 'MEDIUM',
    emoji: '😊',
    label: 'Decent',
    desc: "I can do a few things today.",
    color: Colors.brand.secondary,
  },
  {
    level: 'HIGH',
    emoji: '🔥',
    label: 'Let\'s go',
    desc: "I've got energy. Load me up.",
    color: Colors.brand.primary,
  },
];

export function EnergyCheckinModal({
  visible,
  theme,
  userName,
  onSubmit,
  onDismiss,
}: EnergyCheckinProps) {
  const [selected, setSelected] = useState<EnergyLevel | null>(null);

  const handleSelect = (level: EnergyLevel) => {
    setSelected(level);
    // Small delay so user sees the selection highlight
    setTimeout(() => {
      onSubmit(level);
      setSelected(null);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Dismiss bar */}
          <View style={styles.dismissBarWrapper}>
            <View style={[styles.dismissBar, { backgroundColor: theme.separator }]} />
          </View>

          {/* Header */}
          <Text style={[styles.greeting, { color: theme.text }]}>
            Morning{userName ? `, ${userName}` : ''}.
          </Text>
          <Text style={[styles.question, { color: theme.textSecondary }]}>
            How's your energy today?
          </Text>

          {/* Energy options */}
          <View style={styles.options}>
            {ENERGY_OPTIONS.map((option) => {
              const isSelected = selected === option.level;
              return (
                <Pressable
                  key={option.level}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected
                        ? option.color + '20'
                        : theme.backgroundSecondary,
                      borderColor: isSelected ? option.color : 'transparent',
                      borderWidth: isSelected ? 2 : 0,
                    },
                  ]}
                  onPress={() => handleSelect(option.level)}
                >
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.textMuted }]}>
                      {option.desc}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Skip */}
          <Pressable style={styles.skipBtn} onPress={onDismiss}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>
              Skip for now
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  dismissBarWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dismissBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  question: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xl,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  optionDesc: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.sizes.sm,
  },
});
