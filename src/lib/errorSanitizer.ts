/**
 * Error sanitization utilities for user-facing error messages and Sentry reporting.
 *
 * Key principles:
 * - NEVER expose internal details (table names, SQL queries, stack traces)
 * - ALWAYS provide bilingual messages (English + Burmese)
 * - Hash user IDs before sending to Sentry (no raw PII)
 */

export interface BilingualMessage {
  en: string;
  my: string;
}

/**
 * Patterns to detect different error types for user-friendly mapping.
 * Order matters - more specific patterns should come first.
 */
const ERROR_PATTERNS: Array<{
  patterns: RegExp[];
  message: BilingualMessage;
}> = [
  // Network/connectivity errors
  {
    patterns: [
      /network/i,
      /fetch failed/i,
      /failed to fetch/i,
      /net::ERR/i,
      /ECONNREFUSED/i,
      /ENOTFOUND/i,
      /ETIMEDOUT/i,
      /offline/i,
      /no internet/i,
    ],
    message: {
      en: 'Connection problem. Please check your internet.',
      my: '\u1021\u1004\u103a\u1010\u102c\u1014\u1000\u103a \u1015\u103c\u103e\u1014\u102c\u101b\u1015\u103d\u1014\u103a\u101b\u103e\u102d\u1015\u102b\u101e\u100a\u103a\u104b \u101e\u1004\u103a\u1037\u1021\u1004\u103a\u1010\u102c\u1014\u1000\u103a\u1000\u102d\u102f \u1005\u1005\u103a\u1006\u1031\u1038\u1015\u102b\u104b',
    },
  },
  // Authentication/session errors
  {
    patterns: [
      /auth/i,
      /unauthorized/i,
      /unauthenticated/i,
      /session expired/i,
      /token expired/i,
      /invalid token/i,
      /jwt/i,
      /login required/i,
      /not logged in/i,
      /401/,
    ],
    message: {
      en: 'Session expired. Please sign in again.',
      my: '\u1005\u1000\u103a\u101b\u103e\u1004\u103a \u1000\u102f\u1014\u103a\u1006\u102f\u1036\u1038\u101e\u103d\u102c\u1038\u1015\u102b\u1015\u103c\u102e\u104b \u1000\u103b\u1031\u1038\u1007\u1030\u1038\u1015\u103c\u102e\u1038 \u101d\u1004\u103a\u101b\u1031\u102c\u1000\u103a\u1015\u102b\u104b',
    },
  },
  // Permission/authorization errors
  {
    patterns: [/forbidden/i, /permission denied/i, /not allowed/i, /access denied/i, /403/],
    message: {
      en: 'You do not have permission to do this.',
      my: '\u101e\u1004\u103a\u1037\u1010\u103d\u1004\u103a \u1012\u102e\u101c\u102f\u1015\u103a\u1006\u1031\u102c\u1004\u103a\u1001\u103b\u1000\u103a \u1001\u103d\u1004\u103a\u1037\u1015\u103c\u102f\u1001\u1039\u103b\u1004\u103a \u1019\u101b\u103e\u102d\u1015\u102b\u104b',
    },
  },
  // Rate limiting
  {
    patterns: [/rate limit/i, /too many requests/i, /throttle/i, /429/],
    message: {
      en: 'Too many requests. Please wait a moment and try again.',
      my: '\u1010\u1031\u102c\u1004\u103a\u1038\u1006\u102d\u102f\u1001\u103b\u1000\u103a\u1019\u103b\u102c\u1038\u101c\u103d\u1014\u103a\u1038\u1014\u1031\u101e\u100a\u103a\u104b \u1001\u100f\u1014\u102c\u1005\u1031\u102c\u1004\u103a\u1037\u1015\u103c\u102e\u1038 \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
    },
  },
  // Supabase-specific errors (catch before generic database)
  {
    patterns: [/supabase/i, /postgrest/i, /pgrst/i],
    message: {
      en: 'Something went wrong. Please try again.',
      my: '\u1010\u1005\u103a\u1001\u102f\u1001\u102f \u1019\u103e\u102c\u1038\u101a\u103d\u1004\u103a\u1038\u101e\u103d\u102c\u1038\u101e\u100a\u103a\u104b \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
    },
  },
  // Database errors (generic)
  {
    patterns: [
      /database/i,
      /db error/i,
      /sql/i,
      /query/i,
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /duplicate key/i,
      /foreign key/i,
      /constraint/i,
    ],
    message: {
      en: 'Something went wrong. Please try again.',
      my: '\u1010\u1005\u103a\u1001\u102f\u1001\u102f \u1019\u103e\u102c\u1038\u101a\u103d\u1004\u103a\u1038\u101e\u103d\u102c\u1038\u101e\u100a\u103a\u104b \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
    },
  },
  // Validation errors
  {
    patterns: [/validation/i, /invalid.*input/i, /required field/i, /missing.*field/i],
    message: {
      en: 'Please check your input and try again.',
      my: '\u101e\u1004\u103a\u1037\u1011\u100a\u103a\u1037\u101e\u103d\u1004\u103a\u1038\u1019\u103e\u102f\u1000\u102d\u102f \u1005\u1005\u103a\u1006\u1031\u1038\u1015\u103c\u102e\u1038 \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
    },
  },
  // Server errors
  {
    patterns: [/internal server/i, /500/, /502/, /503/, /504/],
    message: {
      en: 'Server error. Please try again later.',
      my: '\u1006\u102c\u1017\u102c \u1021\u1019\u103e\u102c\u1038\u1021\u101a\u103d\u1004\u103a\u1038\u104b \u1014\u1031\u102c\u1000\u103a\u1019\u103e \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
    },
  },
];

