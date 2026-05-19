import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function send(chatId: number, text: string, extra?: Record<string, unknown>) {
  await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = body?.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = message.text.trim();
  const db = getSupabase();

  // /start
  if (text.startsWith('/start')) {
    await send(chatId,
      '👋 Merhaba! Ben Kafi botuyum.\n\n' +
      '<b>Komutlar:</b>\n' +
      '/liste — Açık görevleri listele\n' +
      '/bugün — Bugünün planını göster\n' +
      '/tamamla [numara] — Görevi tamamla\n' +
      '/sil [numara] — Görevi sil\n\n' +
      'Ya da direkt bir şey yaz, görev olarak ekleyeyim.'
    );
    return NextResponse.json({ ok: true });
  }

  // /liste
  if (text.startsWith('/liste')) {
    const { data: tasks, error } = await db
      .from('tasks')
      .select('id, title, priority, status')
      .neq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !tasks?.length) {
      await send(chatId, '✅ Açık görev yok.');
      return NextResponse.json({ ok: true });
    }

    const priorityIcon: Record<string, string> = { high: '🔴', medium: '🟡', low: '🟢' };
    const lines = tasks.map((t, i) =>
      `${i + 1}. ${priorityIcon[t.priority] ?? '⚪'} ${t.title}`
    );
    await send(chatId, `<b>Açık Görevler (${tasks.length})</b>\n\n${lines.join('\n')}\n\n<i>/tamamla [numara] ile kapat</i>`);
    return NextResponse.json({ ok: true });
  }

  // /bugün
  if (text.startsWith('/bugün') || text.startsWith('/bugun')) {
    const today = new Date().toISOString().split('T')[0];
    const { data: plan } = await db
      .from('today_plans')
      .select('main_goal, must_do, work_blocks')
      .eq('date', today)
      .single();

    if (!plan) {
      await send(chatId, '📋 Bugün için henüz plan oluşturulmamış.');
      return NextResponse.json({ ok: true });
    }

    const mustDo: string[] = Array.isArray(plan.must_do) ? plan.must_do : [];
    const items = mustDo.filter((m: string) => m.trim()).map((m: string, i: number) => `${i + 1}. ${m}`);
    let msg = `<b>Bugünün Planı</b>\n`;
    if (plan.main_goal) msg += `\n🎯 <b>Ana Hedef:</b> ${plan.main_goal}\n`;
    if (items.length) msg += `\n✅ <b>Kritik İşler:</b>\n${items.join('\n')}`;

    await send(chatId, msg);
    return NextResponse.json({ ok: true });
  }

  // /tamamla [numara]
  if (text.startsWith('/tamamla')) {
    const num = parseInt(text.split(' ')[1]);
    if (isNaN(num) || num < 1) {
      await send(chatId, '❓ Kullanım: /tamamla 2');
      return NextResponse.json({ ok: true });
    }

    const { data: tasks } = await db
      .from('tasks')
      .select('id, title')
      .neq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(10);

    const task = tasks?.[num - 1];
    if (!task) {
      await send(chatId, `❌ ${num}. görev bulunamadı. /liste ile kontrol et.`);
      return NextResponse.json({ ok: true });
    }

    await db.from('tasks').update({ status: 'done' }).eq('id', task.id);
    await send(chatId, `✅ Tamamlandı: <b>${task.title}</b>`);
    return NextResponse.json({ ok: true });
  }

  // /sil [numara]
  if (text.startsWith('/sil')) {
    const num = parseInt(text.split(' ')[1]);
    if (isNaN(num) || num < 1) {
      await send(chatId, '❓ Kullanım: /sil 2');
      return NextResponse.json({ ok: true });
    }

    const { data: tasks } = await db
      .from('tasks')
      .select('id, title')
      .neq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(10);

    const task = tasks?.[num - 1];
    if (!task) {
      await send(chatId, `❌ ${num}. görev bulunamadı. /liste ile kontrol et.`);
      return NextResponse.json({ ok: true });
    }

    await db.from('tasks').delete().eq('id', task.id);
    await send(chatId, `🗑️ Silindi: <b>${task.title}</b>`);
    return NextResponse.json({ ok: true });
  }

  // default: add as task
  const { error } = await db.from('tasks').insert({
    id: crypto.randomUUID(),
    title: text,
    description: '',
    priority: 'medium',
    category: 'other',
    status: 'todo',
    due_date: '',
    created_at: new Date().toISOString(),
  });

  if (error) {
    await send(chatId, '❌ Bir hata oluştu, tekrar dene.');
  } else {
    await send(chatId, `✅ Görev eklendi: "<b>${text}</b>"\n\n<i>/liste ile tüm görevleri gör</i>`);
  }

  return NextResponse.json({ ok: true });
}
