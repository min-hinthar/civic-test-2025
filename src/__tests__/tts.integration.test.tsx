/**
 * TTS Integration Tests
 *
 * Renders SpeechButton inside TTSProvider and verifies end-to-end plumbing:
 * speak/cancel triggers, disabled states, ARIA attributes, and provider
 * rendering children without blocking.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { TTSContext, TTSProvider } from '@/contexts/TTSContext';
import SpeechButton from '@/components/ui/SpeechButton';

// ---------------------------------------------------------------------------
// Mock infrastructure (mirrors ttsCore.test.ts pattern)
// ---------------------------------------------------------------------------

let storedUtterances: SpeechSynthesisUtterance[] = [];
let mockSpeaking = false;
let autoFireOnend = true;

function resetMockState() {
  storedUtterances = [];
  mockSpeaking = false;
  autoFireOnend = true;
}

/** Mock SpeechSynthesisUtterance class. */
class MockUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  volume = 1;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onpause: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onresume: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onboundary: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onmark: ((ev: SpeechSynthesisEvent) => void) | null = null;

  constructor(text = '') {
    this.text = text;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).SpeechSynthesisUtterance = MockUtterance;

function installMock() {
  const mockSynth = {
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      storedUtterances.push(utterance);
      mockSpeaking = true;
      if (autoFireOnend) {
        setTimeout(() => {
          mockSpeaking = false;
          utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
        }, 0);
      }
    }),
    cancel: vi.fn(() => {
      const last = storedUtterances[storedUtterances.length - 1];
      mockSpeaking = false;
      if (last) {
        // Fire onend on the cancelled utterance to resolve the promise
        setTimeout(() => {
          last.onend?.(new Event('end') as SpeechSynthesisEvent);
        }, 0);
      }
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    onvoiceschanged: null as (() => void) | null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    get speaking() {
      return mockSpeaking;
    },
    get paused() {
      return false;
    },
    get pending() {
      return false;
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).speechSynthesis = mockSynth;
  return mockSynth;
}

// ---------------------------------------------------------------------------
// Mock requestIdleCallback (not available in jsdom)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).requestIdleCallback = (cb: () => void) => setTimeout(cb, 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).cancelIdleCallback = (id: number) => clearTimeout(id);

// ---------------------------------------------------------------------------
// Test setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  resetMockState();
  installMock();
  try {
    localStorage.clear();
  } catch {
    /* jsdom may not support clear */
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helper: render SpeechButton inside TTSProvider
// ---------------------------------------------------------------------------

function renderButton(props: { text: string; label: string; ariaLabel?: string }) {
  return render(
    <TTSProvider>
      <SpeechButton {...props} />
    </TTSProvider>
  );
}

// ==========================================================================
// Integration Tests
// ==========================================================================

describe('TTS Integration: TTSProvider + SpeechButton', () => {
  it('renders SpeechButton and is enabled with valid text', async () => {
    await act(async () => {
      renderButton({ text: 'Hello world', label: 'Listen' });
      // Flush idle callback for engine creation
      vi.advanceTimersByTime(10);
    });

    const button = screen.getByRole('button', { name: /listen/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('click triggers speechSynthesis.speak with correct text', async () => {
    const mockSynth = installMock();

    await act(async () => {
      renderButton({ text: 'The president lives in the White House', label: 'Listen' });
      vi.advanceTimersByTime(10);
    });

    const button = screen.getByRole('button', { name: /listen/i });

    await act(async () => {
      fireEvent.click(button);
      // Flush cancel delay (ttsCore has a CANCEL_DELAY_MS before speaking)
      vi.advanceTimersByTime(200);
    });

    expect(mockSynth.speak).toHaveBeenCalled();
    // Verify the utterance text matches
    const utterance = storedUtterances[storedUtterances.length - 1];
    expect(utterance).toBeDefined();
    expect(utterance.text).toContain('The president lives in the White House');
  });

  it('button is disabled when text is empty', async () => {
    await act(async () => {
      renderButton({ text: '', label: 'Listen' });
      vi.advanceTimersByTime(10);
    });

    const button = screen.getByRole('button', { name: /listen/i });
    expect(button).toBeDisabled();
  });

  it('button has correct aria-label and aria-pressed attributes', async () => {
    await act(async () => {
      renderButton({ text: 'Test', label: 'Listen', ariaLabel: 'Listen to answer' });
      vi.advanceTimersByTime(10);
    });

    const button = screen.getByRole('button', { name: /listen to answer/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('provider renders children immediately even before engine is ready', async () => {
    // Don't advance timers -- engine creation happens in useEffect
    render(
      <TTSProvider>
        <div data-testid="child">Hello</div>
      </TTSProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('button shows whitespace-only text as disabled', async () => {
    await act(async () => {
      renderButton({ text: '   ', label: 'Listen' });
      vi.advanceTimersByTime(10);
    });

    const button = screen.getByRole('button', { name: /listen/i });
    expect(button).toBeDisabled();
  });
});

// ==========================================================================
// Phase 22: Settings Persistence, Voice Filtering, SpeechButton states
// ==========================================================================

// Helper component that accesses TTSContext directly
function SettingsConsumer({
  onMount,
}: {
  onMount?: (ctx: { updateSettings: (partial: Record<string, unknown>) => void }) => void;
}) {
  const val = useContext(TTSContext);

  // Expose updateSettings to test via callback
  if (onMount && val) {
    onMount({ updateSettings: val.updateSettings });
  }

  return (
    <div>
      <span data-testid="auto-read">{String(val?.settings?.autoRead)}</span>
      <span data-testid="auto-read-lang">{val?.settings?.autoReadLang}</span>
      <span data-testid="auto-read-lang-value">{val?.settings?.autoReadLang}</span>
      <span data-testid="rate">{val?.settings?.rate}</span>
    </div>
  );
}

describe('Phase 22: TTSSettings persistence', () => {
  it('updateSettings changes autoRead in React state', async () => {
    let updateFn: ((partial: Record<string, unknown>) => void) | null = null;

    await act(async () => {
      render(
        <TTSProvider>
          <SettingsConsumer
            onMount={ctx => {
              updateFn = ctx.updateSettings;
            }}
          />
        </TTSProvider>
      );
      vi.advanceTimersByTime(10);
    });

    // Default: autoRead = true
    expect(screen.getByTestId('auto-read')).toHaveTextContent('true');

    // Update autoRead to false
    await act(async () => {
      updateFn?.({ autoRead: false });
      vi.advanceTimersByTime(10);
    });

    // React state should reflect the change
    expect(screen.getByTestId('auto-read')).toHaveTextContent('false');
  });

  it('updateSettings changes autoReadLang in React state', async () => {
    let updateFn: ((partial: Record<string, unknown>) => void) | null = null;

    await act(async () => {
      render(
        <TTSProvider>
          <SettingsConsumer
            onMount={ctx => {
              updateFn = ctx.updateSettings;
            }}
          />
        </TTSProvider>
      );
      vi.advanceTimersByTime(10);
    });

    // Default: both
    expect(screen.getByTestId('auto-read-lang-value')).toHaveTextContent('both');

    await act(async () => {
      updateFn?.({ autoReadLang: 'english' });
      vi.advanceTimersByTime(10);
    });

    // React state should reflect the change
    expect(screen.getByTestId('auto-read-lang-value')).toHaveTextContent('english');
  });

  it('TTSSettings defaults for new fields via merge pattern', async () => {
    // Verify the { ...DEFAULT_SETTINGS, ...parsed } merge pattern:
    // When default settings are loaded, Phase 22 fields are present with correct defaults

    await act(async () => {
      render(
        <TTSProvider>
          <SettingsConsumer />
        </TTSProvider>
      );
      vi.advanceTimersByTime(10);
    });

    // Default fields should be present
    expect(screen.getByTestId('auto-read')).toHaveTextContent('true');
    expect(screen.getByTestId('auto-read-lang')).toHaveTextContent('both');
    expect(screen.getByTestId('auto-read-lang-value')).toHaveTextContent('both');
    // Original defaults still present
    expect(screen.getByTestId('rate')).toHaveTextContent('normal');
  });
});

describe('Phase 22: Voice filtering logic', () => {
  it('filters to English voices only', () => {
    // Test the filtering logic directly (mirrors VoicePicker's useMemo)
    const mixedVoices = [
      { name: 'Samantha', lang: 'en-US', localService: true },
      { name: 'Thomas', lang: 'fr-FR', localService: true },
      { name: 'Google UK', lang: 'en-GB', localService: false },
      { name: 'Yuna', lang: 'ko-KR', localService: true },
      { name: 'Alex', lang: 'en', localService: true },
      { name: 'Lekha', lang: 'hi-IN', localService: true },
    ] as SpeechSynthesisVoice[];

    const filtered = mixedVoices
      .filter(v => {
        const lang = v.lang.toLowerCase().replace(/_/g, '-');
        return lang.startsWith('en-') || lang === 'en';
      })
      .sort((a, b) => {
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;
        return a.name.localeCompare(b.name);
      });

    expect(filtered).toHaveLength(3);
    expect(filtered.map(v => v.name)).toEqual(
      expect.arrayContaining(['Samantha', 'Google UK', 'Alex'])
    );
    // No French, Korean, or Hindi voices
    expect(filtered.find(v => v.lang === 'fr-FR')).toBeUndefined();
    expect(filtered.find(v => v.lang === 'ko-KR')).toBeUndefined();
  });
});

describe('Phase 22: SpeechButton states', () => {
  it('renders speed label when showSpeedLabel is true', async () => {
    await act(async () => {
      render(
        <TTSProvider>
          <SpeechButton text="Test" label="Listen" showSpeedLabel={true} speedLabel="1.3x" />
        </TTSProvider>
      );
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText('1.3x')).toBeInTheDocument();
  });

  it('does not render speed label when showSpeedLabel is false', async () => {
    await act(async () => {
      render(
        <TTSProvider>
          <SpeechButton text="Test" label="Listen" showSpeedLabel={false} speedLabel="1.3x" />
        </TTSProvider>
      );
      vi.advanceTimersByTime(10);
    });

    expect(screen.queryByText('1.3x')).not.toBeInTheDocument();
  });
});
