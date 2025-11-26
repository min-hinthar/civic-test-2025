import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LANG = 'en-US';

export const useSpeechSynthesis = () => {
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      setIsSupported(true);
    }

    return () => {
      synthesisRef.current?.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, lang: string = DEFAULT_LANG) => {
      if (!text?.trim()) return;
      const synth = synthesisRef.current;
      if (!synth) return;

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      synth.speak(utterance);
    },
    []
  );

  const cancel = useCallback(() => {
    synthesisRef.current?.cancel();
  }, []);

  return { speak, cancel, isSupported };
};

export default useSpeechSynthesis;
