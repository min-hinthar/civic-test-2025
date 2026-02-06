// pages/_error.tsx
import * as Sentry from '@sentry/nextjs';
import Error, { ErrorProps } from 'next/error';
import { NextPageContext } from 'next';

/**
 * Custom error page that integrates with Sentry.
 * Properly typed with ErrorProps and NextPageContext.
 */
function MyError({ statusCode }: ErrorProps) {
  return <Error statusCode={statusCode ?? 500} />;
}

MyError.getInitialProps = async (context: NextPageContext) => {
  const { res, err } = context;

  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;

  // Capture the error with Sentry (only if an actual error object exists)
  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000); // ensure events are sent before the page closes
  }

  return { statusCode };
};

export default MyError;
