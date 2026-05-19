'use client';

import { Page } from '@/app/page';

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'plan', label: 'Bugünün Planı' },
  { id: 'tasks', label: 'Görevler' },
  { id: 'content', label: 'İçerikler' },
  { id: 'eod', label: 'Gün Sonu' },
  { id: 'settings', label: 'Ayarlar' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
}

export default function Sidebar({ currentPage, onNavigate, isOpen }: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:relative inset-y-0 left-0 z-30
        w-56 bg-white border-r border-stone-100
        flex flex-col shrink-0
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="px-5 py-6 border-b border-stone-100">
        <h1 className="text-lg font-semibold tracking-tight text-stone-900">Kafi</h1>
        <p className="text-xs text-stone-400 mt-0.5">verimlilik asistanın</p>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all mb-0.5
              ${currentPage === item.id
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-stone-100">
        <p className="text-xs text-stone-300">Kafi v1.0</p>
      </div>
    </aside>
  );
}
