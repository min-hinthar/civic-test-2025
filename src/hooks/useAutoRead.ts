/**
 * useAutoRead Hook
 *
 * Triggers TTS speech automatically when content changes (e.g., question navigation).
 * Uses triggerKey-based re-triggering with configurable delay and silent retry.
 *
 * Usage:
 *   useAutoRead({
 *     text: question.text,
 *     enabled: sessionAutoRead,
 *     triggerKey: questionIndex,
 *     lang: 'en-US',
 *   });
 */

import { useEffect, useRef } from 'react';

import { useTTS } from './useTTS';

interface UseAutoReadOptions {
  /** Text to speak */
  text: string;
  /** Whether auto-read is enabled */
  enabled: boolean;
  /** Language override (e.g., 'en-US', 'my-MM') */
  lang?: string;
  /** Unique key that triggers re-read on change (e.g., question index, card side) */
  triggerKey: string | number;
  /** Delay before speaking in ms (default 300ms to let UI settle) */
  delay?: number;
}

export function useAutoRead(options: UseAutoReadOptions): void {
  const { speak, cancel } = useTTS();
  const { text, enabled, lang, triggerKey, delay = 300 } = options;
  // Track if the effect has been cancelled (React Strict Mode double-invoke safety)
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (!enabled || !text?.trim()) return;

    const timer = setTimeout(() => {
      if (cancelledRef.current) return;
      speak(text, { lang }).catch(() => {
        // Auto-read failure: silent -- user can tap manually
        // Per user decision: "silent retry once, then stop"
        if (cancelledRef.current) return;
        setTimeout(() => {
          if (cancelledRef.current) return;
          speak(text, { lang }).catch(() => {
            // Second failure: stop, let user tap manually
          });
        }, 500);
      });
    }, delay);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
      cancel();
    };
    // Dependencies: re-trigger only on key change and enabled toggle
    // speak/cancel are stable (useCallback in useTTS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, enabled]);
}
