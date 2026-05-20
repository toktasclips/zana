'use client'

import { useState } from 'react'
import { assignTeacher } from './actions'
import Button from '@/components/ui/Button'

interface Teacher {
  id: string
  name: string
}

interface AssignTeacherButtonProps {
  studentId: string
  currentTeacherName: string | null
  teachers: Teacher[]
}

export default function AssignTeacherButton({
  studentId,
  currentTeacherName,
  teachers,
}: AssignTeacherButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAssign(teacherId: string) {
    setLoading(teacherId)
    setError(null)
    const result = await assignTeacher(studentId, teacherId)
    setLoading(null)
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
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentTeacherName ? 'Değiştir' : 'Ata'}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown */}
          <div
            className="absolute right-0 z-20 mt-1 w-52 rounded-xl shadow-lg overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E7E2',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
            role="listbox"
            aria-label="Öğretmen seç"
          >
            {teachers.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: '#8A8F87' }}>
                Kayıtlı öğretmen yok.
              </p>
            ) : (
              <ul className="py-1">
                {teachers.map((t) => (
                  <li key={t.id} role="option" aria-selected={false}>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors"
                      style={{ color: '#1D1D1B' }}
                      disabled={loading === t.id}
                      onClick={() => handleAssign(t.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F6F5F2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span>{t.name}</span>
                      {loading === t.id && (
                        <svg
                          className="animate-spin shrink-0"
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p
                className="px-4 pb-2 text-xs"
                style={{ color: '#DC2626' }}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
