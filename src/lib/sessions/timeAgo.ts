/**
 * Bilingual Relative Time Formatter
 *
 * Simple utility that converts an ISO date string to a human-readable
 * relative time string in both English and Burmese.
 *
 * Thresholds:
 * - < 1 minute: "just now"
 * - < 60 minutes: "X min ago"
 * - < 24 hours: "X hours ago"
 * - >= 24 hours: "yesterday"
 */

/**
 * Format an ISO date string as a bilingual relative timestamp.
 *
 * @param isoDate - ISO 8601 date string (e.g. from `new Date().toISOString()`)
 * @returns Object with `en` (English) and `my` (Burmese) formatted strings
 */
export function timeAgo(isoDate: string): { en: string; my: string } {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);

  if (mins < 1) {
    return { en: 'just now', my: '\u101A\u1001\u102F\u101C\u1031\u1038\u1010\u1004\u103A' };
  }

  if (mins < 60) {
    return {
      en: `${mins} min ago`,
      my: `${mins} \u1019\u102D\u1014\u1005\u103A\u1021\u1000\u103C\u102C`,
    };
  }

  const hours = Math.floor(mins / 60);

  if (hours < 24) {
    return {
      en: `${hours} hour${hours > 1 ? 's' : ''} ago`,
      my: `${hours} \u1014\u102C\u101B\u102E\u1021\u1000\u103C\u102C`,
    };
  }

  return {
    en: 'yesterday',
    my: '\u1019\u1014\u1031\u1037\u1000',
  };
}
