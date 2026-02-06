import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LANG = 'en-US';
const VOICE_LOAD_RETRIES = 8;
const VOICE_LOAD_INTERVAL = 250;

const APPLE_US_VOICES = ['samantha', 'siri', 'ava', 'allison', 'alex', 'victoria', 'karen'];
const ANDROID_US_VOICES = ['google us english', 'google en-us', 'english united states'];
const ENHANCED_HINTS = ['enhanced', 'premium'];

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: detect browser capability on mount
    setIsSupported(true);

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const updateVoices = () => {
      const voices = synth.getVoices();
      if (voices?.length) {
        voicesRef.current = voices;
      }
    };

    const ensureVoicesLoaded = () => {
      updateVoices();
      if (!voicesRef.current.length && attempts < VOICE_LOAD_RETRIES) {
        attempts += 1;
        retryTimer = setTimeout(ensureVoicesLoaded, VOICE_LOAD_INTERVAL);
      }
    };

    ensureVoicesLoaded();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
      if (retryTimer) clearTimeout(retryTimer);
      synth.cancel();
    };
  }, []);

  const findVoice = useCallback((lang: string, preferredVoiceName?: string) => {
    const voices = voicesRef.current;
    if (!voices?.length) return undefined;

    const normalizedLang = lang.toLowerCase();
    const matchesLang = voices.filter(voice =>
      voice.lang?.toLowerCase().startsWith(normalizedLang)
    );

    const matchesHint = (voice: SpeechSynthesisVoice, hint: string) =>
      voice.name.toLowerCase().includes(hint) || voice.voiceURI.toLowerCase().includes(hint);

    if (preferredVoiceName) {
      const preferred = matchesLang.find(voice =>
        matchesHint(voice, preferredVoiceName.toLowerCase())
      );
      if (preferred) return preferred;
    }

    for (const name of [...APPLE_US_VOICES, ...ANDROID_US_VOICES]) {
      const match = matchesLang.find(voice => matchesHint(voice, name));
      if (match) return match;
    }

    const enhanced = matchesLang.find(voice =>
      ENHANCED_HINTS.some(hint => matchesHint(voice, hint))
    );
    if (enhanced) return enhanced;

    const localFirst = matchesLang.find(voice => voice.localService);
    return localFirst ?? matchesLang[0] ?? voices[0];
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions | string = {}) => {
      if (!text?.trim()) return;
      const synth = synthesisRef.current;
      if (!synth) return;

      const normalizedOptions: SpeakOptions =
        typeof options === 'string' ? { lang: options } : options;
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
