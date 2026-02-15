'use client';

/**
 * VoicePicker Component
 *
 * Dropdown for selecting a TTS voice from available browser voices.
 * Filters to English voices, groups by local/remote, and plays a
 * preview sample on selection change.
 */

import React, { useMemo } from 'react';
import { useTTS } from '@/hooks/useTTS';

interface VoicePickerProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  onSelect: (voiceName: string) => void;
  showBurmese: boolean;
}

const PREVIEW_TEXT = 'What is the supreme law of the land?';

/**
 * High-quality natural US English voices, ordered by preference.
 * These are neural/natural voices that sound best for civics test prep.
 * Matching is case-insensitive substring — "Ava" matches "Microsoft Ava Online (Natural)".
 */
const PREFERRED_VOICES = [
  // Microsoft Neural (Natural) — highest quality on Windows/Edge
  'ava',
  'andrew',
  'emma',
  'brian',
  'jenny',
  'michelle',
  'guy',
  'aria',
  'davis',
  'eric',
  'steffan',
  'christopher',
  'monica',
  'jane',
  'jason',
  'nancy',
  'tony',
  'sara',
  // Google — high quality on Chrome
  'google us english',
  // Apple — high quality on Safari/macOS
  'samantha',
  'alex',
  'allison',
  'tom',
  // Android / generic
  'english united states',
];

/** Score a voice by quality preference. Lower = better. */
function voiceQualityScore(name: string): number {
  const lower = name.toLowerCase();
  // Prefer US English locale
  const isUS = lower.includes('en-us') || lower.includes('united states');
  // Check if it's a known high-quality voice
  const preferredIdx = PREFERRED_VOICES.findIndex(pref => lower.includes(pref));
  // "Natural" or "Neural" in name indicates high quality
  const isNatural = lower.includes('natural') || lower.includes('neural');

  if (preferredIdx >= 0) return preferredIdx;
  if (isNatural && isUS) return 50;
  if (isNatural) return 60;
  if (isUS) return 70;
  return 100;
}

export function VoicePicker({ voices, selectedVoice, onSelect, showBurmese }: VoicePickerProps) {
  const { speak } = useTTS();

  // Filter to online-only US English voices (no local/offline voices)
  const filteredVoices = useMemo(() => {
    const onlineUSVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase().replace(/_/g, '-');
      return lang === 'en-us' && !v.localService;
    });

    return onlineUSVoices.sort((a, b) => {
      const scoreA = voiceQualityScore(a.name);
      const scoreB = voiceQualityScore(b.name);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    });
  }, [voices]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    onSelect(name);

    // Play preview with the selected voice
    if (name) {
      const voice = voices.find(v => v.name === name);
      if (voice) {
        speak(PREVIEW_TEXT, { voice, lang: voice.lang }).catch(() => {
          // Preview playback failed silently -- not critical
        });
      }
    }
  };

  if (filteredVoices.length === 0) {
    return (
      <div className="rounded-xl border border-warning bg-warning-subtle px-4 py-3">
        <p className="text-sm font-semibold text-warning">No voices available</p>
        <p className="text-xs text-warning/80 mt-1">
          Your browser may not have any speech voices installed.
        </p>
        {showBurmese && (
          <p className="text-xs text-warning/80 mt-1 font-myanmar">
            {
              '\u101E\u1004\u103A\u1037\u1018\u101B\u102C\u1000\u103A\u1006\u102C\u1010\u103D\u1004\u103A \u1021\u101E\u1036\u1019\u103B\u102C\u1038 \u1019\u101B\u103E\u102D\u1015\u102B\u104B'
            }
          </p>
        )}
      </div>
    );
  }

  return (
    <select
      value={selectedVoice ?? ''}
      onChange={handleChange}
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px] min-w-[200px]"
      aria-label="Select English voice"
    >
      <option value="">System default</option>
      {filteredVoices.map(voice => (
        <option key={voice.name} value={voice.name}>
          {voice.name}
        </option>
      ))}
    </select>
  );
}
