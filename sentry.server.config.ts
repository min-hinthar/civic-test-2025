// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { beforeSendHandler } from './src/lib/sentry';

Sentry.init({
  dsn: 'https://c957cad31df16711843d5241cb2d6515@o4507212955254784.ingest.us.sentry.io/4510406083346432',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // IMPORTANT: Do NOT send user PII automatically
  // We handle user identification manually with hashed IDs via setUserContext
  sendDefaultPii: false,

  // Strip PII from all events before sending to Sentry
  beforeSend: beforeSendHandler,
});
