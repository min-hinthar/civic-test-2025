import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { type MouseEvent, useEffect, useRef } from 'react';

import { useTTS } from '@/hooks/useTTS';

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus button when speaking begins
  useEffect(() => {
    if (isSpeaking) {
      buttonRef.current?.focus();
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
          ? 'border-tts bg-tts/10 text-tts animate-pulse-subtle'
          : 'border-border bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
      {/* ARIA live region for state announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {isSpeaking ? 'Speaking' : ''}
      </span>
    </button>
  );
};

export default SpeechButton;
