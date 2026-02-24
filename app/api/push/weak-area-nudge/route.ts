import { type NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure web-push with VAPID details
if (
  process.env.VAPID_EMAIL &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Bilingual push notification messages for weak area reminders.
 * Per CONTEXT.md: "Every 2-3 days, only if user hasn't studied recently."
 *
 * POST /api/push/weak-area-nudge
 * Body: { userId: string, weakCategory: string, daysSinceStudied: number }
 *
 * Note: This creates the endpoint. Scheduling (cron) is a future enhancement.
 */
const WEAK_AREA_MESSAGES = [
  {
    title:
      'Time to study! / \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A\u1021\u1001\u103B\u102D\u1014\u103A\u1015\u102B!',
    body: "You haven't practiced {category} in {days} days. A quick review will help!\n{category}\u1000\u102D\u102F {days} \u101B\u1000\u103A\u1000\u1010\u100A\u103A\u1038\u1000 \u1019\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u101B\u101E\u1031\u1038\u1015\u102B\u104B \u1021\u1019\u103C\u1014\u103A\u1015\u103C\u1014\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B!",
  },
  {
    title:
      "Let's review! / \u1015\u103C\u1014\u103A\u101C\u1031\u1037\u101C\u102C\u101B\u1021\u1031\u102C\u1004\u103A!",
    body: '{category} could use some practice. Just a few questions!\n{category} \u1021\u1014\u100A\u103A\u1038\u1004\u101A\u103A \u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1019\u100A\u103A\u104B \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1021\u1014\u100A\u103A\u1038\u1004\u101A\u103A\u1015\u1032!',
  },
  {
    title:
      "Don't forget! / \u1019\u1019\u1031\u1037\u101C\u103B\u102C\u1037\u1015\u102B\u1014\u1032\u1037!",
    body: "It's been {days} days since you studied {category}. Keep your streak going!\n{category} \u101C\u1031\u1037\u101C\u102C\u1010\u102C {days} \u101B\u1000\u103A\u101B\u103E\u102D\u1015\u103C\u102E\u104B \u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B!",
  },
];

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (simple API key check for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, weakCategory, daysSinceStudied } = await request.json();

    if (!userId || !weakCategory) {
      return NextResponse.json({ error: 'userId and weakCategory are required' }, { status: 400 });
    }

    const days = daysSinceStudied ?? '?';

    // Get user's push subscription
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No push subscription for user' });
    }

    // Pick a random message and fill in placeholders
    const template = WEAK_AREA_MESSAGES[Math.floor(Math.random() * WEAK_AREA_MESSAGES.length)];
    const title = template.title;
    const body = template.body
      .replace(/\{category\}/g, weakCategory)
      .replace(/\{days\}/g, String(days));

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify({
            title,
            body,
            url: `/practice?category=${encodeURIComponent(weakCategory)}`,
            tag: 'weak-area-nudge',
          })
        );
        sent++;
      } catch (err) {
        failed++;
        // If subscription is expired/invalid (HTTP 410 Gone), clean it up
        if ((err as { statusCode?: number }).statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', sub.user_id);
        }
      }
    }

    return NextResponse.json({ sent, failed });
  } catch (error) {
    console.error('Weak area nudge push error:', error);
    return NextResponse.json(
      { error: 'Failed to send weak area nudge notification' },
      { status: 500 }
    );
  }
}
