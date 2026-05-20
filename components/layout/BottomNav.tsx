'use client'

import Link from 'next/link'
import type { UserRole } from '@/types/database'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Ana Sayfa',   href: '/student',          icon: '🏠' },
    { label: 'Öğretmenler', href: '/student/teachers', icon: '👩‍🏫' },
    { label: 'Derslerim',   href: '/student/lessons',  icon: '📚' },
    { label: 'Mesajlar',    href: '/student/messages', icon: '💬' },
  ],
  teacher: [
    { label: 'Ana Sayfa',  href: '/teacher',          icon: '🏠' },
    { label: 'Öğrenciler', href: '/teacher/students', icon: '👨‍🎓' },
    { label: 'Dersler',    href: '/teacher/lessons',  icon: '📅' },
    { label: 'Mesajlar',   href: '/teacher/messages', icon: '💬' },
  ],
  admin: [
    { label: 'Dashboard',   href: '/admin',            icon: '📊' },
    { label: 'Öğrenciler',  href: '/admin/students',   icon: '👨‍🎓' },
    { label: 'Öğretmenler', href: '/admin/teachers',   icon: '👩‍🏫' },
    { label: 'Dersler',     href: '/admin/lessons',    icon: '📅' },
    { label: 'Paketler',    href: '/admin/packages',   icon: '📦' },
    { label: 'Logs',        href: '/admin/audit-logs', icon: '🔍' },
  ],
}

const rootPaths = new Set(['/student', '/teacher', '/admin'])

function isActive(href: string, activePath: string): boolean {
  return rootPaths.has(href) ? activePath === href : activePath.startsWith(href)
}

interface BottomNavProps {
  role: UserRole
  activePath: string
}

export default function BottomNav({ role, activePath }: BottomNavProps) {
  const items = navItems[role]

  return (
    <nav
      className="flex md:hidden fixed bottom-0 inset-x-0 border-t z-50"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E7E7E2',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ul className="flex w-full">
        {items.map((item) => {
          const active = isActive(item.href, activePath)

          return (
            <li key={item.href} className="flex-1 min-w-0">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors duration-100"
                style={{ color: active ? '#5F705D' : '#8A8F87' }}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="leading-none truncate px-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
