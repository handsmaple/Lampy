// ============================================
// Lampy — Profile & Settings Screen
// ============================================
// Edit interests, tone preference, roast intensity,
// notification settings, schedule, and account.

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius, type ThemeColors } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { InterestPicker } from '@/components/profile/InterestPicker';
import { SchedulePicker } from '@/components/profile/SchedulePicker';
import { LampyOrbMini } from '@/components/orb/LampyOrb';
import { useUserStore } from '@/store/userStore';
import type { InterestTag } from '@/types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const orbState = useUserStore((s) => s.orbState);

  const {
    user,
    setTonePreference,
    setInterests,
    setSchedule,
    setName,
    setLifeSituation,
    setRoastIntensity,
    signOut,
  } = useProfile();

  // Modal states
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');

  // Handle name edit
  const handleNameSave = () => {
    if (nameInput.trim()) {
      setName(nameInput.trim());
    }
    setEditingName(false);
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  // Format time for display
  const formatTime = (time24: string) => {
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.profileRow}>
            {/* Avatar with orb */}
            <View style={styles.avatarArea}>
              <View style={[styles.avatar, { backgroundColor: Colors.brand.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.orbBadge}>
                <LampyOrbMini state={orbState} size={24} />
              </View>
            </View>

            <View style={styles.profileInfo}>
              {/* Name (editable) */}
              {editingName ? (
                <View style={styles.nameEditRow}>
                  <TextInput
                    style={[styles.nameInput, { color: theme.text, borderColor: Colors.brand.primary }]}
                    value={nameInput}
                    onChangeText={setNameInput}
                    onSubmitEditing={handleNameSave}
                    onBlur={handleNameSave}
                    autoFocus
                    maxLength={30}
                    returnKeyType="done"
                  />
                </View>
              ) : (
                <Pressable onPress={() => { setNameInput(user?.name ?? ''); setEditingName(true); }}>
                  <Text style={[styles.name, { color: theme.text }]}>
                    {user?.name ?? 'Tap to set name'}
                  </Text>
                </Pressable>
              )}
              <Text style={[styles.email, { color: theme.textMuted }]}>
                {user?.email ?? ''}
              </Text>

              {/* Stats row */}
              <View style={styles.miniStats}>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatValue, { color: Colors.brand.primary }]}>
                    {user?.total_points ?? 0}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>pts</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatValue, { color: Colors.brand.secondary }]}>
                    {user?.current_streak ?? 0}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>streak</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatValue, { color: Colors.brand.accent }]}>
                    Lv.{user?.current_orb_level ?? 1}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>orb</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ====== PREFERENCES ====== */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          PREFERENCES
        </Text>

        {/* Tone Preference */}
        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Lampy's Tone</Text>
          <View style={styles.toneRow}>
            {(
              [
                { key: 'ROAST', label: 'Roast', emoji: '🔥', desc: 'Playful sarcasm' },
                { key: 'HYPE', label: 'Hype', emoji: '⚡', desc: 'Sharp energy' },
                { key: 'BALANCE', label: 'Balance', emoji: '🎯', desc: 'Mix of both' },
              ] as const
            ).map((tone) => {
              const isActive = user?.tone_preference === tone.key;
              return (
                <Pressable
                  key={tone.key}
                  style={[
                    styles.tonePill,
                    {
                      backgroundColor: isActive
                        ? Colors.brand.primary + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? Colors.brand.primary
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setTonePreference(tone.key)}
                >
                  <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                  <Text
                    style={[
                      styles.toneName,
                      { color: isActive ? Colors.brand.primary : theme.text },
                    ]}
                  >
                    {tone.label}
                  </Text>
                  <Text style={[styles.toneDesc, { color: theme.textMuted }]}>
                    {tone.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Interests */}
        <SettingsRow
          label="Interests"
          value={`${user?.interests?.length ?? 0} selected`}
          emoji="🎯"
          theme={theme}
          onPress={() => setShowInterestPicker(true)}
        />

        {/* Life Situation */}
        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Life Situation</Text>
          <View style={styles.pillRow}>
            {(
              [
                { key: 'STUDENT', label: 'Student', emoji: '🎓' },
                { key: 'WORKING', label: 'Working', emoji: '💼' },
                { key: 'FREELANCE', label: 'Freelance', emoji: '🏠' },
                { key: 'HOME', label: 'At Home', emoji: '🛋️' },
              ] as const
            ).map((opt) => {
              const isActive = user?.life_situation === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive
                        ? Colors.brand.accent + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? Colors.brand.accent
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setLifeSituation(opt.key)}
                >
                  <Text style={styles.pillEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.pillLabel,
                      { color: isActive ? Colors.brand.accent : theme.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ====== SCHEDULE ====== */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          SCHEDULE
        </Text>

        <SettingsRow
          label="Wake time"
          value={formatTime(user?.wake_time ?? '07:00')}
          emoji="🌅"
          theme={theme}
          onPress={() => setShowSchedulePicker(true)}
        />
        <SettingsRow
          label="Sleep time"
          value={formatTime(user?.sleep_time ?? '23:00')}
          emoji="🌙"
          theme={theme}
          onPress={() => setShowSchedulePicker(true)}
        />

        {/* ====== NOTIFICATIONS ====== */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          NOTIFICATIONS
        </Text>

        {/* Roast Intensity */}
        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Roast Intensity</Text>
          <Text style={[styles.settingsDesc, { color: theme.textMuted }]}>
            How spicy should Lampy's roasts be?
          </Text>
          <View style={styles.intensityRow}>
            {(
              [
                { key: 'MILD', label: 'Mild', emoji: '😊' },
                { key: 'MEDIUM', label: 'Medium', emoji: '😏' },
                { key: 'SPICY', label: 'Spicy', emoji: '🌶️' },
              ] as const
            ).map((level) => {
              const isActive = (user?.roast_intensity ?? 'MEDIUM') === level.key;
              return (
                <Pressable
                  key={level.key}
                  style={[
                    styles.intensityPill,
                    {
                      backgroundColor: isActive
                        ? Colors.brand.primary + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? Colors.brand.primary
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setRoastIntensity(level.key)}
                >
                  <Text style={styles.intensityEmoji}>{level.emoji}</Text>
                  <Text
                    style={[
                      styles.intensityLabel,
                      { color: isActive ? Colors.brand.primary : theme.text },
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SettingsRow
          label="Quiet hours"
          value={`${formatTime(user?.sleep_time ?? '23:00')} – ${formatTime(user?.wake_time ?? '07:00')}`}
          emoji="🔇"
          theme={theme}
          onPress={() => setShowSchedulePicker(true)}
        />

        {/* ====== ACCOUNT ====== */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          ACCOUNT
        </Text>

        <SettingsRow
          label="Sign out"
          value=""
          emoji="🚪"
          theme={theme}
          isDestructive
          onPress={handleSignOut}
        />

        {/* App version */}
        <Text style={[styles.versionText, { color: theme.textMuted }]}>
          Lampy v1.0.0
        </Text>
      </ScrollView>

      {/* Interest Picker Modal */}
      <InterestPicker
        visible={showInterestPicker}
        selected={user?.interests ?? []}
        theme={theme}
        onSave={(interests: InterestTag[]) => setInterests(interests)}
        onDismiss={() => setShowInterestPicker(false)}
      />

      {/* Schedule Picker Modal */}
      <SchedulePicker
        visible={showSchedulePicker}
        wakeTime={user?.wake_time ?? '07:00'}
        sleepTime={user?.sleep_time ?? '23:00'}
        theme={theme}
        onSave={(wake: string, sleep: string) => setSchedule(wake, sleep)}
        onDismiss={() => setShowSchedulePicker(false)}
      />
    </View>
  );
}

// --- Reusable Settings Row ---

function SettingsRow({
  label,
  value,
  emoji,
  theme,
  isDestructive,
  onPress,
}: {
  label: string;
  value: string;
  emoji?: string;
  theme: ThemeColors;
  isDestructive?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.settingsRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      onPress={onPress}
    >
      <View style={styles.settingsRowLeft}>
        {emoji && <Text style={styles.settingsEmoji}>{emoji}</Text>}
        <Text
          style={[
            styles.settingsRowLabel,
            { color: isDestructive ? '#EF4444' : theme.text },
          ]}
        >
          {label}
        </Text>
      </View>
      {value ? (
        <Text style={[styles.settingsRowValue, { color: theme.textMuted }]}>
          {value} ›
        </Text>
      ) : null}
    </Pressable>
  );
}

// =============================================
// Styles
// =============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 120,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
  },

  // --- Profile Card ---
  profileCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  avatarArea: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  orbBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
  },
  nameEditRow: {
    marginBottom: 2,
  },
  nameInput: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    borderBottomWidth: 2,
    paddingVertical: 2,
  },
  email: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.sm,
  },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniStatValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  miniStatLabel: {
    fontSize: Typography.sizes.xs,
  },
  miniStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB30',
  },

  // --- Section Headers ---
  sectionHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // --- Settings Card ---
  settingsCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingsLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  settingsDesc: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
  },

  // --- Tone Pills ---
  toneRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tonePill: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  toneEmoji: {
    fontSize: 20,
  },
  toneName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  toneDesc: {
    fontSize: 10,
  },

  // --- Life Situation Pills ---
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },

  // --- Intensity Pills ---
  intensityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intensityPill: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  intensityEmoji: {
    fontSize: 20,
  },
  intensityLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },

  // --- Settings Row ---
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsEmoji: {
    fontSize: 16,
  },
  settingsRowLabel: {
    fontSize: Typography.sizes.md,
  },
  settingsRowValue: {
    fontSize: Typography.sizes.sm,
  },

  // --- Version ---
  versionText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
