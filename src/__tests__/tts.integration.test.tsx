/**
 * TTS Integration Tests
 *
 * Renders SpeechButton inside TTSProvider and verifies end-to-end plumbing:
 * speak/cancel triggers, disabled states, ARIA attributes, and provider
 * rendering children without blocking.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { TTSProvider } from '@/contexts/TTSContext';
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
