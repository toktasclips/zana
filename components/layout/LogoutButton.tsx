'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 rounded-lg text-sm transition-all duration-100"
      style={{ color: '#8A8F87', padding: '10px 12px' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#1D1D1B'
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#8A8F87'
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span className="text-base leading-none shrink-0" aria-hidden="true">
        🚪
      </span>
      Çıkış Yap
    </button>
  )
}
