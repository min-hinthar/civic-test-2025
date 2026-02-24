import { Html, Head, Main, NextScript } from 'next/document';
import { THEME_SCRIPT } from '@/lib/themeScript';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Blocking theme script - prevents FOUC by applying theme before React hydrates */}
        {/* CSP allowlisted via hash in proxy.ts (not nonce — Pages Router limitation) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

        {/* Viewport: initial-scale=1 prevents iOS auto-zoom; viewport-fit=cover
            enables env(safe-area-inset-*) for notch/home-indicator padding.
            Next.js deduplicates by name, so this replaces the auto-generated default. */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#002868" />

        {/* Apple-specific PWA settings */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="US Civics" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
