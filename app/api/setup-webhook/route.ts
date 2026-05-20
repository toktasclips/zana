import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN eksik' }, { status: 500 });

  const host = new URL(request.url).origin;
  const webhookUrl = `${host}/api/telegram`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const data = await res.json();
  return NextResponse.json({ webhookUrl, ...data });
}
