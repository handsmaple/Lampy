// ============================================
// Lampy — Date Utilities
// ============================================
// Always uses local time (not UTC) for date strings.

/**
 * Returns today's date as YYYY-MM-DD in local time.
 * Call this fresh each time you need "today" — do not cache.
 */
export function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
