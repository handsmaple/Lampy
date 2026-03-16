// ============================================
// Lampy — Supabase Edge Function: AI Proxy
// ============================================
// Secure proxy for Claude API calls. Keeps API key server-side.
// Handles: suggestion generation, motivation messages, NLP parsing.
//
// Deploy: supabase functions deploy lampy-ai
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface RequestBody {
  action: 'generate_suggestion' | 'generate_motivation' | 'parse_task';
  payload: Record<string, any>;
}

serve(async (req: Request) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { action, payload } = (await req.json()) as RequestBody;

    let systemPrompt: string;
    let userPrompt: string;
    let model = 'claude-3-haiku-20240307'; // Default: Haiku for speed

    switch (action) {
      case 'generate_suggestion': {
        model = 'claude-3-5-sonnet-20241022'; // Sonnet for deeper suggestions
        systemPrompt = buildSuggestionSystemPrompt();
        userPrompt = buildSuggestionUserPrompt(payload);
        break;
      }
      case 'generate_motivation': {
        systemPrompt = buildMotivationSystemPrompt();
        userPrompt = buildMotivationUserPrompt(payload);
        break;
      }
      case 'parse_task': {
        systemPrompt = buildParseSystemPrompt();
        userPrompt = `Parse this task input: "${payload.input}". Today's date is ${new Date().toISOString().split('T')[0]}.`;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Call Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    // Parse JSON response from Claude
    let parsed;
    try {
      // Extract JSON from response (Claude sometimes wraps in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), { headers });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
});

// --- Prompt Builders ---

function buildSuggestionSystemPrompt(): string {
  return `You are Lampy, an AI planner assistant that suggests fresh, interesting activities.

Rules:
- Suggest ONE activity that fits the user's free time and interests
- Be specific and actionable (not "exercise" but "Try a 20-min bodyweight HIIT workout on YouTube")
- Match the user's energy level
- Category must be one of: fitness, music, cooking, reading, gaming, travel, art, side-projects, mindfulness, learning, social, outdoors
- Keep the suggestion under 100 characters
- Return JSON: { "content": "...", "category": "...", "based_on": ["reason1", "reason2"] }`;
}

function buildSuggestionUserPrompt(payload: Record<string, any>): string {
  return `Generate a fresh suggestion for this user:
- Interests: ${(payload.interests ?? []).join(', ')}
- Life situation: ${payload.life_situation ?? 'WORKING'}
- Energy today: ${payload.energy_level ?? 'MEDIUM'}
- Current streak: ${payload.current_streak ?? 0} days
- Recent tasks completed: ${(payload.recent_tasks ?? []).join(', ')}
- Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
- Time of day: ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}

Return ONLY valid JSON.`;
}

function buildMotivationSystemPrompt(): string {
  return `You are Lampy, a planner app with personality. You write short motivational messages (max 2 sentences).

Voice modes:
- ROAST: Playful sarcasm. Never mean, never shaming. Think "friend who calls you out with a smirk."
- HYPE: Sharp, electric encouragement. Short punchy lines. Think "coach who believes in you."
- REAL: Gentle, warm. For low energy days. Think "friend who checks in without judgment."

Rules:
- Always reference the specific data provided (task name, streak count, days overdue)
- Never be vague or generic
- Never be preachy
- Max 2 sentences
- Return JSON: { "message": "...", "mode": "ROAST|HYPE|REAL" }`;
}

function buildMotivationUserPrompt(payload: Record<string, any>): string {
  return `Generate a motivation message:
- User name: ${payload.name ?? 'friend'}
- Preferred tone: ${payload.tone_preference ?? 'BALANCE'}
- Trigger: ${payload.trigger ?? 'CHECKIN'}
- Energy level: ${payload.energy_level ?? 'MEDIUM'}
- Current streak: ${payload.current_streak ?? 0}
- Overdue tasks: ${payload.overdue_count ?? 0}
- Most overdue task: ${payload.overdue_task ?? 'none'}
- Days overdue: ${payload.days_overdue ?? 0}
- Tasks completed today: ${payload.completed_today ?? 0}

Return ONLY valid JSON.`;
}

function buildParseSystemPrompt(): string {
  return `You parse natural language task descriptions into structured data.

Return JSON with these fields:
- title: cleaned task title (string)
- due_date: ISO date string or null (YYYY-MM-DD)
- due_time: 24h time string or null (HH:MM)
- priority: "HIGH" | "MEDIUM" | "LOW"
- estimated_minutes: number or null

Examples:
"dentist Friday 3pm" → { "title": "Dentist", "due_date": "2026-03-20", "due_time": "15:00", "priority": "MEDIUM", "estimated_minutes": 60 }
"urgent: finish report" → { "title": "Finish report", "due_date": null, "due_time": null, "priority": "HIGH", "estimated_minutes": null }`;
}
