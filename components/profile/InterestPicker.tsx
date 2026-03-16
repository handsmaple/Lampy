// ============================================
// Lampy — Interest Picker
// ============================================
// Toggleable interest tag grid for profile editing.

import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { INTEREST_TAGS, type InterestTag } from '@/types';

const INTEREST_EMOJIS: Record<InterestTag, string> = {
  fitness: '💪',
  music: '🎵',
  cooking: '🍳',
  reading: '📚',
  gaming: '🎮',
  travel: '✈️',
  art: '🎨',
  'side-projects': '💻',
  mindfulness: '🧘',
  learning: '🎓',
  social: '🤝',
  outdoors: '🌿',
};

interface InterestPickerProps {
  visible: boolean;
  selected: InterestTag[];
  theme: ThemeColors;
  onSave: (interests: InterestTag[]) => void;
  onDismiss: () => void;
}

export function InterestPicker({
  visible,
  selected,
  theme,
  onSave,
  onDismiss,
}: InterestPickerProps) {
  const [localSelected, setLocalSelected] = useState<InterestTag[]>(selected);

  // Reset local state when modal opens
  const handleShow = () => setLocalSelected(selected);

  const toggleInterest = (tag: InterestTag) => {
    setLocalSelected((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(localSelected);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      onShow={handleShow}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            Your Interests
          </Text>
          <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
            Pick what excites you. Lampy uses these for suggestions.
          </Text>

          <View style={styles.grid}>
            {INTEREST_TAGS.map((tag) => {
              const isActive = localSelected.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? Colors.brand.primary + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? Colors.brand.primary
                        : theme.cardBorder,
                    },
                  ]}
                  onPress={() => toggleInterest(tag)}
                >
                  <Text style={styles.chipEmoji}>
                    {INTEREST_EMOJIS[tag]}
                  </Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      {
                        color: isActive
                          ? Colors.brand.primary
                          : theme.text,
                      },
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: theme.separator }]}
              onPress={onDismiss}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: Colors.brand.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                Save ({localSelected.length})
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sheetTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
