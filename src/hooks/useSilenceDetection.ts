'use client';

/**
 * Silence Detection Hook
 *
 * Monitors a MediaStream via AudioContext + AnalyserNode to detect
 * silence (RMS level below threshold for a specified duration).
 * Calls onSilence callback when silence is detected.
 *
 * Per research pitfalls:
 * - AudioContext created inside effect (not at module level)
 * - Cleanup: cancelAnimationFrame, disconnect source, close AudioContext
 * - Only runs when enabled is true and stream is not null
 *
 * React Compiler safe: uses cancelled-flag pattern for async cleanup.
 */

import { useEffect } from 'react';

interface UseSilenceDetectionOptions {
  /** Active MediaStream to monitor */
  stream: MediaStream | null;
  /** RMS threshold below which is considered silence (default 0.01) */
  silenceThreshold?: number;
  /** Duration of silence before triggering callback in ms (default 2000) */
  silenceMs?: number;
  /** Callback when silence is detected */
  onSilence: () => void;
  /** Toggle detection on/off (default true) */
  enabled?: boolean;
}

export function useSilenceDetection({
  stream,
  silenceThreshold = 0.01,
  silenceMs = 2000,
  onSilence,
  enabled = true,
}: UseSilenceDetectionOptions): void {
  useEffect(() => {
    if (!enabled || !stream) return;

    let cancelled = false;
    let animationFrameId: number | null = null;
    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    // Track when silence started
    let silenceStart: number | null = null;

    const setup = () => {
      if (cancelled) return;

      try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const checkLevel = () => {
          if (cancelled || !analyser) return;

          analyser.getFloatTimeDomainData(dataArray);

          // Calculate RMS (root mean square) level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / bufferLength);

          if (rms < silenceThreshold) {
            // Below threshold -- track silence duration
            if (silenceStart === null) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart >= silenceMs) {
              // Silence exceeded threshold duration
              if (!cancelled) {
                onSilence();
              }
              // Reset so we don't fire again immediately
              silenceStart = null;
              return; // Stop monitoring after silence detected
            }
          } else {
            // Sound detected -- reset silence timer
            silenceStart = null;
          }

          animationFrameId = requestAnimationFrame(checkLevel);
        };

        checkLevel();
      } catch {
        // AudioContext creation can fail in some environments
      }
    };

    setup();

    return () => {
      cancelled = true;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      if (source) {
        try {
          source.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }

      if (audioContext && audioContext.state !== 'closed') {
        try {
          void audioContext.close();
        } catch {
          // Ignore close errors
        }
      }
    };
  }, [stream, silenceThreshold, silenceMs, onSilence, enabled]);
}
