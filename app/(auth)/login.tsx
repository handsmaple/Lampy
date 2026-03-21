// ============================================
// Lampy — Login Screen
// ============================================

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hold on', 'Enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // New user → set auth state, go to onboarding
          setUser({
            id: data.user.id,
            name: '',
            email: data.user.email ?? email,
            created_at: new Date().toISOString(),
            tone_preference: 'BALANCE',
            wake_time: '07:00',
            sleep_time: '23:00',
            life_situation: 'WORKING',
            interests: [],
            current_orb_level: 1,
            total_points: 0,
            longest_streak: 0,
            current_streak: 0,
            roast_intensity: 'MEDIUM',
          });
          setOnboarded(false);
          router.replace('/(auth)/onboarding' as any);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          // Returning user → fetch profile from Supabase
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setOnboarded(true);
            router.replace('/(tabs)' as any);
          } else {
            // Has account but no profile → needs onboarding
            setUser({
              id: data.user.id,
              name: '',
              email: data.user.email ?? email,
              created_at: new Date().toISOString(),
              tone_preference: 'BALANCE',
              wake_time: '07:00',
              sleep_time: '23:00',
              life_situation: 'WORKING',
              interests: [],
              current_orb_level: 1,
              total_points: 0,
              longest_streak: 0,
              current_streak: 0,
              roast_intensity: 'MEDIUM',
            });
            setOnboarded(false);
            router.replace('/(auth)/onboarding' as any);
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.orbPreview, { backgroundColor: Colors.brand.primary }]} />
          <Text style={[styles.title, { color: theme.text }]}>Lampy</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp
              ? "Let's get your life interesting again."
              : 'Welcome back.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.button, { backgroundColor: Colors.brand.primary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Let's go" : 'Sign in'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Toggle */}
        <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
          <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={{ color: Colors.brand.primary, fontWeight: '600' }}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  orbPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
  },
  button: {
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  toggle: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
  },
});
