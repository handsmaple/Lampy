// ============================================
// Lampy — Profile & Settings Screen
// ============================================

import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius, type ThemeColors } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

        {/* User info */}
        <View style={[styles.profileCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.avatar, { backgroundColor: Colors.brand.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.name ?? 'Not signed in'}
          </Text>
          <Text style={[styles.email, { color: theme.textMuted }]}>
            {user?.email ?? ''}
          </Text>
        </View>

        {/* Settings sections — Phase 10 */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          PREFERENCES
        </Text>

        <SettingsRow
          label="Tone"
          value={user?.tone_preference ?? 'BALANCE'}
          theme={theme}
        />
        <SettingsRow
          label="Interests"
          value={`${user?.interests?.length ?? 0} selected`}
          theme={theme}
        />
        <SettingsRow
          label="Wake time"
          value={user?.wake_time ?? '07:00'}
          theme={theme}
        />
        <SettingsRow
          label="Sleep time"
          value={user?.sleep_time ?? '23:00'}
          theme={theme}
        />

        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          NOTIFICATIONS
        </Text>

        <SettingsRow label="Frequency" value="Normal" theme={theme} />
        <SettingsRow label="Quiet hours" value="23:00 – 07:00" theme={theme} />
        <SettingsRow label="Roast intensity" value="Medium" theme={theme} />

        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          ACCOUNT
        </Text>

        <SettingsRow label="Sign out" value="" theme={theme} />
      </ScrollView>
    </View>
  );
}

function SettingsRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
}) {
  return (
    <Pressable
      style={[styles.settingsRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
    >
      <Text style={[styles.settingsLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.settingsValue, { color: theme.textMuted }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.sizes.sm,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  settingsLabel: {
    fontSize: Typography.sizes.md,
  },
  settingsValue: {
    fontSize: Typography.sizes.sm,
  },
});
