import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })
}

function todayLabel(): string {
  return new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}

function lessonStatusVariant(
  status: string
): 'success' | 'warning' | 'error' | 'neutral' | 'info' {
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'error'
  return 'info'
}

function lessonStatusLabel(status: string): string {
  if (status === 'completed') return 'Tamamlandı'
  if (status === 'cancelled') return 'İptal'
  return 'Planlandı'
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function TeacherDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Teacher record
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, branch, bio, rating')
    .eq('profile_id', user.id)
    .single()

  if (!teacher) redirect('/unauthorized')

  // Profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  // Today's lessons
  const { data: todayLessons } = await supabase
    .from('lessons')
    .select(`
      id, starts_at, ends_at, subject, status,
      students!inner(
        id,
        profiles!inner(full_name)
      )
    `)
    .eq('teacher_id', teacher.id)
    .gte('starts_at', today + 'T00:00:00')
    .lte('starts_at', today + 'T23:59:59')
    .order('starts_at')

  // Assigned students count
  const { count: studentCount } = await supabase
    .from('teacher_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('status', 'active')

  // This month completed lessons count
  const monthStart = today.slice(0, 7) + '-01T00:00:00'
  const { count: completedCount } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('status', 'completed')
    .gte('starts_at', monthStart)

  // Upcoming lessons (next 5, excluding today)
  const { data: upcomingLessons } = await supabase
    .from('lessons')
    .select(`
      id, starts_at, ends_at, subject, status,
      students!inner(
        id,
        profiles!inner(full_name)
      )
    `)
    .eq('teacher_id', teacher.id)
    .eq('status', 'scheduled')
    .gt('starts_at', today + 'T23:59:59')
    .order('starts_at')
    .limit(5)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Öğretmen'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#1D1D1B' }}
        >
          Merhaba, {firstName}!
        </h1>
        <p className="mt-1 text-sm capitalize" style={{ color: '#8A8F87' }}>
          {todayLabel()}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Bugünkü Ders"
          value={todayLessons?.length ?? 0}
          icon="📅"
          subtitle="Bugün planlandı"
        />
        <StatCard
          title="Toplam Öğrenci"
          value={studentCount ?? 0}
          icon="👨‍🎓"
          subtitle="Aktif atama"
        />
        <StatCard
          title="Bu Ay Tamamlanan"
          value={completedCount ?? 0}
          icon="✅"
          subtitle="Tamamlanan ders"
        />
      </div>

      {/* Security notice */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
        style={{
          backgroundColor: '#F0F4EF',
          border: '1px solid #C8D4C6',
          color: '#4A5F48',
        }}
        role="note"
      >
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <p>
          <strong>Gizlilik Hatırlatması:</strong> Öğrenci iletişim bilgilerine
          erişim kısıtlıdır. Platform içi mesajlaşmayı kullanın.{' '}
          <Link
            href="/teacher/messages"
            className="underline underline-offset-2 font-medium"
            style={{ color: '#5F705D' }}
          >
            Mesajlara git →
          </Link>
        </p>
      </div>

      {/* Today's lessons */}
      <section>
        <h2
          className="text-base font-semibold mb-3"
          style={{ color: '#1D1D1B' }}
        >
          Bugünkü Dersler
        </h2>

        {!todayLessons || todayLessons.length === 0 ? (
          <Card>
            <p className="text-sm text-center py-4" style={{ color: '#8A8F87' }}>
              Bugün planlanmış ders bulunmuyor.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayLessons.map((lesson) => {
              const student = Array.isArray(lesson.students)
                ? lesson.students[0]
                : lesson.students
              const studentProfile = Array.isArray(student?.profiles)
                ? student?.profiles[0]
                : student?.profiles

              return (
                <Card key={lesson.id} className="flex items-center gap-4">
                  {/* Time column */}
                  <div
                    className="shrink-0 text-center rounded-lg px-3 py-2 min-w-[60px]"
                    style={{ backgroundColor: '#F0F4EF' }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{ color: '#5F705D' }}
                    >
                      {formatTime(lesson.starts_at)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#8A8F87' }}>
                      {formatTime(lesson.ends_at)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: '#1D1D1B' }}
                    >
                      {studentProfile?.full_name ?? '—'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#8A8F87' }}>
                      {lesson.subject ?? 'Konu belirtilmedi'}
                    </p>
                  </div>

                  <Badge variant={lessonStatusVariant(lesson.status)}>
                    {lessonStatusLabel(lesson.status)}
                  </Badge>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming lessons */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-base font-semibold"
            style={{ color: '#1D1D1B' }}
          >
            Yaklaşan Dersler
          </h2>
          <Link
            href="/teacher/lessons"
            className="text-xs font-medium"
            style={{ color: '#5F705D' }}
          >
            Tümünü gör →
          </Link>
        </div>

        {!upcomingLessons || upcomingLessons.length === 0 ? (
          <Card>
            <p className="text-sm text-center py-4" style={{ color: '#8A8F87' }}>
              Yaklaşan ders bulunmuyor.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.map((lesson) => {
              const student = Array.isArray(lesson.students)
                ? lesson.students[0]
                : lesson.students
              const studentProfile = Array.isArray(student?.profiles)
                ? student?.profiles[0]
                : student?.profiles

              return (
                <Card key={lesson.id} className="flex items-center gap-4">
                  {/* Date column */}
                  <div
                    className="shrink-0 text-center rounded-lg px-3 py-2 min-w-[72px]"
                    style={{ backgroundColor: '#F6F5F2' }}
                  >
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ color: '#5F705D' }}
                    >
                      {formatDate(lesson.starts_at)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#8A8F87' }}>
                      {formatTime(lesson.starts_at)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: '#1D1D1B' }}
                    >
                      {studentProfile?.full_name ?? '—'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#8A8F87' }}>
                      {lesson.subject ?? 'Konu belirtilmedi'}
                    </p>
                  </div>

                  <Badge variant="info">Planlandı</Badge>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
