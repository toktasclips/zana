'use client';

import { useState, useEffect } from 'react';
import { StoreType } from '@/hooks/useStore';

interface SettingsProps {
  store: StoreType;
}

export default function Settings({ store }: SettingsProps) {
  const { data, saveSettings } = store;

  const [userName, setUserName] = useState(data.settings.userName);
  const [dayStartTime, setDayStartTime] = useState(data.settings.dayStartTime);
  const [dayEndTime, setDayEndTime] = useState(data.settings.dayEndTime);
  const [defaultBlockDuration, setDefaultBlockDuration] = useState(data.settings.defaultBlockDuration);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUserName(data.settings.userName);
    setDayStartTime(data.settings.dayStartTime);
    setDayEndTime(data.settings.dayEndTime);
    setDefaultBlockDuration(data.settings.defaultBlockDuration);
  }, [data.settings]);

  function handleSave() {
    saveSettings({ userName, dayStartTime, dayEndTime, defaultBlockDuration });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-stone-900 mb-1">Ayarlar</h2>
        <p className="text-sm text-stone-400">Kafi&apos;yi kendine göre ayarla</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Kullanıcı Adı
          </label>
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Adın"
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Çalışma Saatleri
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-400 mb-1.5 block">Gün Başlangıcı</label>
              <input
                type="time"
                value={dayStartTime}
                onChange={e => setDayStartTime(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:border-stone-400"
              />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1.5 block">Gün Sonu</label>
              <input
                type="time"
                value={dayEndTime}
                onChange={e => setDayEndTime(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:border-stone-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Varsayılan Çalışma Blok Süresi
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={15}
              max={240}
              step={15}
              value={defaultBlockDuration}
              onChange={e => setDefaultBlockDuration(Number(e.target.value))}
              className="w-24 text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:border-stone-400"
            />
            <span className="text-sm text-stone-500">dakika</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            {defaultBlockDuration >= 60
              ? `${Math.floor(defaultBlockDuration / 60)} saat ${defaultBlockDuration % 60 > 0 ? `${defaultBlockDuration % 60} dakika` : ''}`
              : `${defaultBlockDuration} dakika`}
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
          {saved ? 'Kaydedildi' : 'Ayarları Kaydet'}
        </button>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Veri
          </p>
          <p className="text-xs text-stone-500 mb-4 leading-relaxed">
            Tüm veriler tarayıcının yerel deposunda saklanır. Tarayıcı verisi temizlenirse kaybolur.
          </p>
          <button
            onClick={() => {
              if (confirm('Tüm verileri silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
                localStorage.removeItem('kafi-data');
                window.location.reload();
              }
            }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Tüm verileri sil
          </button>
        </div>
      </div>
    </div>
  );
}
