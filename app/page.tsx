'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import TodayPlan from '@/components/plan/TodayPlan';
import Tasks from '@/components/tasks/Tasks';
import Contents from '@/components/content/Contents';
import EndOfDay from '@/components/eod/EndOfDay';
import Settings from '@/components/settings/Settings';
import { useStore } from '@/hooks/useStore';

export type Page = 'dashboard' | 'plan' | 'tasks' | 'content' | 'eod' | 'settings';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const store = useStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-semibold text-stone-900 text-sm">Kafi</span>
        </div>

        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <Dashboard store={store} />}
          {currentPage === 'plan' && <TodayPlan store={store} />}
          {currentPage === 'tasks' && <Tasks store={store} />}
          {currentPage === 'content' && <Contents store={store} />}
          {currentPage === 'eod' && <EndOfDay store={store} />}
          {currentPage === 'settings' && <Settings store={store} />}
        </main>
      </div>
    </div>
  );
}
