/**
 * Speech Animation Components
 *
 * Shared visual indicators for speech button speaking/paused states.
 * Used by both SpeechButton (browser TTS) and BurmeseSpeechButton (pre-generated MP3).
 */

import { motion } from 'motion/react';

// ---------------------------------------------------------------------------
// SoundWaveIcon
// ---------------------------------------------------------------------------

/** Animated equalizer-bar SVG icon for the speaking state. */
export function SoundWaveIcon({ animate }: { animate: boolean }) {
  const bars = [
    { delay: 0, idle: 4, active: 12 },
    { delay: 0.1, idle: 8, active: 16 },
    { delay: 0.2, idle: 4, active: 10 },
  ];

  if (!animate) {
    // Static fallback for reduced motion
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={2 + i * 5}
            y={8 - bar.idle / 2}
            width={3}
            height={bar.idle}
            rx={1.5}
            fill="currentColor"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={2 + i * 5}
          width={3}
          rx={1.5}
          fill="currentColor"
          initial={{ height: bar.idle, y: 8 - bar.idle / 2 }}
          animate={{ height: bar.active, y: 8 - bar.active / 2 }}
          transition={{
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 0.3,
            delay: bar.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ExpandingRings
// ---------------------------------------------------------------------------

/** Expanding/fading concentric rings for the "broadcasting" effect. */
export function ExpandingRings() {
  return (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-tts/40"
          initial={{ width: '100%', height: '100%', opacity: 0.6 }}
          animate={{
            width: ['100%', '180%'],
            height: ['100%', '180%'],
            opacity: [0.4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PauseIcon
// ---------------------------------------------------------------------------

/** Static pause icon (two vertical bars). */
export function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      <rect x={4} y={3} width={3} height={10} rx={1} fill="currentColor" />
      <rect x={9} y={3} width={3} height={10} rx={1} fill="currentColor" />
    </svg>
  );
}
