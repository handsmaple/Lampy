// ============================================
// Lampy — Message Templates
// ============================================
// Personality-driven notification templates.
// Variables wrapped in {{}} are replaced at runtime.
// Roast templates are grouped by intensity (MILD/MEDIUM/SPICY).

import type { LampyMode, LampyTrigger, RoastIntensity } from '@/types';

export interface MessageTemplate {
  mode: LampyMode;
  trigger: LampyTrigger;
  templates: string[];
  intensity?: RoastIntensity; // Only used for ROAST mode
}

// =============================================
// ROAST — MILD (gentle nudge, still playful)
// =============================================

const ROAST_MILD_OVERDUE: string[] = [
  "Hey, {{task}} is still hanging around. Maybe today?",
  "{{task}} has been waiting {{days}} days. No pressure, but… it's been {{days}} days.",
  "Friendly reminder: {{task}} hasn't gone anywhere.",
  "You've got {{task}} on your list still. Just saying.",
];

const ROAST_MILD_INACTIVITY: string[] = [
  "Haven't seen you in a while. Everything good?",
  "Your tasks miss you. Just a little.",
  "The app's been quiet. You okay?",
  "A quick check-in would be nice. Just one task?",
];

const ROAST_MILD_STREAK: string[] = [
  "{{streak}} days! Quietly impressive.",
  "Streak: {{streak}}. Not bad at all.",
  "You've been at it for {{streak}} days. Respect.",
];

const ROAST_MILD_MILESTONE: string[] = [
  "New level. Look at you go.",
  "Something unlocked. You earned that.",
  "{{points}} points. Steady progress.",
];

const ROAST_MILD_CHECKIN: string[] = [
  "Morning. Let's see what today brings.",
  "New day, {{name}}. What are we working with?",
  "Hey {{name}}. Ready when you are.",
];

// =============================================
// ROAST — MEDIUM (classic Lampy sass)
// =============================================

const ROAST_MEDIUM_OVERDUE: string[] = [
  "Day {{days}} of 'I'll do it tomorrow.' Cute.",
  "{{task}} has been waiting {{days}} days. It's starting to lose hope.",
  "You've moved {{task}} {{times}} times now. At this point it's a tradition.",
  "{{task}} called. It wants to know if you're ever coming back.",
  "Still ignoring {{task}}? Bold strategy.",
];

const ROAST_MEDIUM_INACTIVITY: string[] = [
  "Haven't seen you in {{hours}} hours. Did you forget I exist?",
  "Your tasks are collecting dust. Just like your plans.",
  "The app is open. Your tasks are here. Your effort is not.",
  "48 hours of silence. I see how it is.",
];

const ROAST_MEDIUM_STREAK: string[] = [
  "{{streak}} days and you haven't quit? Suspicious.",
  "Streak: {{streak}}. I'm almost impressed.",
  "{{streak}} in a row. Don't let it go to your head.",
  "Who are you and what did you do with the person who quit everything?",
];

const ROAST_MEDIUM_MILESTONE: string[] = [
  "New level. Try not to let it go to your head.",
  "Something unlocked. Don't spend it all in one place.",
  "{{points}} points. I guess effort does pay off. Weird.",
];

const ROAST_MEDIUM_CHECKIN: string[] = [
  "Oh, you're awake. Let's see if today's the day you actually show up.",
  "Morning, {{name}}. The bar is on the floor. Let's clear it.",
  "New day. Same tasks. Maybe different results this time?",
];

// =============================================
// ROAST — SPICY (maximum sass, still not mean)
// =============================================

const ROAST_SPICY_OVERDUE: string[] = [
  "{{task}} has been here {{days}} days. At this point it should pay rent.",
  "You've rescheduled {{task}} {{times}} times. That's not planning, that's denial.",
  "{{task}} is older than some friendships at this point. {{days}} days.",
  "I'd roast you harder but {{task}} is already doing that by existing.",
  "{{days}} days. {{task}} is starting a support group for neglected tasks.",
];

const ROAST_SPICY_INACTIVITY: string[] = [
  "{{hours}} hours MIA. Did your productivity get lost with your motivation?",
  "Your tasks filed a missing persons report. You're the person.",
  "I've seen ghosts more present than you've been lately.",
  "At this point the app icon is just decoration on your phone.",
];

const ROAST_SPICY_STREAK: string[] = [
  "{{streak}} days?! Okay I genuinely did NOT see this coming.",
  "Streak: {{streak}}. I'd clap but I don't have hands. Or faith in you.",
  "{{streak}} in a row. Plot twist of the century.",
];

const ROAST_SPICY_MILESTONE: string[] = [
  "Level up. I'd congratulate you but let's not get ahead of ourselves.",
  "New unlock. Even a broken clock is right twice a day.",
  "{{points}} points. Proof that even you can surprise me.",
];

const ROAST_SPICY_CHECKIN: string[] = [
  "Oh wow, you opened the app. Should I alert the media?",
  "{{name}}'s here! Quick, everyone act like we expected this.",
  "Let me guess — today's 'definitely' the day, right {{name}}?",
];

// =============================================
// HYPE — all triggers
// =============================================

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

const HYPE_CHECKIN: string[] = [
  "New day, new chance to crush it. Let's go, {{name}}.",
  "Morning, {{name}}. I can already tell today's going to be good.",
  "You showed up. That's already half the battle.",
  "Hey {{name}}. Ready to make today count?",
];

const HYPE_OVERDUE: string[] = [
  "{{task}} is still on your list. Today's the day — knock it out.",
  "{{days}} days on {{task}}. You've got this. Just start.",
  "{{task}} won't finish itself, but you absolutely can. Go.",
];

