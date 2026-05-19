import { NextResponse } from 'next/server';
import { sendPushToAll } from '@/lib/webpush';

const MESSAGES = {
  morning: { title: 'Günaydın! ☀️', body: 'Bugünün planını oluştur ve ana odağını belirle.' },
  afternoon: { title: 'Öğleden sonra kontrol 🎯', body: 'Görevlerin nasıl gidiyor? Önceliklerine bak.' },
  evening: { title: 'Günü kapatma vakti 🌙', body: 'Gün sonu değerlendirmeni yap, yarının odağını belirle.' },
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') ?? 'morning') as keyof typeof MESSAGES;
  const msg = MESSAGES[type] ?? MESSAGES.morning;

  const result = await sendPushToAll(msg.title, msg.body);
  return NextResponse.json(result);
}
