// ============================================
// Lampy — Date Utilities
// ============================================
// Always uses local time (not UTC) for date strings.

/**
 * Returns today's date as YYYY-MM-DD in local time.
 * Call this fresh each time you need "today" — do not cache.
 */
export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getLocalToday(): string {
  return formatLocalDate(new Date());
}

export function getLocalTomorrow(): string {
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  return formatLocalDate(tmrw);
}
