import { NextResponse } from 'next/server';

export async function POST() {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json({ error: 'ONESIGNAL_APP_ID veya ONESIGNAL_API_KEY eksik' }, { status: 500 });
  }

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      included_segments: ['Total Subscriptions'],
      headings: { tr: 'Test Bildirimi 🔔', en: 'Test Notification 🔔' },
      contents: { tr: 'Kafi bildirimleri çalışıyor!', en: 'Kafi notifications work!' },
    }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : 500 });
}
