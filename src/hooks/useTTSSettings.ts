/**
 * useTTSSettings Hook
 *
 * Lightweight settings-only hook for accessing TTS preferences.
 * Intended for the future Settings page (Phase 22) and any component
 * that needs to read/update TTS settings without the full engine API.
 *
 * Usage:
 *   const { settings, updateSettings } = useTTSSettings();
 *   updateSettings({ rate: 'fast' });
 */

import { useContext } from 'react';

import { TTSContext } from '../contexts/TTSContext';
import type { TTSSettings } from '../lib/ttsTypes';

interface UseTTSSettingsReturn {
  settings: TTSSettings;
  updateSettings: (partial: Partial<TTSSettings>) => void;
}

export function useTTSSettings(): UseTTSSettingsReturn {
  const ctx = useContext(TTSContext);
  if (!ctx) {
    throw new Error('useTTSSettings must be used within TTSProvider');
  }

  return {
    settings: ctx.settings,
    updateSettings: ctx.updateSettings,
  };
}
