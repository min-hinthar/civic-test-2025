/**
 * JS utility to read CSS custom properties for canvas/chart use.
 *
 * Canvas API contexts, Recharts stroke/fill props, and
 * react-countdown-circle-timer all need resolved color strings
 * since they cannot consume CSS variables natively.
 *
 * The CSS variables in tokens.css store HSL channels only
 * (e.g. "217 91% 60%"), so getTokenColor wraps them with hsl().
 */

/**
 * Read a CSS custom property value from the document root.
 * Returns the raw value (e.g., "217 91% 60%") or fallback.
 *
 * @param name - CSS variable name including -- prefix (e.g., "--color-primary")
 * @param fallback - Value to return if variable is not found or on server
 */
export function getToken(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Read a color token and return it as an HSL string for canvas/SVG use.
 * The CSS variables store HSL channels only (e.g., "217 91% 60%"),
 * so this wraps them with hsl() for direct use in canvas contexts.
 *
 * @param name - CSS variable name (e.g., "--color-primary")
 * @param alpha - Optional alpha value (0-1) for transparency
 */
export function getTokenColor(name: string, alpha?: number): string {
  const raw = getToken(name);
  if (!raw) return '';
  return alpha !== undefined ? `hsl(${raw} / ${alpha})` : `hsl(${raw})`;
}
