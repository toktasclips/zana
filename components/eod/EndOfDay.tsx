'use client';

import { useState, useEffect } from 'react';
import { StoreType } from '@/hooks/useStore';

interface EndOfDayProps {
  store: StoreType;
}

export default function EndOfDay({ store }: EndOfDayProps) {
  const { data, saveEndOfDay } = store;
  const today = new Date().toISOString().split('T')[0];

  const existing = data.endOfDayReviews.find(r => r.date === today);

  const [wentWell, setWentWell] = useState(existing?.wentWell ?? '');
  const [completed, setCompleted] = useState(existing?.completed ?? '');
  const [postponed, setPostponed] = useState(existing?.postponed ?? '');
  const [tomorrowFocus, setTomorrowFocus] = useState(existing?.tomorrowFocus ?? '');
  const [score, setScore] = useState(existing?.productivityScore ?? 7);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const rec = data.endOfDayReviews.find(r => r.date === today);
    if (rec) {
      setWentWell(rec.wentWell);
      setCompleted(rec.completed);
      setPostponed(rec.postponed);
      setTomorrowFocus(rec.tomorrowFocus);
      setScore(rec.productivityScore);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  function handleSave() {
    saveEndOfDay({ date: today, wentWell, completed, postponed, tomorrowFocus, productivityScore: score });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const pastReviews = data.endOfDayReviews
    .filter(r => r.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-stone-900 mb-1">Gün Sonu</h2>
        <p className="text-sm text-stone-400">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="space-y-4">
        {/* Bugün ne iyi gitti */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Bugün Ne İyi Gitti?
          </label>
          <textarea
            value={wentWell}
            onChange={e => setWentWell(e.target.value)}
            placeholder="Bugün iyi giden şeyler..."
            rows={3}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* Tamamlananlar */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Ne Tamamlandı?
          </label>
          <textarea
            value={completed}
            onChange={e => setCompleted(e.target.value)}
            placeholder="Bugün bitirdiğin işler..."
            rows={3}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* Ertelenenler */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Ne Ertelendi?
          </label>
          <textarea
            value={postponed}
            onChange={e => setPostponed(e.target.value)}
            placeholder="Yarına kalan işler..."
            rows={2}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* Yarının odağı */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Yarın İçin Ana Odak
          </label>
          <textarea
            value={tomorrowFocus}
            onChange={e => setTomorrowFocus(e.target.value)}
            placeholder="Yarın en önemli işin ne?"
            rows={2}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* Verimlilik puanı */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Günlük Verimlilik Puanı
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={`
                  w-10 h-10 rounded-xl text-sm font-semibold transition-all
                  ${score >= n
                    ? n >= 8 ? 'bg-green-500 text-white' : n >= 5 ? 'bg-amber-400 text-white' : 'bg-red-400 text-white'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">
            {score >= 8 && 'Harika bir gün!'}
            {score >= 5 && score < 8 && 'Fena değil, devam et.'}
            {score < 5 && 'Yarın daha iyisi olacak.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-2xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          {saved ? 'Kaydedildi' : 'Günü Kapat'}
        </button>
      </div>

      {/* Geçmiş */}
      {pastReviews.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Geçmiş Değerlendirmeler
          </h3>
          <div className="space-y-3">
            {pastReviews.map(review => (
              <div key={review.date} className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-stone-500">
                    {new Date(review.date + 'T00:00:00').toLocaleDateString('tr-TR', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    review.productivityScore >= 8
                      ? 'bg-green-50 text-green-700'
                      : review.productivityScore >= 5
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {review.productivityScore}/10
                  </span>
                </div>
                {review.tomorrowFocus && (
                  <p className="text-xs text-stone-600 truncate">{review.tomorrowFocus}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
