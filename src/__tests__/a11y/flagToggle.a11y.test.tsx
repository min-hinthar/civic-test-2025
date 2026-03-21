import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../utils/renderWithProviders';
import { FlagToggle } from '@/components/ui/FlagToggle';

// Mock hooks
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

vi.mock('@/lib/haptics', () => ({
  hapticLight: vi.fn(),
}));

describe('FlagToggle accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<FlagToggle />, { preset: 'core' });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations in compact mode', async () => {
    const { container } = renderWithProviders(<FlagToggle compact />, { preset: 'core' });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses radiogroup role with accessible label', () => {
    const { container } = renderWithProviders(<FlagToggle />, { preset: 'core' });

    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup).toBeTruthy();
    expect(radiogroup?.getAttribute('aria-label')).toMatch(/Language mode/);
  });

  it('radio buttons have aria-checked attributes', () => {
    const { container } = renderWithProviders(<FlagToggle />, { preset: 'core' });

    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(2);

    // Exactly one should be checked
    const checkedRadios = Array.from(radios).filter(r => r.getAttribute('aria-checked') === 'true');
    expect(checkedRadios.length).toBe(1);
  });

  it('radio buttons have descriptive aria-labels', () => {
    const { container } = renderWithProviders(<FlagToggle />, { preset: 'core' });

    const radios = container.querySelectorAll('[role="radio"]');
    for (const radio of radios) {
      expect(radio.getAttribute('aria-label')).toMatch(/Language:/);
    }
  });
});
