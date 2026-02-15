import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTS } from '@/hooks/useTTS';
import { isAndroid } from '@/lib/ttsCore';

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

/** Static pause icon (two vertical bars). */
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      <rect x={4} y={3} width={3} height={10} rx={1} fill="currentColor" />
      <rect x={9} y={3} width={3} height={10} rx={1} fill="currentColor" />
    </svg>
  );
}

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
  showSpeedLabel?: boolean;
  speedLabel?: string;
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
  showSpeedLabel = false,
  speedLabel,
}: SpeechButtonProps) => {
  const { speak, cancel, pause, resume, isSpeaking, isPaused, isSupported, error } = useTTS();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastClickRef = useRef<number>(0);

  // Online/offline awareness
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const handleOnline = useCallback(() => setIsOnline(true), []);
  const handleOffline = useCallback(() => setIsOnline(false), []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

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

    // Rapid-tap debounce: ignore clicks within 150ms
    const now = Date.now();
    if (now - lastClickRef.current < 150) return;
    lastClickRef.current = now;

    if (isPaused) {
      // Paused -> resume
      resume();
    } else if (isSpeaking) {
      // Speaking -> pause (or cancel on Android)
      if (isAndroid()) {
        cancel();
      } else {
        pause();
      }
    } else {
      // Idle -> speak (fire-and-forget)
      // voiceName is accepted for backward compatibility but voice selection
      // is handled internally by ttsCore's findVoice algorithm
      void speak(text, { lang, pitch, rate });
    }
  };

  // Determine ARIA label based on state
  const computedAriaLabel =
    isSpeaking && !isPaused
      ? 'Pause speaking'
      : isPaused
        ? 'Resume speaking'
        : (ariaLabel ?? label);

  const showAnimations = isSpeaking && !shouldReduceMotion && !isPaused;

  // Error state: show red tint when error is present and not actively speaking/paused
  const hasError = error !== null && !isSpeaking && !isPaused;

  // Tooltip text: error > unsupported > offline > default
  const tooltipTitle = !isSupported
    ? 'TTS not supported in this browser'
    : hasError
      ? error
      : !isOnline && !isSpeaking
        ? `${ariaLabel ?? label} (Limited audio offline)`
        : undefined;

  const button = (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={isSpeaking || isPaused}
      aria-label={computedAriaLabel}
      onClick={handleClick}
      disabled={!isSupported || !text?.trim()}
      className={clsx(
        // Base styles
        'relative inline-flex items-center gap-2 overflow-visible rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition min-h-[44px]',
        // State-specific styles
        isPaused
          ? 'border-tts/50 bg-tts/5 text-tts'
          : isSpeaking
            ? clsx('border-tts bg-tts/10 text-tts', !shouldReduceMotion && 'animate-pulse-subtle')
            : hasError
              ? 'border-destructive/50 bg-destructive/5 text-destructive'
              : 'border-border bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {/* Icon: pause icon when paused, animated sound wave when speaking, Volume2 when idle */}
      {isPaused ? (
        <PauseIcon />
      ) : isSpeaking ? (
        <SoundWaveIcon animate={!shouldReduceMotion} />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{label}</span>
      {/* Speed label */}
      {showSpeedLabel && speedLabel && (
        <span className="text-[10px] font-medium text-muted-foreground/70 tabular-nums">
          {speedLabel}
        </span>
      )}
      {/* Expanding rings (only when actively speaking, not paused, disabled for reduced motion) */}
      {showAnimations && <ExpandingRings />}
      {/* ARIA live region for state announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {isSpeaking ? 'Speaking' : isPaused ? 'Paused' : ''}
      </span>
    </button>
  );

  // Wrap in span for tooltip (native title) when error/unsupported/offline
  // span wrapper needed for disabled buttons (disabled elements don't fire hover events)
  if (tooltipTitle) {
    return <span title={tooltipTitle}>{button}</span>;
  }

  return button;
};

export default SpeechButton;
