// IMPORTANT: If you change these scripts, you must update the SHA-256 hashes
// in proxy.ts (THEME_SCRIPT_HASH, HASH_REDIRECT_SCRIPT_HASH). The browser
// console will show the new hash in the CSP violation error message.
export const THEME_SCRIPT = `
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

/**
 * Hash redirect script: converts legacy hash-based URLs (#/path) to clean URLs (/path).
 * Guards against Supabase auth callback hashes (#access_token=...) which must not be redirected.
 */
export const HASH_REDIRECT_SCRIPT = `(function(){var h=window.location.hash;if(h&&h.indexOf('#/')===0&&h.indexOf('#access_token=')!==0){window.location.replace(h.substring(1)+window.location.search);}})();`;
