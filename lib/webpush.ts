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

async function sendTelegram(title: string, body: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const db = getSupabase();
  const { data } = await db.from('settings').select('telegram_chat_id').eq('id', 1).single();
  const chatId = data?.telegram_chat_id;
  if (!chatId) return false;

  const text = `🔔 <b>${title}</b>\n${body}`;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

export async function sendNotification(title: string, body: string) {
  ensureVapid();
  const db = getSupabase();

  // Send via Telegram (most reliable on mobile)
  const telegramOk = await sendTelegram(title, body);

  // Also send via web push if any subscriptions exist
  const { data: subs } = await db.from('push_subscriptions').select('endpoint, p256dh, auth');
  let webPushSent = 0;
  const dead: string[] = [];

  if (subs?.length) {
    const payload = JSON.stringify({ title, body });
    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          webPushSent++;
        } catch (err: unknown) {
          if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
            dead.push(sub.endpoint);
          }
        }
      })
    );
    if (dead.length) await db.from('push_subscriptions').delete().in('endpoint', dead);
  }

  return { telegram: telegramOk, webPush: webPushSent };
}

// backward compat
export const sendPushToAll = (title: string, body: string) => sendNotification(title, body);
