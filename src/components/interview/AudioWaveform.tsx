'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MicOff } from 'lucide-react';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { strings } from '@/lib/i18n/strings';
import { getTokenColor } from '@/lib/tokens';

interface AudioWaveformProps {
  /** MediaStream from microphone */
  stream: MediaStream | null;
  /** Whether to actively visualize */
  isActive: boolean;
}

/**
 * Canvas-based real-time audio waveform visualization.
 *
 * Features:
 * - Connects to MediaStream via AudioContext + AnalyserNode
 * - Draws time-domain waveform on canvas using requestAnimationFrame
 * - Shows flat line when inactive
 * - Graceful fallback (mic-off icon) when stream is null
 * - Cleanup: cancels animation frame and disconnects audio nodes on unmount
 * - Uses semantic design tokens for colors (theme-aware)
 *
 * React Compiler safe: canvas ref accessed only in effects, never render.
 */
export function AudioWaveform({ stream, isActive }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanup = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        void audioContextRef.current.close();
      } catch {
        // Ignore close errors
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    if (!stream || !isActive) {
      cleanup();

      // Draw flat line on inactive canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = canvas.offsetWidth * dpr;
          canvas.height = canvas.offsetHeight * dpr;
          ctx.scale(dpr, dpr);
          const w = canvas.offsetWidth;
          const h = canvas.offsetHeight;
          ctx.clearRect(0, 0, w, h);
          // Read token color for flat line (theme-aware)
          ctx.strokeStyle = getTokenColor('--color-border', 0.3);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();
        }
      }
      return;
    }

    // Set up AudioContext + AnalyserNode
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      animationRef.current = requestAnimationFrame(draw);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, w, h);

      // Read token color each frame so theme changes take effect immediately
      ctx.strokeStyle = getTokenColor('--color-primary');
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();
    };

    draw();

    return cleanup;
  }, [stream, isActive, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // No stream: show fallback
  if (!stream) {
    return (
      <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-muted/20 text-muted-foreground">
        <MicOff className="h-4 w-4" />
        <BilingualText text={strings.interview.recordingUnavailable} size="xs" />
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-12 w-full rounded-xl" aria-hidden="true" />;
}
