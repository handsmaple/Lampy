// ============================================
// Lampy — AI Integration (Claude API)
// ============================================
// NLP task parsing, suggestion generation, motivation messages.
// All Claude API calls go through Supabase Edge Functions in production.
// Local fallbacks provided for dev/offline mode.

import { supabase } from './supabase';
import { generateMessage } from '@/constants/lampy-messages';
import { formatLocalDate } from '@/lib/date';
import type {
  TaskPriority,
  EnergyLevel,
  TonePreference,
  LampyMode,
  LampyTrigger,
  InterestTag,
} from '@/types';

// =============================================
// NLP Task Parsing
// =============================================

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
    due_date = formatLocalDate(tmrw);
    title = title.replace(/\btomorrow\b/i, '').trim();
  } else if (/\btoday\b/i.test(trimmed)) {
    due_date = formatLocalDate(today);
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
        due_date = formatLocalDate(targetDate);
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

// =============================================
// AI Suggestion Engine
// =============================================

export interface GeneratedSuggestion {
  content: string;
  category: string;
  based_on: string[];
}

interface SuggestionContext {
  interests: InterestTag[];
  life_situation: string;
  energy_level: EnergyLevel;
  current_streak: number;
  recent_tasks: string[];
}

/**
 * Generate a fresh activity suggestion via Claude API.
 * Falls back to local generation if Edge Function unavailable.
 */
export async function generateSuggestion(
  context: SuggestionContext
): Promise<GeneratedSuggestion> {
  try {
    const { data, error } = await supabase.functions.invoke('lampy-ai', {
      body: {
        action: 'generate_suggestion',
        payload: context,
      },
    });

    if (!error && data?.success && data.data?.content) {
      return {
        content: data.data.content,
        category: data.data.category ?? context.interests[0] ?? 'learning',
        based_on: data.data.based_on ?? ['interests', 'energy'],
      };
    }
  } catch (e) {
    console.log('Edge function unavailable, using local fallback');
  }

  // Local fallback
  return generateLocalSuggestion(context);
}

/**
 * Local suggestion fallback — no AI needed.
 * Uses interest-based templates with energy awareness.
 */
function generateLocalSuggestion(context: SuggestionContext): GeneratedSuggestion {
  const { interests, energy_level } = context;

  // Suggestion pool organized by interest + energy
  const SUGGESTIONS: Record<string, Record<EnergyLevel, string[]>> = {
    fitness: {
      LOW: ['Try a 10-minute gentle stretching routine', 'Take a slow walk around the block'],
      MEDIUM: ['Do a 20-minute bodyweight workout', 'Go for a 30-minute jog'],
      HIGH: ['Try a new HIIT workout on YouTube', 'Sign up for that gym class you\'ve been eyeing'],
    },
    music: {
      LOW: ['Listen to a chill playlist for 20 minutes', 'Discover a new artist on Spotify'],
      MEDIUM: ['Practice an instrument for 15 minutes', 'Create a mood playlist'],
      HIGH: ['Learn a new song from start to finish', 'Go to an open mic night'],
    },
    cooking: {
      LOW: ['Try a simple one-pot recipe tonight', 'Look up a 15-minute meal idea'],
      MEDIUM: ['Cook a recipe from a cuisine you\'ve never tried', 'Meal prep for tomorrow'],
      HIGH: ['Try making pasta from scratch', 'Host a small dinner and cook something bold'],
    },
    reading: {
      LOW: ['Read one chapter of that book on your shelf', 'Browse a bookstore for 20 minutes'],
      MEDIUM: ['Start a new book — just the first 30 pages', 'Read an interesting longform article'],
      HIGH: ['Set a reading goal: finish a book this week', 'Join an online book discussion'],
    },
    gaming: {
      LOW: ['Play a casual mobile game for 15 minutes', 'Watch a gaming video essay'],
      MEDIUM: ['Try an indie game you\'ve wishlisted', 'Play co-op with a friend online'],
      HIGH: ['Start a new game and commit to the story', 'Try speedrunning your favorite game'],
    },
    learning: {
      LOW: ['Watch one TED talk on something random', 'Read a Wikipedia rabbit hole for 15 min'],
      MEDIUM: ['Do one lesson in that online course', 'Listen to a podcast on a new topic'],
      HIGH: ['Start a mini-project to practice a new skill', 'Write down 3 things you learned this week'],
    },
    'side-projects': {
      LOW: ['Sketch out one idea in a notebook', 'Browse Product Hunt for inspiration'],
      MEDIUM: ['Spend 30 minutes on your side project', 'Write down your project roadmap'],
      HIGH: ['Build one small feature today', 'Ship something — even if it\'s rough'],
    },
    mindfulness: {
      LOW: ['Do a 5-minute guided meditation', 'Write 3 things you\'re grateful for'],
      MEDIUM: ['Try a 15-minute meditation session', 'Journal about how your week is going'],
      HIGH: ['Try a new mindfulness practice (breathwork, yoga)', 'Digital detox for 2 hours'],
    },
    social: {
      LOW: ['Text a friend you haven\'t talked to in a while', 'Send someone a compliment'],
      MEDIUM: ['Call a friend for a catch-up', 'Plan a coffee date this week'],
      HIGH: ['Organize a small hangout this weekend', 'Try a new social activity (meetup, class)'],
    },
    outdoors: {
      LOW: ['Step outside for 10 minutes of fresh air', 'Sit in a park and people-watch'],
      MEDIUM: ['Go for a nature walk', 'Find a new café to work from'],
      HIGH: ['Plan a day hike for this weekend', 'Try a new outdoor activity (cycling, kayaking)'],
    },
    travel: {
      LOW: ['Browse travel photos for inspiration', 'Research one destination you want to visit'],
      MEDIUM: ['Plan a day trip for next weekend', 'Explore a neighborhood you\'ve never visited'],
      HIGH: ['Book a spontaneous weekend getaway', 'Create a travel bucket list with dates'],
    },
    art: {
      LOW: ['Doodle for 10 minutes — no pressure', 'Visit a virtual museum online'],
      MEDIUM: ['Try a 30-minute drawing tutorial', 'Take photos of interesting things around you'],
      HIGH: ['Start a creative project you\'ve been putting off', 'Visit a local gallery or art show'],
    },
  };

  // Pick a random interest that has suggestions
  const availableInterests = interests.filter((i) => SUGGESTIONS[i]);
  const interest = availableInterests.length > 0
    ? availableInterests[Math.floor(Math.random() * availableInterests.length)]
    : 'learning';

  const pool = SUGGESTIONS[interest]?.[energy_level] ?? SUGGESTIONS.learning[energy_level];
  const content = pool[Math.floor(Math.random() * pool.length)];

  const based_on: string[] = [`interest:${interest}`, `energy:${energy_level}`];
  if (context.current_streak > 0) based_on.push(`streak:${context.current_streak}`);

  return { content, category: interest, based_on };
}

// =============================================
// AI Motivation Message Generator
// =============================================

export interface GeneratedMotivation {
  message: string;
  mode: LampyMode;
}

interface MotivationContext {
  name: string;
  tone_preference: TonePreference;
  trigger: LampyTrigger;
  energy_level: EnergyLevel;
  current_streak: number;
  overdue_count: number;
  overdue_task?: string;
  days_overdue?: number;
  completed_today: number;
}

/**
 * Generate a context-aware motivation message via Claude API.
 * Falls back to template-based generation if Edge Function unavailable.
 */
export async function generateMotivation(
  context: MotivationContext
): Promise<GeneratedMotivation> {
  try {
    const { data, error } = await supabase.functions.invoke('lampy-ai', {
      body: {
        action: 'generate_motivation',
        payload: context,
      },
    });

    if (!error && data?.success && data.data?.message) {
      return {
        message: data.data.message,
        mode: data.data.mode ?? determineMode(context),
      };
    }
  } catch (e) {
    console.log('Edge function unavailable, using local fallback');
  }

  // Local fallback using templates
  return generateLocalMotivation(context);
}

/**
 * Determine which Lampy mode to use based on context.
 */
function determineMode(context: MotivationContext): LampyMode {
  const { trigger, energy_level, tone_preference } = context;

  // Low energy → always REAL (gentle)
  if (energy_level === 'LOW') return 'REAL';

  // Overdue → ROAST (unless user explicitly prefers HYPE)
  if (trigger === 'OVERDUE' && (tone_preference === 'ROAST' || tone_preference === 'BALANCE')) return 'ROAST';

  // Streaks and milestones → HYPE
  if (trigger === 'STREAK' || trigger === 'MILESTONE') return 'HYPE';

  // Inactivity → depends on preference
  if (trigger === 'INACTIVITY') {
    return tone_preference === 'ROAST' ? 'ROAST' : 'REAL';
  }

  // Check-in → user's preference
  if (tone_preference === 'ROAST') return 'ROAST';
  if (tone_preference === 'HYPE') return 'HYPE';
  return 'HYPE'; // BALANCE defaults to HYPE for check-ins
}

/**
 * Local motivation fallback using message templates.
 */
function generateLocalMotivation(context: MotivationContext): GeneratedMotivation {
  const mode = determineMode(context);

  const templateContext: Record<string, string | number> = {
    name: context.name,
    streak: context.current_streak,
    count: context.completed_today,
    task: context.overdue_task ?? 'that task',
    days: context.days_overdue ?? 0,
    times: context.overdue_count,
  };

  const message = generateMessage(mode, context.trigger, templateContext);
  return { message, mode };
}
