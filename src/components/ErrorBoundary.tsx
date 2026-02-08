'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { sanitizeError, sanitizeForSentry, type BilingualMessage } from '@/lib/errorSanitizer';
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
 * - Provides "Try again" and "Return to home" options
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
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default bilingual fallback UI
      return (
        <ErrorFallback
          errorMessage={this.state.errorMessage}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Props for the ErrorFallback component.
 */
interface ErrorFallbackProps {
  errorMessage: BilingualMessage | null;
  onReset: () => void;
  onGoHome: () => void;
}

/**
 * Default fallback UI for error boundaries.
 * Displays a friendly, bilingual error message with recovery options.
 */
function ErrorFallback({ errorMessage, onReset, onGoHome }: ErrorFallbackProps) {
  const message = errorMessage ?? {
    en: 'Something went wrong. Please try again.',
    my: '\u1010\u1005\u103a\u1001\u102f\u1001\u102f \u1019\u103e\u102c\u1038\u101a\u103d\u1004\u103a\u1038\u101e\u103d\u102c\u1038\u101e\u100a\u103a\u104b \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-slate-800">
        {/* Icon - friendly, not alarming */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>

        {/* English message */}
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{message.en}</h2>

        {/* Burmese message */}
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-300 font-myanmar">{message.my}</p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try again</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800"
          >
            <Home className="h-5 w-5" />
            <span>Return to home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
