import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const today = new Date().toLocaleDateString('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function AdminDashboardPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const supabase = await createClient()

  const [
    { count: studentCount },
    { count: teacherCount },
    { count: activeLessonCount },
    { count: messageCount },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase
      .from('audit_logs')
      .select('id, action, entity_type, created_at, actor_profile_id')
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<{ id: string; action: string; entity_type: string; created_at: string; actor_profile_id: string | null }[]>(),
  ])

  return (
    <div className="p-6 md:p-8 space-y-8" style={{ backgroundColor: '#F6F5F2', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1D1D1B' }}>
          Admin Paneli
        </h1>
        <p className="text-sm capitalize" style={{ color: '#8A8F87' }}>
          {today}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Öğrenci"
          value={studentCount ?? 0}
          icon="👨‍🎓"
          subtitle="Kayıtlı öğrenci"
        />
        <StatCard
          title="Toplam Öğretmen"
          value={teacherCount ?? 0}
          icon="👩‍🏫"
          subtitle="Aktif öğretmen"
        />
        <StatCard
          title="Aktif Ders"
          value={activeLessonCount ?? 0}
          icon="📅"
          subtitle="Planlanmış ders"
        />
        <StatCard
          title="Toplam Mesaj"
          value={messageCount ?? 0}
          icon="💬"
          subtitle="Gönderilen mesaj"
        />
      </div>

      {/* Recent audit logs */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#1D1D1B' }}>
            Son İşlemler
          </h2>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-medium transition-colors"
            style={{ color: '#5F705D' }}
          >
            Tümünü Gör →
          </Link>
        </div>

        {!recentLogs || recentLogs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: '#8A8F87' }}>
              Henüz işlem kaydı yok.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  <th
                    className="pb-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#8A8F87' }}
                  >
                    İşlem
                  </th>
                  <th
                    className="pb-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#8A8F87' }}
                  >
                    Varlık
                  </th>
                  <th
                    className="pb-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#8A8F87' }}
                  >
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E7E7E2' }}>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 font-medium" style={{ color: '#1D1D1B' }}>
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: '#F0F4EF', color: '#5F705D' }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3" style={{ color: '#8A8F87' }}>
                      {log.entity_type}
                    </td>
                    <td className="py-3 text-right tabular-nums" style={{ color: '#8A8F87' }}>
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#1D1D1B' }}>
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/students', label: 'Öğrenci Yönetimi', icon: '👨‍🎓', desc: 'Öğrencileri görüntüle ve düzenle' },
            { href: '/admin/teachers', label: 'Öğretmen Yönetimi', icon: '👩‍🏫', desc: 'Öğretmenleri görüntüle ve düzenle' },
            { href: '/admin/lessons', label: 'Ders Yönetimi', icon: '📅', desc: 'Tüm dersleri görüntüle' },
          ].map(({ href, label, icon, desc }) => (
            <Link key={href} href={href}>
              <div
                className="rounded-xl p-5 flex items-start gap-4 transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E7E2',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#5F705D'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#E7E7E2'
                }}
              >
                <span className="text-2xl leading-none shrink-0 mt-0.5" aria-hidden="true">
                  {icon}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1D1D1B' }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8A8F87' }}>
                    {desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
