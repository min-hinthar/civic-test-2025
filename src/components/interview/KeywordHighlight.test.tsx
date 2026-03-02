import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isValidElement, type ReactElement } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { highlightKeywords, KeywordHighlight } from './KeywordHighlight';

// Mock useAuth -- LanguageProvider now calls useAuth() for settings sync
vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

// Mock localStorage for LanguageProvider (jsdom sometimes lacks full implementation)
beforeAll(() => {
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      key: vi.fn(),
      length: 0,
    },
    writable: true,
    configurable: true,
  });
});

/** Wrap component in required providers */
function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

// --- highlightKeywords utility tests ---

describe('highlightKeywords', () => {
  it('highlights exact keyword match in answer text', () => {
    const result = highlightKeywords('The president leads the country', ['president']);
    // Should have 3 parts: "The ", <mark>president</mark>, " leads the country"
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('The ');
    expect(isValidElement(result[1])).toBe(true);
    expect(result[2]).toBe(' leads the country');
  });

  it('is case-insensitive: "president" matches "President" in answer', () => {
    const result = highlightKeywords('The President leads', ['president']);
    expect(result).toHaveLength(3);
    // The <mark> element should contain the original case "President"
    const markEl = result[1] as ReactElement<{ children: string }>;
    expect(markEl.props.children).toBe('President');
  });

  it('highlights multiple keywords independently', () => {
    const result = highlightKeywords('The president leads the country', ['president', 'country']);
    // "The " + <mark>president</mark> + " leads the " + <mark>country</mark>
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('The ');
    expect(isValidElement(result[1])).toBe(true);
    expect(result[2]).toBe(' leads the ');
    expect(isValidElement(result[3])).toBe(true);
  });

  it('uses word boundary: "the" does not match "their" or "there"', () => {
    const result = highlightKeywords('their answer is there somewhere', ['the']);
    // No word "the" exists as a standalone word, so no highlights
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('their answer is there somewhere');
  });

  it('returns original text unchanged when matchedKeywords is empty', () => {
    const result = highlightKeywords('The supreme law of the land', []);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('The supreme law of the land');
  });

  it('returns empty string for empty answer', () => {
    const result = highlightKeywords('', ['president']);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('');
  });

  it('handles keyword at the very start of text', () => {
    const result = highlightKeywords('Freedom of speech', ['freedom']);
    expect(result).toHaveLength(2);
    expect(isValidElement(result[0])).toBe(true);
    expect(result[1]).toBe(' of speech');
  });

  it('handles keyword at the very end of text', () => {
    const result = highlightKeywords('We have freedom', ['freedom']);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('We have ');
    expect(isValidElement(result[1])).toBe(true);
  });
});

// --- KeywordHighlight component tests ---

describe('KeywordHighlight', () => {
  it('renders matched keywords with <mark> elements', () => {
    renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads the country"
        matchedKeywords={['president', 'country']}
        missingKeywords={[]}
      />
    );

    const marks = screen.getAllByText(/president|country/);
    // Each matched keyword should be rendered
    expect(marks.length).toBeGreaterThanOrEqual(2);
    // Check that the mark elements exist in the DOM
    const markEls = document.querySelectorAll('mark');
    expect(markEls).toHaveLength(2);
  });

  it('renders missing keywords as pill chips when showMissing=true', () => {
    renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads"
        matchedKeywords={['president']}
        missingKeywords={['constitution', 'supreme']}
        showMissing={true}
      />
    );

    expect(screen.getByText(/Missing keywords/)).toBeInTheDocument();
    expect(screen.getByText('constitution')).toBeInTheDocument();
    expect(screen.getByText('supreme')).toBeInTheDocument();

    // Check pill chip styling
    const pill = screen.getByText('constitution');
    expect(pill.className).toContain('rounded-full');
  });

  it('hides missing keywords section when showMissing=false', () => {
    renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads"
        matchedKeywords={['president']}
        missingKeywords={['constitution']}
        showMissing={false}
      />
    );

    expect(screen.queryByText(/Missing keywords/)).not.toBeInTheDocument();
    expect(screen.queryByText('constitution')).not.toBeInTheDocument();
  });

  it('applies smaller text in compact mode', () => {
    const { container } = renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads"
        matchedKeywords={['president']}
        missingKeywords={[]}
        compact={true}
      />
    );

    // Find the space-y-2 wrapper div (the KeywordHighlight root)
    const wrapper = container.querySelector('.space-y-2, [class*="text-sm"]');
    expect(wrapper?.className).toContain('text-sm');
  });

  it('applies base text in normal mode', () => {
    const { container } = renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads"
        matchedKeywords={['president']}
        missingKeywords={[]}
        compact={false}
      />
    );

    // Find the space-y-2 wrapper div (the KeywordHighlight root)
    const wrapper = container.querySelector('.space-y-2, [class*="text-base"]');
    expect(wrapper?.className).toContain('text-base');
  });

  it('shows "No answer given" for empty answer', () => {
    renderWithProviders(
      <KeywordHighlight
        userAnswer=""
        matchedKeywords={['president']}
        missingKeywords={['constitution']}
      />
    );

    expect(screen.getByText('No answer given')).toBeInTheDocument();
  });

  it('shows "No answer given" for whitespace-only answer', () => {
    renderWithProviders(
      <KeywordHighlight userAnswer="   " matchedKeywords={['president']} missingKeywords={[]} />
    );

    expect(screen.getByText('No answer given')).toBeInTheDocument();
  });

  it('does not show Missing section when missingKeywords is empty', () => {
    renderWithProviders(
      <KeywordHighlight
        userAnswer="The president leads the country"
        matchedKeywords={['president', 'country']}
        missingKeywords={[]}
        showMissing={true}
      />
    );

    expect(screen.queryByText(/Missing keywords/)).not.toBeInTheDocument();
  });
});
