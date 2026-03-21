import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { NavBadge } from '@/components/navigation/NavBadge';

describe('NavBadge accessibility', () => {
  it('count badge has no a11y violations', async () => {
    const { container } = render(<NavBadge type="count" count={5} color="warning" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('dot badge has no a11y violations', async () => {
    const { container } = render(<NavBadge type="dot" visible={true} color="primary" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('hidden badge has no a11y violations', async () => {
    const { container } = render(<NavBadge type="count" count={0} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('count badge has role="status" and aria-label', () => {
    const { container } = render(<NavBadge type="count" count={3} />);

    const badge = container.querySelector('[role="status"]');
    expect(badge).toBeTruthy();
    expect(badge?.getAttribute('aria-label')).toBe('3 new');
  });

  it('overflow count shows 99+ in aria-label', () => {
    const { container } = render(<NavBadge type="count" count={150} />);

    const badge = container.querySelector('[role="status"]');
    expect(badge?.getAttribute('aria-label')).toBe('99+ new');
  });
});
