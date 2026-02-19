import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { ExpandingRings, PauseIcon, SoundWaveIcon } from '@/components/ui/SpeechAnimations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import {
  createAudioPlayer,
  getEnglishAudioUrl,
  type AudioPlayer,
  type AudioPlayerState,
  type AudioType,
} from '@/lib/audio/audioPlayer';
import { isAndroid } from '@/lib/ttsCore';

// ---------------------------------------------------------------------------
// Rate map (matches TTSContext RATE_MAP)
// ---------------------------------------------------------------------------

const RATE_MAP = { slow: 0.7, normal: 0.98, fast: 1.3 } as const;

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
// Module-level player singleton (shared across all SpeechButton instances)
// ---------------------------------------------------------------------------

let sharedPlayer: AudioPlayer | null = null;

function getPlayer(): AudioPlayer {
  if (!sharedPlayer) {
    sharedPlayer = createAudioPlayer();
  }
  return sharedPlayer;
}

// ---------------------------------------------------------------------------
// SpeechButton
// ---------------------------------------------------------------------------

interface SpeechButtonProps {
  text: string;
  label: string;
  ariaLabel?: string;
  /** Question ID for MP3 lookup. When provided, uses pre-generated audio. */
  questionId?: string;
  /** Audio type: 'q' (question), 'a' (answer), 'e' (explanation). Default: 'q'. */
  audioType?: AudioType;
  lang?: string;
  pitch?: number;
  rate?: number;
  className?: string;
  stopPropagation?: boolean;
  showSpeedLabel?: boolean;
  speedLabel?: string;
}

const SpeechButton = ({
  text,
  label,
  ariaLabel,
  questionId,
  audioType = 'q',
  lang = 'en-US',
  pitch,
  rate,
  className,
  stopPropagation = false,
  showSpeedLabel = false,
  speedLabel,
}: SpeechButtonProps) => {
  const { speak, cancel, pause, resume, isSpeaking, isPaused, currentText, isSupported, error } =
    useTTS();
  const { settings } = useTTSSettings();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastClickRef = useRef<number>(0);

  // MP3 mode: use pre-generated audio when questionId is available
  const useMp3 = !!questionId;
  const myUrl = questionId ? getEnglishAudioUrl(questionId, audioType) : null;

  // Player state subscription (only used in MP3 mode)
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isSpeaking: false,
    isPaused: false,
    currentFile: null,
  });

  useEffect(() => {
    if (!useMp3) return;
    const player = getPlayer();
    const unsub = player.onStateChange(setPlayerState);
    return unsub;
  }, [useMp3]);

  // Per-button state: detect if THIS button's content is playing
  const isMySpeaking = useMp3
    ? playerState.isSpeaking && playerState.currentFile === myUrl
    : isSpeaking && currentText === text;
  const isMyPaused = useMp3
    ? playerState.isPaused && playerState.currentFile === myUrl
    : isPaused && currentText === text;

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

    if (useMp3 && myUrl) {
      // MP3 mode
      const player = getPlayer();
      if (isMyPaused) {
        player.resume();
      } else if (isMySpeaking) {
        if (isAndroid()) {
          player.cancel();
        } else {
          player.pause();
        }
      } else {
        const numericRate = rate ?? RATE_MAP[settings.rate];
        player.play(myUrl, numericRate).catch(() => {});
      }
    } else {
      // Browser TTS fallback
      if (isMyPaused) {
        resume();
      } else if (isMySpeaking) {
        if (isAndroid()) {
          cancel();
        } else {
          pause();
        }
      } else {
        speak(text, { lang, pitch, rate }).catch(() => {});
      }
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
  const tooltipTitle =
    !useMp3 && !isSupported
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
      disabled={!useMp3 && (!isSupported || !text.trim())}
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
        <span className="text-caption font-medium text-muted-foreground/70 tabular-nums">
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
