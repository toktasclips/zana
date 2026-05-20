'use server'

import { createClient } from '@/lib/supabase/server'
import { filterMessageContent } from '@/lib/security/message-filter'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify caller is a teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!teacher) throw new Error('Unauthorized: teacher record not found')

  const body = formData.get('body') as string
  const receiverId = formData.get('receiverId') as string

  if (!body?.trim() || !receiverId) return

  const { flagged } = filterMessageContent(body)

  await supabase.from('messages').insert({
    sender_profile_id: user.id,
    receiver_profile_id: receiverId,
    body: body.trim(),
    flagged,
  })

  revalidatePath('/teacher/messages')
}
