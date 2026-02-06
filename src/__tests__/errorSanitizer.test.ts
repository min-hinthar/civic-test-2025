import { describe, it, expect } from 'vitest';
import { sanitizeError, sanitizeForSentry, containsSensitiveData } from '@/lib/errorSanitizer';

describe('sanitizeError', () => {
  describe('returns bilingual messages', () => {
    it('returns both en and my fields', () => {
      const result = sanitizeError(new Error('some error'));
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
      expect(typeof result.en).toBe('string');
      expect(typeof result.my).toBe('string');
      expect(result.en.length).toBeGreaterThan(0);
      expect(result.my.length).toBeGreaterThan(0);
    });
  });

  describe('maps known error patterns to friendly messages', () => {
    it('maps network errors', () => {
      const networkErrors = [
        new Error('Network error occurred'),
        new Error('Failed to fetch'),
        new Error('net::ERR_CONNECTION_REFUSED'),
        new Error('ECONNREFUSED'),
        new Error('offline mode'),
      ];

      for (const error of networkErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Connection problem');
      }
    });

    it('maps authentication errors', () => {
      const authErrors = [
        new Error('Unauthorized'),
        new Error('Session expired'),
        new Error('Invalid token'),
        new Error('JWT verification failed'),
        new Error('401 Unauthorized'),
      ];

      for (const error of authErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Session expired');
      }
    });

    it('maps permission errors', () => {
      const permErrors = [
        new Error('Forbidden'),
        new Error('Permission denied'),
        new Error('Access denied'),
        new Error('403 Forbidden'),
      ];

      for (const error of permErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('permission');
      }
    });

    it('maps rate limit errors', () => {
      const rateErrors = [
        new Error('Rate limit exceeded'),
        new Error('Too many requests'),
        new Error('429 Too Many Requests'),
      ];

      for (const error of rateErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Too many requests');
      }
    });

    it('maps Supabase errors to generic message', () => {
      const supabaseErrors = [
        new Error('Supabase error: invalid api key'),
        new Error('PostgREST error'),
        new Error('PGRST116: The result contains 0 rows'),
      ];

      for (const error of supabaseErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Something went wrong');
      }
    });

    it('maps database errors to generic message', () => {
      const dbErrors = [
        new Error('Database connection failed'),
        new Error('relation "users" does not exist'),
        new Error('column "password" does not exist'),
        new Error('duplicate key violates unique constraint'),
      ];

      for (const error of dbErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Something went wrong');
      }
    });

    it('maps validation errors', () => {
      const validationErrors = [
        new Error('Validation failed'),
        new Error('Invalid input provided'),
        new Error('Missing required field'),
      ];

      for (const error of validationErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('check your input');
      }
    });

    it('maps server errors', () => {
      const serverErrors = [
        new Error('Internal server error'),
        new Error('500 Internal Server Error'),
        new Error('502 Bad Gateway'),
        new Error('503 Service Unavailable'),
      ];

      for (const error of serverErrors) {
        const result = sanitizeError(error);
        expect(result.en).toContain('Server error');
      }
    });
  });

  describe('strips sensitive data', () => {
    it('never exposes table names', () => {
      const error = new Error('Error: relation "mock_tests" does not exist');
      const result = sanitizeError(error);
      expect(result.en).not.toContain('mock_tests');
      expect(result.my).not.toContain('mock_tests');
    });

    it('never exposes column names', () => {
      const error = new Error('column "user_password_hash" does not exist');
      const result = sanitizeError(error);
      expect(result.en).not.toContain('user_password_hash');
      expect(result.my).not.toContain('user_password_hash');
    });

    it('never exposes SQL queries', () => {
      const error = new Error('Error in query: SELECT * FROM users WHERE id = 123');
      const result = sanitizeError(error);
      expect(result.en).not.toContain('SELECT');
      expect(result.en).not.toContain('FROM users');
      expect(result.my).not.toContain('SELECT');
    });

    it('never exposes stack traces', () => {
      const error = new Error('Something broke');
      error.stack = `Error: Something broke
    at UserService.getUser (/app/src/services/user.ts:45:12)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)`;
      const result = sanitizeError(error);
      expect(result.en).not.toContain('UserService');
      expect(result.en).not.toContain('/app/src');
      expect(result.my).not.toContain('UserService');
    });

    it('never exposes user IDs (UUIDs)', () => {
      const error = new Error('User 123e4567-e89b-12d3-a456-426614174000 not found');
      const result = sanitizeError(error);
      expect(result.en).not.toContain('123e4567');
      expect(result.my).not.toContain('123e4567');
    });

    it('never exposes email addresses', () => {
      const error = new Error('User john.doe@example.com already exists');
      const result = sanitizeError(error);
      expect(result.en).not.toContain('john.doe@example.com');
      expect(result.my).not.toContain('john.doe@example.com');
    });
  });

  describe('handles edge cases', () => {
    it('handles undefined', () => {
      const result = sanitizeError(undefined);
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
      expect(result.en).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles null', () => {
      const result = sanitizeError(null);
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
      expect(result.en).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles empty string', () => {
      const result = sanitizeError('');
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
      expect(result.en).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles whitespace-only string', () => {
      const result = sanitizeError('   ');
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
    });

    it('handles plain string errors', () => {
      const result = sanitizeError('Network error');
      expect(result.en).toContain('Connection problem');
    });

    it('handles non-Error objects with message property', () => {
      const result = sanitizeError({ message: 'Unauthorized access' });
      expect(result.en).toContain('Session expired');
    });

    it('handles Supabase-style error objects', () => {
      const result = sanitizeError({
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
      });
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
    });

    it('handles objects without message property', () => {
      const result = sanitizeError({ code: 500, status: 'error' });
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
    });

    it('handles numbers', () => {
      const result = sanitizeError(404);
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
    });

    it('handles arrays', () => {
      const result = sanitizeError(['error1', 'error2']);
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('my');
    });
  });
});

