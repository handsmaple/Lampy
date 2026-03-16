// ============================================
// Lampy — Offline Operation Queue
// ============================================
// Queues Supabase operations when offline and
// replays them when connectivity is restored.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { supabase } from './supabase';

interface QueuedOperation {
  id: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data?: Record<string, any>;
  matchColumn?: string;
  matchValue?: string;
  createdAt: string;
}

const QUEUE_KEY = 'lampy_offline_queue';

// --- Queue an operation for later ---

export async function enqueueOperation(op: Omit<QueuedOperation, 'id' | 'createdAt'>): Promise<void> {
  try {
    const queue = await getQueue();
    queue.push({
      ...op,
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to enqueue operation:', error);
  }
}

// --- Get all queued operations ---

export async function getQueue(): Promise<QueuedOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// --- Replay all queued operations ---

export async function replayQueue(): Promise<number> {
  const queue = await getQueue();
  if (queue.length === 0) return 0;

  let replayed = 0;
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    try {
      let error: any = null;

      if (op.type === 'INSERT' && op.data) {
        const result = await supabase.from(op.table).insert(op.data);
        error = result.error;
      } else if (op.type === 'UPDATE' && op.data && op.matchColumn && op.matchValue) {
        const result = await supabase
          .from(op.table)
          .update(op.data)
          .eq(op.matchColumn, op.matchValue);
        error = result.error;
      } else if (op.type === 'DELETE' && op.matchColumn && op.matchValue) {
        const result = await supabase
          .from(op.table)
          .delete()
          .eq(op.matchColumn, op.matchValue);
        error = result.error;
      }

      if (error) {
        console.warn('Failed to replay operation:', op.id, error);
        remaining.push(op);
      } else {
        replayed++;
      }
    } catch {
      remaining.push(op);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return replayed;
}

// --- Check if we have pending operations ---

export async function hasPendingOperations(): Promise<boolean> {
  const queue = await getQueue();
  return queue.length > 0;
}

// --- Auto-replay when app returns to foreground ---

let isListening = false;

export function startOfflineSync(): void {
  if (isListening) return;
  isListening = true;

  AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      const count = await replayQueue();
      if (count > 0) {
        console.log(`Replayed ${count} offline operations`);
      }
    }
  });
}
