import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import { beforeSendHandler } from './sentry';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
}));

function makeErrorEvent(errorMessage: string, overrides?: Partial<ErrorEvent>): ErrorEvent {
  return {
    exception: {
      values: [{ type: 'Error', value: errorMessage }],
    },
    ...overrides,
  } as ErrorEvent;
}

const emptyHint = {} as EventHint;

describe('beforeSendHandler', () => {
  beforeEach(() => {
    // Set production mode so PII stripping is active
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('fingerprinting', () => {
    it('fingerprints network errors as network-error', () => {
      const event = makeErrorEvent('fetch failed ECONNREFUSED');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['network-error']);
    });

    it('fingerprints ERR_INTERNET_DISCONNECTED as network-error', () => {
      const event = makeErrorEvent('ERR_INTERNET_DISCONNECTED');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['network-error']);
    });

    it('fingerprints IndexedDB errors as indexeddb-error', () => {
      const event = makeErrorEvent('IndexedDB QuotaExceeded');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['indexeddb-error']);
    });

    it('fingerprints IDBDatabase errors as indexeddb-error', () => {
      const event = makeErrorEvent('IDBDatabase error');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['indexeddb-error']);
    });

    it('fingerprints SpeechSynthesis errors as tts-error', () => {
      const event = makeErrorEvent('SpeechSynthesis error');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['tts-error']);
    });

    it('fingerprints utterance errors as tts-error', () => {
      const event = makeErrorEvent('utterance failed');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['tts-error']);
    });

    it('fingerprints hydration errors as hydration-mismatch', () => {
      const event = makeErrorEvent('Minified React error #418');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['hydration-mismatch']);
    });

    it('fingerprints ChunkLoadError as chunk-load-failure', () => {
      const event = makeErrorEvent('ChunkLoadError: Loading chunk');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['chunk-load-failure']);
    });

    it('fingerprints dynamic import failures as chunk-load-failure', () => {
      const event = makeErrorEvent('Failed to fetch dynamically imported module');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toEqual(['chunk-load-failure']);
    });
  });

  describe('drop rules', () => {
    it('drops AbortError events', () => {
      const event = makeErrorEvent('AbortError');
      const result = beforeSendHandler(event, emptyHint);
      expect(result).toBeNull();
    });

    it('drops "The operation was aborted" events', () => {
      const event = makeErrorEvent('The operation was aborted');
      const result = beforeSendHandler(event, emptyHint);
      expect(result).toBeNull();
    });

    it('drops "signal is aborted" events', () => {
      const event = makeErrorEvent('signal is aborted');
      const result = beforeSendHandler(event, emptyHint);
      expect(result).toBeNull();
    });
  });

  describe('no custom fingerprint', () => {
    it('does not add fingerprint for regular errors', () => {
      const event = makeErrorEvent('TypeError: cannot read property');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.fingerprint).toBeUndefined();
    });
  });

  describe('PII stripping', () => {
    it('strips email addresses from error values', () => {
      const event = makeErrorEvent('Error for user@example.com failed');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.exception?.values?.[0]?.value).toContain('[EMAIL_REDACTED]');
      expect(result?.exception?.values?.[0]?.value).not.toContain('user@example.com');
    });

    it('strips UUIDs from error values', () => {
      const event = makeErrorEvent('Error for 550e8400-e29b-41d4-a716-446655440000 failed');
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.exception?.values?.[0]?.value).toContain('[UUID_REDACTED]');
      expect(result?.exception?.values?.[0]?.value).not.toContain(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('hashes user ID and removes PII fields', () => {
      const event = makeErrorEvent('some error', {
        user: {
          id: 'abc123',
          email: 'test@example.com',
          username: 'testuser',
          ip_address: '192.168.1.1',
        },
      } as Partial<ErrorEvent>);
      const result = beforeSendHandler(event, emptyHint);
      expect(result?.user?.id).toMatch(/^user_/);
      expect(result?.user?.id).not.toBe('abc123');
      expect(result?.user?.email).toBeUndefined();
      expect(result?.user?.username).toBeUndefined();
      expect(result?.user?.ip_address).toBeUndefined();
    });
  });
});
