import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import Card from '@/components/ui/Card'
import AssignTeacherButton from './AssignTeacherButton'
import EditLessonsButton from './EditLessonsButton'

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
      {isActive ? 'Aktif' : status}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminStudentsPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const supabase = await createClient()

  type StudentRow = {
    id: string
    grade_level: string | null
    remaining_lessons: number
    status: string
    created_at: string
    profiles: { full_name: string; avatar_url: string | null } | null
    teacher_assignments: Array<{
      status: string
      teachers: {
        id: string
        profiles: { full_name: string } | null
      } | null
    }>
  }

  const [{ data: rawStudents }, { data: allTeachers }] = await Promise.all([
    supabase
      .from('students')
      .select(
        `
        id, grade_level, remaining_lessons, status, created_at,
        profiles!inner(full_name, avatar_url),
        teacher_assignments(
          status,
          teachers!inner(
            id,
            profiles!inner(full_name)
          )
        )
      `
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('teachers')
      .select('id, profiles!inner(full_name)')
      .eq('status', 'active'),
  ])

  const students = (rawStudents ?? []) as unknown as StudentRow[]

  // Flatten teacher list for dropdowns
  type TeacherOption = { id: string; profiles: { full_name: string } | null }
  const teacherOptions = ((allTeachers ?? []) as unknown as TeacherOption[]).map((t) => ({
    id: t.id,
    name: t.profiles?.full_name ?? 'İsimsiz',
  }))

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
          Öğrenci Yönetimi
        </h1>
        <p className="text-sm" style={{ color: '#8A8F87' }}>
          {students.length} öğrenci kayıtlı
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3" aria-hidden="true">
              👨‍🎓
            </p>
            <p className="text-sm font-medium" style={{ color: '#1D1D1B' }}>
              Henüz kayıtlı öğrenci yok
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A8F87' }}>
              Sisteme öğrenci eklendiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[780px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  {[
                    'Ad Soyad',
                    'Sınıf',
                    'Kalan Ders',
                    'Öğretmen',
                    'Durum',
                    'Kayıt Tarihi',
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
                {students.map((student, idx) => {
                  const profile = student.profiles
                  const activeAssignment = student.teacher_assignments?.find(
                    (a) => a.status === 'active'
                  )

                  const assignedTeacherName =
                    activeAssignment?.teachers?.profiles?.full_name ?? null

                  const isLast = idx === students.length - 1

                  return (
                    <tr
                      key={student.id}
                      style={
                        isLast ? undefined : { borderBottom: '1px solid #E7E7E2' }
                      }
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{
                              backgroundColor: '#EBF5EA',
                              color: '#3A6B38',
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

                      {/* Grade */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {student.grade_level ?? '—'}
                      </td>

                      {/* Remaining lessons */}
                      <td className="px-6 py-4">
                        <span
                          className="font-semibold tabular-nums"
                          style={{
                            color:
                              student.remaining_lessons <= 2
                                ? '#DC2626'
                                : '#1D1D1B',
                          }}
                        >
                          {student.remaining_lessons}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {assignedTeacherName ?? (
                          <span
                            className="text-xs italic"
                            style={{ color: '#B8BCB4' }}
                          >
                            Atanmadı
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>

                      {/* Created at */}
                      <td
                        className="px-6 py-4 tabular-nums"
                        style={{ color: '#8A8F87' }}
                      >
                        {formatDate(student.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <EditLessonsButton
                            studentId={student.id}
                            currentLessons={student.remaining_lessons}
                          />
                          <AssignTeacherButton
                            studentId={student.id}
                            currentTeacherName={assignedTeacherName}
                            teachers={teacherOptions}
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
