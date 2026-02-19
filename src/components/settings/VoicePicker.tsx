'use client';

/**
 * VoicePicker — Native select dropdown for TTS voice selection.
 *
 * Shows English voices sorted local-first then alphabetical.
 * Selecting a voice updates settings (persisted to localStorage)
 * and plays a preview sentence.
 *
 * Uses native <select> for accessibility (Phase 22 decision).
 */

import { useMemo } from 'react';

import { useTTS } from '@/hooks/useTTS';

interface VoicePickerProps {
  showBurmese: boolean;
}

export function VoicePicker({ showBurmese }: VoicePickerProps) {
  const { voices, settings, updateSettings, speak, cancel } = useTTS();

  // Filter to English voices, sort local-first then alphabetical
  const englishVoices = useMemo(() => {
    const filtered = voices.filter(v => {
      const lang = v.lang.toLowerCase().replace(/_/g, '-');
      return lang.startsWith('en-') || lang === 'en';
    });
    return filtered.sort((a, b) => {
      // Local voices first
      if (a.localService && !b.localService) return -1;
      if (!a.localService && b.localService) return 1;
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [voices]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value || undefined;
    updateSettings({ preferredVoiceName: voiceName });
    cancel();

    if (voiceName) {
      const selectedVoice = englishVoices.find(v => v.name === voiceName);
      if (selectedVoice) {
        speak('What is the supreme law of the land?', { voice: selectedVoice }).catch(() => {
          // Preview playback failed silently
        });
      }
    }
  };

  return (
    <select
      value={settings.preferredVoiceName ?? ''}
      onChange={handleChange}
      aria-label="Select TTS voice"
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px] min-w-[140px] w-full"
    >
      <option value="">
        {showBurmese ? 'အလိုအလျောက် (အကောင်းဆုံးအသံ)' : 'Auto (best available)'}
      </option>
      {englishVoices.map(v => (
        <option key={v.voiceURI} value={v.name}>
          {v.name} {v.localService ? '(local)' : '(online)'}
        </option>
      ))}
    </select>
  );
}
