'use client';

/**
 * Speech Recognition Hook for Interview Mode
 *
 * Wraps the native Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * with a clean React-friendly API. Provides browser support detection,
 * error handling, and Safari/HTTPS checks.
 *
 * When not supported, returns { isSupported: false } -- callers should show
 * self-grade buttons as fallback.
 *
 * React Compiler safe: refs accessed only in handlers/effects, never render.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInterviewSpeechReturn {
  /** Current recognized transcript text */
  transcript: string;
  /** Whether recognition is actively listening */
  isListening: boolean;
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Start listening for speech */
  startListening: () => Promise<void>;
  /** Stop listening */
  stopListening: () => void;
  /** Clear the current transcript */
  resetTranscript: () => void;
  /** Error message if recognition fails, or null */
  error: string | null;
}

/** Constructor type for SpeechRecognition */
type SpeechRecognitionConstructor = { new (): SpeechRecognition };

/** Check if the browser supports the Web Speech API */
function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;

  // Standard API or webkit-prefixed (Chrome, Safari, Edge)
  const Ctor: SpeechRecognitionConstructor | undefined =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  return Ctor ?? null;
}

/** Check if running on HTTPS or localhost (required for speech recognition) */
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  // localhost is exempted from HTTPS requirement
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return true;
  }
  return window.location.protocol === 'https:';
}

/** Detect Safari browser for Siri-specific messaging */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}

export function useInterviewSpeech(): UseInterviewSpeechReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Check support once
  const SpeechRecognitionAPI = getSpeechRecognitionConstructor();
  const isSupported = SpeechRecognitionAPI !== null && isSecureContext();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Ignore abort errors during cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!SpeechRecognitionAPI) {
      if (isSafari()) {
        setError('Speech recognition requires Siri to be enabled on Apple devices.');
      } else {
        setError(
          'Speech recognition is not supported in this browser. Please use Chrome for the best experience.'
        );
      }
      return;
    }

    if (!isSecureContext()) {
      setError('Speech recognition requires a secure connection (HTTPS).');
      return;
    }

    // Clean up any existing recognition instance
    const existing = recognitionRef.current;
    if (existing) {
      try {
        existing.abort();
      } catch {
        // Ignore
      }
    }

    setError(null);
    setTranscript('');

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      setIsListening(false);

      // Map error codes to user-friendly messages
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone permission denied. Please allow microphone access.');
          break;
        case 'no-speech':
          // Not a real error -- just no speech detected, auto-stops
          break;
        case 'audio-capture':
          setError('No microphone found. Please connect a microphone.');
          break;
        case 'network':
          setError('Network error during speech recognition. Please check your connection.');
          break;
        case 'aborted':
          // Intentional abort, not an error
          break;
        default:
          if (isSafari()) {
            setError('Speech recognition requires Siri to be enabled on Apple devices.');
          } else {
            setError('Speech recognition error. Please try again.');
          }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch {
      setError('Failed to start speech recognition. Please try again.');
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && isListeningRef.current) {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
