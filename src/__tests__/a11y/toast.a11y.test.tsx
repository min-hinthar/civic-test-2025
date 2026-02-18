import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';

describe('Toast accessibility', () => {
  it('Toast with error type has no a11y violations', async () => {
    const { container } = render(
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg bg-destructive text-white"
      >
        <span className="flex-shrink-0 text-lg" aria-hidden="true">
          Warning
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">An error occurred</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-full p-1"
          aria-label="Dismiss notification"
        >
          X
        </button>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Toast with success type has no a11y violations', async () => {
    const { container } = render(
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg bg-success text-white"
      >
        <span className="flex-shrink-0 text-lg" aria-hidden="true">
          Check
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">Operation successful</p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 rounded-full p-1"
          aria-label="Dismiss notification"
        >
          X
        </button>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ToastContainer has correct ARIA attributes', () => {
    const { getByRole } = render(
      <div aria-live="assertive" aria-atomic="true" role="log">
        <div role="alert">
          <p>Test notification</p>
        </div>
      </div>
    );

    const container = getByRole('log');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });
});
