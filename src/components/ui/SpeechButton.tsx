import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { ExpandingRings, PauseIcon, SoundWaveIcon } from '@/components/ui/SpeechAnimations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTS } from '@/hooks/useTTS';
import { isAndroid } from '@/lib/ttsCore';

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
