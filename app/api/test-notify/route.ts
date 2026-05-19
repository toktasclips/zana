import { NextResponse } from 'next/server';
import { sendPushToAll } from '@/lib/webpush';

export async function POST() {
  const result = await sendPushToAll('Test Bildirimi 🔔', 'Kafi bildirimleri çalışıyor!');
  if (result.sent === 0) {
    return NextResponse.json({ error: 'Abone yok. Önce bildirimleri aç.' }, { status: 400 });
  }
  return NextResponse.json(result);
}
