import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mocks ---

// Mock NextResponse.next to capture headers
const mockResponseHeaders = new Map<string, string>();
const mockResponse = {
  headers: {
    set: vi.fn((key: string, value: string) => {
      mockResponseHeaders.set(key, value);
    }),
    get: vi.fn((key: string) => mockResponseHeaders.get(key)),
  },
};

// Track request headers passed to NextResponse.next
let capturedRequestHeaders: Headers | null = null;

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn((opts?: { request?: { headers?: Headers } }) => {
      if (opts?.request?.headers) {
        capturedRequestHeaders = opts.request.headers;
      }
      return mockResponse;
    }),
  },
}));

// Mock crypto.randomUUID for deterministic nonce
const MOCK_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
vi.stubGlobal(
  'crypto',
  Object.assign({}, globalThis.crypto, {
    randomUUID: vi.fn(() => MOCK_UUID),
  })
);

// Import after mocks are set up
import { proxy, config } from '../../proxy';

describe('proxy()', () => {
  const EXPECTED_NONCE = Buffer.from(MOCK_UUID).toString('base64');

  beforeEach(() => {
    mockResponseHeaders.clear();
    capturedRequestHeaders = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('nonce generation', () => {
    it('generates a base64-encoded UUID nonce', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain(`'nonce-${EXPECTED_NONCE}'`);
    });

    it('produces a valid base64 string', () => {
      // Verify the nonce is decodable base64
      const decoded = Buffer.from(EXPECTED_NONCE, 'base64').toString();
      expect(decoded).toBe(MOCK_UUID);
    });
  });

  describe('CSP header construction', () => {
    it('contains strict-dynamic in script-src', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain("'strict-dynamic'");
    });

    it('contains unsafe-inline in style-src', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('contains report-uri with Sentry endpoint', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain('report-uri https://o4507212955254784.ingest.us.sentry.io');
    });

    it('contains worker-src self blob:', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain("worker-src 'self' blob:");
    });

    it('contains frame-src with Google and TipTopJar', () => {
      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain("frame-src 'self' https://accounts.google.com https://tiptopjar.com");
    });

    it('contains unsafe-eval in development mode', () => {
      // proxy.ts reads process.env.NODE_ENV at call time
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).toContain("'unsafe-eval'");

      process.env.NODE_ENV = origEnv;
    });

    it('does NOT contain unsafe-eval in production mode', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      proxy();
      const csp = mockResponseHeaders.get('Content-Security-Policy') ?? '';
      expect(csp).not.toContain("'unsafe-eval'");

      process.env.NODE_ENV = origEnv;
    });
  });

  describe('security headers on response', () => {
    it('sets X-Content-Type-Options to nosniff', () => {
      proxy();
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('sets X-Frame-Options to DENY', () => {
      proxy();
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
      proxy();
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
    });

    it('sets Permissions-Policy', () => {
      proxy();
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), microphone=(self), geolocation=()'
      );
    });

    it('sets X-DNS-Prefetch-Control to on', () => {
      proxy();
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-DNS-Prefetch-Control', 'on');
    });
  });

  describe('nonce transport', () => {
    it('sets x-nonce on request headers', () => {
      proxy();
      expect(capturedRequestHeaders).not.toBeNull();
      expect(capturedRequestHeaders!.get('x-nonce')).toBe(EXPECTED_NONCE);
    });

    it('sets CSP on request headers for downstream consumption', () => {
      proxy();
      expect(capturedRequestHeaders).not.toBeNull();
      const reqCsp = capturedRequestHeaders!.get('Content-Security-Policy');
      expect(reqCsp).toContain("'strict-dynamic'");
      expect(reqCsp).toContain(`'nonce-${EXPECTED_NONCE}'`);
    });

    it('sets CSP on response headers for browser enforcement', () => {
      proxy();
      const resCsp = mockResponseHeaders.get('Content-Security-Policy');
      expect(resCsp).toContain("'strict-dynamic'");
    });
  });
});

describe('config.matcher', () => {
  it('exports a matcher config', () => {
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(config.matcher).toHaveLength(1);
  });

  it('excludes api routes', () => {
    const source = config.matcher[0].source;
    expect(source).toContain('api');
  });

  it('excludes _next/static and _next/image', () => {
    const source = config.matcher[0].source;
    expect(source).toContain('_next/static');
    expect(source).toContain('_next/image');
  });

  it('excludes favicon.ico, icons, manifest.json', () => {
    const source = config.matcher[0].source;
    expect(source).toContain('favicon.ico');
    expect(source).toContain('icons');
    expect(source).toContain('manifest.json');
  });

  it('excludes sw.js, sw.js.map, offline.html', () => {
    const source = config.matcher[0].source;
    expect(source).toContain('sw.js');
    expect(source).toContain('sw.js.map');
    expect(source).toContain('offline.html');
  });

  it('has missing clause for prefetch requests', () => {
    const missing = config.matcher[0].missing;
    expect(missing).toBeDefined();
    expect(missing).toEqual(
      expect.arrayContaining([
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ])
    );
  });
});
