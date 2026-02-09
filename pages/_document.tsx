import { Html, Head, Main, NextScript } from 'next/document';

const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('civic-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.setProperty('color-scheme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#1a1f36' : '#002868';
  } catch(e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Blocking theme script - prevents FOUC by applying theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#002868" />

        {/* Apple-specific PWA settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
