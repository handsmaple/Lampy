// ============================================
// Lampy — Profile Hook
// ============================================
// Manages user profile updates with Supabase sync.

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import type { TonePreference, InterestTag, LifeSituation } from '@/types';

export function useProfile() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  // Update a single field or multiple fields
  const updateProfile = useCallback(
    async (updates: Partial<{
      name: string;
      tone_preference: TonePreference;
      life_situation: LifeSituation;
      interests: InterestTag[];
      wake_time: string;
      sleep_time: string;
    }>) => {
      if (!user) return false;

      // Optimistic update
      setUser({ ...user, ...updates });

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update profile:', error);
        // Revert
        setUser(user);
        Alert.alert('Error', 'Failed to save changes.');
        return false;
      }

      return true;
    },
    [user, setUser]
  );

  // Update tone preference
  const setTonePreference = useCallback(
    (tone: TonePreference) => updateProfile({ tone_preference: tone }),
    [updateProfile]
  );

  // Update interests
  const setInterests = useCallback(
    (interests: InterestTag[]) => updateProfile({ interests }),
    [updateProfile]
  );

  // Update schedule
  const setSchedule = useCallback(
    (wake_time: string, sleep_time: string) =>
      updateProfile({ wake_time, sleep_time }),
    [updateProfile]
  );

  // Update name
  const setName = useCallback(
    (name: string) => updateProfile({ name }),
    [updateProfile]
  );

  // Update life situation
  const setLifeSituation = useCallback(
    (life_situation: LifeSituation) => updateProfile({ life_situation }),
    [updateProfile]
  );

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
      return;
    }
    clearUser();
  }, [clearUser]);

  return {
    user,
    updateProfile,
    setTonePreference,
    setInterests,
    setSchedule,
    setName,
    setLifeSituation,
    signOut,
  };
}
