import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'

type LessonStatus = 'scheduled' | 'completed' | 'cancelled'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function durationMinutes(startsAt: string, endsAt: string): number {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)
}

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'scheduled') return <Badge variant="info">Planlandı</Badge>
  if (status === 'completed') return <Badge variant="success">Tamamlandı</Badge>
  return <Badge variant="error">İptal</Badge>
}

type LessonRow = {
  id: string
  starts_at: string
  ends_at: string
  subject: string | null
  status: LessonStatus
  lesson_notes: string | null
  teachers: {
    profiles: { full_name: string }
  }
}

// Mock data for demo / empty-state
const MOCK_UPCOMING: LessonRow[] = [
  {
    id: 'mock-u1',
    starts_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    subject: 'Matematik — Türev',
    status: 'scheduled',
    lesson_notes: null,
    teachers: { profiles: { full_name: 'Ayşe Kaya' } },
  },
  {
    id: 'mock-u2',
    starts_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    subject: 'Matematik — İntegral',
    status: 'scheduled',
    lesson_notes: null,
    teachers: { profiles: { full_name: 'Ayşe Kaya' } },
  },
]

const MOCK_PAST: LessonRow[] = [
  {
    id: 'mock-p1',
    starts_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    subject: 'Matematik — Limit',
    status: 'completed',
    lesson_notes: 'Limit konusu işlendi. Ev ödevi verildi.',
    teachers: { profiles: { full_name: 'Ayşe Kaya' } },
  },
  {
    id: 'mock-p2',
    starts_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    subject: 'Matematik — Fonksiyonlar',
    status: 'completed',
    lesson_notes: null,
    teachers: { profiles: { full_name: 'Ayşe Kaya' } },
  },
]

function LessonCard({ lesson }: { lesson: LessonRow }) {
  const { date, time } = formatDateTime(lesson.starts_at)
  const duration = durationMinutes(lesson.starts_at, lesson.ends_at)
  const teacherName = lesson.teachers?.profiles?.full_name ?? 'Öğretmen'

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Date block */}
      <div
        className="flex-shrink-0 rounded-lg px-3 py-2 text-center min-w-[64px]"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <p
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {date.split(' ')[0]}
        </p>
        <p
          className="text-lg font-bold leading-none mt-0.5"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {new Date(lesson.starts_at).getDate()}
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {time}
        </p>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {lesson.subject ?? 'Ders'}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {teacherName} · {duration} dk
        </p>
        {lesson.lesson_notes && (
          <p
            className="text-xs mt-1 italic line-clamp-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {lesson.lesson_notes}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={lesson.status} />
      </div>
    </div>
  )
}

export default async function StudentLessonsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/unauthorized')

  const { data: student } = await supabase
    .from('students')
    .select('id, remaining_lessons')
    .eq('profile_id', user.id)
    .single()

  const studentId = student?.id ?? null

  const lessonsSelect = `
    id,
    starts_at,
    ends_at,
    subject,
    status,
    lesson_notes,
    teachers!inner(
      profiles!inner(full_name)
    )
  `

  const now = new Date().toISOString()

  const [upcomingRes, pastRes, packageRes] = await Promise.all([
    studentId
      ? supabase
          .from('lessons')
          .select(lessonsSelect)
          .eq('student_id', studentId)
          .eq('status', 'scheduled')
          .gte('starts_at', now)
          .order('starts_at', { ascending: true })
      : Promise.resolve({ data: null }),

    studentId
      ? supabase
          .from('lessons')
          .select(lessonsSelect)
          .eq('student_id', studentId)
          .in('status', ['completed', 'cancelled'])
          .lt('starts_at', now)
          .order('starts_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),

    studentId
      ? supabase
          .from('lesson_packages')
          .select('package_name, total_lessons, used_lessons, remaining_lessons')
          .eq('student_id', studentId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const useMock = !studentId || (!upcomingRes.data?.length && !pastRes.data?.length)
  const upcomingLessons: LessonRow[] = useMock
    ? MOCK_UPCOMING
    : (upcomingRes.data as unknown as LessonRow[])
  const pastLessons: LessonRow[] = useMock
    ? MOCK_PAST
    : (pastRes.data as unknown as LessonRow[])

  const pkg = packageRes.data
  const remainingLessons =
    pkg?.remaining_lessons ?? student?.remaining_lessons ?? 0
  const completedCount = pastLessons.filter((l) => l.status === 'completed').length

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Derslerim
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Tüm ders geçmişinizi ve yaklaşan derslerinizi buradan takip edin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Kalan Ders"
          value={remainingLessons}
          subtitle={pkg?.package_name ?? 'Aktif paket'}
          icon="📚"
        />
        <StatCard
          title="Yaklaşan"
          value={upcomingLessons.length}
          subtitle="Planlanmış ders"
          icon="📅"
        />
        <StatCard
          title="Tamamlanan"
          value={completedCount}
          subtitle="Geçmiş ders"
          icon="✅"
        />
      </div>

      {/* Mock banner */}
      {useMock && (
        <div
          className="rounded-xl p-3 flex gap-2 mb-6 text-sm"
          style={{
            backgroundColor: '#DBEAFE',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
          }}
        >
          <span aria-hidden="true">ℹ️</span>
          <span>Örnek dersler gösteriliyor. Gerçek dersler kaydedilince burada görüntülenecek.</span>
        </div>
      )}

      {/* Upcoming */}
      <section className="mb-8">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          Yaklaşan Dersler
        </h2>

        {upcomingLessons.length === 0 ? (
          <Card className="text-center py-10">
            <span className="text-3xl mb-2 block" aria-hidden="true">📭</span>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Planlanmış yaklaşan ders yok.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          Geçmiş Dersler
        </h2>

        {pastLessons.length === 0 ? (
          <Card className="text-center py-10">
            <span className="text-3xl mb-2 block" aria-hidden="true">📂</span>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Henüz tamamlanmış ders bulunmuyor.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
