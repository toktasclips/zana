import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long' }),
    time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function lessonStatusBadge(status: 'scheduled' | 'completed' | 'cancelled') {
  if (status === 'scheduled') return <Badge variant="info">Planlandı</Badge>
  if (status === 'completed') return <Badge variant="success">Tamamlandı</Badge>
  return <Badge variant="error">İptal</Badge>
}

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/unauthorized')

  // Fetch student record
  const { data: student } = await supabase
    .from('students')
    .select('id, remaining_lessons, grade_level, package_name, status')
    .eq('profile_id', user.id)
    .single()

  const studentId = student?.id ?? null

  // Fetch upcoming lessons (next 3 scheduled)
  const now = new Date().toISOString()
  const { data: upcomingLessons } = studentId
    ? await supabase
        .from('lessons')
        .select(`
          id,
          starts_at,
          ends_at,
          subject,
          status,
          teacher_id,
          teachers!inner(
            profile_id,
            profiles!inner(full_name)
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'scheduled')
        .gte('starts_at', now)
        .order('starts_at', { ascending: true })
        .limit(3)
    : { data: null }

  // Fetch completed lessons count
  const { count: completedCount } = studentId
    ? await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'completed')
    : { count: null }

  // Fetch assigned teacher
  const { data: assignment } = studentId
    ? await supabase
        .from('teacher_assignments')
        .select(`
          id,
          status,
          teacher_id,
          teachers!inner(
            branch,
            experience_years,
            rating,
            profiles!inner(full_name)
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .single()
    : { data: null }

  // Fetch active lesson package
  const { data: lessonPackage } = studentId
    ? await supabase
        .from('lesson_packages')
        .select('package_name, total_lessons, used_lessons, remaining_lessons, expires_at')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  const firstName = profile.full_name?.split(' ')[0] ?? 'Öğrenci'
  const remainingLessons =
    lessonPackage?.remaining_lessons ?? student?.remaining_lessons ?? 0
  const upcomingCount = upcomingLessons?.length ?? 0
  const completedTotal = completedCount ?? 0

  // Type helpers for joined data
  type LessonWithTeacher = {
    id: string
    starts_at: string
    ends_at: string
    subject: string | null
    status: 'scheduled' | 'completed' | 'cancelled'
    teachers: {
      profiles: { full_name: string }
    }
  }

  type AssignmentWithTeacher = {
    teachers: {
      branch: string | null
      experience_years: number | null
      rating: number | null
      profiles: { full_name: string }
    }
  }

  const typedLessons = (upcomingLessons ?? []) as unknown as LessonWithTeacher[]
  const typedAssignment = assignment as unknown as AssignmentWithTeacher | null

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Hoş geldin, {firstName}!
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Teneffüs platformuna hoş geldin. Derslerini ve öğretmenini buradan takip edebilirsin.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Kalan Ders"
          value={remainingLessons}
          subtitle={lessonPackage ? lessonPackage.package_name : 'Aktif paket'}
          icon="📚"
        />
        <StatCard
          title="Yaklaşan Ders"
          value={upcomingCount}
          subtitle="Planlanmış ders"
          icon="📅"
        />
        <StatCard
          title="Tamamlanan"
          value={completedTotal}
          subtitle="Toplam ders"
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Lessons + Security Notice */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Lessons */}
          <Card>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
            >
              Yaklaşan Dersler
            </h2>

            {typedLessons.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl mb-3 block" aria-hidden="true">📭</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Yaklaşan planlanmış dersin bulunmuyor.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {typedLessons.map((lesson) => {
                  const { date, time } = formatDateTime(lesson.starts_at)
                  const teacherName = lesson.teachers?.profiles?.full_name ?? 'Öğretmen'
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-start justify-between gap-3 rounded-lg p-3"
                      style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {lesson.subject ?? 'Ders'}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {date} · {time} · {teacherName}
                        </p>
                      </div>
                      <div className="shrink-0">{lessonStatusBadge(lesson.status)}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Security Notice */}
          <div
            className="rounded-xl p-4 flex gap-3"
            style={{
              backgroundColor: '#FEF9C3',
              border: '1px solid #FDE047',
            }}
          >
            <span className="text-lg leading-none shrink-0 mt-0.5" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-sm leading-relaxed" style={{ color: '#854D0E' }}>
              <span className="font-semibold">Güvenlik Uyarısı: </span>
              Platform dışı iletişim yasaktır. Tüm iletişiminizi Teneffüs üzerinden yürütünüz.
            </p>
          </div>
        </div>

        {/* Right: Assigned Teacher + Package */}
        <div className="space-y-6">
          {/* Assigned Teacher */}
          <Card>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
            >
              Atanmış Öğretmen
            </h2>

            {typedAssignment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  >
                    {typedAssignment.teachers.profiles.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold leading-tight truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {typedAssignment.teachers.profiles.full_name}
                    </p>
                    {typedAssignment.teachers.branch && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {typedAssignment.teachers.branch}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {typedAssignment.teachers.experience_years != null && (
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    >
                      <p
                        className="text-base font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {typedAssignment.teachers.experience_years}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        yıl deneyim
                      </p>
                    </div>
                  )}
                  {typedAssignment.teachers.rating != null && (
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    >
                      <p
                        className="text-base font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {typedAssignment.teachers.rating.toFixed(1)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        ⭐ puan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-3xl mb-2 block" aria-hidden="true">👩‍🏫</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Henüz bir öğretmen atanmadı.
                </p>
              </div>
            )}
          </Card>

          {/* Lesson Package */}
          {lessonPackage && (
            <Card>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
              >
                Ders Paketi
              </h2>
              <p
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {lessonPackage.package_name}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--color-text-secondary)' }}>İlerleme</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {lessonPackage.used_lessons} / {lessonPackage.total_lessons}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border-primary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (lessonPackage.used_lessons / lessonPackage.total_lessons) * 100)}%`,
                      backgroundColor: 'var(--color-accent-primary)',
                    }}
                  />
                </div>
              </div>
              {lessonPackage.expires_at && (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Son geçerlilik:{' '}
                  {new Date(lessonPackage.expires_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
