import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;

const MESSAGES = {
  morning: {
    title: 'Günaydın! ☀️',
    body: 'Bugünün planını oluştur ve ana odağını belirle.',
  },
  afternoon: {
    title: 'Öğleden sonra kontrol 🎯',
    body: 'Görevlerin nasıl gidiyor? Önceliklerine bak.',
  },
  evening: {
    title: 'Günü kapatma vakti 🌙',
    body: 'Gün sonu değerlendirmeni yap, yarının odağını belirle.',
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') ?? 'morning') as keyof typeof MESSAGES;

  // Vercel Cron Jobs automatically sends the VERCEL_AUTOMATION_BYPASS_SECRET header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const message = MESSAGES[type] ?? MESSAGES.morning;

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { en: message.title, tr: message.title },
      contents: { en: message.body, tr: message.body },
    }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : 500 });
}
