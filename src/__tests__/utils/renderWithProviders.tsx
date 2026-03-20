/**
 * Shared test render utility with configurable provider presets.
 *
 * Wraps @testing-library/react's render() with the app's provider tree,
 * matching the exact nesting order from ClientProviders.tsx.
 *
 * Usage:
 *   renderWithProviders(<MyComponent />, { preset: 'core' });
 *   renderWithProviders(<MyComponent />, { preset: 'full', providers: { TTS: true } });
 *   renderWithProviders(<MyComponent />, { preset: 'minimal' });
 */

import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';

// Provider imports -- must match ClientProviders.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TTSProvider } from '@/contexts/TTSContext';
import { ToastProvider } from '@/components/BilingualToast';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { SRSProvider } from '@/contexts/SRSContext';
import { StateProvider } from '@/contexts/StateContext';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Provider names matching the nesting order in ClientProviders.tsx.
 */
export type ProviderName =
  | 'ErrorBoundary'
  | 'Auth'
  | 'Language'
  | 'Theme'
  | 'TTS'
  | 'Toast'
  | 'Offline'
  | 'Social'
  | 'SRS'
  | 'State'
  | 'Navigation';

/**
 * Options for renderWithProviders.
 */
export interface RenderWithProvidersOptions {
  /** Provider preset: minimal, core (default), or full */
  preset?: 'minimal' | 'core' | 'full';
  /** Override individual providers on top of the preset */
  providers?: Partial<Record<ProviderName, boolean>>;
  /** Mock configuration for provider state */
  mocks?: {
    user?: { id: string; email: string; name: string; testHistory: unknown[] } | null;
    language?: 'bilingual' | 'english-only';
    theme?: 'light' | 'dark';
    onLine?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Provider ordering (MUST match ClientProviders.tsx exactly)
// ---------------------------------------------------------------------------

/**
 * Canonical provider nesting order from ClientProviders.tsx:
 * ErrorBoundary > Auth > Language > Theme > TTS > Toast >
 * Offline > Social > SRS > State > Navigation
 */
const PROVIDER_ORDER: ProviderName[] = [
  'ErrorBoundary',
  'Auth',
  'Language',
  'Theme',
  'TTS',
  'Toast',
  'Offline',
  'Social',
  'SRS',
  'State',
  'Navigation',
];

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const PRESETS: Record<'minimal' | 'core' | 'full', Set<ProviderName>> = {
  /** Minimal: ErrorBoundary + StateProvider only */
  minimal: new Set<ProviderName>(['ErrorBoundary', 'State']),

  /** Core: ErrorBoundary + Auth + Language + Theme + Toast + State (covers ~78% of tests) */
  core: new Set<ProviderName>(['ErrorBoundary', 'Auth', 'Language', 'Theme', 'Toast', 'State']),

  /** Full: All 11 providers in exact ClientProviders.tsx order */
  full: new Set<ProviderName>(PROVIDER_ORDER),
};

// ---------------------------------------------------------------------------
// Provider component map
// ---------------------------------------------------------------------------

type ProviderWrapper = ({ children }: { children: ReactNode }) => ReactElement;

const PROVIDER_COMPONENTS: Record<ProviderName, ProviderWrapper> = {
  ErrorBoundary: ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>,
  Auth: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  Language: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
  Theme: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  TTS: ({ children }) => <TTSProvider>{children}</TTSProvider>,
  Toast: ({ children }) => <ToastProvider>{children}</ToastProvider>,
  Offline: ({ children }) => <OfflineProvider>{children}</OfflineProvider>,
  Social: ({ children }) => <SocialProvider>{children}</SocialProvider>,
  SRS: ({ children }) => <SRSProvider>{children}</SRSProvider>,
  State: ({ children }) => <StateProvider>{children}</StateProvider>,
  Navigation: ({ children }) => <NavigationProvider>{children}</NavigationProvider>,
};

// ---------------------------------------------------------------------------
// Builder: compose provider tree respecting ordering
// ---------------------------------------------------------------------------

function buildProviderTree(enabledProviders: Set<ProviderName>, children: ReactNode): ReactElement {
  // Filter PROVIDER_ORDER to only enabled providers, maintaining correct nesting
  const activeProviders = PROVIDER_ORDER.filter(name => enabledProviders.has(name));

  // Wrap from inside out (last in array = innermost wrapper)
  let tree: ReactElement = <>{children}</>;

  for (let i = activeProviders.length - 1; i >= 0; i--) {
    const Wrapper = PROVIDER_COMPONENTS[activeProviders[i]];
    tree = <Wrapper>{tree}</Wrapper>;
  }

  return tree;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Render a component wrapped in the app's provider tree with configurable presets.
 *
 * @param ui - React element to render
 * @param options - Configuration for preset, provider overrides, and mocks
 * @returns @testing-library/react RenderResult
 *
 * @example
 * // Default core preset
 * renderWithProviders(<MyComponent />);
 *
 * @example
 * // Minimal for unit tests that don't need contexts
 * renderWithProviders(<MyComponent />, { preset: 'minimal' });
 *
 * @example
 * // Core + TTS provider
 * renderWithProviders(<MyComponent />, { providers: { TTS: true } });
 *
 * @example
 * // Full provider tree
 * renderWithProviders(<MyComponent />, { preset: 'full' });
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const { preset = 'core', providers = {} } = options;

  // Start with the preset's enabled providers
  const enabledProviders = new Set(PRESETS[preset]);

  // Apply overrides
  for (const [name, enabled] of Object.entries(providers)) {
    if (enabled) {
      enabledProviders.add(name as ProviderName);
    } else {
      enabledProviders.delete(name as ProviderName);
    }
  }

  // Build the wrapper
  function Wrapper({ children }: { children: ReactNode }) {
    return buildProviderTree(enabledProviders, children);
  }

  return render(ui, { wrapper: Wrapper });
}
