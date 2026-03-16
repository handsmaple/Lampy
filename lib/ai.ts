// ============================================
// Lampy — AI Integration (Claude API)
// ============================================
// NLP task parsing, suggestion generation, motivation messages.
// All calls go through Supabase Edge Functions in production.
// For dev, we use local parsing fallbacks.

import type { TaskPriority } from '@/types';

// --- NLP Task Parsing ---

export interface ParsedTask {
  title: string;
  due_date?: string;
  due_time?: string;
  priority: TaskPriority;
  estimated_minutes?: number;
}

/**
 * Parse natural language into structured task data.
 * Uses local parsing for dev, Claude API via Edge Function in production.
 *
 * Examples:
 *   "dentist Friday 3pm" → { title: "Dentist", due_date: "2026-03-20", due_time: "15:00", priority: "MEDIUM" }
 *   "urgent: finish report by tomorrow" → { title: "Finish report", due_date: "2026-03-17", priority: "HIGH" }
 */
export function parseTaskInput(input: string): ParsedTask {
  const trimmed = input.trim();
  let title = trimmed;
  let priority: TaskPriority = 'MEDIUM';
  let due_date: string | undefined;
  let due_time: string | undefined;

  // Detect priority keywords
  if (/\b(urgent|asap|important|critical)\b/i.test(trimmed)) {
    priority = 'HIGH';
    title = title.replace(/\b(urgent|asap|important|critical):?\s*/i, '');
  } else if (/\b(low|whenever|maybe|someday)\b/i.test(trimmed)) {
    priority = 'LOW';
    title = title.replace(/\b(low|whenever|maybe|someday):?\s*/i, '');
  }

  // Detect time patterns (e.g., "3pm", "15:00", "at 2:30pm")
  const timeMatch = trimmed.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3]?.toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    due_time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    title = title.replace(timeMatch[0], '').trim();
  }

  // Detect day-of-week patterns
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // Check "today" / "tomorrow"
  if (/\btomorrow\b/i.test(trimmed)) {
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    due_date = tmrw.toISOString().split('T')[0];
    title = title.replace(/\btomorrow\b/i, '').trim();
  } else if (/\btoday\b/i.test(trimmed)) {
    due_date = today.toISOString().split('T')[0];
    title = title.replace(/\btoday\b/i, '').trim();
  } else {
    // Check for day names
    for (let i = 0; i < 7; i++) {
      const regex = new RegExp(`\\b(${dayNames[i]}|${dayShort[i]})\\b`, 'i');
      if (regex.test(trimmed)) {
        const currentDay = today.getDay();
        let daysAhead = i - currentDay;
        if (daysAhead <= 0) daysAhead += 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysAhead);
        due_date = targetDate.toISOString().split('T')[0];
        title = title.replace(regex, '').trim();
        break;
      }
    }
  }

  // Clean up title
  title = title
    .replace(/\b(by|on|at|for)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title: title || trimmed,
    due_date,
    due_time,
    priority,
  };
}
