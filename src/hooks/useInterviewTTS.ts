/**
 * Interview TTS Hook
 *
 * Extended text-to-speech hook for interview simulation with:
 * - onEnd callbacks for sequencing (chime -> greeting -> question -> answer)
 * - Timeout fallback for unreliable browser onend events (Chrome/Android)
 * - Speech rate preference from localStorage
 * - Graceful degradation when TTS is unsupported
 *
 * Voice-finding logic replicated from useSpeechSynthesis for manual utterance control.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const VOICE_LOAD_RETRIES = 8;
const VOICE_LOAD_INTERVAL = 250;

const APPLE_US_VOICES = ['samantha', 'siri', 'ava', 'allison', 'alex', 'victoria', 'karen'];
const ANDROID_US_VOICES = ['google us english', 'google en-us', 'english united states'];
const ENHANCED_HINTS = ['enhanced', 'premium'];

const SPEECH_RATE_KEY = 'civic-prep-speech-rate';

type SpeechRate = 'slow' | 'normal' | 'fast';

const RATE_VALUES: Record<SpeechRate, number> = {
  slow: 0.7,
  normal: 0.98,
  fast: 1.3,
};

type SpeakOptions = {
  onEnd?: () => void;
  rate?: number;
};

function getSpeechRateFromStorage(): number {
  if (typeof window === 'undefined') return RATE_VALUES.normal;
  const stored = localStorage.getItem(SPEECH_RATE_KEY) as SpeechRate | null;
  return RATE_VALUES[stored ?? 'normal'] ?? RATE_VALUES.normal;
}

/**
 * Estimate speech duration for timeout fallback.
 * Formula: (word count / 2.5 words per second) * 1000 / rate + 3000ms buffer
 */
function estimateDuration(text: string, rate: number): number {
  const wordCount = text.split(/\s+/).length;
  return (wordCount / 2.5) * 1000 / rate + 3000;
}

function findVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
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
}

export function useInterviewTTS() {
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackFiredRef = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  });

  // Voice loading: retry polling + voiceschanged listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const synth = window.speechSynthesis;
    synthesisRef.current = synth;

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

  const clearFallbackTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const speakWithCallback = useCallback(
    (text: string, options?: SpeakOptions) => {
      const onEnd = options?.onEnd;

      // If TTS not supported, immediately fire callback (text-only fallback)
      if (!isSupported) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }

      const synth = synthesisRef.current;
      if (!synth) {
        onEnd?.();
        return;
      }

      // Clear any previous timeout and queued utterances
      clearFallbackTimeout();
      synth.cancel();

      // Reset callback guard
      callbackFiredRef.current = false;

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = findVoice(voicesRef.current, 'en-US');
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = 'en-US';

      // Determine rate: explicit option > localStorage preference
      const rate = options?.rate ?? getSpeechRateFromStorage();
      utterance.rate = rate;
      utterance.pitch = 1.02;

      const fireOnEnd = () => {
        // Guard against double-firing (both onend and timeout)
        if (callbackFiredRef.current) return;
        callbackFiredRef.current = true;
        clearFallbackTimeout();
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onend = fireOnEnd;
      utterance.onerror = fireOnEnd;

      // CRITICAL: Timeout fallback for Chrome/Android onend unreliability
      const duration = estimateDuration(text, rate);
      timeoutRef.current = setTimeout(fireOnEnd, duration);

      setIsSpeaking(true);
      synth.speak(utterance);
    },
    [isSupported, clearFallbackTimeout]
  );

  const cancel = useCallback(() => {
    clearFallbackTimeout();
    callbackFiredRef.current = true; // Prevent pending callbacks from firing
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  }, [clearFallbackTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      synthesisRef.current?.cancel();
    };
  }, []);

  return { speakWithCallback, cancel, isSpeaking, isSupported };
}
