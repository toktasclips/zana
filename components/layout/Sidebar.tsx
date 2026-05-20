'use client'

import Link from 'next/link'
import type { UserRole } from '@/types/database'
import LogoutButton from './LogoutButton'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Ana Sayfa',    href: '/student',          icon: '🏠' },
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
    { label: 'Audit Logs',  href: '/admin/audit-logs', icon: '🔍' },
  ],
}

const rootPaths = new Set(['/student', '/teacher', '/admin'])

function isActive(href: string, activePath: string): boolean {
  return rootPaths.has(href) ? activePath === href : activePath.startsWith(href)
}

interface SidebarProps {
  role: UserRole
  activePath: string
}

export default function Sidebar({ role, activePath }: SidebarProps) {
  const items = navItems[role]

  return (
    <aside
      className="hidden md:flex w-64 h-screen flex-col flex-shrink-0 border-r"
      style={{ backgroundColor: '#F6F5F2', borderColor: '#E7E7E2' }}
    >
      <div className="flex items-center h-16 px-6 flex-shrink-0">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#1D1D1B' }}>
          Teneff
          <span style={{ color: '#5F705D' }}>ü</span>
          s
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href, activePath)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg text-sm transition-all duration-100"
                  style={
                    active
                      ? {
                          backgroundColor: '#FFFFFF',
                          color: '#1D1D1B',
                          fontWeight: 500,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          borderLeft: '2px solid #5F705D',
                          padding: '10px 12px 10px 10px',
                        }
                      : { color: '#8A8F87', padding: '10px 12px' }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#1D1D1B'
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#8A8F87'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span className="text-base leading-none shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t flex-shrink-0" style={{ borderColor: '#E7E7E2' }}>
        <LogoutButton />
      </div>
    </aside>
  )
}
