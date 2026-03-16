// ============================================
// Lampy — Rewards Screen
// ============================================
// Orb evolution display, streak tracker, points
// history, and unlockables gallery.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useRewards, UNLOCKABLES_CATALOG } from '@/hooks/useRewards';
import { LampyOrbMini } from '@/components/orb/LampyOrb';
import { UnlockRevealModal } from '@/components/rewards/RewardModal';
import type { OrbState, Unlockable, UnlockableType } from '@/types';

// --- Tab filter for unlockables ---
type UnlockableTab = 'ALL' | UnlockableType;

export default function RewardsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);
  const rewards = useUserStore((s) => s.rewards);
  const orbState = useUserStore((s) => s.orbState);

  const {
    fetchRewards,
    fetchUnlocked,
    purchaseUnlockable,
    activateUnlockable,
    getLevelProgress,
    getCatalogWithStatus,
    ORB_LEVELS,
  } = useRewards();

  const [activeTab, setActiveTab] = useState<UnlockableTab>('ALL');
  const [revealItem, setRevealItem] = useState<Unlockable | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchRewards();
    fetchUnlocked();
  }, [fetchRewards, fetchUnlocked]);

  const levelProgress = getLevelProgress();
  const catalogItems = getCatalogWithStatus();

  // Filter catalog by tab
  const filteredItems =
    activeTab === 'ALL'
      ? catalogItems
      : catalogItems.filter((item) => item.type === activeTab);

  // Handle purchase
  const handlePurchase = async (item: Unlockable) => {
    const success = await purchaseUnlockable(item);
    if (success) {
      setRevealItem(item);
      setShowReveal(true);
    }
  };

  // Handle activate
  const handleActivate = (unlockableId: string) => {
    activateUnlockable(unlockableId);
  };

  // Tab config
  const tabs: { key: UnlockableTab; label: string; emoji: string }[] = [
    { key: 'ALL', label: 'All', emoji: '🏪' },
    { key: 'THEME', label: 'Themes', emoji: '🎨' },
    { key: 'ORB_SKIN', label: 'Orb Skins', emoji: '✨' },
    { key: 'VOICE_MODE', label: 'Voice', emoji: '🗣️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: theme.text }]}>Rewards</Text>

        {/* Stats Row */}
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

        {/* Orb Evolution */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Orb Evolution
          </Text>

          {/* Orb display with level */}
          <View style={styles.orbEvolutionRow}>
            <LampyOrbMini state={orbState} size={48} />
            <View style={styles.orbInfo}>
              <Text style={[styles.orbLevelText, { color: theme.text }]}>
                Level {user?.current_orb_level ?? 1}
              </Text>
              {levelProgress.isMaxLevel ? (
                <Text style={[styles.orbProgressLabel, { color: Colors.brand.accent }]}>
                  Max Level Reached!
                </Text>
              ) : (
                <Text style={[styles.orbProgressLabel, { color: theme.textSecondary }]}>
                  {levelProgress.current} / {levelProgress.needed} to next level
                </Text>
              )}
            </View>
          </View>

          {/* Progress bar */}
          {!levelProgress.isMaxLevel && (
            <View style={[styles.progressBarBg, { backgroundColor: theme.separator }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: Colors.brand.accent,
                    width: `${Math.round(levelProgress.progress * 100)}%`,
                  },
                ]}
              />
            </View>
          )}

          {/* Level milestones */}
          <View style={styles.milestonesRow}>
            {ORB_LEVELS.slice(0, 5).map((entry) => {
              const isReached = (user?.current_orb_level ?? 1) >= entry.level;
              return (
                <View key={entry.level} style={styles.milestoneItem}>
                  <View
                    style={[
                      styles.milestoneDot,
                      {
                        backgroundColor: isReached
                          ? Colors.brand.accent
                          : theme.separator,
                      },
                    ]}
                  >
                    <Text style={styles.milestoneDotText}>{entry.level}</Text>
                  </View>
                  <Text
                    style={[
                      styles.milestonePoints,
                      { color: isReached ? Colors.brand.accent : theme.textMuted },
                    ]}
                  >
                    {entry.points}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Streak Tracker */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Streak Tracker
          </Text>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={[styles.streakNumber, { color: Colors.brand.secondary }]}>
                {user?.current_streak ?? 0}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
                Current
              </Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={[styles.streakNumber, { color: Colors.brand.primary }]}>
                {user?.longest_streak ?? 0}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
                Longest
              </Text>
            </View>
          </View>

          {/* Streak milestone markers */}
          <View style={styles.streakMilestones}>
            {[3, 7, 14, 21, 30].map((milestone) => {
              const currentStreak = user?.current_streak ?? 0;
              const reached = currentStreak >= milestone;
              return (
                <View key={milestone} style={styles.streakMilestoneItem}>
                  <View
                    style={[
                      styles.streakBadge,
                      {
                        backgroundColor: reached
                          ? Colors.brand.secondary + '20'
                          : theme.separator + '40',
                        borderColor: reached
                          ? Colors.brand.secondary
                          : theme.separator,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.streakBadgeText,
                        {
                          color: reached
                            ? Colors.brand.secondary
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {milestone}
                    </Text>
                  </View>
                  <Text style={[styles.streakBadgeLabel, { color: theme.textMuted }]}>
                    {reached ? '✓' : `${milestone}d`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Unlockables Gallery */}
        <View style={styles.gallerySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Unlockables
          </Text>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabRow}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive
                        ? Colors.brand.accent + '15'
                        : theme.backgroundSecondary,
                      borderColor: isActive
                        ? Colors.brand.accent
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive ? Colors.brand.accent : theme.textSecondary,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Unlockable cards */}
          <View style={styles.unlockableGrid}>
            {filteredItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.unlockableCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: item.isActive
                      ? Colors.brand.accent
                      : item.isOwned
                        ? theme.cardBorder
                        : theme.separator,
                    opacity: item.canPurchase || item.isOwned ? 1 : 0.5,
                  },
                ]}
              >
                {/* Active badge */}
                {item.isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: Colors.brand.accent }]}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}

                {/* Icon */}
                <Text style={styles.unlockableEmoji}>
                  {item.type === 'THEME'
                    ? '🎨'
                    : item.type === 'ORB_SKIN'
                      ? '✨'
                      : '🗣️'}
                </Text>

                {/* Name */}
                <Text
                  style={[styles.unlockableName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {/* Status / Action */}
                {item.isOwned ? (
                  item.isActive ? (
                    <Text style={[styles.unlockableStatus, { color: Colors.brand.accent }]}>
                      Equipped
                    </Text>
                  ) : (
                    <Pressable
                      style={[
                        styles.equipButton,
                        { backgroundColor: Colors.brand.accent + '15' },
                      ]}
                      onPress={() => handleActivate(item.id)}
                    >
                      <Text style={[styles.equipText, { color: Colors.brand.accent }]}>
                        Equip
                      </Text>
                    </Pressable>
                  )
                ) : (
                  <Pressable
                    style={[
                      styles.purchaseButton,
                      {
                        backgroundColor: item.canPurchase
                          ? Colors.brand.primary
                          : theme.separator,
                      },
                    ]}
                    onPress={() => item.canPurchase && handlePurchase(item)}
                    disabled={!item.canPurchase}
                  >
                    <Text
                      style={[
                        styles.purchaseText,
                        { color: item.canPurchase ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {item.cost_points} pts
                    </Text>
                  </Pressable>
                )}

                {/* Streak requirement */}
                {!item.isOwned && item.required_streak && !item.meetsStreak && (
                  <Text style={[styles.requirementText, { color: theme.textMuted }]}>
                    Needs {item.required_streak}d streak
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Rewards */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Rewards
          </Text>
          {rewards.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No rewards earned yet. Start completing tasks!
              </Text>
            </View>
          ) : (
            rewards.slice(0, 15).map((r) => (
              <View
                key={r.id}
                style={[styles.rewardRow, { borderBottomColor: theme.separator }]}
              >
                <View style={styles.rewardLeft}>
                  <Text style={styles.rewardEmoji}>
                    {r.type === 'STREAK'
                      ? '⚡'
                      : r.type === 'TASK_COMPLETE'
                        ? '✅'
                        : r.type === 'MILESTONE'
                          ? '🎉'
                          : '💡'}
                  </Text>
                  <View style={styles.rewardInfo}>
                    <Text
                      style={[styles.rewardDesc, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {r.description}
                    </Text>
                    <Text style={[styles.rewardDate, { color: theme.textMuted }]}>
                      {formatRewardDate(r.earned_at)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.rewardPoints, { color: Colors.brand.primary }]}>
                  +{r.points_earned}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Unlock Reveal Modal */}
      <UnlockRevealModal
        visible={showReveal}
        unlockable={revealItem}
        theme={theme}
        onDismiss={() => {
          setShowReveal(false);
          setRevealItem(null);
        }}
      />
    </View>
  );
}

// --- Helpers ---

function formatRewardDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
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

  // --- Stats ---
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.md,
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

  // --- Sections ---
  section: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },

  // --- Orb Evolution ---
  orbEvolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  orbInfo: {
    flex: 1,
  },
  orbLevelText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  orbProgressLabel: {
    fontSize: Typography.sizes.xs,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneItem: {
    alignItems: 'center',
    gap: 2,
  },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneDotText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  milestonePoints: {
    fontSize: 10,
  },

  // --- Streak ---
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
  },
  streakLabel: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB30',
  },
  streakMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakMilestoneItem: {
    alignItems: 'center',
    gap: 4,
  },
  streakBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  streakBadgeLabel: {
    fontSize: 10,
  },

  // --- Unlockables Gallery ---
  gallerySection: {
    marginBottom: Spacing.lg,
  },
  tabScroll: {
    marginBottom: Spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },

  unlockableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  unlockableCard: {
    width: '48%',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    minHeight: 140,
  },
  activeBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  unlockableEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  unlockableName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  unlockableStatus: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  equipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  equipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  purchaseButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  purchaseText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  requirementText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },

  // --- Recent Rewards ---
  recentSection: {
    marginBottom: Spacing.lg,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  rewardEmoji: {
    fontSize: 18,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardDesc: {
    fontSize: Typography.sizes.sm,
  },
  rewardDate: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  rewardPoints: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
