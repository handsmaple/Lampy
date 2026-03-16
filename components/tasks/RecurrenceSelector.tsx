// ============================================
// Lampy — Recurrence Selector
// ============================================
// Pick a recurring schedule for tasks using RRULE format.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

interface RecurrenceSelectorProps {
  theme: ThemeColors;
  value?: string; // RRULE string
  onChange: (rule: string | undefined) => void;
}

type FrequencyOption = {
  label: string;
  value: string; // RRULE fragment
  emoji: string;
};

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { label: 'Daily', value: 'FREQ=DAILY', emoji: '📅' },
  { label: 'Weekdays', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', emoji: '💼' },
  { label: 'Weekly', value: 'FREQ=WEEKLY', emoji: '🔄' },
  { label: 'Custom days', value: 'CUSTOM', emoji: '🎯' },
];

const DAYS_OF_WEEK = [
  { short: 'MO', label: 'Mon' },
  { short: 'TU', label: 'Tue' },
  { short: 'WE', label: 'Wed' },
  { short: 'TH', label: 'Thu' },
  { short: 'FR', label: 'Fri' },
  { short: 'SA', label: 'Sat' },
  { short: 'SU', label: 'Sun' },
];

export function RecurrenceSelector({ theme, value, onChange }: RecurrenceSelectorProps) {
  const [isEnabled, setIsEnabled] = useState(!!value);
  const [selectedFreq, setSelectedFreq] = useState<string | null>(
    value ? getFreqFromRule(value) : null
  );
  const [customDays, setCustomDays] = useState<string[]>(
    value ? getDaysFromRule(value) : []
  );

  const handleToggle = () => {
    if (isEnabled) {
      setIsEnabled(false);
      setSelectedFreq(null);
      setCustomDays([]);
      onChange(undefined);
    } else {
      setIsEnabled(true);
    }
  };

  const handleFreqSelect = (option: FrequencyOption) => {
    setSelectedFreq(option.value);

    if (option.value === 'CUSTOM') {
      // Wait for day selection
      if (customDays.length > 0) {
        onChange(`FREQ=WEEKLY;BYDAY=${customDays.join(',')}`);
      }
    } else {
      onChange(option.value);
    }
  };

  const toggleDay = (dayCode: string) => {
    setCustomDays((prev) => {
      const next = prev.includes(dayCode)
        ? prev.filter((d) => d !== dayCode)
        : [...prev, dayCode];

      if (next.length > 0) {
        onChange(`FREQ=WEEKLY;BYDAY=${next.join(',')}`);
      } else {
        onChange(undefined);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* Toggle recurring on/off */}
      <Pressable
        style={[
          styles.toggleRow,
          {
            backgroundColor: isEnabled
              ? Colors.brand.primary + '15'
              : theme.backgroundSecondary,
          },
        ]}
        onPress={handleToggle}
      >
        <Text style={styles.toggleEmoji}>{isEnabled ? '🔁' : '➡️'}</Text>
        <View style={styles.toggleText}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>
            {isEnabled ? 'Repeating task' : 'One-time task'}
          </Text>
          <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>
            {isEnabled ? 'Tap to make one-time' : 'Tap to make recurring'}
          </Text>
        </View>
      </Pressable>

      {/* Frequency options */}
      {isEnabled && (
        <View style={styles.freqGrid}>
          {FREQUENCY_OPTIONS.map((option) => {
            const isSelected = selectedFreq === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.freqPill,
                  {
                    backgroundColor: isSelected
                      ? Colors.brand.primary
                      : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => handleFreqSelect(option)}
              >
                <Text style={styles.freqEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.freqLabel,
                    { color: isSelected ? '#fff' : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Custom day picker */}
      {isEnabled && selectedFreq === 'CUSTOM' && (
        <View style={styles.dayRow}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = customDays.includes(day.short);
            return (
              <Pressable
                key={day.short}
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: isSelected
                      ? Colors.brand.primary
                      : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => toggleDay(day.short)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isSelected ? '#fff' : theme.text },
                  ]}
                >
                  {day.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// --- Helpers ---

function getFreqFromRule(rule: string): string {
  if (rule.includes('BYDAY=MO,TU,WE,TH,FR') && !rule.match(/BYDAY=.*,(SA|SU)/)) {
    return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  }
  if (rule === 'FREQ=DAILY') return 'FREQ=DAILY';
  if (rule === 'FREQ=WEEKLY') return 'FREQ=WEEKLY';
  return 'CUSTOM';
}

function getDaysFromRule(rule: string): string[] {
  const match = rule.match(/BYDAY=([A-Z,]+)/);
  return match ? match[1].split(',') : [];
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  toggleEmoji: {
    fontSize: 24,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  toggleDesc: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  freqPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  freqEmoji: {
    fontSize: 14,
  },
  freqLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
});
