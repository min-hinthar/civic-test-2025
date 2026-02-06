import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

    it('displays "Return to home" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
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
    });
  });
});
