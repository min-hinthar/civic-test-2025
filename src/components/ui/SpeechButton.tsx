import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { type MouseEvent, useEffect, useRef } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTS } from '@/hooks/useTTS';

// ---------------------------------------------------------------------------
// Animation sub-components (private -- not exported)
// ---------------------------------------------------------------------------

/** Animated equalizer-bar SVG icon for the speaking state. */
function SoundWaveIcon({ animate }: { animate: boolean }) {
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

/** Expanding/fading concentric rings for the "broadcasting" effect. */
function ExpandingRings() {
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
// SpeechButton
// ---------------------------------------------------------------------------

interface SpeechButtonProps {
  text: string;
  label: string;
  ariaLabel?: string;
  lang?: string;
  pitch?: number;
  rate?: number;
  voiceName?: string;
  className?: string;
  stopPropagation?: boolean;
}

const SpeechButton = ({
  text,
  label,
  ariaLabel,
  lang = 'en-US',
  pitch,
  rate,
  voiceName: _voiceName,
  className,
  stopPropagation = false,
}: SpeechButtonProps) => {
  const { speak, cancel, isSpeaking, isSupported } = useTTS();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus button when speaking begins (preventScroll avoids page jumping)
  useEffect(() => {
    if (isSpeaking) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [isSpeaking]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (isSpeaking) {
      cancel();
    } else {
      // Fire-and-forget -- don't await for button click
      // voiceName is accepted for backward compatibility but voice selection
      // is handled internally by ttsCore's findVoice algorithm
      void speak(text, { lang, pitch, rate });
    }
  };

  const showAnimations = isSpeaking && !shouldReduceMotion;

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? 'Stop speaking' : (ariaLabel ?? label)}
      onClick={handleClick}
      disabled={!isSupported || !text?.trim()}
      className={clsx(
        // Base styles
        'relative inline-flex items-center gap-2 overflow-visible rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition min-h-[44px]',
        // Speaking state: dedicated TTS color + pulsing border
        isSpeaking
          ? clsx('border-tts bg-tts/10 text-tts', !shouldReduceMotion && 'animate-pulse-subtle')
          : 'border-border bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {/* Icon: animated sound wave when speaking, Volume2 when idle */}
      {isSpeaking ? (
        <SoundWaveIcon animate={!shouldReduceMotion} />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{label}</span>
      {/* Expanding rings (only when speaking, disabled for reduced motion) */}
      {showAnimations && <ExpandingRings />}
      {/* ARIA live region for state announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {isSpeaking ? 'Speaking' : ''}
      </span>
    </button>
  );
};

export default SpeechButton;
