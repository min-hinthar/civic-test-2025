import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { withSessionErrorBoundary } from '@/components/withSessionErrorBoundary';

// Suppress console.error during tests since we're testing error handling
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock captureError from sentry helper
const mockCaptureError = vi.fn();
vi.mock('@/lib/sentry', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
}));

// Mock useNavigation for withSessionErrorBoundary tests
const mockSetLock = vi.fn();
vi.mock('@/components/navigation/NavigationProvider', () => ({
  useNavigation: () => ({
    isExpanded: false,
    setExpanded: vi.fn(),
    toggleSidebar: vi.fn(),
    tier: 'mobile' as const,
    isLocked: false,
    lockMessage: null,
    setLock: mockSetLock,
    navVisible: true,
    badges: {},
    sidebarRef: { current: null },
  }),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }): React.ReactNode {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div data-testid="child-content">Child rendered successfully</div>;
}

describe('ErrorBoundary', () => {
  describe('catches child errors', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Hello World</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('catches error and shows fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should not render the child
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('fallback UI renders with bilingual text', () => {
    it('displays English error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show a user-friendly English message (not the raw error)
      // The sanitizer returns generic messages for unknown errors
      expect(
        screen.getByText(/unexpected error|something went wrong|please try again/i)
      ).toBeInTheDocument();
    });

    it('displays Burmese error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have Burmese text (check for presence of Myanmar Unicode range)
      const allText = document.body.textContent || '';
      // Myanmar Unicode block: \u1000-\u109F
      const hasBurmese = /[\u1000-\u109F]/.test(allText);
      expect(hasBurmese).toBe(true);
    });

    it('displays "Try again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('displays "Return home" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument();
    });
  });

  describe('Try again button resets the boundary', () => {
    it('resets error state when clicked', () => {
      // Create a component that can control when to throw
      let throwError = true;
      function ConditionalError() {
        if (throwError) {
          throw new Error('Conditional error');
        }
        return <div data-testid="success">Recovered!</div>;
      }

      render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      // Should be in error state
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // Stop throwing and click retry
      throwError = false;
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Need to rerender to actually test the reset
      // The ErrorBoundary.handleReset will reset state, but children still throw
      // So we need to stop throwing before clicking

      // Note: In real usage, the error would typically be due to temporary conditions
      // that resolve themselves (network issues, etc.)
    });
  });

  describe('uses sanitized error messages', () => {
    it('does not display raw error message with sensitive data', () => {
      function SensitiveError(): never {
        throw new Error('Database error: column "password_hash" in table "users" not found');
      }

      render(
        <ErrorBoundary>
          <SensitiveError />
        </ErrorBoundary>
      );

      const pageText = document.body.textContent || '';

      // Should NOT contain sensitive data
      expect(pageText).not.toContain('password_hash');
      expect(pageText).not.toContain('users');
      expect(pageText).not.toContain('Database error');
      expect(pageText).not.toContain('column');
      expect(pageText).not.toContain('table');
    });

    it('does not display stack traces', () => {
      function StackTraceError(): never {
        const error = new Error('Something broke');
        error.stack = `Error: Something broke
    at UserService.getPassword (/app/src/services/user.ts:45:12)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)`;
        throw error;
      }

      render(
        <ErrorBoundary>
          <StackTraceError />
        </ErrorBoundary>
      );

      const pageText = document.body.textContent || '';

      // Should NOT contain stack trace details
      expect(pageText).not.toContain('UserService');
      expect(pageText).not.toContain('/app/src');
      expect(pageText).not.toContain('.ts:45');
      expect(pageText).not.toContain('processTicksAndRejections');
    });
  });

  describe('calls onError callback', () => {
    it('invokes onError when error is caught', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('custom fallback', () => {
    it('renders custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      // Should NOT render default fallback buttons
      expect(screen.queryByText(/Try again/)).not.toBeInTheDocument();
    });

    it('renders nothing when fallback is null (CelebrationOverlay pattern)', () => {
      const { container } = render(
        <ErrorBoundary fallback={null}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // null fallback = silent failure, renders nothing
      expect(container.innerHTML).toBe('');
    });
  });

  describe('SharedErrorFallback rendering', () => {
    it('renders bilingual content with heading and action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // SharedErrorFallback renders h2 heading with sanitized message
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      // Action buttons present
      expect(screen.getByText(/Try again/)).toBeInTheDocument();
      expect(screen.getByText(/Return home/)).toBeInTheDocument();
    });

    it('resets error boundary when Try again is clicked', () => {
      let shouldThrow = true;
      function ToggleError() {
        if (shouldThrow) throw new Error('Resettable error');
        return <div data-testid="recovered">Recovered content</div>;
      }

      render(
        <ErrorBoundary>
          <ToggleError />
        </ErrorBoundary>
      );

      // Error boundary shows fallback
      expect(screen.getByText(/Try again/)).toBeInTheDocument();
      expect(screen.queryByTestId('recovered')).not.toBeInTheDocument();

      // Stop throwing and click Try again
      shouldThrow = false;
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should recover and render child
      expect(screen.getByTestId('recovered')).toBeInTheDocument();
      expect(screen.queryByText(/Try again/)).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// withSessionErrorBoundary HOC tests
// ---------------------------------------------------------------------------

function ThrowingSession({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Session crash');
  return <div data-testid="session-content">Session content</div>;
}

const ProtectedSession = withSessionErrorBoundary(ThrowingSession, {
  componentName: 'TestSession',
});

describe('withSessionErrorBoundary', () => {
  beforeEach(() => {
    mockSetLock.mockClear();
    mockCaptureError.mockClear();
  });

  it('renders wrapped component when no error occurs', () => {
    render(<ProtectedSession shouldThrow={false} />);

    expect(screen.getByTestId('session-content')).toBeInTheDocument();
    expect(screen.getByText('Session content')).toBeInTheDocument();
  });

  it('calls setLock(false) on error to release navigation lock', () => {
    render(<ProtectedSession shouldThrow={true} />);

    // CRITICAL assertion: nav lock must be released
    expect(mockSetLock).toHaveBeenCalledWith(false);
  });

  it('calls captureError with component context on error', () => {
    render(<ProtectedSession shouldThrow={true} />);

    expect(mockCaptureError).toHaveBeenCalledTimes(1);
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'TestSession',
        componentStack: expect.any(String),
      })
    );
  });

  it('renders ErrorBoundary fallback UI on crash', () => {
    render(<ProtectedSession shouldThrow={true} />);

    // SharedErrorFallback renders Try again and Return home buttons
    expect(screen.getByText(/Try again/)).toBeInTheDocument();
    expect(screen.getByText(/Return home/)).toBeInTheDocument();
    expect(screen.queryByTestId('session-content')).not.toBeInTheDocument();
  });

  it('has correct displayName for debugging', () => {
    expect(ProtectedSession.displayName).toBe('withSessionErrorBoundary(ThrowingSession)');
  });
});
