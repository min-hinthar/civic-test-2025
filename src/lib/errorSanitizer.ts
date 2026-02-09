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
      my: 'အင်တာနက် ပြှနာရပွန်ရှိပါသည်။ သင့်အင်တာနက်ကို စစ်ဆေးပါ။',
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
      my: 'စက်ရှင် ကုန်ဆုံးသွားပါပြီ။ ကျေးဇူးပြီး ဝင်ရောက်ပါ။',
    },
  },
  // Permission/authorization errors
  {
    patterns: [/forbidden/i, /permission denied/i, /not allowed/i, /access denied/i, /403/],
    message: {
      en: 'You do not have permission to do this.',
      my: 'သင့်တွင် ဒီလုပ်ဆောင်ချက် ခွင့်ပြုခ္ျင် မရှိပါ။',
    },
  },
  // Rate limiting
  {
    patterns: [/rate limit/i, /too many requests/i, /throttle/i, /429/],
    message: {
      en: 'Too many requests. Please wait a moment and try again.',
      my: 'တောင်းဆိုချက်များလွန်းနေသည်။ ခဏနာစောင့်ပြီး ထပ်ကြိုးစားပါ။',
    },
  },
  // Supabase-specific errors (catch before generic database)
  {
    patterns: [/supabase/i, /postgrest/i, /pgrst/i],
    message: {
      en: 'Something went wrong. Please try again.',
      my: 'တစ်ခုခု မှားယွင်းသွားသည်။ ထပ်ကြိုးစားပါ။',
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
      my: 'တစ်ခုခု မှားယွင်းသွားသည်။ ထပ်ကြိုးစားပါ။',
    },
  },
  // Validation errors
  {
    patterns: [/validation/i, /invalid.*input/i, /required field/i, /missing.*field/i],
    message: {
      en: 'Please check your input and try again.',
      my: 'သင့်ထည့်သွင်းမှုကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။',
    },
  },
  // Server errors
  {
    patterns: [/internal server/i, /500/, /502/, /503/, /504/],
    message: {
      en: 'Server error. Please try again later.',
      my: 'ဆာဗာ အမှားအယွင်း။ နောက်မှ ထပ်ကြိုးစားပါ။',
    },
  },
];

/**
 * Default fallback message when no pattern matches.
 */
const DEFAULT_ERROR_MESSAGE: BilingualMessage = {
  en: 'An unexpected error occurred. Please try again.',
  my: 'မမှ်ော်လင့်သော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။ ထပ်ကြိုးစားပါ။',
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
