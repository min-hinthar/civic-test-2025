import { NextResponse } from 'next/server';

export function proxy() {
  const isDev = process.env.NODE_ENV === 'development';

  // Generate a unique nonce per request for CSP script allowlisting
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Build CSP with strict-dynamic: nonce-trusted scripts can load sub-scripts
  // without explicit domain allowlists. Dev adds unsafe-eval for webpack HMR.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
    img-src 'self' blob: data:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://accounts.google.com https://tiptopjar.com${isDev ? ' ws://localhost:3000' : ''};
    media-src 'self' blob:;
    worker-src 'self' blob:;
    frame-src 'self' https://accounts.google.com https://tiptopjar.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
    report-uri https://o4507212955254784.ingest.us.sentry.io/api/4510406083346432/security/?sentry_key=c957cad31df16711843d5241cb2d6515
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Transport nonce to layout.tsx via request headers (never exposed in response)
  const requestHeaders = new Headers();
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP on response for browser enforcement
  response.headers.set('Content-Security-Policy', cspHeader);

  // Consolidated security headers (moved from next.config.mjs headers())
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|sw.js.map|offline.html).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
