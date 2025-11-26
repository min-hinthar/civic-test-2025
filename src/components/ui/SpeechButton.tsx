import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import useSpeechSynthesis from '@/lib/useSpeechSynthesis';

interface SpeechButtonProps {
  text: string;
  label: string;
  ariaLabel?: string;
  lang?: string;
  className?: string;
  stopPropagation?: boolean;
}

const SpeechButton = ({
  text,
  label,
  ariaLabel,
  lang = 'en-US',
  className,
  stopPropagation = false,
}: SpeechButtonProps) => {
  const { speak, isSupported } = useSpeechSynthesis();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    speak(text, lang);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onClick={handleClick}
      disabled={!isSupported || !text?.trim()}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default SpeechButton;
