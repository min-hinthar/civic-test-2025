import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { ExpandingRings, PauseIcon, SoundWaveIcon } from '@/components/ui/SpeechAnimations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTS } from '@/hooks/useTTS';
import { isAndroid } from '@/lib/ttsCore';

// ---------------------------------------------------------------------------
// US Flag Icon (16x16 inline SVG)
// ---------------------------------------------------------------------------

/** Simplified US flag: blue canton + stripes. */
function USFlagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 12"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      role="img"
    >
      {/* Red stripes background */}
      <rect width="16" height="12" fill="#B22234" />
      {/* White stripes */}
      <rect y="1.85" width="16" height="0.92" fill="white" />
      <rect y="3.69" width="16" height="0.92" fill="white" />
      <rect y="5.54" width="16" height="0.92" fill="white" />
      <rect y="7.38" width="16" height="0.92" fill="white" />
      <rect y="9.23" width="16" height="0.92" fill="white" />
      <rect y="11.08" width="16" height="0.92" fill="white" />
      {/* Blue canton */}
      <rect width="6.4" height="6.46" fill="#3C3B6E" />
      {/* Stars (simplified 3x2 grid) */}
      <circle cx="1.1" cy="1.1" r="0.45" fill="white" />
      <circle cx="3.2" cy="1.1" r="0.45" fill="white" />
      <circle cx="5.3" cy="1.1" r="0.45" fill="white" />
      <circle cx="2.15" cy="2.15" r="0.45" fill="white" />
      <circle cx="4.25" cy="2.15" r="0.45" fill="white" />
      <circle cx="1.1" cy="3.2" r="0.45" fill="white" />
      <circle cx="3.2" cy="3.2" r="0.45" fill="white" />
      <circle cx="5.3" cy="3.2" r="0.45" fill="white" />
      <circle cx="2.15" cy="4.25" r="0.45" fill="white" />
      <circle cx="4.25" cy="4.25" r="0.45" fill="white" />
      <circle cx="1.1" cy="5.3" r="0.45" fill="white" />
      <circle cx="3.2" cy="5.3" r="0.45" fill="white" />
      <circle cx="5.3" cy="5.3" r="0.45" fill="white" />
    </svg>
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
  const { speak, cancel, pause, resume, isSpeaking, isPaused, currentText, isSupported, error } =
    useTTS();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastClickRef = useRef<number>(0);

  // Per-button state: only show animations when THIS button's text is being spoken
  const isMySpeaking = isSpeaking && currentText === text;
  const isMyPaused = isPaused && currentText === text;

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

  // Focus button when THIS button starts speaking (preventScroll avoids page jumping)
  useEffect(() => {
    if (isMySpeaking) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [isMySpeaking]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    // Rapid-tap debounce: ignore clicks within 150ms
    const now = Date.now();
    if (now - lastClickRef.current < 150) return;
    lastClickRef.current = now;

    if (isMyPaused) {
      // This button is paused -> resume
      resume();
    } else if (isMySpeaking) {
      // This button is speaking -> pause (or cancel on Android)
      if (isAndroid()) {
        cancel();
      } else {
        pause();
      }
    } else {
      // Idle or a different button is speaking -> start new speech
      // (speak() internally cancels any active speech first)
      speak(text, { lang, pitch, rate }).catch(() => {});
    }
  };

  // Determine ARIA label based on state
  const computedAriaLabel =
    isMySpeaking && !isMyPaused
      ? 'Pause speaking'
      : isMyPaused
        ? 'Resume speaking'
        : (ariaLabel ?? label);

  const showAnimations = isMySpeaking && !shouldReduceMotion && !isMyPaused;

  // Error state: show red tint when error is present and not actively speaking/paused
  const hasError = error !== null && !isMySpeaking && !isMyPaused;

  // Tooltip text: error > unsupported > offline > default
  const tooltipTitle = !isSupported
    ? 'TTS not supported in this browser'
    : hasError
      ? error
      : !isOnline && !isMySpeaking
        ? `${ariaLabel ?? label} (Limited audio offline)`
        : undefined;

  const button = (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={isMySpeaking || isMyPaused}
      aria-label={computedAriaLabel}
      onClick={handleClick}
      disabled={!isSupported || !text?.trim()}
      className={clsx(
        // Base styles
        'relative inline-flex items-center gap-2 overflow-visible rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition min-h-[44px]',
        // State-specific styles
        isMyPaused
          ? 'border-tts/50 bg-tts/5 text-tts'
          : isMySpeaking
            ? clsx('border-tts bg-tts/10 text-tts', !shouldReduceMotion && 'animate-pulse-subtle')
            : hasError
              ? 'border-destructive/50 bg-destructive/5 text-destructive'
              : 'border-border bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {/* Flag icon — always visible for language identification */}
      <USFlagIcon />
      <span>{label}</span>
      {/* State icon: pause when paused, sound wave when speaking, Volume2 when idle */}
      {isMyPaused ? (
        <PauseIcon />
      ) : isMySpeaking ? (
        <SoundWaveIcon animate={!shouldReduceMotion} />
      ) : (
        <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
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
        {isMySpeaking ? 'Speaking' : isMyPaused ? 'Paused' : ''}
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
