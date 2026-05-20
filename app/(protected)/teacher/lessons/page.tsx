import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import AddNoteForm from './AddNoteForm'

// ─── types ────────────────────────────────────────────────────────────────────

type LessonStatus = 'scheduled' | 'completed' | 'cancelled'

type LessonRow = {
  id: string
  starts_at: string
  ends_at: string
  subject: string | null
  status: LessonStatus
  lesson_notes: string | null
  students: {
    profiles: { full_name: string }
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

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
    dayNum: d.getDate(),
    weekday: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
  }
}

function durationMinutes(startsAt: string, endsAt: string): number {
  return Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000
  )
}

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'scheduled') return <Badge variant="info">Planlandı</Badge>
  if (status === 'completed') return <Badge variant="success">Tamamlandı</Badge>
  return <Badge variant="error">İptal</Badge>
}

// ─── lesson card ──────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  showNote,
}: {
  lesson: LessonRow
  showNote: boolean
}) {
  const { dayNum, weekday, time } = formatDateTime(lesson.starts_at)
  const duration = durationMinutes(lesson.starts_at, lesson.ends_at)
  const studentName =
    lesson.students?.profiles?.full_name ?? 'Öğrenci'

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div
          className="flex-shrink-0 rounded-lg px-3 py-2 text-center min-w-[56px]"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <p
            className="text-[10px] font-medium uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {weekday}
          </p>
          <p
            className="text-xl font-bold leading-none mt-0.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {dayNum}
          </p>
          <p
            className="text-[10px] mt-0.5"
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
            {studentName} · {duration} dk
          </p>

          {lesson.lesson_notes && (
            <p
              className="text-xs mt-2 italic line-clamp-2 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              &ldquo;{lesson.lesson_notes}&rdquo;
            </p>
          )}

          {showNote && (
            <AddNoteForm
              lessonId={lesson.id}
              existingNote={lesson.lesson_notes}
            />
          )}
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={lesson.status} />
        </div>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function TeacherLessonsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Teacher record
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!teacher) redirect('/unauthorized')

  const now = new Date().toISOString()

  const lessonsSelect = `
    id,
    starts_at,
    ends_at,
    subject,
    status,
    lesson_notes,
    students!inner(
      profiles!inner(full_name)
    )
  `

  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from('lessons')
      .select(lessonsSelect)
      .eq('teacher_id', teacher.id)
      .eq('status', 'scheduled')
      .gte('starts_at', now)
      .order('starts_at', { ascending: true }),

    supabase
      .from('lessons')
      .select(lessonsSelect)
      .eq('teacher_id', teacher.id)
      .in('status', ['completed', 'cancelled'])
      .lt('starts_at', now)
      .order('starts_at', { ascending: false })
      .limit(30),
  ])

  const upcomingLessons = (upcomingRes.data ?? []) as unknown as LessonRow[]
  const pastLessons = (pastRes.data ?? []) as unknown as LessonRow[]
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
          Yaklaşan ve geçmiş derslerinizi buradan takip edin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        <StatCard
          title="Toplam Geçmiş"
          value={pastLessons.length}
          subtitle="Kayıtlı ders"
          icon="📂"
        />
      </div>

      {/* Upcoming lessons */}
      <section className="mb-8">
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          Yaklaşan Dersler
        </h2>

        {upcomingLessons.length === 0 ? (
          <Card className="text-center py-10">
            <span className="text-3xl mb-2 block" aria-hidden="true">
              📭
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Planlanmış yaklaşan ders yok.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} showNote={false} />
            ))}
          </div>
        )}
      </section>

      {/* Past lessons */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          Geçmiş Dersler
        </h2>

        {pastLessons.length === 0 ? (
          <Card className="text-center py-10">
            <span className="text-3xl mb-2 block" aria-hidden="true">
              📂
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Henüz tamamlanmış ders bulunmuyor.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastLessons.map((lesson) => (
              // Allow adding/editing notes on completed lessons
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                showNote={lesson.status === 'completed'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
