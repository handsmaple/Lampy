// ============================================
// Lampy — Message Templates
// ============================================
// Personality-driven notification templates.
// Variables wrapped in {{}} are replaced at runtime.

import type { LampyMode, LampyTrigger } from '@/types';

export interface MessageTemplate {
  mode: LampyMode;
  trigger: LampyTrigger;
  templates: string[];
}

// --- Roast Mode ---

const ROAST_OVERDUE: string[] = [
  "Day {{days}} of 'I'll do it tomorrow.' Cute.",
  "{{task}} has been waiting {{days}} days. It's starting to lose hope.",
  "You've moved {{task}} {{times}} times now. At this point it's a tradition.",
  "{{task}} called. It wants to know if you're ever coming back.",
  "Still ignoring {{task}}? Bold strategy.",
];

const ROAST_INACTIVITY: string[] = [
  "Haven't seen you in {{hours}} hours. Did you forget I exist?",
  "Your tasks are collecting dust. Just like your plans.",
  "The app is open. Your tasks are here. Your effort is not.",
  "48 hours of silence. I see how it is.",
];

// --- Hype Mode ---

const HYPE_STREAK: string[] = [
  "{{streak}} days straight. You're actually doing it.",
  "Streak: {{streak}}. This is not a drill.",
  "{{streak}} in a row. Who even are you right now?",
  "You hit {{streak}} days. Most people quit at 3. Not you.",
];

const HYPE_MILESTONE: string[] = [
  "Level up. You earned this.",
  "New unlock. Because you showed up.",
  "{{points}} points. That's not luck — that's you.",
  "Something new just unlocked. Go see what you earned.",
];

const HYPE_TASK_COMPLETE: string[] = [
  "Done. One less thing haunting you.",
  "Checked off {{task}}. Keep that energy.",
  "{{task}} — handled. What's next?",
  "That's {{count}} today. You're on a roll.",
];

// --- Real Mode ---

const REAL_LOW_ENERGY: string[] = [
  "Rough day? One small thing. That's all.",
  "Low energy noted. Just pick the easiest thing on your list.",
  "Not every day has to be productive. But one tiny win helps.",
  "You showed up. That counts. Now pick one thing.",
];

const REAL_CHECKIN: string[] = [
  "Hey {{name}}. How are we feeling today?",
  "New day. Let's see what we're working with.",
  "Morning, {{name}}. Quick check — how's your energy?",
];

// --- All Templates ---

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { mode: 'ROAST', trigger: 'OVERDUE', templates: ROAST_OVERDUE },
  { mode: 'ROAST', trigger: 'INACTIVITY', templates: ROAST_INACTIVITY },
  { mode: 'HYPE', trigger: 'STREAK', templates: HYPE_STREAK },
  { mode: 'HYPE', trigger: 'MILESTONE', templates: HYPE_MILESTONE },
  { mode: 'HYPE', trigger: 'CHECKIN', templates: HYPE_TASK_COMPLETE },
  { mode: 'REAL', trigger: 'CHECKIN', templates: REAL_CHECKIN },
  { mode: 'REAL', trigger: 'INACTIVITY', templates: REAL_LOW_ENERGY },
];

/**
 * Pick a random template for a given mode + trigger combo,
 * then fill in variables from context.
 */
export function generateMessage(
  mode: LampyMode,
  trigger: LampyTrigger,
  context: Record<string, string | number> = {}
): string {
  const group = MESSAGE_TEMPLATES.find(
    (t) => t.mode === mode && t.trigger === trigger
  );

  if (!group || group.templates.length === 0) {
    // Fallback
    return mode === 'ROAST'
      ? "You know what you need to do."
      : mode === 'HYPE'
      ? "Let's go."
      : "One step at a time.";
  }

  // Pick random template
  const template = group.templates[Math.floor(Math.random() * group.templates.length)];

  // Replace {{variables}} with context values
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return context[key]?.toString() ?? key;
  });
}
