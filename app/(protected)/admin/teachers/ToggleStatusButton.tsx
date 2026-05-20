'use client'

import { useState } from 'react'
import { toggleTeacherStatus } from '../students/actions'
import Button from '@/components/ui/Button'

interface ToggleStatusButtonProps {
  teacherId: string
  currentStatus: string
}

export default function ToggleStatusButton({
  teacherId,
  currentStatus,
}: ToggleStatusButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = currentStatus === 'active'

  async function handleToggle() {
    setLoading(true)
    setError(null)
    const newStatus = isActive ? 'inactive' : 'active'
    const result = await toggleTeacherStatus(teacherId, newStatus)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant={isActive ? 'ghost' : 'secondary'}
        loading={loading}
        onClick={handleToggle}
        aria-label={isActive ? 'Öğretmeni devre dışı bırak' : 'Öğretmeni etkinleştir'}
        style={
          isActive
            ? { color: '#DC2626' }
            : { color: '#5F705D' }
        }
      >
        {isActive ? 'Devre Dışı Bırak' : 'Etkinleştir'}
      </Button>
      {error && (
        <p
          className="absolute top-full right-0 mt-1 text-xs whitespace-nowrap"
          style={{ color: '#DC2626' }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
