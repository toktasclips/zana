'use client'

import { useState, useTransition } from 'react'
import { updateLessonNote } from './actions'

interface AddNoteFormProps {
  lessonId: string
  existingNote: string | null
}

export default function AddNoteForm({ lessonId, existingNote }: AddNoteFormProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(existingNote ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setValue(existingNote ?? '')
    setError(null)
    setSaved(false)
    setOpen(true)
  }

  function handleCancel() {
    setOpen(false)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      try {
        const result = await updateLessonNote(lessonId, value)
        if (result?.error) {
          setError(result.error)
        } else {
          setSaved(true)
          setOpen(false)
        }
      } catch {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="mt-2 flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors duration-100"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-primary)',
          color: 'var(--color-accent-primary)',
        }}
      >
        <span aria-hidden="true">{existingNote ? '✏️' : '📝'}</span>
        {existingNote ? 'Notu Düzenle' : 'Not Ekle'}
        {saved && (
          <span
            className="ml-1 text-[10px]"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            ✓ Kaydedildi
          </span>
        )}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-xl p-4 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-primary)',
      }}
    >
      <label
        htmlFor={`note-${lessonId}`}
        className="block text-xs font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Ders Notu
      </label>

      <textarea
        id={`note-${lessonId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Bu ders hakkında not girin…"
        className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-primary)',
          color: 'var(--color-text-primary)',
          // @ts-expect-error css custom property
          '--tw-ring-color': 'var(--color-accent-primary)',
        }}
        disabled={isPending}
        autoFocus
      />

      {error && (
        <p className="text-xs" style={{ color: '#991B1B' }}>
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          İptal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors duration-100 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
        >
          {isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
