import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackPanel } from '@/components/quiz/FeedbackPanel';

// Mock hooks used by FeedbackPanel and its children (SpeechButton)
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true, // skip animations in tests
}));

vi.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSpeaking: false,
    currentText: null,
    error: null,
  }),
}));

vi.mock('@/hooks/useTTSSettings', () => ({
  useTTSSettings: () => ({
    settings: {
      enabled: true,
      autoRead: false,
      speed: 'normal',
      voiceName: '',
    },
    updateSettings: vi.fn(),
  }),
}));

vi.mock('@/lib/audio/soundEffects', () => ({
  playPanelReveal: vi.fn(),
}));

describe('FeedbackPanel accessibility', () => {
  const defaultProps = {
    isCorrect: true,
    show: true,
    correctAnswer: 'The Constitution',
    streakCount: 0,
    mode: 'practice' as const,
    onContinue: vi.fn(),
    showBurmese: false,
  };

  it('FeedbackPanel (correct) has no a11y violations', async () => {
    const { container } = render(<FeedbackPanel {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FeedbackPanel (incorrect) has no a11y violations', async () => {
    const { container } = render(
      <FeedbackPanel
        {...defaultProps}
        isCorrect={false}
        userAnswer="The Declaration of Independence"
        correctAnswer="The Constitution"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FeedbackPanel (incorrect with explanation) has no a11y violations', async () => {
    const { container } = render(
      <FeedbackPanel
        {...defaultProps}
        isCorrect={false}
        userAnswer="The Declaration of Independence"
        correctAnswer="The Constitution"
        explanation={{
          brief_en: 'The Constitution is the supreme law of the land.',
          brief_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေသည် နိုင်ငံ၏ အမြင့်ဆုံးဥပဒေဖြစ်သည်။',
          mnemonic_en: 'Think: Constitution = Supreme',
          mnemonic_my: 'ဖွဲ့စည်းပုံ = အမြင့်ဆုံး',
        }}
        showBurmese={true}
        mode="practice"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
