'use client';

import { AppData } from '@/lib/types';

function getSuggestion(data: AppData): string {
  const today = new Date().toISOString().split('T')[0];
  const pending = data.tasks.filter(t => t.status !== 'done');
  const highPriority = pending.filter(t => t.priority === 'high');
  const todayEod = data.endOfDayReviews.find(r => r.date === today);
  const hour = new Date().getHours();

  if (pending.length === 0) {
    return 'Güne başlamadan önce 3 kritik iş belirle.';
  }
  if (highPriority.length > 0) {
    return `${highPriority.length} yüksek öncelikli görev var. Önce onu bitir.`;
  }
  if (pending.length > 5) {
    return 'Bugün sadece 3 ana işe odaklan.';
  }
  if (!todayEod && hour >= 17) {
    return 'Günü kapatmadan kısa değerlendirme yap.';
  }
  return 'İyi gidiyorsun. Odaklanmaya devam et.';
}

interface KafiSuggestionProps {
  data: AppData;
}

export default function KafiSuggestion({ data }: KafiSuggestionProps) {
  const suggestion = getSuggestion(data);

  return (
    <div className="bg-stone-900 text-white rounded-2xl p-5">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
        Kafi Önerisi
      </p>
      <p className="text-sm leading-relaxed text-stone-100">{suggestion}</p>
    </div>
  );
}
