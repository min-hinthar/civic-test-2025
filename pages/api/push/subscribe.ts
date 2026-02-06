import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { subscription, userId, reminderFrequency } = req.body;

      if (!userId || !subscription) {
        return res.status(400).json({ error: 'Missing required fields' });
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
      return res.status(500).json({ error: 'Failed to save subscription' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      return res.status(500).json({ error: 'Failed to remove subscription' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
