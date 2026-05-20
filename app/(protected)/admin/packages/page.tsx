import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import Card from '@/components/ui/Card'

function PackageStatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'
  const isExpired = status === 'expired'
  let bg = '#F4F4F4'
  let color = '#6B7280'
  if (isActive) { bg = '#EBF5EA'; color = '#3A6B38' }
  if (isExpired) { bg = '#FEF2F2'; color = '#DC2626' }

  const label = isActive ? 'Aktif' : isExpired ? 'Süresi Doldu' : status

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}

function LessonProgressBar({
  used,
  total,
}: {
  used: number
  total: number
}) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const isHigh = pct >= 80
  const isMid = pct >= 50

  let barColor = '#5F705D'
  if (isHigh) barColor = '#DC2626'
  else if (isMid) barColor = '#F59E0B'

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{
          height: 6,
          backgroundColor: '#E7E7E2',
          minWidth: 80,
        }}
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${used} / ${total} ders kullanıldı`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <span
        className="text-xs tabular-nums shrink-0"
        style={{ color: '#8A8F87' }}
      >
        {used}/{total}
      </span>
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminPackagesPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const supabase = await createClient()

  type PackageRow = {
    id: string
    package_name: string
    total_lessons: number
    used_lessons: number
    remaining_lessons: number
    starts_at: string | null
    expires_at: string | null
    status: string
    created_at: string
    students: { profiles: { full_name: string } | null } | null
  }

  const { data: rawPackages } = await supabase
    .from('lesson_packages')
    .select(
      `
      id, package_name, total_lessons, used_lessons, remaining_lessons,
      starts_at, expires_at, status, created_at,
      students!inner(
        profiles!inner(full_name)
      )
    `
    )
    .order('created_at', { ascending: false })

  const packages = (rawPackages ?? []) as unknown as PackageRow[]

  return (
    <div
      className="p-6 md:p-8 space-y-6"
      style={{ backgroundColor: '#F6F5F2', minHeight: '100%' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#1D1D1B' }}
        >
          Ders Paketleri
        </h1>
        <p className="text-sm" style={{ color: '#8A8F87' }}>
          {packages.length} paket kayıtlı
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        {packages.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3" aria-hidden="true">
              📦
            </p>
            <p className="text-sm font-medium" style={{ color: '#1D1D1B' }}>
              Henüz ders paketi yok
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A8F87' }}>
              Öğrencilere paket atandığında burada görünecek.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  {[
                    'Öğrenci',
                    'Paket Adı',
                    'Kullanım',
                    'Kalan',
                    'Başlangıç',
                    'Bitiş',
                    'Durum',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: '#8A8F87' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, idx) => {
                  const studentProfile = pkg.students?.profiles
                  const isLast = idx === packages.length - 1

                  return (
                    <tr
                      key={pkg.id}
                      style={
                        isLast
                          ? undefined
                          : { borderBottom: '1px solid #E7E7E2' }
                      }
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <span
                          className="font-medium"
                          style={{ color: '#1D1D1B' }}
                        >
                          {studentProfile?.full_name ?? '—'}
                        </span>
                      </td>

                      {/* Package name */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {pkg.package_name}
                      </td>

                      {/* Progress bar */}
                      <td className="px-6 py-4 min-w-[160px]">
                        <LessonProgressBar
                          used={pkg.used_lessons}
                          total={pkg.total_lessons}
                        />
                      </td>

                      {/* Remaining */}
                      <td className="px-6 py-4">
                        <span
                          className="font-semibold tabular-nums"
                          style={{
                            color:
                              pkg.remaining_lessons <= 2
                                ? '#DC2626'
                                : '#1D1D1B',
                          }}
                        >
                          {pkg.remaining_lessons}
                        </span>
                      </td>

                      {/* Starts at */}
                      <td
                        className="px-6 py-4 tabular-nums"
                        style={{ color: '#8A8F87' }}
                      >
                        {formatDate(pkg.starts_at)}
                      </td>

                      {/* Expires at */}
                      <td
                        className="px-6 py-4 tabular-nums"
                        style={{ color: '#8A8F87' }}
                      >
                        {formatDate(pkg.expires_at)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <PackageStatusBadge status={pkg.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
