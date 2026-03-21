// ============================================
// Lampy — Widget Data Provider
// ============================================
// Prepares and stores data for the home screen widget.
// Top 3 tasks + orb state + streak, synced to
// shared storage for native widget consumption.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, OrbState } from '@/types';
import { getLocalToday } from '@/lib/date';

// --- Widget Data Shape ---

export interface WidgetData {
  tasks: WidgetTask[];
  orbState: OrbState;
  streak: number;
  level: number;
  greeting: string;
  updatedAt: string;
}

export interface WidgetTask {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isOverdue: boolean;
}

const WIDGET_STORAGE_KEY = 'lampy_widget_data';

// --- Build widget data from current state ---

export function buildWidgetData(
  tasks: Task[],
  orbState: OrbState,
  streak: number,
  level: number,
  userName?: string
): WidgetData {
  const today = getLocalToday();

  // Get top 3 pending tasks (overdue first → priority → due date)
  const topTasks = tasks
    .filter((t) => {
      if (t.status !== 'PENDING') return false;
      if (!t.due_date) return true;
      return t.due_date <= today;
    })
    .sort((a, b) => {
      const aOverdue = a.due_date && a.due_date < today;
      const bOverdue = b.due_date && b.due_date < today;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      isOverdue: !!(t.due_date && t.due_date < today),
    }));

  // Time-based greeting
  const hour = new Date().getHours();
  const name = userName ? `, ${userName}` : '';
  let greeting: string;
  if (hour < 12) greeting = `Good morning${name}`;
  else if (hour < 17) greeting = `Good afternoon${name}`;
  else greeting = `Good evening${name}`;

  return {
    tasks: topTasks,
    orbState,
    streak,
    level,
    greeting,
    updatedAt: new Date().toISOString(),
  };
}

// --- Save widget data to shared storage ---

export async function saveWidgetData(data: WidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save widget data:', error);
  }
}

// --- Read widget data from shared storage ---

export async function loadWidgetData(): Promise<WidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WidgetData;
  } catch (error) {
    console.error('Failed to load widget data:', error);
    return null;
  }
}
