'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface SelectTeacherButtonProps {
  teacherId: string
  teacherName: string
}

export default function SelectTeacherButton({
  teacherId,
  teacherName,
}: SelectTeacherButtonProps) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)

  async function handleSelect() {
    setLoading(true)
    try {
      // In a real implementation this would call a server action
      // to create a teacher_assignment record for the current student.
      await new Promise((r) => setTimeout(r, 800))
      setSelected(true)
    } finally {
      setLoading(false)
    }
  }

  if (selected) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium"
        style={{ color: 'var(--color-accent-primary)' }}
      >
        ✓ Seçildi
      </span>
    )
  }

  return (
    <Button
      size="sm"
      variant="primary"
      loading={loading}
      onClick={handleSelect}
      aria-label={`${teacherName} öğretmenini seç`}
    >
      Seç
    </Button>
  )
}
