import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessagesClient, { type Conversation } from './MessagesClient'

// ─── mock data for demo / empty state ─────────────────────────────────────────

function mockConversations(currentUserId: string): Conversation[] {
  const past = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recent = new Date(Date.now() - 8 * 60 * 1000).toISOString()
  return [
    {
      contactProfile: { id: 'mock-student-1', full_name: 'Ali Yılmaz' },
      messages: [
        {
          id: 'mock-m1',
          sender_profile_id: 'mock-student-1',
          receiver_profile_id: currentUserId,
          body: 'Hocam, yarınki ders saatini hatırlatabilir misiniz?',
          flagged: false,
          created_at: past,
        },
        {
          id: 'mock-m2',
          sender_profile_id: currentUserId,
          receiver_profile_id: 'mock-student-1',
          body: "Merhaba Ali, saat 15:00'da buluşacağız. Türev konusuna odaklanacağız.",
          flagged: false,
          created_at: recent,
        },
      ],
    },
  ]
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function TeacherMessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify teacher role
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!teacher) redirect('/unauthorized')

  // Fetch all messages where this teacher's profile is sender or receiver
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('id, sender_profile_id, receiver_profile_id, body, flagged, created_at')
    .or(`sender_profile_id.eq.${user.id},receiver_profile_id.eq.${user.id}`)
    .order('created_at', { ascending: true })

  // Collect unique contact IDs (the other party in each message)
  const contactIds = Array.from(
    new Set(
      (rawMessages ?? []).flatMap((m) => [
        m.sender_profile_id,
        m.receiver_profile_id,
      ])
    )
  ).filter((id) => id !== user.id)

  // Fetch contact profiles — safe fields only (id + full_name, NO email/phone)
  const { data: contactProfiles } =
    contactIds.length > 0
      ? await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', contactIds)
      : { data: [] }

  const profileMap = new Map<string, { id: string; full_name: string }>(
    (contactProfiles ?? []).map((p) => [p.id, p])
  )

  // Group messages into per-contact conversations
  const conversationMap = new Map<string, Conversation>()
  for (const msg of rawMessages ?? []) {
    const contactId =
      msg.sender_profile_id === user.id
        ? msg.receiver_profile_id
        : msg.sender_profile_id

    const contactProfile = profileMap.get(contactId)
    if (!contactProfile) continue

    if (!conversationMap.has(contactId)) {
      conversationMap.set(contactId, { contactProfile, messages: [] })
    }
    conversationMap.get(contactId)!.messages.push(msg)
  }

  const conversations: Conversation[] =
    conversationMap.size > 0
      ? Array.from(conversationMap.values())
      : mockConversations(user.id)

  return (
    <div
      className="flex flex-col"
      style={{ height: '100%', backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Page header */}
      <div
        className="flex-shrink-0 px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-primary)',
        }}
      >
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Mesajlar
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Öğrencilerinizle güvenli iletişim
        </p>
      </div>

      {/* Chat UI — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <MessagesClient
          currentUserId={user.id}
          conversations={conversations}
        />
      </div>
    </div>
  )
}
