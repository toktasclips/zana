'use client';

import { useState } from 'react';
import { StoreType } from '@/hooks/useStore';
import { Task, Priority, TaskCategory, TaskStatus } from '@/lib/types';

type Filter = 'all' | 'today' | 'high' | 'done' | 'pending';

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const PRIORITY_STYLE: Record<Priority, string> = {
  low: 'bg-stone-100 text-stone-500',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-600',
};
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Yapılacak',
  'in-progress': 'Yapılıyor',
  done: 'Tamamlandı',
};
const CATEGORY_LABEL: Record<TaskCategory, string> = {
  work: 'İş',
  content: 'İçerik',
  client: 'Müşteri',
  personal: 'Kişisel',
  other: 'Diğer',
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'today', label: 'Bugün' },
  { id: 'high', label: 'Yüksek Öncelik' },
  { id: 'pending', label: 'Bekleyenler' },
  { id: 'done', label: 'Tamamlananlar' },
];

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium' as Priority,
  category: 'work' as TaskCategory,
  status: 'todo' as TaskStatus,
  dueDate: '',
};

interface TasksProps {
  store: StoreType;
}

export default function Tasks({ store }: TasksProps) {
  const { data, addTask, updateTask, deleteTask } = store;
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const filtered = data.tasks.filter(task => {
    if (filter === 'today') return task.dueDate === today;
    if (filter === 'high') return task.priority === 'high' && task.status !== 'done';
    if (filter === 'done') return task.status === 'done';
    if (filter === 'pending') return task.status !== 'done';
    return true;
  });

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (editId) {
      updateTask(editId, form);
      setEditId(null);
    } else {
      addTask(form);
    }
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleEdit(task: Task) {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      status: task.status,
      dueDate: task.dueDate,
    });
    setEditId(task.id);
    setShowForm(true);
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-1">Görevler</h2>
          <p className="text-sm text-stone-400">{data.tasks.filter(t => t.status !== 'done').length} bekleyen görev</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          + Görev Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">
            {editId ? 'Görevi Düzenle' : 'Yeni Görev'}
          </h3>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Görev başlığı"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 placeholder:text-stone-300 focus:border-stone-400"
            />
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Açıklama (isteğe bağlı)"
              rows={2}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <label className="text-xs text-stone-400 mb-1 block">Kategori</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as TaskCategory }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  {(Object.keys(CATEGORY_LABEL) as TaskCategory[]).map(c => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
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
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Son Tarih</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                />
              </div>
            </div>
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

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <p className="text-stone-400 text-sm">Bu filtrede görev yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border border-stone-100 p-4 transition-all ${
                task.status === 'done' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateTask(task.id, {
                    status: task.status === 'done' ? 'todo' : 'done',
                  })}
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    task.status === 'done'
                      ? 'bg-stone-900 border-stone-900'
                      : 'border-stone-300 hover:border-stone-500'
                  }`}
                >
                  {task.status === 'done' && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-stone-900 ${task.status === 'done' ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-stone-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[task.priority]}`}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                      {CATEGORY_LABEL[task.category]}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.dueDate < today && task.status !== 'done'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1.5 text-stone-300 hover:text-stone-600 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
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
