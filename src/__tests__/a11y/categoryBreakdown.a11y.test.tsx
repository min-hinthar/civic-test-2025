import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../utils/renderWithProviders';
import { CategoryBreakdown } from '@/components/results/CategoryBreakdown';
import type { QuestionResult } from '@/types';

// Mock animation component to avoid motion/react issues in test
vi.mock('@/components/animations/StaggeredList', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const makeAnswer = (text: string, correct: boolean) => ({
  text_en: text,
  text_my: text,
  correct,
});

const mockResults: QuestionResult[] = [
  {
    questionId: 'q1',
    questionText_en: 'What is the supreme law?',
    questionText_my: 'What is the supreme law?',
    correctAnswer: makeAnswer('The Constitution', true),
    selectedAnswer: makeAnswer('The Constitution', true),
    isCorrect: true,
    category: 'Principles of American Democracy' as QuestionResult['category'],
  },
  {
    questionId: 'q2',
    questionText_en: 'What does the Constitution do?',
    questionText_my: 'What does the Constitution do?',
    correctAnswer: makeAnswer('Sets up the government', true),
    selectedAnswer: makeAnswer('Wrong answer', false),
    isCorrect: false,
    category: 'Principles of American Democracy' as QuestionResult['category'],
  },
  {
    questionId: 'q3',
    questionText_en: 'How many senators?',
    questionText_my: 'How many senators?',
    correctAnswer: makeAnswer('100', true),
    selectedAnswer: makeAnswer('100', true),
    isCorrect: true,
    category: 'System of Government' as QuestionResult['category'],
  },
];

describe('CategoryBreakdown accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <CategoryBreakdown results={mockResults} showBurmese={false} />,
      { preset: 'core' }
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with Burmese labels', async () => {
    const { container } = renderWithProviders(
      <CategoryBreakdown results={mockResults} showBurmese={true} />,
      { preset: 'core' }
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('progress bars have aria-label with mastery percentage', () => {
    const { container } = renderWithProviders(
      <CategoryBreakdown results={mockResults} showBurmese={false} />,
      { preset: 'core' }
    );

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeGreaterThan(0);

    for (const bar of progressBars) {
      expect(bar.getAttribute('aria-label')).toMatch(/mastery: \d+%/);
      expect(bar.getAttribute('aria-valuenow')).toBeTruthy();
    }
  });
});
