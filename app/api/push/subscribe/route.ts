import { type NextRequest, NextResponse } from 'next/server';
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
  request: NextRequest
): Promise<{ userId: string } | { error: string; statusCode: number }> {
  const authHeader = request.headers.get('authorization');

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
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    Sentry.captureException(new Error(`Push subscribe auth failure: ${reason}`), {
      tags: {
        endpoint: 'push-subscribe',
        auth_failure: 'true',
      },
      extra: {
        reason,
        ip: typeof ip === 'string' ? ip : ip,
      },
    });

    return { error: 'Invalid or expired token', statusCode: 401 };
  }

  return { userId: data.user.id };
}

export async function POST(request: NextRequest) {
  // --- Verify JWT ---
  const authResult = await verifyJWT(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
  }

  const { userId } = authResult;

  // --- Rate Limit ---
  const { allowed, retryAfterSeconds } = checkRateLimit(userId);

  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { subscription, reminderFrequency } = await request.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription error:', error);
    Sentry.captureException(error, {
      tags: { endpoint: 'push-subscribe', method: 'POST' },
    });
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // --- Verify JWT ---
  const authResult = await verifyJWT(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
  }

  const { userId } = authResult;

  // --- Rate Limit ---
  const { allowed, retryAfterSeconds } = checkRateLimit(userId);

  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { error } = await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    Sentry.captureException(error, {
      tags: { endpoint: 'push-subscribe', method: 'DELETE' },
    });
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
