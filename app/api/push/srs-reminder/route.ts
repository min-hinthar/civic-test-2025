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
 * SRS Reminder Push Notification Endpoint
 *
 * POST /api/push/srs-reminder
 * Protected by x-api-key header matching SRS_CRON_API_KEY env var.
 *
 * Queries Supabase for users with SRS cards due for review (due <= now()),
 * then sends bilingual push notifications to each user with due cards.
 *
 * Returns: { notified: number, errors: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key authorization (for cron job callers)
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.SRS_CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Query users with SRS cards due for review
    const { data: dueCards, error: dueError } = await supabaseAdmin
      .from('srs_cards')
      .select('user_id')
      .lte('due', now);

    if (dueError) throw dueError;

    if (!dueCards || dueCards.length === 0) {
      return NextResponse.json({ notified: 0, errors: 0 });
    }

    // Group due counts by user
    const userDueCounts = new Map<string, number>();
    for (const card of dueCards) {
      const userId = card.user_id as string;
      userDueCounts.set(userId, (userDueCounts.get(userId) ?? 0) + 1);
    }

    let notified = 0;
    let errors = 0;

    // For each user with due cards, look up push subscription and send notification
    for (const [userId, count] of userDueCounts) {
      try {
        const { data: subscriptions, error: subError } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId);

        if (subError) throw subError;
        if (!subscriptions || subscriptions.length === 0) continue;

        // Bilingual notification
        const title =
          'Cards Due for Review! / \u1015\u103C\u1014\u103A\u101C\u103E\u100A\u1037\u103A\u101B\u1014\u103A \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u101B\u103E\u102D\u1015\u102B\u1010\u101A\u103A!';
        const body = `You have ${count} card${count === 1 ? '' : 's'} ready to review. / \u1015\u103C\u1014\u103A\u101C\u103E\u100A\u1037\u103A\u101B\u1014\u103A \u1000\u1010\u103A ${count} \u1001\u102F\u101B\u103E\u102D\u101E\u100A\u103A\u104B`;

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
                url: '/study#review',
                tag: 'srs-reminder',
              })
            );
            notified++;
          } catch (err) {
            errors++;
            // If subscription is expired/invalid (HTTP 410 Gone), clean it up
            if ((err as { statusCode?: number }).statusCode === 410) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', sub.user_id);
            }
          }
        }
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ notified, errors });
  } catch (error) {
    console.error('SRS reminder push error:', error);
    return NextResponse.json(
      { error: 'Failed to send SRS reminder notifications' },
      { status: 500 }
    );
  }
}
