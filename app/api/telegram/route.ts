import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function send(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function getDb() {
  const { getSupabase } = await import('@/lib/supabase');
  return getSupabase();
}

export async function POST(request: Request) {
  // Always return 200 to Telegram — never let an error propagate
  try {
    const body = await request.json();
    const message = body?.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const text: string = message.text.trim();

    // /start — respond immediately, save chat_id in background
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
      // Save chat_id without blocking the response
      getDb().then(db =>
        db.from('settings').update({ telegram_chat_id: chatId }).eq('id', 1)
      ).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    const db = await getDb();

    // /liste
    if (text.startsWith('/liste')) {
      const { data: tasks } = await db
        .from('tasks').select('id, title, priority')
        .neq('status', 'done').order('created_at', { ascending: false }).limit(10);

      if (!tasks?.length) {
        await send(chatId, '✅ Açık görev yok.');
        return NextResponse.json({ ok: true });
      }
      const icon: Record<string, string> = { high: '🔴', medium: '🟡', low: '🟢' };
      const lines = tasks.map((t, i) => `${i + 1}. ${icon[t.priority] ?? '⚪'} ${t.title}`);
      await send(chatId, `<b>Açık Görevler (${tasks.length})</b>\n\n${lines.join('\n')}\n\n<i>/tamamla [numara] ile kapat</i>`);
      return NextResponse.json({ ok: true });
    }

    // /bugün
    if (text.startsWith('/bugün') || text.startsWith('/bugun')) {
      const today = new Date().toISOString().split('T')[0];
      const { data: plan } = await db.from('today_plans').select('main_goal, must_do').eq('date', today).single();
      if (!plan) { await send(chatId, '📋 Bugün için henüz plan oluşturulmamış.'); return NextResponse.json({ ok: true }); }
      const items = (Array.isArray(plan.must_do) ? plan.must_do as string[] : []).filter(m => m.trim()).map((m, i) => `${i + 1}. ${m}`);
      let msg = '<b>Bugünün Planı</b>\n';
      if (plan.main_goal) msg += `\n🎯 <b>Ana Hedef:</b> ${plan.main_goal}\n`;
      if (items.length) msg += `\n✅ <b>Kritik İşler:</b>\n${items.join('\n')}`;
      await send(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // /tamamla [n]
    if (text.startsWith('/tamamla')) {
      const num = parseInt(text.split(' ')[1]);
      if (isNaN(num) || num < 1) { await send(chatId, '❓ Kullanım: /tamamla 2'); return NextResponse.json({ ok: true }); }
      const { data: tasks } = await db.from('tasks').select('id, title').neq('status', 'done').order('created_at', { ascending: false }).limit(10);
      const task = tasks?.[num - 1];
      if (!task) { await send(chatId, `❌ ${num}. görev bulunamadı.`); return NextResponse.json({ ok: true }); }
      await db.from('tasks').update({ status: 'done' }).eq('id', task.id);
      await send(chatId, `✅ Tamamlandı: <b>${task.title}</b>`);
      return NextResponse.json({ ok: true });
    }

    // /sil [n]
    if (text.startsWith('/sil')) {
      const num = parseInt(text.split(' ')[1]);
      if (isNaN(num) || num < 1) { await send(chatId, '❓ Kullanım: /sil 2'); return NextResponse.json({ ok: true }); }
      const { data: tasks } = await db.from('tasks').select('id, title').neq('status', 'done').order('created_at', { ascending: false }).limit(10);
      const task = tasks?.[num - 1];
      if (!task) { await send(chatId, `❌ ${num}. görev bulunamadı.`); return NextResponse.json({ ok: true }); }
      await db.from('tasks').delete().eq('id', task.id);
      await send(chatId, `🗑️ Silindi: <b>${task.title}</b>`);
      return NextResponse.json({ ok: true });
    }

    // default: add task
    const { error } = await db.from('tasks').insert({
      id: crypto.randomUUID(), title: text, description: '',
      priority: 'medium', category: 'other', status: 'todo',
      due_date: '', created_at: new Date().toISOString(),
    });
    await send(chatId, error ? '❌ Hata oluştu.' : `✅ Görev eklendi: "<b>${text}</b>"`);

  } catch {
    // Swallow all errors — Telegram must always get 200
  }

  return NextResponse.json({ ok: true });
}
