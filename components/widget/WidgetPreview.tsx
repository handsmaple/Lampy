// ============================================
// Lampy — Widget Preview
// ============================================
// In-app preview of what the home screen widget
// will look like. Shows top 3 tasks + orb color
// + streak count. Mirrors the native widget layout.

import { StyleSheet, View, Text } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { ORB_COLORS } from '@/components/orb/OrbColors';
import type { ThemeColors } from '@/constants/theme';
import type { WidgetData, WidgetTask } from '@/lib/widget-data';

interface WidgetPreviewProps {
  data: WidgetData;
  theme: ThemeColors;
}

const PRIORITY_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F5A623',
  LOW: '#5B8FB9',
};

export function WidgetPreview({ data, theme }: WidgetPreviewProps) {
  const orbConfig = ORB_COLORS[data.orbState];

  return (
    <View style={[styles.widget, { backgroundColor: theme.card }]}>
      {/* Top row: greeting + orb dot */}
      <View style={styles.topRow}>
        <View style={styles.greetingArea}>
          <Text style={[styles.appName, { color: Colors.brand.primary }]}>
            Lampy
          </Text>
          <Text style={[styles.greeting, { color: theme.textSecondary }]} numberOfLines={1}>
            {data.greeting}
          </Text>
        </View>

        {/* Orb indicator */}
        <View style={styles.orbArea}>
          <View
            style={[
              styles.orbDot,
              { backgroundColor: orbConfig.primary },
            ]}
          />
          <View
            style={[
              styles.orbGlow,
              { backgroundColor: orbConfig.primary + '30' },
            ]}
          />
        </View>
      </View>

      {/* Task list */}
      <View style={styles.taskList}>
        {data.tasks.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No tasks — enjoy your day!
          </Text>
        ) : (
          data.tasks.map((task, index) => (
            <WidgetTaskRow
              key={task.id}
              task={task}
              theme={theme}
              isLast={index === data.tasks.length - 1}
            />
          ))
        )}
      </View>

      {/* Bottom row: streak + level */}
      <View style={styles.bottomRow}>
        <View style={styles.bottomStat}>
          <Text style={[styles.bottomEmoji]}>⚡</Text>
          <Text style={[styles.bottomValue, { color: Colors.brand.secondary }]}>
            {data.streak}
          </Text>
          <Text style={[styles.bottomLabel, { color: theme.textMuted }]}>
            streak
          </Text>
        </View>
        <View style={styles.bottomDivider} />
        <View style={styles.bottomStat}>
          <Text style={[styles.bottomEmoji]}>✨</Text>
          <Text style={[styles.bottomValue, { color: Colors.brand.accent }]}>
            Lv.{data.level}
          </Text>
          <Text style={[styles.bottomLabel, { color: theme.textMuted }]}>
            orb
          </Text>
        </View>
      </View>
    </View>
  );
}

// --- Individual task row ---

function WidgetTaskRow({
  task,
  theme,
  isLast,
}: {
  task: WidgetTask;
  theme: ThemeColors;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.taskRow,
        !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.separator },
      ]}
    >
      {/* Priority dot */}
      <View
        style={[
          styles.priorityDot,
          { backgroundColor: PRIORITY_COLORS[task.priority] },
        ]}
      />

      {/* Title */}
      <Text
        style={[
          styles.taskTitle,
          { color: task.isOverdue ? '#EF4444' : theme.text },
        ]}
        numberOfLines={1}
      >
        {task.title}
      </Text>

      {/* Overdue badge */}
      {task.isOverdue && (
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueText}>!</Text>
        </View>
      )}
    </View>
  );
}

// --- Compact "small" widget variant ---

interface WidgetPreviewSmallProps {
  data: WidgetData;
  theme: ThemeColors;
}

export function WidgetPreviewSmall({ data, theme }: WidgetPreviewSmallProps) {
  const orbConfig = ORB_COLORS[data.orbState];

  return (
    <View style={[styles.widgetSmall, { backgroundColor: theme.card }]}>
      {/* Orb + level */}
      <View style={styles.smallTop}>
        <View
          style={[styles.smallOrb, { backgroundColor: orbConfig.primary + '30' }]}
        >
          <View style={[styles.smallOrbCore, { backgroundColor: orbConfig.primary }]} />
        </View>
        <Text style={[styles.smallLevel, { color: theme.text }]}>
          Lv.{data.level}
        </Text>
      </View>

      {/* Task count */}
      <Text style={[styles.smallCount, { color: theme.text }]}>
        {data.tasks.length}
      </Text>
      <Text style={[styles.smallLabel, { color: theme.textMuted }]}>
        tasks today
      </Text>

      {/* Streak */}
      <View style={styles.smallStreak}>
        <Text style={[styles.smallStreakText, { color: Colors.brand.secondary }]}>
          ⚡ {data.streak}d
        </Text>
      </View>
    </View>
  );
}

// =============================================
// Styles
// =============================================

const styles = StyleSheet.create({
  // --- Medium Widget (default) ---
  widget: {
    borderRadius: 20,
    padding: Spacing.md,
    width: '100%',
    // iOS widget shadow-like appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
  },
  greetingArea: {
    flex: 1,
  },
  appName: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  greeting: {
    fontSize: Typography.sizes.xs,
  },
  orbArea: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    zIndex: 1,
  },
  orbGlow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
  },
  taskList: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: Spacing.sm,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskTitle: {
    fontSize: Typography.sizes.sm,
    flex: 1,
    fontWeight: Typography.weights.medium,
  },
  overdueBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF444420',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: '#EF4444',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB20',
    gap: Spacing.md,
  },
  bottomStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bottomEmoji: {
    fontSize: 11,
  },
  bottomValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  bottomLabel: {
    fontSize: 10,
  },
  bottomDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB30',
  },

  // --- Small Widget ---
  widgetSmall: {
    borderRadius: 20,
    padding: Spacing.md,
    width: 155,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  smallTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  smallOrb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallOrbCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  smallLevel: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  smallCount: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
    marginBottom: -2,
  },
  smallLabel: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xs,
  },
  smallStreak: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: '#F5A62310',
  },
  smallStreakText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
});
