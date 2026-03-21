// ============================================
// Lampy — Suggestions Hook
// ============================================
// Manages AI-generated activity suggestions.
// Max 1 suggestion per day, cached to avoid regeneration.

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { generateSuggestion } from '@/lib/ai';
import { getLocalToday } from '@/lib/date';
import type { Suggestion, SuggestionStatus } from '@/types';

export function useSuggestions() {
  const user = useUserStore((s) => s.user);
  const tasks = useUserStore((s) => s.tasks);
  const suggestions = useUserStore((s) => s.suggestions);
  const todayCheckin = useUserStore((s) => s.todayCheckin);
  const setSuggestions = useUserStore((s) => s.setSuggestions);
  const updateSuggestionStatus = useUserStore((s) => s.updateSuggestionStatus);
  const addTask = useUserStore((s) => s.addTask);
  const showError = useUserStore((s) => s.showErrorToast);

  // Check if there's a pending suggestion for today (fresh each render)
  const today = getLocalToday();
  const todaySuggestion = suggestions.find(
    (s) => s.generated_at.startsWith(today) && s.status === 'PENDING'
  );

  // Fetch suggestions from Supabase
  const fetchSuggestions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setSuggestions(data);
    }
  }, [user, setSuggestions]);

  // Generate a new suggestion (max 1 per day)
  const generateNewSuggestion = useCallback(async () => {
    if (!user) return null;

    // Already have one today
    if (todaySuggestion) return todaySuggestion;

    const recentDone = tasks
      .filter((t) => t.status === 'DONE')
      .slice(0, 5)
      .map((t) => t.title);

    const result = await generateSuggestion({
      interests: user.interests ?? [],
      life_situation: user.life_situation ?? 'WORKING',
      energy_level: todayCheckin?.level ?? 'MEDIUM',
      current_streak: user.current_streak ?? 0,
      recent_tasks: recentDone,
    });

    const suggestion: Suggestion = {
      id: crypto.randomUUID?.() ?? `sug-${Date.now()}`,
      user_id: user.id,
      content: result.content,
      category: result.category,
      based_on: result.based_on,
      status: 'PENDING',
      generated_at: new Date().toISOString(),
    };

    // Save to Supabase
    const { error } = await supabase.from('suggestions').insert(suggestion);
    if (error) {
      console.error('Failed to save suggestion:', error);
      showError('Could not save suggestion');
    }

    // Add to local state
    setSuggestions([suggestion, ...suggestions]);
    return suggestion;
  }, [user, tasks, todayCheckin, todaySuggestion, suggestions, setSuggestions]);

  // Accept suggestion → creates a task from it
  const acceptSuggestion = useCallback(
    async (id: string) => {
      const suggestion = suggestions.find((s) => s.id === id);
      if (!suggestion || !user) return;

      // Create task from suggestion
      const taskId = crypto.randomUUID?.() ?? `task-${Date.now()}`;
      const newTask = {
        id: taskId,
        user_id: user.id,
        title: suggestion.content,
        status: 'PENDING' as const,
        priority: 'MEDIUM' as const,
        is_recurring: false,
        times_rescheduled: 0,
        created_via: 'SUGGESTION' as const,
        created_at: new Date().toISOString(),
      };

      // Optimistic updates
      addTask(newTask);
      updateSuggestionStatus(id, 'ACCEPTED', taskId);

      // Save to Supabase
      await Promise.all([
        supabase.from('tasks').insert(newTask),
        supabase
          .from('suggestions')
          .update({
            status: 'ACCEPTED',
            task_id: taskId,
            responded_at: new Date().toISOString(),
          })
          .eq('id', id),
      ]);
    },
    [user, suggestions, addTask, updateSuggestionStatus]
  );

  // Dismiss suggestion
  const dismissSuggestion = useCallback(
    async (id: string) => {
      updateSuggestionStatus(id, 'DISMISSED');

      await supabase
        .from('suggestions')
        .update({
          status: 'DISMISSED',
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);
    },
    [updateSuggestionStatus]
  );

  // Save suggestion for later
  const saveSuggestion = useCallback(
    async (id: string) => {
      updateSuggestionStatus(id, 'SAVED');

      await supabase
        .from('suggestions')
        .update({
          status: 'SAVED',
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);
    },
    [updateSuggestionStatus]
  );

  return {
    suggestions,
    todaySuggestion,
    fetchSuggestions,
    generateNewSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    saveSuggestion,
  };
}