const HYPE_INACTIVITY: string[] = [
  "Haven't seen you in a bit. Come back — momentum is waiting.",
  "Quick check-in. One task. That's all it takes to restart.",
  "You've done it before. You'll do it again. Open that list.",
];

// =============================================
// REAL — all triggers
// =============================================

const REAL_CHECKIN: string[] = [
  "Hey {{name}}. How are we feeling today?",
  "New day. Let's see what we're working with.",
  "Morning, {{name}}. Quick check — how's your energy?",
  "Take a breath first. Then we'll figure out today.",
];

const REAL_INACTIVITY: string[] = [
  "Rough day? One small thing. That's all.",
  "Low energy noted. Just pick the easiest thing on your list.",
  "Not every day has to be productive. But one tiny win helps.",
  "You showed up. That counts. Now pick one thing.",
];

const REAL_STREAK: string[] = [
  "{{streak}} days. Quietly consistent. That matters.",
  "Streak: {{streak}}. You don't have to be perfect. You just have to keep going.",
  "{{streak}} days of showing up. That's real.",
];

const REAL_MILESTONE: string[] = [
  "New level reached. Step by step, you're getting there.",
  "Something unlocked. A small reward for real effort.",
  "{{points}} points. Every one of them earned honestly.",
];

const REAL_OVERDUE: string[] = [
  "{{task}} is {{days}} days overdue. No judgment — just a reminder.",
  "Still got {{task}} on the list. Whenever you're ready.",
  "{{task}} can wait if you need it to. But don't forget about it.",
];

// =============================================
// All Templates
// =============================================

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // Roast MILD
  { mode: 'ROAST', trigger: 'OVERDUE', intensity: 'MILD', templates: ROAST_MILD_OVERDUE },
  { mode: 'ROAST', trigger: 'INACTIVITY', intensity: 'MILD', templates: ROAST_MILD_INACTIVITY },
  { mode: 'ROAST', trigger: 'STREAK', intensity: 'MILD', templates: ROAST_MILD_STREAK },
  { mode: 'ROAST', trigger: 'MILESTONE', intensity: 'MILD', templates: ROAST_MILD_MILESTONE },
  { mode: 'ROAST', trigger: 'CHECKIN', intensity: 'MILD', templates: ROAST_MILD_CHECKIN },

  // Roast MEDIUM
  { mode: 'ROAST', trigger: 'OVERDUE', intensity: 'MEDIUM', templates: ROAST_MEDIUM_OVERDUE },
  { mode: 'ROAST', trigger: 'INACTIVITY', intensity: 'MEDIUM', templates: ROAST_MEDIUM_INACTIVITY },
  { mode: 'ROAST', trigger: 'STREAK', intensity: 'MEDIUM', templates: ROAST_MEDIUM_STREAK },
  { mode: 'ROAST', trigger: 'MILESTONE', intensity: 'MEDIUM', templates: ROAST_MEDIUM_MILESTONE },
  { mode: 'ROAST', trigger: 'CHECKIN', intensity: 'MEDIUM', templates: ROAST_MEDIUM_CHECKIN },

  // Roast SPICY
  { mode: 'ROAST', trigger: 'OVERDUE', intensity: 'SPICY', templates: ROAST_SPICY_OVERDUE },
  { mode: 'ROAST', trigger: 'INACTIVITY', intensity: 'SPICY', templates: ROAST_SPICY_INACTIVITY },
  { mode: 'ROAST', trigger: 'STREAK', intensity: 'SPICY', templates: ROAST_SPICY_STREAK },
  { mode: 'ROAST', trigger: 'MILESTONE', intensity: 'SPICY', templates: ROAST_SPICY_MILESTONE },
  { mode: 'ROAST', trigger: 'CHECKIN', intensity: 'SPICY', templates: ROAST_SPICY_CHECKIN },

  // Hype — all triggers
  { mode: 'HYPE', trigger: 'STREAK', templates: HYPE_STREAK },
  { mode: 'HYPE', trigger: 'MILESTONE', templates: HYPE_MILESTONE },
  { mode: 'HYPE', trigger: 'CHECKIN', templates: HYPE_CHECKIN },
  { mode: 'HYPE', trigger: 'OVERDUE', templates: HYPE_OVERDUE },
  { mode: 'HYPE', trigger: 'INACTIVITY', templates: HYPE_INACTIVITY },

  // Real — all triggers
  { mode: 'REAL', trigger: 'CHECKIN', templates: REAL_CHECKIN },
  { mode: 'REAL', trigger: 'INACTIVITY', templates: REAL_INACTIVITY },
  { mode: 'REAL', trigger: 'STREAK', templates: REAL_STREAK },
  { mode: 'REAL', trigger: 'MILESTONE', templates: REAL_MILESTONE },
  { mode: 'REAL', trigger: 'OVERDUE', templates: REAL_OVERDUE },
];

/**
 * Pick a random template for a given mode + trigger combo,
 * then fill in variables from context.
 * For ROAST mode, filters by roast_intensity (defaults to MEDIUM).
 */
export function generateMessage(
  mode: LampyMode,
  trigger: LampyTrigger,
  context: Record<string, string | number> = {},
  roastIntensity: RoastIntensity = 'MEDIUM',
): string {
  const group = MESSAGE_TEMPLATES.find((t) => {
    if (t.mode !== mode || t.trigger !== trigger) return false;
    // For ROAST mode, match intensity
    if (mode === 'ROAST') return t.intensity === roastIntensity;
    return true;
  });

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
