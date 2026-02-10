import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

// Admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Rate Limiting ---
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per user per minute

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let requestCounter = 0;

function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds: number } {
  // Cleanup stale entries every 100 requests
  requestCounter++;
  if (requestCounter % 100 === 0) {
    cleanupRateLimitMap();
  }

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

// --- JWT Verification ---
async function verifyJWT(
  req: NextApiRequest
): Promise<{ userId: string } | { error: string; statusCode: number }> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', statusCode: 401 };
  }

  const token = authHeader.slice(7);

  // Create a per-request Supabase client with the user's token
  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data, error } = await supabaseUser.auth.getUser();

  if (error || !data.user) {
    const reason = error?.message ?? 'no user';
    const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown';

    Sentry.captureException(new Error(`Push subscribe auth failure: ${reason}`), {
      tags: {
        endpoint: 'push-subscribe',
        auth_failure: 'true',
      },
      extra: {
        reason,
        ip: typeof ip === 'string' ? ip : ip[0],
      },
    });

    return { error: 'Invalid or expired token', statusCode: 401 };
  }

  return { userId: data.user.id };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Verify JWT ---
  const authResult = await verifyJWT(req);

  if ('error' in authResult) {
    return res.status(authResult.statusCode).json({ error: authResult.error });
  }

  const { userId } = authResult;

  // --- Rate Limit ---
  const { allowed, retryAfterSeconds } = checkRateLimit(userId);

  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'Too many requests' });
  }

  // --- POST: Subscribe ---
  if (req.method === 'POST') {
    try {
      const { subscription, reminderFrequency } = req.body;

      if (!subscription) {
        return res.status(400).json({ error: 'Missing subscription data' });
      }

      const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          reminder_frequency: reminderFrequency,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Push subscription error:', error);
      Sentry.captureException(error, {
        tags: { endpoint: 'push-subscribe', method: 'POST' },
      });
      return res.status(500).json({ error: 'Failed to save subscription' });
    }
  }

  // --- DELETE: Unsubscribe ---
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      Sentry.captureException(error, {
        tags: { endpoint: 'push-subscribe', method: 'DELETE' },
      });
      return res.status(500).json({ error: 'Failed to remove subscription' });
    }
  }
}
