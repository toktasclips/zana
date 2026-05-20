'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLessonNote(
  lessonId: string,
  notes: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify this lesson belongs to the authenticated teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!teacher) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('lessons')
    .update({ lesson_notes: notes.trim() })
    .eq('id', lessonId)
    .eq('teacher_id', teacher.id) // RLS + server-side ownership check

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/teacher/lessons')
  return {}
}
