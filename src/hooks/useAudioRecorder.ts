/**
 * Audio Recorder Hook
 *
 * Captures microphone input via MediaRecorder API with:
 * - Graceful degradation when mic is unavailable or permission denied
 * - Blob URL management with proper cleanup (prevents memory leaks)
 * - MediaStream exposure for waveform visualization
 * - Honor-system mode: interview works without recording if mic unavailable
 *
 * React Compiler safe: refs accessed only in handlers/effects, never render.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioURLRef = useRef<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const revokeCurrentURL = useCallback(() => {
    if (audioURLRef.current) {
      URL.revokeObjectURL(audioURLRef.current);
      audioURLRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // No MediaDevices API (no HTTPS or unsupported browser)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      return false;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      return true;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return; // Graceful degradation: no-op without stream

    // Revoke previous blob URL to prevent memory leak
    revokeCurrentURL();
    setAudioURL(null);

    chunksRef.current = [];

    try {
      const recorder = new MediaRecorder(currentStream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          audioURLRef.current = url;
          setAudioURL(url);
        }
        chunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      // MediaRecorder creation failed (unsupported codec, etc.)
      setIsRecording(false);
    }
  }, [revokeCurrentURL]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
    setIsRecording(false);
  }, []);

  const clearRecording = useCallback(() => {
    revokeCurrentURL();
    setAudioURL(null);
  }, [revokeCurrentURL]);

  const cleanup = useCallback(() => {
    // Stop recording if active
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch {
        // Ignore errors during cleanup
      }
    }
    mediaRecorderRef.current = null;

    // Stop all stream tracks
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Revoke blob URLs
    revokeCurrentURL();

    // Reset state
    setIsRecording(false);
    setAudioURL(null);
    setStream(null);
  }, [revokeCurrentURL]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === 'recording') {
        try {
          recorder.stop();
        } catch {
          // Ignore
        }
      }

      // Stop stream tracks
      const currentStream = streamRef.current;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      // Revoke blob URL
      if (audioURLRef.current) {
        URL.revokeObjectURL(audioURLRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    hasPermission,
    audioURL,
    stream,
    requestPermission,
    startRecording,
    stopRecording,
    clearRecording,
    cleanup,
  };
}
