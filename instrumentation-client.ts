// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { beforeSendHandler } from './src/lib/sentry';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

  // 20% sampling in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // IMPORTANT: Do NOT send user PII automatically
  // We handle user identification manually with hashed IDs via setUserContext
  sendDefaultPii: false,

  // Strip PII from all events before sending to Sentry
  beforeSend: beforeSendHandler,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
