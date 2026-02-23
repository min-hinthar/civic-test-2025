import { NextResponse } from 'next/server';

// SHA-256 hash of the inline theme script in _document.tsx (prevents FOUC).
// Nonce-based approach doesn't work reliably in Pages Router on Vercel
// (middleware x-nonce header not forwarded to _document getInitialProps).
// Hash is stable because the theme script content is hardcoded.
const THEME_SCRIPT_HASH = "'sha256-NKQrmMd/nbWq2Iv4I0YgtUOgn8XHk35ntdeRQ/aIx5A='";

export function proxy() {
  const isDev = process.env.NODE_ENV === 'development';

  // In dev mode, webpack uses eval() for source maps and Next.js injects
  // HMR inline scripts without nonces. Relax CSP accordingly.
  // In prod, use hash-based allowlisting for the theme script.
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://tiptopjar.com`
    : `'self' 'wasm-unsafe-eval' ${THEME_SCRIPT_HASH} https://accounts.google.com https://tiptopjar.com`;

  const cspHeader = `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' blob: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://accounts.google.com https://tiptopjar.com${isDev ? ' ws://localhost:3000' : ''}; media-src 'self' blob:; worker-src 'self' blob:; frame-src https://accounts.google.com https://tiptopjar.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; report-uri https://o4507212955254784.ingest.us.sentry.io/api/4510406083346432/security/?sentry_key=c957cad31df16711843d5241cb2d6515`;

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)',
  ],
};