describe('containsSensitiveData', () => {
  it('detects table names', () => {
    expect(containsSensitiveData('table: users')).toBe(true);
    expect(containsSensitiveData("table 'mock_tests'")).toBe(true);
  });

  it('detects column names', () => {
    expect(containsSensitiveData('column: password_hash')).toBe(true);
  });

  it('detects SQL keywords', () => {
    expect(containsSensitiveData('SELECT id FROM users')).toBe(true);
    expect(containsSensitiveData('INSERT INTO tests')).toBe(true);
    expect(containsSensitiveData('DELETE FROM sessions')).toBe(true);
  });

  it('detects file paths', () => {
    expect(containsSensitiveData('/src/services/auth.ts')).toBe(true);
    expect(containsSensitiveData('C:\\app\\src\\index.tsx')).toBe(true);
  });

  it('detects stack traces', () => {
    expect(containsSensitiveData('at UserService.getUser (')).toBe(true);
    expect(containsSensitiveData('    at processTicksAndRejections')).toBe(true);
  });

  it('detects UUIDs', () => {
    expect(containsSensitiveData('user id: 123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('detects email addresses', () => {
    expect(containsSensitiveData('email: user@example.com')).toBe(true);
  });

  it('returns false for safe messages', () => {
    expect(containsSensitiveData('Something went wrong')).toBe(false);
    expect(containsSensitiveData('Please try again')).toBe(false);
    expect(containsSensitiveData('Network error occurred')).toBe(false);
  });
});

describe('sanitizeForSentry', () => {
  describe('error sanitization', () => {
    it('returns sanitized error message', () => {
      const error = new Error('User john@example.com not found');
      const result = sanitizeForSentry(error);

      expect(result.error.message).not.toContain('john@example.com');
      expect(result.error.message).toContain('[EMAIL_REDACTED]');
    });

    it('preserves error name', () => {
      const error = new TypeError('Invalid argument');
      const result = sanitizeForSentry(error);

      expect(result.error.name).toBe('TypeError');
    });

    it('sanitizes stack trace', () => {
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at user_123e4567-e89b-12d3-a456-426614174000.handler`;
      const result = sanitizeForSentry(error);

      expect(result.error.stack).not.toContain('123e4567');
      expect(result.error.stack).toContain('[UUID_REDACTED]');
    });

    it('handles non-Error objects', () => {
      const result = sanitizeForSentry({ message: 'Custom error' });
      expect(result.error.message).toBe('Custom error');
      expect(result.error.name).toBeUndefined();
    });
  });

  describe('user ID hashing', () => {
    it('hashes user IDs instead of sending raw UUIDs', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const result = sanitizeForSentry(new Error('test'), { id: userId });

      // Should not contain raw UUID
      expect(result.user?.id).not.toBe(userId);
      expect(result.user?.id).not.toContain('123e4567');

      // Should be a hashed format
      expect(result.user?.id).toMatch(/^user_[0-9a-f]+$/);
    });

    it('produces consistent hashes for the same user ID', () => {
      const userId = 'test-user-123';
      const result1 = sanitizeForSentry(new Error('test1'), { id: userId });
      const result2 = sanitizeForSentry(new Error('test2'), { id: userId });

      expect(result1.user?.id).toBe(result2.user?.id);
    });

    it('produces different hashes for different user IDs', () => {
      const result1 = sanitizeForSentry(new Error('test'), { id: 'user-1' });
      const result2 = sanitizeForSentry(new Error('test'), { id: 'user-2' });

      expect(result1.user?.id).not.toBe(result2.user?.id);
    });

    it('does not include email in result', () => {
      const result = sanitizeForSentry(new Error('test'), {
        id: 'user-1',
        email: 'user@example.com',
      });

      expect(JSON.stringify(result)).not.toContain('user@example.com');
    });

    it('does not include name in result', () => {
      const result = sanitizeForSentry(new Error('test'), {
        id: 'user-1',
        name: 'John Doe',
      });

      expect(JSON.stringify(result)).not.toContain('John Doe');
    });

    it('handles missing user info', () => {
      const result = sanitizeForSentry(new Error('test'));
      expect(result.user).toBeUndefined();
    });

    it('handles empty user info', () => {
      const result = sanitizeForSentry(new Error('test'), {});
      expect(result.user).toBeUndefined();
    });
  });

  describe('context sanitization', () => {
    it('strips PII from context strings', () => {
      const result = sanitizeForSentry(new Error('test'), undefined, {
        action: 'user john@example.com logged in',
      });

      expect(result.context?.action).not.toContain('john@example.com');
      expect(result.context?.action).toContain('[EMAIL_REDACTED]');
    });

    it('strips UUIDs from context', () => {
      const result = sanitizeForSentry(new Error('test'), undefined, {
        targetUser: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.context?.targetUser).not.toContain('123e4567');
      expect(result.context?.targetUser).toContain('[UUID_REDACTED]');
    });

    it('preserves non-string context values', () => {
      const result = sanitizeForSentry(new Error('test'), undefined, {
        count: 42,
        active: true,
      });

      expect(result.context?.count).toBe(42);
      expect(result.context?.active).toBe(true);
    });

    it('sanitizes nested objects in context', () => {
      const result = sanitizeForSentry(new Error('test'), undefined, {
        user: { email: 'test@example.com', id: 'abc123' },
      });

      const contextStr = JSON.stringify(result.context);
      expect(contextStr).not.toContain('test@example.com');
    });

    it('handles complex objects gracefully', () => {
      // Create a circular reference which can't be stringified
      const circular: Record<string, unknown> = { name: 'test' };
      circular.self = circular;

      const result = sanitizeForSentry(new Error('test'), undefined, {
        circular,
      });

      // Should handle gracefully without throwing
      expect(result.context?.circular).toBe('[COMPLEX_OBJECT]');
    });
  });
});
