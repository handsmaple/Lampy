// ============================================
// Lampy — Rewards Screen
// ============================================

import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function RewardsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);
  const rewards = useUserStore((s) => s.rewards);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Rewards</Text>

        {/* Stats overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.statValue, { color: Colors.brand.primary }]}>
              {user?.total_points ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Points</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.statValue, { color: Colors.brand.secondary }]}>
              {user?.current_streak ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.statValue, { color: Colors.brand.accent }]}>
              {user?.current_orb_level ?? 1}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Level</Text>
          </View>
        </View>

        {/* Orb evolution placeholder — Phase 8 */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Orb Evolution</Text>
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            Complete tasks to evolve your orb.
          </Text>
        </View>

        {/* Unlockables placeholder — Phase 8 */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Unlockables</Text>
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            Themes, orb skins, and voice modes — coming soon.
          </Text>
        </View>

        {/* Recent rewards */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.md }]}>
          Recent Rewards
        </Text>
        {rewards.length === 0 ? (
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            No rewards earned yet. Start completing tasks!
          </Text>
        ) : (
          rewards.slice(0, 10).map((r) => (
            <View
              key={r.id}
              style={[styles.rewardRow, { borderBottomColor: theme.separator }]}
            >
              <Text style={[styles.rewardDesc, { color: theme.text }]}>{r.description}</Text>
              <Text style={[styles.rewardPoints, { color: Colors.brand.primary }]}>
                +{r.points_earned}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  placeholder: {
    fontSize: Typography.sizes.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  rewardDesc: {
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  rewardPoints: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
