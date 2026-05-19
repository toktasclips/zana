'use client';

import { useState, useEffect } from 'react';
import { StoreType } from '@/hooks/useStore';
import { WorkBlock, WorkBlockStatus } from '@/lib/types';

const STATUS_LABEL: Record<WorkBlockStatus, string> = {
  planned: 'Planlandı',
  'in-progress': 'Yapılıyor',
  done: 'Bitti',
};

const STATUS_STYLE: Record<WorkBlockStatus, string> = {
  planned: 'bg-stone-100 text-stone-600',
  'in-progress': 'bg-amber-50 text-amber-700',
  done: 'bg-green-50 text-green-700',
};

interface TodayPlanProps {
  store: StoreType;
}

export default function TodayPlan({ store }: TodayPlanProps) {
  const { data, saveTodayPlan } = store;
  const today = new Date().toISOString().split('T')[0];
  const plan = data.todayPlan?.date === today ? data.todayPlan : null;

  const [mainGoal, setMainGoal] = useState(plan?.mainGoal ?? '');
  const [mustDo, setMustDo] = useState<[string, string, string]>(plan?.mustDo ?? ['', '', '']);
  const [distractions, setDistractions] = useState(plan?.distractions ?? '');
  const [energyLevel, setEnergyLevel] = useState(plan?.energyLevel ?? 3);
  const [workBlocks, setWorkBlocks] = useState<WorkBlock[]>(plan?.workBlocks ?? []);
  const [saved, setSaved] = useState(false);

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({ startTime: '', endTime: '', task: '' });

  useEffect(() => {
    if (plan) {
      setMainGoal(plan.mainGoal);
      setMustDo(plan.mustDo);
      setDistractions(plan.distractions);
      setEnergyLevel(plan.energyLevel);
      setWorkBlocks(plan.workBlocks);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.todayPlan]);

  function handleSave() {
    saveTodayPlan({
      date: today,
      mainGoal,
      mustDo,
      distractions,
      energyLevel,
      workBlocks,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddBlock() {
    if (!blockForm.task || !blockForm.startTime) return;
    const newBlock: WorkBlock = {
      id: crypto.randomUUID(),
      ...blockForm,
      status: 'planned',
    };
    setWorkBlocks(prev => [...prev, newBlock]);
    setBlockForm({ startTime: '', endTime: '', task: '' });
    setShowBlockForm(false);
  }

  function handleBlockStatusChange(id: string, status: WorkBlockStatus) {
    setWorkBlocks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  function handleDeleteBlock(id: string) {
    setWorkBlocks(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-stone-900 mb-1">Bugünün Planı</h2>
        <p className="text-sm text-stone-400">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="space-y-4">
        {/* Ana Hedef */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Bugünün Ana Hedefi
          </label>
          <textarea
            value={mainGoal}
            onChange={e => setMainGoal(e.target.value)}
            placeholder="Bugün neyi başarmak istiyorsun?"
            rows={3}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* 3 Kritik İş */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Mutlaka Bitmesi Gereken 3 İş
          </label>
          <div className="space-y-2">
            {([0, 1, 2] as const).map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-semibold shrink-0">
                  {i + 1}
                </div>
                <input
                  value={mustDo[i]}
                  onChange={e => {
                    const next = [...mustDo] as [string, string, string];
                    next[i] = e.target.value;
                    setMustDo(next);
                  }}
                  placeholder={`${i + 1}. kritik iş`}
                  className="flex-1 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 placeholder:text-stone-300 focus:border-stone-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dikkat Dağıtıcılar */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Dikkat Dağıtıcılar
          </label>
          <textarea
            value={distractions}
            onChange={e => setDistractions(e.target.value)}
            placeholder="Bugün seni dağıtabilecek şeyler neler?"
            rows={2}
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
          />
        </div>

        {/* Enerji Seviyesi */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Bugünkü Enerji Seviyesi
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${energyLevel >= level
                    ? 'bg-amber-400 text-white'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-2">
            {energyLevel === 1 && 'Çok düşük'}
            {energyLevel === 2 && 'Düşük'}
            {energyLevel === 3 && 'Orta'}
            {energyLevel === 4 && 'İyi'}
            {energyLevel === 5 && 'Mükemmel'}
          </p>
        </div>

        {/* Çalışma Blokları */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-widest">
              Çalışma Blokları
            </label>
            <button
              onClick={() => setShowBlockForm(true)}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              + Blok Ekle
            </button>
          </div>

          {showBlockForm && (
            <div className="mb-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Başlangıç</label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={e => setBlockForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5 focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Bitiş</label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={e => setBlockForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5 focus:border-stone-400"
                  />
                </div>
              </div>
              <input
                value={blockForm.task}
                onChange={e => setBlockForm(p => ({ ...p, task: e.target.value }))}
                placeholder="Ne yapacaksın?"
                className="w-full text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 mb-3 placeholder:text-stone-300 focus:border-stone-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBlock}
                  className="flex-1 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Ekle
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="flex-1 py-2 bg-stone-100 text-stone-600 text-sm rounded-lg hover:bg-stone-200 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {workBlocks.length === 0 ? (
            <p className="text-sm text-stone-400">Henüz çalışma bloğu yok.</p>
          ) : (
            <div className="space-y-2">
              {workBlocks
                .slice()
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(block => (
                  <div key={block.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <div className="text-xs text-stone-500 font-mono shrink-0">
                      {block.startTime}
                      {block.endTime && ` — ${block.endTime}`}
                    </div>
                    <span className="flex-1 text-sm text-stone-700 truncate">{block.task}</span>
                    <select
                      value={block.status}
                      onChange={e => handleBlockStatusChange(block.id, e.target.value as WorkBlockStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLE[block.status]}`}
                    >
                      {(Object.keys(STATUS_LABEL) as WorkBlockStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-2xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          {saved ? 'Kaydedildi' : 'Planı Kaydet'}
        </button>
      </div>
    </div>
  );
}