/**
 * Default fallback message when no pattern matches.
 */
const DEFAULT_ERROR_MESSAGE: BilingualMessage = {
  en: 'An unexpected error occurred. Please try again.',
  my: '\u1019\u1019\u103e\u103a\u1031\u102c\u103a\u101c\u1004\u103a\u1037\u101e\u1031\u102c \u1021\u1019\u103e\u102c\u1038\u1010\u1005\u103a\u1001\u102f \u1016\u103c\u1005\u103a\u1015\u103d\u102c\u1038\u1001\u1032\u1037\u101e\u100a\u103a\u104b \u1011\u1015\u103a\u1000\u103c\u102d\u102f\u1038\u1005\u102c\u1038\u1015\u102b\u104b',
};

/**
 * Patterns that indicate sensitive data that should never be shown to users.
 */
const SENSITIVE_PATTERNS = [
  // Database details - match "table: name", "table 'name'", "table name", etc.
  // Note: Using /i only (not /gi) because RegExp.test() with /g has stateful lastIndex
  /table[\s:]+["']?[\w_]+["']?/i,
  /column[\s:]+["']?[\w_]+["']?/i,
  /relation[\s:]+["']?[\w_]+["']?/i,
  /schema[\s:]+["']?[\w_]+["']?/i,
  // SQL fragments
  /SELECT\s+/i,
  /INSERT\s+/i,
  /UPDATE\s+/i,
  /DELETE\s+/i,
  /FROM\s+/i,
  /WHERE\s+/i,
  /JOIN\s+/i,
  // File paths
  /\/[\w/.-]+\.(ts|tsx|js|jsx|mjs)/i,
  /C:\\[\w\\.-]+\.(ts|tsx|js|jsx|mjs)/i,
  // Stack traces
  /at\s+[\w.]+\s+\(/i,
  /^\s+at\s+/m,
  // UUIDs (potential user IDs)
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
];

/**
 * Extract error message from various error types.
 */
function extractErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    // Handle objects with message property
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
    // Handle Supabase error format
    if (typeof obj.error === 'string') {
      return obj.error;
    }
    if (typeof obj.error_description === 'string') {
      return obj.error_description;
    }
    // Try JSON stringify for other objects
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

/**
 * Check if error message contains sensitive data.
 */
export function containsSensitiveData(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Sanitize an error for user display.
 * Returns a bilingual user-friendly message.
 *
 * @param error - The raw error (Error object, string, or unknown)
 * @returns BilingualMessage with en and my fields
 */
export function sanitizeError(error: unknown): BilingualMessage {
  const errorMessage = extractErrorMessage(error);

  // Empty or null errors get default message
  if (!errorMessage.trim()) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Check against known patterns
  for (const { patterns, message } of ERROR_PATTERNS) {
    if (patterns.some(pattern => pattern.test(errorMessage))) {
      return message;
    }
  }

  // If the message contains sensitive data, return generic message
  if (containsSensitiveData(errorMessage)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // For unknown errors, return default message
  // (we don't want to expose arbitrary error text to users)
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Simple hash function for user IDs.
 * Uses a basic djb2 hash - sufficient for anonymization, not for cryptography.
 */
function hashUserId(userId: string): string {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 33) ^ userId.charCodeAt(i);
  }
  // Convert to unsigned 32-bit and then to hex
  return 'user_' + (hash >>> 0).toString(16);
}

/**
 * Strip PII from a string (emails, UUIDs, etc.)
 */
function stripPII(text: string): string {
  let result = text;

  // Replace email addresses with placeholder
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_REDACTED]');

  // Replace UUIDs with placeholder
  result = result.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '[UUID_REDACTED]'
  );

  return result;
}

/**
 * User info for Sentry context.
 */
export interface UserInfo {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Context for Sentry error reporting.
 */
export interface SentryContext {
  [key: string]: unknown;
}

/**
 * Sanitized error data safe for Sentry.
 */
export interface SanitizedSentryData {
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
  user?: {
    id: string; // Hashed ID
  };
  context?: SentryContext;
}

/**
 * Sanitize error data for Sentry reporting.
 * Hashes user IDs and strips PII.
 *
 * @param error - The raw error
 * @param userInfo - Optional user information (will be anonymized)
 * @param context - Optional additional context
 * @returns SanitizedSentryData safe for reporting
 */
export function sanitizeForSentry(
  error: unknown,
  userInfo?: UserInfo,
  context?: SentryContext
): SanitizedSentryData {
  const result: SanitizedSentryData = {
    error: {
      message: '',
    },
  };

  // Extract and sanitize error message
  const errorMessage = extractErrorMessage(error);
  result.error.message = stripPII(errorMessage);

  // Add error name if available
  if (error instanceof Error) {
    result.error.name = error.name;
    // Sanitize stack trace
    if (error.stack) {
      result.error.stack = stripPII(error.stack);
    }
  }

  // Hash user ID if provided
  if (userInfo?.id) {
    result.user = {
      id: hashUserId(userInfo.id),
    };
    // Note: We intentionally do NOT include email or name
  }

  // Sanitize context if provided
  if (context) {
    const sanitizedContext: SentryContext = {};
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        sanitizedContext[key] = stripPII(value);
      } else if (typeof value === 'object' && value !== null) {
        // Deep sanitize objects by stringifying and stripping
        try {
          const stringified = JSON.stringify(value);
          sanitizedContext[key] = JSON.parse(stripPII(stringified));
        } catch {
          sanitizedContext[key] = '[COMPLEX_OBJECT]';
        }
      } else {
        sanitizedContext[key] = value;
      }
    }
    result.context = sanitizedContext;
  }

  return result;
}
