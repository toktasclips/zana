import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/webpush';

export async function POST() {
  const result = await sendNotification('Test Bildirimi 🔔', 'Kafi bildirimleri çalışıyor!');
  if (!result.telegram && result.webPush === 0) {
    return NextResponse.json({ error: 'Telegram chat_id veya web push abonesi yok.' }, { status: 400 });
  }
  return NextResponse.json(result);
}
