'use client';

import { useState, useEffect } from 'react';
import { StoreType } from '@/hooks/useStore';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function NotificationSettings() {
  const [status, setStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported' | 'loading' | 'error'>('default');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
    } else {
      setStatus(Notification.permission as 'default' | 'granted' | 'denied');
    }
  }, []);

  async function handleEnable() {
    setStatus('loading');
    setErrMsg('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission as 'denied' | 'default');
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      if (!VAPID_PUBLIC_KEY) {
        setErrMsg('VAPID_PUBLIC_KEY eksik — Vercel env var ayarla ve redeploy yap.');
        setStatus('error');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data?.error ?? `Supabase kayıt hatası (${res.status})`);
        setStatus('error');
        return;
      }

      setStatus('granted');
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Bilinmeyen hata');
      setStatus('error');
    }
  }

  if (status === 'unsupported') return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
        Bildirimler
      </p>
      {status === 'granted' ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-sm text-stone-600">Bildirimler açık. Sabah, öğle ve akşam hatırlatıcı gelecek.</p>
        </div>
      ) : status === 'denied' ? (
        <div>
          <p className="text-sm text-red-500 mb-2">Bildirimler engellendi.</p>
          <p className="text-xs text-stone-400 leading-relaxed">
            Adres çubuğundaki kilit ikonuna tıkla → Bildirimler → İzin Ver → Sayfayı yenile.
          </p>
        </div>
      ) : status === 'error' ? (
        <div>
          <p className="text-sm text-red-500 mb-2">Hata oluştu.</p>
          <p className="text-xs text-red-400 mb-3 leading-relaxed font-mono">{errMsg}</p>
          <button
            onClick={handleEnable}
            className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-stone-500 mb-3 leading-relaxed">
            Günde 3 hatırlatıcı: sabah planı, öğle kontrolü, akşam gün sonu.
          </p>
          <button
            onClick={handleEnable}
            disabled={status === 'loading'}
            className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Kaydediliyor...' : 'Bildirimleri Aç'}
          </button>
        </div>
      )}
    </div>
  );
}

function TestNotification() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function handleTest() {
    setState('loading');
    try {
      const res = await fetch('/api/test-notify', { method: 'POST' });
      setState(res.ok ? 'ok' : 'error');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 3000);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">Test Bildirimi</p>
      <p className="text-xs text-stone-500 mb-3">Tüm abonelere anlık bildirim gönder.</p>
      <button
        onClick={handleTest}
        disabled={state === 'loading'}
        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
          state === 'ok' ? 'bg-green-100 text-green-700' :
          state === 'error' ? 'bg-red-100 text-red-600' :
          'bg-stone-900 text-white hover:bg-stone-800'
        }`}
      >
        {state === 'loading' ? 'Gönderiliyor...' : state === 'ok' ? 'Gönderildi!' : state === 'error' ? 'Hata' : 'Test Gönder'}
      </button>
    </div>
  );
}

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

        <NotificationSettings />
        <TestNotification />

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
