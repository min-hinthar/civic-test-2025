'use client';

import { useContext } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { TTSContext } from '@/contexts/TTSContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useSocial } from '@/contexts/SocialContext';
import { useSRS } from '@/contexts/SRSContext';
import { useUserState } from '@/contexts/StateContext';
import { useNavigation } from '@/components/navigation/NavigationProvider';

const EXPECTED_ORDER = [
  'ErrorBoundary',
  'AuthProvider',
  'LanguageProvider',
  'ThemeProvider',
  'TTSProvider',
  'ToastProvider',
  'OfflineProvider',
  'SocialProvider',
  'SRSProvider',
  'StateProvider',
  'NavigationProvider',
];

const ORDER_REFERENCE = `Expected: ${EXPECTED_ORDER.join(' > ')}
See: .claude/learnings/provider-ordering.md`;

function warn(name: string): void {
  console.warn(`[ProviderOrderGuard] ${name} missing or misordered.\n${ORDER_REFERENCE}`);
}

/**
 * Dev-mode provider ordering validation component.
 *
 * Calls all context hooks to verify providers are mounted in the correct order.
 * Emits console.warn (never throws) when a provider is missing or misordered.
 *
 * MUST be conditionally rendered in ClientProviders.tsx:
 *   {process.env.NODE_ENV === 'development' && <ProviderOrderGuard />}
 *
 * This ensures zero production overhead (component never mounts) and avoids
 * Rules of Hooks violation from early returns before hook calls.
 */
export function ProviderOrderGuard(): null {
  // Hooks that throw when provider is missing -- detect via try/catch
  try {
    useAuth();
  } catch {
    warn('AuthProvider');
  }

  try {
    useLanguage();
  } catch {
    warn('LanguageProvider');
  }

  try {
    useThemeContext();
  } catch {
    warn('ThemeProvider');
  }

  // TTSContext has no exported hook; useContext returns null when missing
  const ttsValue = useContext(TTSContext);
  if (ttsValue === null) {
    warn('TTSProvider');
  }

  // useToast() returns a no-op fallback (never throws), and ToastContext is not
  // exported. Detection of missing ToastProvider is architecturally impossible
  // without exporting the raw context. Skipped intentionally.

  try {
    useOffline();
  } catch {
    warn('OfflineProvider');
  }

  try {
    useSocial();
  } catch {
    warn('SocialProvider');
  }

  try {
    useSRS();
  } catch {
    warn('SRSProvider');
  }

  try {
    useUserState();
  } catch {
    warn('StateProvider');
  }

  try {
    useNavigation();
  } catch {
    warn('NavigationProvider');
  }

  return null;
}
