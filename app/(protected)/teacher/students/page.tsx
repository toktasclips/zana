import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

// ─── types ────────────────────────────────────────────────────────────────────

type AssignmentRow = {
  id: string
  status: string
  created_at: string
  students: {
    id: string
    grade_level: string | null
    remaining_lessons: number
    status: string
    profiles: {
      full_name: string
      avatar_url: string | null
    }
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function studentStatusVariant(
  status: string
): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'active') return 'success'
  if (status === 'paused') return 'warning'
  if (status === 'inactive') return 'neutral'
  return 'neutral'
}

function studentStatusLabel(status: string): string {
  if (status === 'active') return 'Aktif'
  if (status === 'paused') return 'Duraklatıldı'
  if (status === 'inactive') return 'Pasif'
  return status
}

function avatarInitial(fullName: string): string {
  return fullName.trim().charAt(0).toUpperCase()
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function TeacherStudentsPage() {
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

  // Active assignments with student + profile (safe fields only — no email/phone)
  const { data: rawAssignments } = await supabase
    .from('teacher_assignments')
    .select(`
      id, status, created_at,
      students!inner(
        id, grade_level, remaining_lessons, status,
        profiles!inner(full_name, avatar_url)
      )
    `)
    .eq('teacher_id', teacher.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const assignments = (rawAssignments ?? []) as unknown as AssignmentRow[]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Öğrencilerim
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Size atanmış aktif öğrenciler
        </p>
      </div>

      {/* Security notice */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm mb-6"
        style={{
          backgroundColor: '#F0F4EF',
          border: '1px solid #C8D4C6',
          color: '#4A5F48',
        }}
        role="note"
        aria-label="Gizlilik bildirimi"
      >
        <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">
          🔒
        </span>
        <p>
          <strong>Gizlilik Hatırlatması:</strong> Öğrenci iletişim bilgilerine
          (e-posta, telefon) erişim kısıtlıdır. Tüm iletişiminiz için{' '}
          <Link
            href="/teacher/messages"
            className="underline underline-offset-2 font-medium"
            style={{ color: '#5F705D' }}
          >
            platform içi mesajlaşmayı
          </Link>{' '}
          kullanın.
        </p>
      </div>

      {/* Student count */}
      {assignments.length > 0 && (
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {assignments.length} aktif öğrenci
        </p>
      )}

      {/* Empty state */}
      {assignments.length === 0 ? (
        <Card className="text-center py-14">
          <span className="text-4xl mb-3 block" aria-hidden="true">
            👨‍🎓
          </span>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Henüz atanmış öğrenci yok
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Yönetici size öğrenci atadığında burada görünecek.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments.map((a) => {
            const student = a.students
            const profile = student.profiles

            return (
              <article
                key={a.id}
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                {/* Top row: avatar + name + status */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                    aria-hidden="true"
                  >
                    {avatarInitial(profile.full_name)}
                  </div>

                  {/* Name + grade */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold leading-tight truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {profile.full_name}
                    </p>
                    {student.grade_level && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {student.grade_level}
                      </p>
                    )}
                  </div>

                  <Badge variant={studentStatusVariant(student.status)}>
                    {studentStatusLabel(student.status)}
                  </Badge>
                </div>

                {/* Remaining lessons */}
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: 'var(--color-bg-primary)' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Kalan Ders
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {student.remaining_lessons}
                  </span>
                </div>

                {/* Action */}
                <Link
                  href="/teacher/messages"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors duration-100"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    color: 'var(--color-accent-primary)',
                  }}
                >
                  <span aria-hidden="true">💬</span>
                  Mesaj Gönder
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
