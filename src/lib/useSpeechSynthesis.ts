import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LANG = 'en-US';
const PREFERRED_US_VOICES = ['samantha', 'siri', 'ava', 'allison', 'alex', 'victoria', 'karen'];

type SpeakOptions = {
  lang?: string;
  pitch?: number;
  rate?: number;
  preferredVoiceName?: string;
};

export const useSpeechSynthesis = () => {
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const synth = window.speechSynthesis;
    synthesisRef.current = synth;
    setIsSupported(true);

    const updateVoices = () => {
      const voices = synth.getVoices();
      if (voices?.length) {
        voicesRef.current = voices;
      }
    };

    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
      synth.cancel();
    };
  }, []);

  const findVoice = useCallback((lang: string, preferredVoiceName?: string) => {
    const voices = voicesRef.current;
    if (!voices?.length) return undefined;

    const normalizedLang = lang.toLowerCase();
    const matchesLang = voices.filter(voice => voice.lang?.toLowerCase().startsWith(normalizedLang));

    if (preferredVoiceName) {
      const preferred = matchesLang.find(voice =>
        voice.name.toLowerCase().includes(preferredVoiceName.toLowerCase())
      );
      if (preferred) return preferred;
    }

    for (const name of PREFERRED_US_VOICES) {
      const match = matchesLang.find(voice => voice.name.toLowerCase().includes(name));
      if (match) return match;
    }

    const enhanced = matchesLang.find(
      voice => voice.voiceURI.toLowerCase().includes('enhanced') || voice.name.toLowerCase().includes('enhanced')
    );
    return enhanced ?? matchesLang[0] ?? voices[0];
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions | string = {}) => {
      if (!text?.trim()) return;
      const synth = synthesisRef.current;
      if (!synth) return;

      const normalizedOptions: SpeakOptions = typeof options === 'string' ? { lang: options } : options;
      const lang = normalizedOptions.lang ?? DEFAULT_LANG;
      const utterance = new SpeechSynthesisUtterance(text);

      const selectedVoice = findVoice(lang, normalizedOptions.preferredVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = lang;
      utterance.rate = normalizedOptions.rate ?? 0.98;
      utterance.pitch = normalizedOptions.pitch ?? 1.02;

      synth.cancel();
      synth.speak(utterance);
    },
    [findVoice]
  );

  const cancel = useCallback(() => {
    synthesisRef.current?.cancel();
  }, []);

  return { speak, cancel, isSupported };
};

export default useSpeechSynthesis;
