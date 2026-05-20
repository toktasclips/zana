'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { filterMessageContent } from '@/lib/security/message-filter'
import { sendMessage } from './actions'

// ─── types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  full_name: string
}

type Message = {
  id: string
  sender_profile_id: string
  receiver_profile_id: string
  body: string
  flagged: boolean
  created_at: string
}

export type Conversation = {
  contactProfile: Profile
  messages: Message[]
}

interface MessagesClientProps {
  currentUserId: string
  conversations: Conversation[]
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  })
}

function groupByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: Record<string, Message[]> = {}
  for (const msg of messages) {
    const d = new Date(msg.created_at).toDateString()
    if (!groups[d]) groups[d] = []
    groups[d].push(msg)
  }
  return Object.entries(groups).map(([, msgs]) => ({
    date: formatDate(msgs[0].created_at),
    messages: msgs,
  }))
}

// ─── component ────────────────────────────────────────────────────────────────

export default function MessagesClient({
  currentUserId,
  conversations,
}: MessagesClientProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const threadRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const activeConversation = conversations[activeIdx] ?? null

  // Scroll to bottom when conversation changes or messages are added
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [activeIdx, activeConversation?.messages.length])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setInputValue(val)
    if (val.trim()) {
      const { flagged, reason } = filterMessageContent(val)
      if (flagged) {
        const reasons: Record<string, string> = {
          email_detected: 'E-posta adresi içeriyor',
          phone_detected: 'Telefon numarası içeriyor',
          external_platform_mentioned: 'Platform dışı uygulama adı içeriyor',
        }
        setWarning(reasons[reason ?? ''] ?? 'İletişim bilgisi içeriyor')
      } else {
        setWarning(null)
      }
    } else {
      setWarning(null)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  function handleSubmit(formData: FormData) {
    const body = inputValue.trim()
    if (!body || !activeConversation) return

    startTransition(async () => {
      await sendMessage(formData)
      setInputValue('')
      setWarning(null)
    })
  }

  const groups = activeConversation ? groupByDate(activeConversation.messages) : []

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Security banner */}
      <div
        className="flex-shrink-0 flex gap-2 px-4 py-2.5 text-xs"
        style={{
          backgroundColor: '#FEF9C3',
          borderBottom: '1px solid #FDE047',
          color: '#854D0E',
        }}
        role="note"
      >
        <span aria-hidden="true" className="text-sm shrink-0">
          ⚠️
        </span>
        <span className="leading-relaxed">
          <strong>Güvenlik Uyarısı:</strong> Öğrenci iletişim bilgilerini (telefon,
          e-posta) platform dışında paylaşmak yasaktır. Telefon numarası, e-posta
          veya sosyal medya içeren mesajlar otomatik olarak işaretlenir.
        </span>
      </div>

      {/* Empty state */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <span className="text-4xl" aria-hidden="true">
            💬
          </span>
          <p
            className="text-sm text-center"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Henüz mesajınız bulunmuyor.
            <br />
            Öğrencileriniz size mesaj gönderdiğinde burada görünecek.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Conversation list */}
          <aside
            className="w-full sm:w-64 flex-shrink-0 overflow-y-auto border-r"
            style={{
              borderColor: 'var(--color-border-primary)',
              backgroundColor: 'var(--color-bg-primary)',
            }}
          >
            <ul>
              {conversations.map((conv, idx) => {
                const last = conv.messages[conv.messages.length - 1]
                const isActive = idx === activeIdx
                return (
                  <li key={conv.contactProfile.id}>
                    <button
                      onClick={() => setActiveIdx(idx)}
                      className="w-full text-left px-4 py-3 flex gap-3 items-start transition-colors"
                      style={
                        isActive
                          ? {
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderLeft: '2px solid var(--color-accent-primary)',
                              paddingLeft: '14px',
                            }
                          : { borderLeft: '2px solid transparent' }
                      }
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                        aria-hidden="true"
                      >
                        {conv.contactProfile.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {conv.contactProfile.full_name}
                        </p>
                        {last && (
                          <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {last.body}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Message thread */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: 0 }}
          >
            {/* Thread header */}
            {activeConversation && (
              <div
                className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b"
                style={{ borderColor: 'var(--color-border-primary)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  aria-hidden="true"
                >
                  {activeConversation.contactProfile.full_name.charAt(0)}
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeConversation.contactProfile.full_name}
                </p>
              </div>
            )}

            {/* Messages scroll area */}
            <div
              ref={threadRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
            >
              {groups.length === 0 ? (
                <p
                  className="text-xs text-center mt-8"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Henüz mesaj yok. İlk mesajı gönderin!
                </p>
              ) : (
                groups.map(({ date, messages: dayMessages }) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-2">
                      <div
                        className="flex-1 h-px"
                        style={{ backgroundColor: 'var(--color-border-primary)' }}
                      />
                      <span
                        className="text-xs px-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {date}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ backgroundColor: 'var(--color-border-primary)' }}
                      />
                    </div>

                    <div className="space-y-2">
                      {dayMessages.map((msg) => {
                        const isMine = msg.sender_profile_id === currentUserId
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className="max-w-[72%] rounded-2xl px-3.5 py-2"
                              style={
                                isMine
                                  ? {
                                      backgroundColor: 'var(--color-accent-primary)',
                                      color: '#ffffff',
                                      borderBottomRightRadius: '4px',
                                    }
                                  : {
                                      backgroundColor: 'var(--color-bg-primary)',
                                      color: 'var(--color-text-primary)',
                                      border: '1px solid var(--color-border-primary)',
                                      borderBottomLeftRadius: '4px',
                                    }
                              }
                            >
                              <p className="text-sm leading-relaxed break-words">
                                {msg.body}
                              </p>
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  isMine ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <span
                                  className="text-xs"
                                  style={{
                                    color: isMine
                                      ? 'rgba(255,255,255,0.65)'
                                      : 'var(--color-text-secondary)',
                                  }}
                                >
                                  {formatTime(msg.created_at)}
                                </span>
                                {msg.flagged && (
                                  <span
                                    className="text-xs"
                                    title="Bu mesaj işaretlendi"
                                    aria-label="İşaretlendi"
                                  >
                                    🚩
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            {activeConversation && (
              <div
                className="flex-shrink-0 border-t"
                style={{ borderColor: 'var(--color-border-primary)' }}
              >
                {warning && (
                  <div
                    className="px-4 py-2 text-xs flex gap-1.5"
                    style={{
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
                      borderBottom: '1px solid #FCA5A5',
                    }}
                    role="alert"
                  >
                    <span aria-hidden="true">🚩</span>
                    <span>
                      Uyarı: {warning}. Göndermeniz durumunda bu mesaj
                      işaretlenecektir.
                    </span>
                  </div>
                )}
                <form
                  ref={formRef}
                  action={handleSubmit}
                  className="flex items-end gap-2 p-3"
                >
                  <input
                    type="hidden"
                    name="receiverId"
                    value={activeConversation.contactProfile.id}
                  />
                  <textarea
                    name="body"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesajınızı yazın… (Enter ile gönderin)"
                    rows={1}
                    disabled={isPending}
                    className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      color: 'var(--color-text-primary)',
                      maxHeight: '120px',
                      lineHeight: '1.5',
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.style.height = 'auto'
                      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isPending || !inputValue.trim()}
                    className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                    aria-label="Gönder"
                  >
                    {isPending ? (
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="white"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
