import webpush from 'web-push';
import { getSupabase } from './supabase';

let vapidSet = false;
function ensureVapid() {
  if (vapidSet) return;
  webpush.setVapidDetails(
    'mailto:kafi@app.local',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidSet = true;
}

export async function sendPushToAll(title: string, body: string) {
  ensureVapid();
  const db = getSupabase();
  const { data: subs } = await db.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (!subs?.length) return { sent: 0 };

  const payload = JSON.stringify({ title, body });
  let sent = 0;
  const dead: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        // 410 Gone = subscription expired, clean it up
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
          dead.push(sub.endpoint);
        }
      }
    })
  );

  if (dead.length) {
    await db.from('push_subscriptions').delete().in('endpoint', dead);
  }

  return { sent };
}
