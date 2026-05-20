'use client'

import { useState } from 'react'
import { updateRemainingLessons } from './actions'
import Button from '@/components/ui/Button'

interface EditLessonsButtonProps {
  studentId: string
  currentLessons: number
}

export default function EditLessonsButton({
  studentId,
  currentLessons,
}: EditLessonsButtonProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(String(currentLessons))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 0) {
      setError('Geçerli bir sayı girin.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await updateRemainingLessons(studentId, parsed)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setValue(String(currentLessons))
          setError(null)
          setOpen((v) => !v)
        }}
        aria-label="Kalan ders sayısını düzenle"
      >
        Düzenle
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 z-20 mt-1 w-52 rounded-xl p-4 shadow-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E7E2',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <p
              className="text-xs font-medium mb-3"
              style={{ color: '#8A8F87' }}
            >
              Kalan Ders Sayısı
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  border: '1px solid #E7E7E2',
                  color: '#1D1D1B',
                  backgroundColor: '#F6F5F2',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#5F705D'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E7E7E2'
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs" style={{ color: '#DC2626' }} role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  Kaydet
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  İptal
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
