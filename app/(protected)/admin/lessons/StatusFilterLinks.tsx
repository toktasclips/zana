'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'scheduled', label: 'Planlandı' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal Edildi' },
] as const

interface StatusFilterLinksProps {
  current: string
}

export default function StatusFilterLinks({ current }: StatusFilterLinksProps) {
  const pathname = usePathname()

  return (
    <div
      className="inline-flex rounded-lg p-1 gap-1"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E7E2' }}
      role="group"
      aria-label="Ders durumuna göre filtrele"
    >
      {FILTERS.map((f) => {
        const isActive = current === f.value
        const href =
          f.value ? `${pathname}?status=${f.value}` : pathname

        return (
          <Link
            key={f.value}
            href={href}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-100"
            style={
              isActive
                ? {
                    backgroundColor: '#5F705D',
                    color: '#FFFFFF',
                  }
                : {
                    color: '#8A8F87',
                  }
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {f.label}
          </Link>
        )
      })}
    </div>
  )
}
