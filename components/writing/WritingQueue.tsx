'use client';

import { useState } from 'react';
import { StoreType } from '@/hooks/useStore';
import { WritingItem, WritingType, Priority, TaskStatus } from '@/lib/types';

const TYPE_LABEL: Record<WritingType, string> = {
  email: 'Email',
  'ad-copy': 'Reklam Metni',
  'video-script': 'Video Script',
  post: 'Post',
  'landing-page': 'Landing Page',
};

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const PRIORITY_STYLE: Record<Priority, string> = {
  low: 'bg-stone-100 text-stone-500',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-600',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Yapılacak',
  'in-progress': 'Yazılıyor',
  done: 'Tamamlandı',
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-stone-100 text-stone-600',
  'in-progress': 'bg-blue-50 text-blue-700',
  done: 'bg-green-50 text-green-700',
};

const emptyForm = {
  title: '',
  type: 'post' as WritingType,
  priority: 'medium' as Priority,
  status: 'todo' as TaskStatus,
  notes: '',
};

interface WritingQueueProps {
  store: StoreType;
}

export default function WritingQueue({ store }: WritingQueueProps) {
  const { data, addWritingItem, updateWritingItem, deleteWritingItem } = store;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (editId) {
      updateWritingItem(editId, form);
      setEditId(null);
    } else {
      addWritingItem(form);
    }
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleEdit(item: WritingItem) {
    setForm({
      title: item.title,
      type: item.type,
      priority: item.priority,
      status: item.status,
      notes: item.notes,
    });
    setEditId(item.id);
    setShowForm(true);
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  }

  const pending = data.writingQueue.filter(w => w.status !== 'done');
  const done = data.writingQueue.filter(w => w.status === 'done');

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-1">Yazılacaklar</h2>
          <p className="text-sm text-stone-400">{pending.length} bekleyen yazı</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          + Yazı Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">
            {editId ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
          </h3>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Yazı başlığı"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 placeholder:text-stone-300 focus:border-stone-400"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Tür</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as WritingType }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  {(Object.keys(TYPE_LABEL) as WritingType[]).map(t => (
                    <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Öncelik</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Durum</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as TaskStatus }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  {(Object.keys(STATUS_LABEL) as TaskStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notlar"
              rows={2}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
              >
                {editId ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 bg-stone-100 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {data.writingQueue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <p className="text-stone-400 text-sm">Henüz yazılacak bir şey yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...pending, ...done].map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-stone-100 p-4 ${item.status === 'done' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateWritingItem(item.id, {
                    status: item.status === 'done' ? 'todo' : 'done',
                  })}
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    item.status === 'done'
                      ? 'bg-stone-900 border-stone-900'
                      : 'border-stone-300 hover:border-stone-500'
                  }`}
                >
                  {item.status === 'done' && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-stone-900 ${item.status === 'done' ? 'line-through' : ''}`}>
                    {item.title}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-stone-500 mt-0.5 truncate">{item.notes}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {TYPE_LABEL[item.type]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[item.priority]}`}>
                      {PRIORITY_LABEL[item.priority]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-stone-300 hover:text-stone-600 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteWritingItem(item.id)}
                    className="p-1.5 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
