/**
 * Sentry helper utilities for error reporting with PII stripping.
 *
 * This module provides:
 * - captureError: Wrapper around Sentry.captureException with sanitization
 * - setUserContext: Set user context with hashed ID only (no PII)
 * - beforeSendHandler: Event processor for PII stripping
 */

import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent, EventHint } from '@sentry/nextjs';

/**
 * Hash a user ID using djb2 algorithm.
 * Same algorithm used in errorSanitizer for consistency.
 */
function hashUserId(userId: string): string {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 33) ^ userId.charCodeAt(i);
  }
  return 'user_' + (hash >>> 0).toString(16);
}

/**
 * Strip PII from strings (emails, UUIDs).
 */
function stripPII(text: string | undefined): string | undefined {
  if (!text) return text;

  let result = text;

  // Replace email addresses
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_REDACTED]');

  // Replace UUIDs
  result = result.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '[UUID_REDACTED]'
  );

  return result;
}

/**
 * beforeSend handler that strips PII from Sentry events.
 * Use this in your Sentry.init() configuration.
 */
export function beforeSendHandler(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  // Skip PII stripping in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    return event;
  }

  // -------------------------------------------------------------------------
  // Error fingerprinting: group high-volume error categories under single issues
  // -------------------------------------------------------------------------
  const errorValue = event.exception?.values?.[0]?.value ?? '';
  if (/network|fetch|ECONNREFUSED|ERR_INTERNET_DISCONNECTED/i.test(errorValue)) {
    event.fingerprint = ['network-error'];
  } else if (/IndexedDB|QuotaExceeded|IDBDatabase/i.test(errorValue)) {
    event.fingerprint = ['indexeddb-error'];
  } else if (/SpeechSynthesis|speechSynthesis|utterance/i.test(errorValue)) {
    event.fingerprint = ['tts-error'];
  }

  // Strip PII from exception messages
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(exception => ({
      ...exception,
      value: stripPII(exception.value),
      stacktrace: exception.stacktrace
        ? {
            ...exception.stacktrace,
            frames: exception.stacktrace.frames?.map(frame => ({
              ...frame,
              // Don't strip file paths in stack traces - they're useful for debugging
              // but strip any embedded PII in context lines
              context_line: stripPII(frame.context_line),
              pre_context: frame.pre_context?.map(line => stripPII(line) || ''),
              post_context: frame.post_context?.map(line => stripPII(line) || ''),
            })),
          }
        : undefined,
    }));
  }

  // Strip PII from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
      ...breadcrumb,
      message: stripPII(breadcrumb.message),
      data: breadcrumb.data
        ? Object.fromEntries(
            Object.entries(breadcrumb.data).map(([key, value]) => [
              key,
              typeof value === 'string' ? stripPII(value) : value,
            ])
          )
        : undefined,
    }));
  }

  // Hash user ID if present
  if (event.user?.id) {
    event.user = {
      id: hashUserId(String(event.user.id)),
      // Explicitly remove other PII fields
      email: undefined,
      username: undefined,
      ip_address: undefined,
    };
  }

  // Strip PII from extra context
  if (event.extra) {
    event.extra = Object.fromEntries(
      Object.entries(event.extra).map(([key, value]) => [
        key,
        typeof value === 'string' ? stripPII(value) : value,
      ])
    );
  }

  // Strip PII from tags
  if (event.tags) {
    event.tags = Object.fromEntries(
      Object.entries(event.tags).map(([key, value]) => [
        key,
        typeof value === 'string' ? stripPII(value) : value,
      ])
    );
  }

  return event;
}

/**
 * Capture an error and send to Sentry with sanitization.
 *
 * @param error - The error to capture
 * @param context - Optional additional context (will be sanitized)
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): string | undefined {
  // Sanitize context if provided
  const sanitizedContext = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          typeof value === 'string' ? stripPII(value) : value,
        ])
      )
    : undefined;

  // Capture the exception
  return Sentry.captureException(error, {
    extra: sanitizedContext,
  });
}

/**
 * Set user context with hashed ID only.
 * No email, name, or other PII is stored.
 *
 * @param userId - The user's ID (will be hashed before sending)
 */
export function setUserContext(userId: string): void {
  Sentry.setUser({
    id: hashUserId(userId),
    // Explicitly don't set email, username, or other PII
  });
}

/**
 * Clear user context (e.g., on logout).
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Check if Sentry is initialized and available.
 */
export function isSentryEnabled(): boolean {
  // Check if SENTRY_DSN is configured
  const dsn =
    process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;

  return Boolean(dsn);
}
