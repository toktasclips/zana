'use client';

import { useState } from 'react';
import { StoreType } from '@/hooks/useStore';
import { ContentIdea, ContentPlatform, ContentStatus } from '@/lib/types';

const PLATFORM_LABEL: Record<ContentPlatform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  email: 'Email',
};

const PLATFORM_STYLE: Record<ContentPlatform, string> = {
  instagram: 'bg-pink-50 text-pink-600',
  youtube: 'bg-red-50 text-red-600',
  linkedin: 'bg-blue-50 text-blue-700',
  email: 'bg-stone-100 text-stone-600',
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  idea: 'Fikir',
  writing: 'Yazılıyor',
  filming: 'Çekilecek',
  published: 'Yayınlandı',
};

const STATUS_STYLE: Record<ContentStatus, string> = {
  idea: 'bg-amber-50 text-amber-700',
  writing: 'bg-blue-50 text-blue-700',
  filming: 'bg-purple-50 text-purple-700',
  published: 'bg-green-50 text-green-700',
};

const emptyForm = {
  title: '',
  platform: 'instagram' as ContentPlatform,
  status: 'idea' as ContentStatus,
  hook: '',
  mainIdea: '',
  cta: '',
};

interface ContentsProps {
  store: StoreType;
}

export default function Contents({ store }: ContentsProps) {
  const { data, addContentIdea, updateContentIdea, deleteContentIdea } = store;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (editId) {
      updateContentIdea(editId, form);
      setEditId(null);
    } else {
      addContentIdea(form);
    }
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleEdit(idea: ContentIdea) {
    setForm({
      title: idea.title,
      platform: idea.platform,
      status: idea.status,
      hook: idea.hook,
      mainIdea: idea.mainIdea,
      cta: idea.cta,
    });
    setEditId(idea.id);
    setShowForm(true);
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-1">İçerikler</h2>
          <p className="text-sm text-stone-400">{data.contentIdeas.length} içerik fikri</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          + İçerik Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">
            {editId ? 'İçeriği Düzenle' : 'Yeni İçerik Fikri'}
          </h3>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="İçerik başlığı"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 placeholder:text-stone-300 focus:border-stone-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Platform</label>
                <select
                  value={form.platform}
                  onChange={e => setForm(p => ({ ...p, platform: e.target.value as ContentPlatform }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  {(Object.keys(PLATFORM_LABEL) as ContentPlatform[]).map(pl => (
                    <option key={pl} value={pl}>{PLATFORM_LABEL[pl]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Durum</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as ContentStatus }))}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 focus:border-stone-400"
                >
                  {(Object.keys(STATUS_LABEL) as ContentStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={form.hook}
              onChange={e => setForm(p => ({ ...p, hook: e.target.value }))}
              placeholder="Hook — ilk cümle / dikkat çekici"
              rows={2}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
            />
            <textarea
              value={form.mainIdea}
              onChange={e => setForm(p => ({ ...p, mainIdea: e.target.value }))}
              placeholder="Ana fikir"
              rows={2}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 resize-none placeholder:text-stone-300 focus:border-stone-400"
            />
            <input
              value={form.cta}
              onChange={e => setForm(p => ({ ...p, cta: e.target.value }))}
              placeholder="CTA — harekete geçirici"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 placeholder:text-stone-300 focus:border-stone-400"
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

      {/* Content Cards */}
      {data.contentIdeas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <p className="text-stone-400 text-sm">Henüz içerik fikri yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.contentIdeas.map(idea => (
            <div key={idea.id} className="bg-white rounded-2xl border border-stone-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_STYLE[idea.platform]}`}>
                    {PLATFORM_LABEL[idea.platform]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[idea.status]}`}>
                    {STATUS_LABEL[idea.status]}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(idea)}
                    className="p-1.5 text-stone-300 hover:text-stone-600 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteContentIdea(idea.id)}
                    className="p-1.5 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-stone-900 mb-2">{idea.title}</h3>

              {(idea.hook || idea.mainIdea || idea.cta) && (
                <button
                  onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {expanded === idea.id ? 'Gizle' : 'Detaylar'}
                </button>
              )}

              {expanded === idea.id && (
                <div className="mt-3 space-y-2.5 pt-3 border-t border-stone-50">
                  {idea.hook && (
                    <div>
                      <p className="text-xs font-medium text-stone-400 mb-0.5">Hook</p>
                      <p className="text-xs text-stone-600 leading-relaxed">{idea.hook}</p>
                    </div>
                  )}
                  {idea.mainIdea && (
                    <div>
                      <p className="text-xs font-medium text-stone-400 mb-0.5">Ana Fikir</p>
                      <p className="text-xs text-stone-600 leading-relaxed">{idea.mainIdea}</p>
                    </div>
                  )}
                  {idea.cta && (
                    <div>
                      <p className="text-xs font-medium text-stone-400 mb-0.5">CTA</p>
                      <p className="text-xs text-stone-600 leading-relaxed">{idea.cta}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3">
                <select
                  value={idea.status}
                  onChange={e => updateContentIdea(idea.id, { status: e.target.value as ContentStatus })}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 focus:border-stone-400"
                >
                  {(Object.keys(STATUS_LABEL) as ContentStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
