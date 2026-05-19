import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { endpoint, p256dh, auth } = await request.json();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const db = getSupabase();
  await db.from('push_subscriptions').upsert({ endpoint, p256dh, auth }, { onConflict: 'endpoint' });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { endpoint } = await request.json();
  if (!endpoint) return NextResponse.json({ error: 'missing endpoint' }, { status: 400 });

  const db = getSupabase();
  await db.from('push_subscriptions').delete().eq('endpoint', endpoint);
  return NextResponse.json({ ok: true });
}
