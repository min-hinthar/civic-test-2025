// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { beforeSendHandler } from './src/lib/sentry';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 20% of traces in production to conserve quota, 100% in development for debugging
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // IMPORTANT: Do NOT send user PII automatically
  // We handle user identification manually with hashed IDs via setUserContext
  sendDefaultPii: false,

  // Strip PII from all events before sending to Sentry
  beforeSend: beforeSendHandler,
});
