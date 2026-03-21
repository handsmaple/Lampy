// ============================================
// Lampy — Suggestion Card
// ============================================
// Displays an AI-generated suggestion with accept/dismiss actions.
// Tap "Add to tasks" to accept, "Not now" to dismiss.

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { Suggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  theme: ThemeColors;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onSave?: (id: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  fitness: '💪',
  music: '🎵',
  cooking: '🍳',
  reading: '📚',
  gaming: '🎮',
  travel: '✈️',
  art: '🎨',
  'side-projects': '🚀',
  mindfulness: '🧘',
  learning: '🧠',
  social: '👥',
  outdoors: '🌿',
};

export function SuggestionCard({
  suggestion,
  theme,
  onAccept,
  onDismiss,
  onSave,
}: SuggestionCardProps) {
  const [responding, setResponding] = useState(false);

  const emoji = CATEGORY_EMOJIS[suggestion.category] ?? '💡';

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setResponding(true);
    onAccept(suggestion.id);
  };

  const handleDismiss = () => {
    setResponding(true);
    onDismiss(suggestion.id);
  };

  if (responding) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.brand.primary + '08',
          borderColor: Colors.brand.primary + '25',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: Colors.brand.primary + '15' }]}>
          <Text style={styles.badgeEmoji}>💡</Text>
          <Text style={[styles.badgeText, { color: Colors.brand.primary }]}>Fresh idea</Text>
        </View>
        <Text style={[styles.category, { color: theme.textMuted }]}>
          {emoji} {suggestion.category}
        </Text>
      </View>

      {/* Suggestion content */}
      <Text style={[styles.content, { color: theme.text }]}>
        {suggestion.content}
      </Text>

      {/* Based on tags */}
      {suggestion.based_on.length > 0 && (
        <View style={styles.tags}>
          {suggestion.based_on.map((reason, idx) => (
            <View
              key={idx}
              style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Text style={[styles.tagText, { color: theme.textMuted }]}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.dismissBtn, { backgroundColor: theme.backgroundSecondary }]}
          onPress={handleDismiss}
        >
          <Text style={[styles.dismissText, { color: theme.textMuted }]}>Not now</Text>
        </Pressable>

        {onSave && (
          <Pressable
            style={[styles.saveBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => onSave(suggestion.id)}
          >
            <Text style={[styles.saveText, { color: theme.textSecondary }]}>Save</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.acceptBtn, { backgroundColor: Colors.brand.primary }]}
          onPress={handleAccept}
        >
          <Text style={styles.acceptText}>+ Add to tasks</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  category: {
    fontSize: Typography.sizes.xs,
    textTransform: 'capitalize',
  },
  content: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dismissBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  dismissText: {
    fontSize: Typography.sizes.sm,
  },
  saveBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  saveText: {
    fontSize: Typography.sizes.sm,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
