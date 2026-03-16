// ============================================
// Lampy — Home Screen (Daily Focus)
// ============================================

import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const user = useUserStore((s) => s.user);
  const orbState = useUserStore((s) => s.orbState);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Orb placeholder — Phase 5 */}
        <View style={[styles.orbPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.orbText, { color: theme.textMuted }]}>
            Orb — {orbState}
          </Text>
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: theme.text }]}>
          {user ? `Hey, ${user.name}.` : 'Hey.'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Here's your focus for today.
        </Text>

        {/* Today's tasks placeholder — Phase 4 */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Focus
          </Text>
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            No tasks yet. Tap + to add one.
          </Text>
        </View>

        {/* Suggestion placeholder — Phase 6 */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Fresh Suggestion
          </Text>
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>
            Suggestions will appear once Lampy knows you better.
          </Text>
        </View>
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
  orbPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  orbText: {
    fontSize: Typography.sizes.xs,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xl,
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
});
