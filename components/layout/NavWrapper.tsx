'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import type { UserRole } from '@/types/database'

interface NavWrapperProps {
  role: UserRole
  children: React.ReactNode
}

export default function NavWrapper({ role, children }: NavWrapperProps) {
  const pathname = usePathname()

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#F6F5F2' }}
    >
      <Sidebar role={role} activePath={pathname} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav role={role} activePath={pathname} />
    </div>
  )
}
