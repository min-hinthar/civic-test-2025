import { type NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function configureVapid() {
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
}

// Bilingual reminder messages for study reminders
const REMINDER_MESSAGES = [
  {
    title:
      'Time to study! / \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u1021\u1001\u103B\u102D\u1014\u103A\u101B\u1031\u102C\u1000\u103A\u1015\u103C\u102E!',
    body: 'A few minutes of practice today keeps your knowledge fresh.\n\u101A\u1014\u1031\u1037 \u1019\u102D\u1014\u1005\u103A\u1021\u1014\u100A\u103A\u1038\u1004\u101A\u103A \u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B\u104B',
  },
  {
    title:
      'Ready for your civics test? / \u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101B\u1031\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1006\u1004\u103A\u101E\u1004\u1037\u103A\u1016\u103C\u1005\u103A\u1015\u103C\u102E\u101C\u102C\u1038\u104B',
    body: "Keep practicing - you're making progress!\n\u1006\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B - \u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1014\u1031\u1015\u102B\u1015\u103C\u102E!",
  },
  {
    title:
      'Study reminder / \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A',
    body: 'A little study every day makes a big difference.\n\u1014\u1031\u1037\u1010\u102D\u102F\u1004\u103A\u1038 \u1021\u1014\u100A\u103A\u1038\u1004\u101A\u103A \u101C\u1031\u1037\u101C\u102C\u1001\u103C\u1004\u103A\u1038\u1000 \u1000\u103C\u102E\u1038\u1019\u102C\u1038\u101E\u1031\u102C \u1001\u103C\u102C\u1038\u1014\u102C\u1038\u1001\u103B\u1000\u103A \u1016\u103C\u1005\u103A\u1005\u1031\u1015\u102B\u101E\u100A\u103A\u104B',
  },
];

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (simple API key check for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    configureVapid();
    const supabaseAdmin = getSupabaseAdmin();
    const { frequency } = await request.json();

    // Get subscriptions matching frequency
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('reminder_frequency', frequency);

    if (error) throw error;

    const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions || []) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify({
            title: message.title,
            body: message.body,
            url: '/home',
            tag: 'study-reminder',
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
    console.error('Send push error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
