/**
 * BurmeseSpeechButton
 *
 * Speech button for pre-generated Burmese MP3 playback.
 * Uses HTMLAudioElement via createBurmesePlayer() instead of browser TTS.
 * Shows Myanmar flag icon and integrates with TTS settings for voice/speed.
 */

import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { ExpandingRings, PauseIcon, SoundWaveIcon } from '@/components/ui/SpeechAnimations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import {
  createBurmesePlayer,
  getBurmeseAudioUrl,
  type AudioType,
  type BurmesePlayer,
  type BurmesePlayerState,
} from '@/lib/audio/burmeseAudio';
import { isAndroid } from '@/lib/ttsCore';

// ---------------------------------------------------------------------------
// Rate map (matches TTSContext RATE_MAP)
// ---------------------------------------------------------------------------

const RATE_MAP = { slow: 0.7, normal: 0.98, fast: 1.3 } as const;

// ---------------------------------------------------------------------------
// Myanmar Flag Icon (16x16 inline SVG)
// ---------------------------------------------------------------------------

/** Simple Myanmar flag: 3 horizontal stripes (yellow/green/red) with white star. */
function MyanmarFlagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-4 w-4"
      role="img"
    >
      {/* Yellow stripe */}
      <rect x="0" y="0" width="16" height="5.33" fill="#FECB00" />
      {/* Green stripe */}
      <rect x="0" y="5.33" width="16" height="5.34" fill="#34B233" />
      {/* Red stripe */}
      <rect x="0" y="10.67" width="16" height="5.33" fill="#EA2839" />
      {/* White star */}
      <polygon
        points="8,2 9.2,5.5 12.8,5.5 9.8,7.8 10.8,11.3 8,9 5.2,11.3 6.2,7.8 3.2,5.5 6.8,5.5"
        fill="white"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Module-level player singleton
// ---------------------------------------------------------------------------

let sharedPlayer: BurmesePlayer | null = null;

function getPlayer(): BurmesePlayer {
  if (!sharedPlayer) {
    sharedPlayer = createBurmesePlayer();
  }
  return sharedPlayer;
}

// ---------------------------------------------------------------------------
// BurmeseSpeechButton
// ---------------------------------------------------------------------------

interface BurmeseSpeechButtonProps {
  questionId: string;
  audioType: AudioType;
  label: string;
  className?: string;
  showSpeedLabel?: boolean;
  speedLabel?: string;
  stopPropagation?: boolean;
}

export function BurmeseSpeechButton({
  questionId,
  audioType,
  label,
  className,
  showSpeedLabel = false,
  speedLabel,
  stopPropagation = false,
}: BurmeseSpeechButtonProps) {
  const { settings } = useTTSSettings();
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastClickRef = useRef<number>(0);

  // Player state subscription
  const [playerState, setPlayerState] = useState<BurmesePlayerState>({
    isSpeaking: false,
    isPaused: false,
    currentFile: null,
  });

  // Error state
  const [error, setError] = useState<string | null>(null);

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

  // Subscribe to player state
  useEffect(() => {
    const player = getPlayer();
    const unsub = player.onStateChange(setPlayerState);
    return unsub;
  }, []);

  // Focus button when speaking begins
  useEffect(() => {
    if (playerState.isSpeaking) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [playerState.isSpeaking]);

  // Determine if THIS button's audio is playing
  const myUrl = getBurmeseAudioUrl(questionId, audioType);
  const isMySpeaking = playerState.isSpeaking && playerState.currentFile === myUrl;
  const isMyPaused = playerState.isPaused && playerState.currentFile === myUrl;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    // Rapid-tap debounce: ignore clicks within 150ms
    const now = Date.now();
    if (now - lastClickRef.current < 150) return;
    lastClickRef.current = now;

    const player = getPlayer();

    if (isMyPaused) {
      // Paused -> resume
      player.resume();
    } else if (isMySpeaking) {
      // Speaking -> pause (or cancel on Android)
      if (isAndroid()) {
        player.cancel();
      } else {
        player.pause();
      }
    } else {
      // Idle or different audio playing -> play this one
      setError(null);
      const numericRate = RATE_MAP[settings.rate];
      player.play(myUrl, numericRate).catch(() => {
        setError('Burmese audio unavailable');
      });
    }
  };

  // Determine ARIA label based on state
  const computedAriaLabel =
    isMySpeaking && !isMyPaused
      ? 'Pause Burmese audio'
      : isMyPaused
        ? 'Resume Burmese audio'
        : label;

  const showAnimations = isMySpeaking && !shouldReduceMotion && !isMyPaused;
  const hasError = error !== null && !isMySpeaking && !isMyPaused;

  // Tooltip
  const tooltipTitle = hasError
    ? error
    : !isOnline && !isMySpeaking
      ? 'Burmese audio unavailable offline'
      : undefined;

  const button = (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={isMySpeaking || isMyPaused}
      aria-label={computedAriaLabel}
      onClick={handleClick}
      className={clsx(
        // Base styles (matches SpeechButton)
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
      <MyanmarFlagIcon />
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
      {/* Expanding rings (only when actively speaking, not paused) */}
      {showAnimations && <ExpandingRings />}
      {/* ARIA live region for state announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {isMySpeaking ? 'Playing Burmese audio' : isMyPaused ? 'Paused' : ''}
      </span>
    </button>
  );

  // Wrap in span for tooltip
  if (tooltipTitle) {
    return <span title={tooltipTitle}>{button}</span>;
  }

  return button;
}
