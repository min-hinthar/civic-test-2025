/**
 * Network Quality Check
 *
 * Quick diagnostic to determine connection quality before starting
 * an interview session. Used to show a pre-start warning when the
 * connection is too slow for reliable audio streaming.
 */

import { getInterviewAudioUrl } from '@/lib/audio/audioPlayer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NetworkQuality = 'fast' | 'slow' | 'offline';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Threshold in Mbps below which connection is considered slow */
const SLOW_DOWNLINK_MBPS = 1;

/** Timeout for the HEAD request probe in milliseconds */
const PROBE_TIMEOUT_MS = 2000;

// ---------------------------------------------------------------------------
// Network check
// ---------------------------------------------------------------------------

/**
 * Check network quality using the best available API.
 *
 * Strategy:
 * 1. If the Network Information API is available (Chrome), use `downlink`
 * 2. Otherwise, time a HEAD request to a known audio file
 * 3. On any unexpected error, default to 'fast' (don't block interview start)
 *
 * @returns 'fast', 'slow', or 'offline'
 */
export async function checkNetworkQuality(): Promise<NetworkQuality> {
  try {
    // Try Network Information API first (Chrome/Edge/Android)
    const nav = navigator as Record<string, unknown>;
    const connection = nav.connection as { downlink?: number } | undefined;
    if (connection && typeof connection.downlink === 'number') {
      return connection.downlink < SLOW_DOWNLINK_MBPS ? 'slow' : 'fast';
    }

    // Fallback: time a HEAD request to a known audio file
    const probeUrl = getInterviewAudioUrl('greeting-01');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    const start = performance.now();
    try {
      await fetch(probeUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const elapsed = performance.now() - start;
      return elapsed > PROBE_TIMEOUT_MS ? 'slow' : 'fast';
    } catch {
      clearTimeout(timeoutId);
      // Distinguish abort (slow) from network error (offline)
      if (!navigator.onLine) {
        return 'offline';
      }
      // AbortController timeout means slow
      return 'slow';
    }
  } catch {
    // Default to fast on unexpected errors (don't block interview start)
    return 'fast';
  }
}
