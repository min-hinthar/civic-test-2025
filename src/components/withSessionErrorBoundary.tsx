'use client';

import { type ComponentType, type ErrorInfo, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { captureError } from '@/lib/sentry';

interface SessionErrorBoundaryOptions {
  /** Component name for Sentry context */
  componentName: string;
}

/**
 * HOC that wraps a component in ErrorBoundary with session cleanup.
 * Captures useNavigation() for lock release and reports to Sentry.
 *
 * Per CONTEXT.md: "HOC wrapper pattern (`withSessionErrorBoundary`) bridges
 * class-based ErrorBoundary with functional hooks"
 *
 * Cleanup strategy:
 * - setLock(false): release navigation lock so user isn't trapped
 * - captureError(): report to Sentry with component context
 * - Component-specific cleanup (audio, timers) happens via React's useEffect
 *   cleanup when ErrorBoundary unmounts the child tree
 * - Session re-save is NOT done -- rely on existing 5-second auto-save
 */
export function withSessionErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: SessionErrorBoundaryOptions
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function SessionErrorBoundaryWrapper(props: P) {
    const { setLock } = useNavigation();

    const handleError = useCallback(
      (error: Error, errorInfo: ErrorInfo) => {
        // CRITICAL: Release navigation lock so user isn't trapped
        setLock(false);
        // Report to Sentry with component context
        captureError(error, {
          component: options.componentName,
          componentStack: errorInfo.componentStack || 'unknown',
        });
      },
      [setLock]
    );

    return (
      <ErrorBoundary onError={handleError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  SessionErrorBoundaryWrapper.displayName = `withSessionErrorBoundary(${displayName})`;
  return SessionErrorBoundaryWrapper;
}
