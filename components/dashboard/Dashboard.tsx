'use client';

import { useState } from 'react';
import { StoreType } from '@/hooks/useStore';
import KafiSuggestion from '@/components/shared/KafiSuggestion';
import { Task } from '@/lib/types';

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-600',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface DashboardProps {
  store: StoreType;
}

export default function Dashboard({ store }: DashboardProps) {
  const { data, saveMainFocus, saveDailyNote } = store;
  const today = new Date().toISOString().split('T')[0];

  const [focusInput, setFocusInput] = useState(data.mainFocus[today] ?? '');
  const [focusEditing, setFocusEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(data.dailyNotes[today] ?? '');

  const pending = data.tasks.filter(t => t.status !== 'done');
  const done = data.tasks.filter(t => t.status === 'done');
  const topTasks = pending
    .slice()
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);

  const mainFocus = data.mainFocus[today] ?? '';

  function handleFocusSave() {
    saveMainFocus(today, focusInput);
    setFocusEditing(false);
  }

  function handleNoteSave() {
    saveDailyNote(today, noteContent);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">
          {formatDate(new Date())}
        </p>
        <h2 className="text-2xl font-semibold text-stone-900">
          {data.settings.userName ? `Merhaba, ${data.settings.userName}` : 'Merhaba'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ana Odak */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
              Bugünün Ana Odağı
            </p>
            {focusEditing ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={focusInput}
                  onChange={e => setFocusInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFocusSave()}
                  placeholder="Bugün neye odaklanıyorsun?"
                  className="flex-1 text-sm text-stone-900 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:border-stone-400"
                />
                <button
                  onClick={handleFocusSave}
                  className="px-4 py-2 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <button
                onClick={() => setFocusEditing(true)}
                className="w-full text-left group"
              >
                {mainFocus ? (
                  <p className="text-base font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                    {mainFocus}
                  </p>
                ) : (
                  <p className="text-sm text-stone-400 group-hover:text-stone-600 transition-colors">
                    Bugünün ana odağını belirle...
                  </p>
                )}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
                Tamamlandı
              </p>
              <p className="text-3xl font-semibold text-stone-900">{done.length}</p>
              <p className="text-xs text-stone-400 mt-1">görev</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
                Bekliyor
              </p>
              <p className="text-3xl font-semibold text-stone-900">{pending.length}</p>
              <p className="text-xs text-stone-400 mt-1">görev</p>
            </div>
          </div>

          {/* Top Tasks */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
              Öncelikli Görevler
            </p>
            {topTasks.length === 0 ? (
              <p className="text-sm text-stone-400">Henüz görev eklenmedi.</p>
            ) : (
              <div className="space-y-2.5">
                {topTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3">
                    <button
                      onClick={() => store.updateTask(task.id, {
                        status: task.status === 'done' ? 'todo' : 'done',
                      })}
                      className="w-4 h-4 rounded-full border-2 border-stone-300 hover:border-stone-500 flex items-center justify-center shrink-0 transition-colors"
                    />
                    <span className="flex-1 text-sm text-stone-700 truncate">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[task.priority]}`}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Note */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
              Günlük Not
            </p>
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              onBlur={handleNoteSave}
              placeholder="Bugün aklında ne var?"
              rows={4}
              className="w-full text-sm text-stone-700 bg-transparent resize-none placeholder:text-stone-300 leading-relaxed"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <KafiSuggestion data={data} />

          {/* Today plan summary */}
          {data.todayPlan && data.todayPlan.date === today && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
                Bugünün Planı
              </p>
              {data.todayPlan.mainGoal && (
                <p className="text-sm text-stone-700 leading-relaxed mb-3">
                  {data.todayPlan.mainGoal}
                </p>
              )}
              <div className="space-y-2">
                {data.todayPlan.mustDo.filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-xs text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Energy level */}
          {data.todayPlan && data.todayPlan.date === today && data.todayPlan.energyLevel > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
                Enerji Seviyesi
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`flex-1 h-2 rounded-full ${
                      level <= data.todayPlan!.energyLevel ? 'bg-amber-400' : 'bg-stone-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">
                {data.todayPlan.energyLevel} / 5
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
