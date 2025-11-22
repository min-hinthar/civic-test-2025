// pages/api/sentry-example-api.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";

// Custom error class for Sentry testing
class SentryExampleAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    throw new SentryExampleAPIError(
      "This error is raised on the backend called by the example page."
    );
  } catch (err) {
    // Capture with Sentry
    Sentry.captureException(err);
    // Respond with error JSON
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  // This line is unreachable after throw, but kept for clarity
  res.status(200).json({ name: "John Doe" });
}

