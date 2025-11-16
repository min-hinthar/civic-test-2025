import type { AppProps } from 'next/app';
import '../src/styles/globals.css';

const CivicPrepApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default CivicPrepApp;
