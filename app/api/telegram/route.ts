import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = body?.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = message.text.trim();

  if (text.startsWith('/start')) {
    await sendMessage(chatId, '👋 Merhaba! Bana herhangi bir şey yaz, görev olarak Kafi\'ye ekleyeyim.');
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from('tasks').insert({
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
    await sendMessage(chatId, '❌ Bir hata oluştu, tekrar dene.');
  } else {
    await sendMessage(chatId, `✅ Görev eklendi: "${text}"`);
  }

  return NextResponse.json({ ok: true });
}
