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
  const prev = data.previousPlan;
  const overdueItems = prev
    ? prev.mustDo.filter((item, i) => item.trim() && !prev.mustDoDone[i])
    : [];

  const [isEditing, setIsEditing] = useState(!plan);
  const [mainGoal, setMainGoal] = useState(plan?.mainGoal ?? '');
  const [mustDo, setMustDo] = useState<[string, string, string]>(plan?.mustDo ?? ['', '', '']);
  const [mustDoDone, setMustDoDone] = useState<[boolean, boolean, boolean]>(plan?.mustDoDone ?? [false, false, false]);
  const [distractions, setDistractions] = useState(plan?.distractions ?? '');
  const [energyLevel, setEnergyLevel] = useState(plan?.energyLevel ?? 3);
  const [workBlocks, setWorkBlocks] = useState<WorkBlock[]>(plan?.workBlocks ?? []);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({ startTime: '', endTime: '', task: '' });

  useEffect(() => {
    if (plan) {
      setMainGoal(plan.mainGoal);
      setMustDo(plan.mustDo);
      setMustDoDone(plan.mustDoDone);
      setDistractions(plan.distractions);
      setEnergyLevel(plan.energyLevel);
      setWorkBlocks(plan.workBlocks);
      setIsEditing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.todayPlan]);

  function handleSave() {
    saveTodayPlan({ date: today, mainGoal, mustDo, mustDoDone, distractions, energyLevel, workBlocks });
    setIsEditing(false);
  }

  function handleToggleDone(i: 0 | 1 | 2) {
    const next = [...mustDoDone] as [boolean, boolean, boolean];
    next[i] = !next[i];
    setMustDoDone(next);
    if (plan) {
      saveTodayPlan({ date: today, mainGoal, mustDo, mustDoDone: next, distractions, energyLevel, workBlocks });
    }
  }

  function handleAddBlock() {
    if (!blockForm.task || !blockForm.startTime) return;
    const newBlock: WorkBlock = { id: crypto.randomUUID(), ...blockForm, status: 'planned' };
    setWorkBlocks(prev => [...prev, newBlock]);
    setBlockForm({ startTime: '', endTime: '', task: '' });
    setShowBlockForm(false);
  }

  function handleBlockStatus(id: string, status: WorkBlockStatus) {
    const updated = workBlocks.map(b => b.id === id ? { ...b, status } : b);
    setWorkBlocks(updated);
    if (plan) {
      saveTodayPlan({ date: today, mainGoal, mustDo, mustDoDone, distractions, energyLevel, workBlocks: updated });
    }
  }

  function handleDeleteBlock(id: string) {
    const updated = workBlocks.filter(b => b.id !== id);
    setWorkBlocks(updated);
    if (plan) {
      saveTodayPlan({ date: today, mainGoal, mustDo, mustDoDone, distractions, energyLevel, workBlocks: updated });
    }
  }

  function addOverdueItem(item: string) {
    const emptyIndex = mustDo.findIndex(m => !m.trim()) as 0 | 1 | 2;
    if (emptyIndex === -1) return;
    const next = [...mustDo] as [string, string, string];
    next[emptyIndex] = item;
    setMustDo(next);
  }

  const dateLabel = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const completedCount = mustDoDone.filter(Boolean).length;

  if (!isEditing && plan) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Bugünün Planı</h2>
            <p className="text-sm text-stone-400">{dateLabel}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Düzenle
          </button>
        </div>

        <div className="space-y-4">
          {plan.mainGoal && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Ana Hedef</p>
              <p className="text-sm text-stone-700 leading-relaxed">{plan.mainGoal}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">Kritik İşler</p>
              <span className="text-xs text-stone-400">{completedCount}/3</span>
            </div>
            <div className="space-y-2">
              {mustDo.map((item, i) => item.trim() ? (
                <button
                  key={i}
                  onClick={() => handleToggleDone(i as 0 | 1 | 2)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    mustDoDone[i]
                      ? 'bg-green-500 border-green-500'
                      : 'border-stone-300 group-hover:border-stone-500'
                  }`}>
                    {mustDoDone[i] && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm transition-all ${mustDoDone[i] ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                    {item}
                  </span>
                </button>
              ) : null)}
            </div>
          </div>

          {workBlocks.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">Çalışma Blokları</p>
                <button
                  onClick={() => setShowBlockForm(true)}
                  className="text-xs text-stone-500 hover:text-stone-900"
                >+ Ekle</button>
              </div>
              {showBlockForm && (
                <div className="mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="time" value={blockForm.startTime}
                      onChange={e => setBlockForm(p => ({ ...p, startTime: e.target.value }))}
                      className="text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5" />
                    <input type="time" value={blockForm.endTime}
                      onChange={e => setBlockForm(p => ({ ...p, endTime: e.target.value }))}
                      className="text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5" />
                  </div>
                  <input value={blockForm.task}
                    onChange={e => setBlockForm(p => ({ ...p, task: e.target.value }))}
                    placeholder="Ne yapacaksın?"
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 mb-2 placeholder:text-stone-300" />
                  <div className="flex gap-2">
                    <button onClick={handleAddBlock} className="flex-1 py-1.5 bg-stone-900 text-white text-xs rounded-lg">Ekle</button>
                    <button onClick={() => setShowBlockForm(false)} className="flex-1 py-1.5 bg-stone-100 text-stone-600 text-xs rounded-lg">İptal</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {workBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(block => (
                  <div key={block.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <span className="text-xs text-stone-500 font-mono shrink-0">
                      {block.startTime}{block.endTime && ` — ${block.endTime}`}
                    </span>
                    <span className="flex-1 text-sm text-stone-700 truncate">{block.task}</span>
                    <select
                      value={block.status}
                      onChange={e => handleBlockStatus(block.id, e.target.value as WorkBlockStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLE[block.status]}`}
                    >
                      {(Object.keys(STATUS_LABEL) as WorkBlockStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDeleteBlock(block.id)} className="text-stone-300 hover:text-red-400">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Enerji:</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(l => (
                  <div key={l} className={`w-4 h-4 rounded-full ${energyLevel >= l ? 'bg-amber-400' : 'bg-stone-100'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-1">Bugünün Planı</h2>
          <p className="text-sm text-stone-400">{dateLabel}</p>
        </div>
        {plan && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            İptal
          </button>
        )}
      </div>

      {overdueItems.length > 0 && !plan && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-widest mb-2">Dünden Kalanlar</p>
          <div className="space-y-1.5">
            {overdueItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-sm text-orange-700">{item}</span>
                <button
                  onClick={() => addOverdueItem(item)}
                  className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors shrink-0"
                >
                  Bugüne Ekle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
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

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Bugünkü Enerji Seviyesi
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  energyLevel >= level ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-widest">Çalışma Blokları</label>
            <button onClick={() => setShowBlockForm(true)} className="text-xs font-medium text-stone-600 hover:text-stone-900">
              + Blok Ekle
            </button>
          </div>

          {showBlockForm && (
            <div className="mb-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Başlangıç</label>
                  <input type="time" value={blockForm.startTime}
                    onChange={e => setBlockForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Bitiş</label>
                  <input type="time" value={blockForm.endTime}
                    onChange={e => setBlockForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg px-2 py-1.5" />
                </div>
              </div>
              <input value={blockForm.task}
                onChange={e => setBlockForm(p => ({ ...p, task: e.target.value }))}
                placeholder="Ne yapacaksın?"
                className="w-full text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 mb-3 placeholder:text-stone-300" />
              <div className="flex gap-2">
                <button onClick={handleAddBlock} className="flex-1 py-2 bg-stone-900 text-white text-sm rounded-lg">Ekle</button>
                <button onClick={() => setShowBlockForm(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 text-sm rounded-lg">İptal</button>
              </div>
            </div>
          )}

          {workBlocks.length === 0 ? (
            <p className="text-sm text-stone-400">Henüz çalışma bloğu yok.</p>
          ) : (
            <div className="space-y-2">
              {workBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(block => (
                <div key={block.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-mono shrink-0">
                    {block.startTime}{block.endTime && ` — ${block.endTime}`}
                  </span>
                  <span className="flex-1 text-sm text-stone-700 truncate">{block.task}</span>
                  <select value={block.status}
                    onChange={e => handleBlockStatus(block.id, e.target.value as WorkBlockStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLE[block.status]}`}
                  >
                    {(Object.keys(STATUS_LABEL) as WorkBlockStatus[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button onClick={() => handleDeleteBlock(block.id)} className="text-stone-300 hover:text-red-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 transition-all"
        >
          Planı Kaydet
        </button>
      </div>
    </div>
  );
}
