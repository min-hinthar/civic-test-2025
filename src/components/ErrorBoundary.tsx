'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { sanitizeError, sanitizeForSentry, type BilingualMessage } from '@/lib/errorSanitizer';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import * as Sentry from '@sentry/nextjs';

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component to render instead of default */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: BilingualMessage | null;
}

/**
 * React Error Boundary component that catches JavaScript errors in child components.
 *
 * Features:
 * - Catches React component errors and displays bilingual fallback UI
 * - Sanitizes error messages before display (no sensitive data)
 * - Reports errors to Sentry with PII stripped
 * - Provides "Try again" and "Return home" options via SharedErrorFallback
 *
 * Note: Error boundaries must be class components as of React 19.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  /**
   * Update state when an error is caught during rendering.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Sanitize the error message for display
    const sanitizedMessage = sanitizeError(error);
    return {
      hasError: true,
      errorMessage: sanitizedMessage,
    };
  }

  /**
   * Log the error and report to Sentry.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Get sanitized data for Sentry
    const sanitizedData = sanitizeForSentry(error, undefined, {
      componentStack: errorInfo.componentStack || 'unknown',
    });

    // Report to Sentry if available
    if (typeof Sentry !== 'undefined' && Sentry.captureException) {
      Sentry.captureException(error, {
        extra: {
          componentStack: sanitizedData.context?.componentStack,
          sanitizedMessage: sanitizedData.error.message,
        },
      });
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log sanitized error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', sanitizedData);
    }
  }

  /**
   * Reset the error boundary state.
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      errorMessage: null,
    });
  };

  /**
   * Navigate to home page.
   * Uses window.location for reliable navigation that works with React Router.
   */
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it (null = silent failure)
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // Read language mode from localStorage (class component cannot use hooks)
      const showBurmese = (() => {
        try {
          if (typeof window !== 'undefined') {
            return localStorage.getItem('civic-test-language-mode') !== 'english-only';
          }
        } catch {
          // localStorage unavailable (private browsing, test env, etc.)
        }
        return true;
      })();

      return (
        <SharedErrorFallback
          message={
            this.state.errorMessage ?? {
              en: 'Something went wrong. Please try again.',
              my: '\u1010\u1005\u103A\u1001\u102F\u1001\u102F \u1019\u103E\u102C\u1038\u101A\u103D\u1004\u103A\u1038\u101E\u103D\u102C\u1038\u101E\u100A\u103A\u104B \u1011\u1015\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B',
            }
          }
          showBurmese={showBurmese}
          onRetry={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
