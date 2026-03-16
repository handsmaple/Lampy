// ============================================
// Lampy — Schedule Picker
// ============================================
// Wake time + sleep time editor with hour scroll.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

interface SchedulePickerProps {
  visible: boolean;
  wakeTime: string;   // "07:00"
  sleepTime: string;  // "23:00"
  theme: ThemeColors;
  onSave: (wake: string, sleep: string) => void;
  onDismiss: () => void;
}

// Generate time options (every 30 min)
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ['00', '30']) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m}`);
  }
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function SchedulePicker({
  visible,
  wakeTime,
  sleepTime,
  theme,
  onSave,
  onDismiss,
}: SchedulePickerProps) {
  const [localWake, setLocalWake] = useState(wakeTime);
  const [localSleep, setLocalSleep] = useState(sleepTime);
  const [editing, setEditing] = useState<'wake' | 'sleep'>('wake');

  const handleShow = () => {
    setLocalWake(wakeTime);
    setLocalSleep(sleepTime);
    setEditing('wake');
  };

  const handleSave = () => {
    onSave(localWake, localSleep);
    onDismiss();
  };

  const activeTime = editing === 'wake' ? localWake : localSleep;
  const setActiveTime = editing === 'wake' ? setLocalWake : setLocalSleep;

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
            Your Schedule
          </Text>
          <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
            Lampy uses these for notifications and quiet hours.
          </Text>

          {/* Toggle tabs */}
          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tab,
                {
                  backgroundColor: editing === 'wake'
                    ? Colors.brand.secondary + '15'
                    : theme.backgroundSecondary,
                  borderColor: editing === 'wake'
                    ? Colors.brand.secondary
                    : 'transparent',
                },
              ]}
              onPress={() => setEditing('wake')}
            >
              <Text style={styles.tabEmoji}>🌅</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: editing === 'wake' ? Colors.brand.secondary : theme.textSecondary },
                ]}
              >
                Wake up
              </Text>
              <Text
                style={[
                  styles.tabTime,
                  { color: editing === 'wake' ? Colors.brand.secondary : theme.text },
                ]}
              >
                {formatTime12(localWake)}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                {
                  backgroundColor: editing === 'sleep'
                    ? Colors.brand.blue + '15'
                    : theme.backgroundSecondary,
                  borderColor: editing === 'sleep'
                    ? Colors.brand.blue
                    : 'transparent',
                },
              ]}
              onPress={() => setEditing('sleep')}
            >
              <Text style={styles.tabEmoji}>🌙</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: editing === 'sleep' ? Colors.brand.blue : theme.textSecondary },
                ]}
              >
                Sleep
              </Text>
              <Text
                style={[
                  styles.tabTime,
                  { color: editing === 'sleep' ? Colors.brand.blue : theme.text },
                ]}
              >
                {formatTime12(localSleep)}
              </Text>
            </Pressable>
          </View>

          {/* Time grid */}
          <ScrollView
            style={styles.timeScroll}
            contentContainerStyle={styles.timeGrid}
            showsVerticalScrollIndicator={false}
          >
            {TIME_OPTIONS.map((time) => {
              const isActive = time === activeTime;
              const accentColor = editing === 'wake'
                ? Colors.brand.secondary
                : Colors.brand.blue;

              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeOption,
                    {
                      backgroundColor: isActive
                        ? accentColor + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? accentColor
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setActiveTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      { color: isActive ? accentColor : theme.text },
                    ]}
                  >
                    {formatTime12(time)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Actions */}
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
              <Text style={styles.saveText}>Save</Text>
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
    maxHeight: '80%',
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
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  tabTime: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  timeScroll: {
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  timeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minWidth: '22%',
    alignItems: 'center',
  },
  timeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
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
