'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'

async function requireAdmin() {
  const role = await getUserRole()
  if (role !== 'admin') {
    throw new Error('UNAUTHORIZED: admin role required')
  }
}

async function getActorProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function assignTeacher(
  studentId: string,
  teacherId: string
): Promise<{ error?: string }> {
  await requireAdmin()

  const supabase = await createClient()
  const actorId = await getActorProfileId()

  // Deactivate any existing active assignments
  await supabase
    .from('teacher_assignments')
    .update({ status: 'inactive' })
    .eq('student_id', studentId)
    .eq('status', 'active')

  const { error } = await supabase.from('teacher_assignments').insert({
    student_id: studentId,
    teacher_id: teacherId,
    status: 'active',
  })

  if (error) {
    return { error: error.message }
  }

  // Log to audit_logs
  await supabase.from('audit_logs').insert({
    actor_profile_id: actorId,
    action: 'assign_teacher',
    entity_type: 'teacher_assignments',
    entity_id: studentId,
    metadata: { student_id: studentId, teacher_id: teacherId },
  })

  revalidatePath('/admin/students')
  return {}
}

export async function updateRemainingLessons(
  studentId: string,
  lessons: number
): Promise<{ error?: string }> {
  await requireAdmin()

  if (!Number.isInteger(lessons) || lessons < 0) {
    return { error: 'Geçersiz ders sayısı.' }
  }

  const supabase = await createClient()
  const actorId = await getActorProfileId()

  // Capture old value for audit
  const { data: existing } = await supabase
    .from('students')
    .select('remaining_lessons')
    .eq('id', studentId)
    .single()

  const { error } = await supabase
    .from('students')
    .update({ remaining_lessons: lessons })
    .eq('id', studentId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('audit_logs').insert({
    actor_profile_id: actorId,
    action: 'update_remaining_lessons',
    entity_type: 'students',
    entity_id: studentId,
    metadata: {
      student_id: studentId,
      old_value: existing?.remaining_lessons ?? null,
      new_value: lessons,
    },
  })

  revalidatePath('/admin/students')
  return {}
}

export async function toggleTeacherStatus(
  teacherId: string,
  newStatus: 'active' | 'inactive'
): Promise<{ error?: string }> {
  await requireAdmin()

  const supabase = await createClient()
  const actorId = await getActorProfileId()

  const { error } = await supabase
    .from('teachers')
    .update({ status: newStatus })
    .eq('id', teacherId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('audit_logs').insert({
    actor_profile_id: actorId,
    action: 'toggle_teacher_status',
    entity_type: 'teachers',
    entity_id: teacherId,
    metadata: { teacher_id: teacherId, new_status: newStatus },
  })

  revalidatePath('/admin/teachers')
  return {}
}
