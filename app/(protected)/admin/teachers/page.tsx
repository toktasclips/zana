import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import Card from '@/components/ui/Card'
import ToggleStatusButton from './ToggleStatusButton'

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: isActive ? '#EBF5EA' : '#F4F4F4',
        color: isActive ? '#3A6B38' : '#6B7280',
      }}
    >
      {isActive ? 'Aktif' : 'Pasif'}
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return (
      <span className="text-xs" style={{ color: '#B8BCB4' }}>
        —
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-medium"
      style={{ color: '#1D1D1B' }}
    >
      <span style={{ color: '#F59E0B' }}>★</span>
      {rating.toFixed(1)}
    </span>
  )
}

export default async function AdminTeachersPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const supabase = await createClient()

  const { data: teachers } = await supabase
    .from('teachers')
    .select(
      `
      id, branch, bio, experience_years, rating, status, created_at,
      profiles!inner(full_name, avatar_url)
    `
    )
    .order('created_at', { ascending: false })

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
          Öğretmen Yönetimi
        </h1>
        <p className="text-sm" style={{ color: '#8A8F87' }}>
          {teachers?.length ?? 0} öğretmen kayıtlı
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        {!teachers || teachers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3" aria-hidden="true">
              👩‍🏫
            </p>
            <p className="text-sm font-medium" style={{ color: '#1D1D1B' }}>
              Henüz kayıtlı öğretmen yok
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A8F87' }}>
              Sisteme öğretmen eklendiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  {[
                    'Ad Soyad',
                    'Branş',
                    'Deneyim',
                    'Puan',
                    'Bio',
                    'Durum',
                    'İşlemler',
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider${h === 'İşlemler' ? ' text-right' : ''}`}
                      style={{ color: '#8A8F87' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, idx) => {
                  const profile = teacher.profiles as
                    | { full_name: string; avatar_url: string | null }
                    | null
                  const isLast = idx === teachers.length - 1

                  return (
                    <tr
                      key={teacher.id}
                      style={
                        isLast
                          ? undefined
                          : { borderBottom: '1px solid #E7E7E2' }
                      }
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{
                              backgroundColor: '#E8EDF7',
                              color: '#3B5998',
                            }}
                            aria-hidden="true"
                          >
                            {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: '#1D1D1B' }}
                          >
                            {profile?.full_name ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Branch */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {teacher.branch ?? '—'}
                      </td>

                      {/* Experience */}
                      <td
                        className="px-6 py-4 tabular-nums"
                        style={{ color: '#8A8F87' }}
                      >
                        {teacher.experience_years != null
                          ? `${teacher.experience_years} yıl`
                          : '—'}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <StarRating rating={teacher.rating} />
                      </td>

                      {/* Bio */}
                      <td
                        className="px-6 py-4 max-w-[200px]"
                        style={{ color: '#8A8F87' }}
                      >
                        {teacher.bio ? (
                          <span
                            className="block truncate"
                            title={teacher.bio}
                          >
                            {teacher.bio}
                          </span>
                        ) : (
                          <span
                            className="text-xs italic"
                            style={{ color: '#B8BCB4' }}
                          >
                            Yok
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={teacher.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <ToggleStatusButton
                            teacherId={teacher.id}
                            currentStatus={teacher.status}
                          />
                        </div>
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
