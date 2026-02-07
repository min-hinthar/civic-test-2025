import type { AppProps } from 'next/app';

// Self-hosted Myanmar font (PWA offline support)
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';

import '../src/styles/globals.css';

const CivicPrepApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default CivicPrepApp;
