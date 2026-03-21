// ============================================
// Lampy — Task Hook
// ============================================
// CRUD operations for tasks, backed by Supabase.

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import type { Task, TaskPriority, TaskCreatedVia } from '@/types';

export function useTasks() {
  const user = useUserStore((s) => s.user);
  const tasks = useUserStore((s) => s.tasks);
  const setTasks = useUserStore((s) => s.setTasks);
  const addTask = useUserStore((s) => s.addTask);
  const updateTask = useUserStore((s) => s.updateTask);
  const removeTask = useUserStore((s) => s.removeTask);
  const completeTask = useUserStore((s) => s.completeTask);
  const skipTask = useUserStore((s) => s.skipTask);
  const showError = useUserStore((s) => s.showErrorToast);

  // Fetch all tasks for user
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch tasks:', error);
      showError('Could not load your tasks');
      return;
    }
    if (data) setTasks(data);
  }, [user, setTasks]);

  // Create a new task
  const createTask = useCallback(
    async (input: {
      title: string;
      notes?: string;
      priority?: TaskPriority;
      due_date?: string;
      due_time?: string;
      estimated_minutes?: number;
      is_recurring?: boolean;
      recurrence_rule?: string;
      created_via?: TaskCreatedVia;
    }) => {
      if (!user) return null;

      const newTask: Task = {
        id: crypto.randomUUID?.() ?? `task-${Date.now()}`,
        user_id: user.id,
        title: input.title,
        notes: input.notes,
        status: 'PENDING',
        priority: input.priority ?? 'MEDIUM',
        due_date: input.due_date,
        due_time: input.due_time,
        estimated_minutes: input.estimated_minutes,
        is_recurring: input.is_recurring ?? false,
        recurrence_rule: input.recurrence_rule,
        times_rescheduled: 0,
        created_via: input.created_via ?? 'MANUAL',
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      addTask(newTask);

      const { error } = await supabase.from('tasks').insert(newTask);
      if (error) {
        console.error('Failed to create task:', error);
        removeTask(newTask.id);
        Alert.alert('Error', 'Failed to create task.');
        return null;
      }

      return newTask;
    },
    [user, addTask, removeTask]
  );

  // Update an existing task
  const editTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      // Optimistic update
      updateTask(id, updates);

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Failed to update task:', error);
        showError('Could not save changes');
        // Refetch to restore state
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  // Revert a task to PENDING (undo complete/skip)
  const undoStatusChange = useCallback(
    async (id: string) => {
      updateTask(id, { status: 'PENDING', completed_at: undefined });

      const { error } = await supabase
        .from('tasks')
        .update({ status: 'PENDING', completed_at: null })
        .eq('id', id);

      if (error) {
        console.error('Failed to undo status change:', error);
        showError('Could not undo that action');
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  // Restore a deleted task (re-insert)
  const undoDelete = useCallback(
    async (task: Task) => {
      addTask(task);

      const { error } = await supabase.from('tasks').insert(task);
      if (error) {
        console.error('Failed to restore task:', error);
        showError('Could not restore the task');
        removeTask(task.id);
      }
    },
    [addTask, removeTask]
  );

  // Complete a task
  const markComplete = useCallback(
    async (id: string) => {
      completeTask(id);

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'DONE',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to complete task:', error);
        showError('Could not mark as complete');
        fetchTasks();
      }
    },
    [completeTask, fetchTasks]
  );

  // Skip a task
  const markSkipped = useCallback(
    async (id: string) => {
      skipTask(id);

      const { error } = await supabase
        .from('tasks')
        .update({ status: 'SKIPPED' })
        .eq('id', id);

      if (error) {
        console.error('Failed to skip task:', error);
        showError('Could not skip the task');
        fetchTasks();
      }
    },
    [skipTask, fetchTasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (id: string) => {
      removeTask(id);

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete task:', error);
        showError('Could not delete the task');
        fetchTasks();
      }
    },
    [removeTask, fetchTasks]
  );

  // Reschedule a task (bumps times_rescheduled)
  const rescheduleTask = useCallback(
    async (id: string, newDate: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      editTask(id, {
        due_date: newDate,
        times_rescheduled: task.times_rescheduled + 1,
      });
    },
    [tasks, editTask]
  );

  return {
    tasks,
    fetchTasks,
    createTask,
    editTask,
    markComplete,
    markSkipped,
    deleteTask,
    rescheduleTask,
    undoStatusChange,
    undoDelete,
  };
}
