import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import Card from '@/components/ui/Card'
import StatusFilterLinks from './StatusFilterLinks'

type LessonStatus = 'scheduled' | 'completed' | 'cancelled'

const STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
}

const STATUS_STYLES: Record<
  LessonStatus,
  { backgroundColor: string; color: string }
> = {
  scheduled: { backgroundColor: '#EBF5EA', color: '#3A6B38' },
  completed: { backgroundColor: '#EEF2FF', color: '#4338CA' },
  cancelled: { backgroundColor: '#FEF2F2', color: '#DC2626' },
}

function LessonStatusBadge({ status }: { status: LessonStatus }) {
  const styles = STATUS_STYLES[status] ?? {
    backgroundColor: '#F4F4F4',
    color: '#6B7280',
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={styles}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const { status } = await searchParams

  const validStatuses: LessonStatus[] = ['scheduled', 'completed', 'cancelled']
  const activeFilter =
    status && validStatuses.includes(status as LessonStatus)
      ? (status as LessonStatus)
      : ''

  const supabase = await createClient()

  let query = supabase
    .from('lessons')
    .select(
      `
      id, subject, starts_at, ends_at, status,
      students!inner(
        profiles!inner(full_name)
      ),
      teachers!inner(
        profiles!inner(full_name)
      )
    `
    )
    .order('starts_at', { ascending: false })

  if (activeFilter) {
    query = query.eq('status', activeFilter)
  }

  const { data: lessons } = await query

  return (
    <div
      className="p-6 md:p-8 space-y-6"
      style={{ backgroundColor: '#F6F5F2', minHeight: '100%' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#1D1D1B' }}
          >
            Ders Yönetimi
          </h1>
          <p className="text-sm" style={{ color: '#8A8F87' }}>
            {lessons?.length ?? 0} ders
            {activeFilter ? ` · ${STATUS_LABELS[activeFilter]}` : ' · Tümü'}
          </p>
        </div>
        <StatusFilterLinks current={activeFilter} />
      </div>

      <Card className="!p-0 overflow-hidden">
        {!lessons || lessons.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3" aria-hidden="true">
              📅
            </p>
            <p className="text-sm font-medium" style={{ color: '#1D1D1B' }}>
              {activeFilter
                ? `"${STATUS_LABELS[activeFilter]}" durumunda ders yok`
                : 'Henüz ders kaydı yok'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A8F87' }}>
              {activeFilter
                ? 'Farklı bir filtre deneyin.'
                : 'Dersler oluşturulduğunda burada görünecek.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  {['Öğrenci', 'Öğretmen', 'Konu', 'Başlangıç', 'Durum'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: '#8A8F87' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, idx) => {
                  const studentProfile = (
                    lesson.students as {
                      profiles: { full_name: string } | null
                    } | null
                  )?.profiles
                  const teacherProfile = (
                    lesson.teachers as {
                      profiles: { full_name: string } | null
                    } | null
                  )?.profiles
                  const isLast = idx === lessons.length - 1

                  return (
                    <tr
                      key={lesson.id}
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

                      {/* Teacher */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {teacherProfile?.full_name ?? '—'}
                      </td>

                      {/* Subject */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {lesson.subject ?? (
                          <span
                            className="italic text-xs"
                            style={{ color: '#B8BCB4' }}
                          >
                            Belirtilmedi
                          </span>
                        )}
                      </td>

                      {/* Starts at */}
                      <td
                        className="px-6 py-4 tabular-nums"
                        style={{ color: '#8A8F87' }}
                      >
                        {formatDateTime(lesson.starts_at)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <LessonStatusBadge
                          status={lesson.status as LessonStatus}
                        />
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
