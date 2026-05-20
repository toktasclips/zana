import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/get-user-role'
import Card from '@/components/ui/Card'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function ActionBadge({ action }: { action: string }) {
  // Color-code common action prefixes
  let bg = '#F4F4F4'
  let color = '#6B7280'

  if (action.startsWith('assign')) {
    bg = '#EEF2FF'; color = '#4338CA'
  } else if (action.startsWith('update')) {
    bg = '#FFFBEB'; color = '#D97706'
  } else if (action.startsWith('toggle')) {
    bg = '#FDF4FF'; color = '#9333EA'
  } else if (action.startsWith('create')) {
    bg = '#EBF5EA'; color = '#3A6B38'
  } else if (action.startsWith('delete')) {
    bg = '#FEF2F2'; color = '#DC2626'
  }

  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium font-mono"
      style={{ backgroundColor: bg, color }}
    >
      {action}
    </span>
  )
}

function MetadataPreview({
  metadata,
}: {
  metadata: Record<string, unknown> | null
}) {
  if (!metadata) {
    return (
      <span className="text-xs italic" style={{ color: '#B8BCB4' }}>
        —
      </span>
    )
  }

  const str = JSON.stringify(metadata)
  const truncated = str.length > 80 ? str.slice(0, 80) + '…' : str

  return (
    <code
      className="text-xs px-1.5 py-0.5 rounded"
      style={{
        backgroundColor: '#F6F5F2',
        color: '#8A8F87',
        fontFamily: 'ui-monospace, monospace',
      }}
      title={str}
    >
      {truncated}
    </code>
  )
}

export default async function AdminAuditLogsPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/unauthorized')

  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(
      `
      id, action, entity_type, entity_id, metadata, created_at,
      actor_profile_id
    `
    )
    .order('created_at', { ascending: false })
    .limit(50)

  // Resolve actor names in a single query
  const actorIds = [
    ...new Set(
      (logs ?? [])
        .map((l) => l.actor_profile_id)
        .filter((id): id is string => id !== null)
    ),
  ]

  const actorNames: Record<string, string> = {}
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds)
    for (const p of profiles ?? []) {
      actorNames[p.id] = p.full_name
    }
  }

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
          Audit Logları
        </h1>
        <p className="text-sm" style={{ color: '#8A8F87' }}>
          Son {logs?.length ?? 0} işlem kaydı
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        {!logs || logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3" aria-hidden="true">
              🔍
            </p>
            <p className="text-sm font-medium" style={{ color: '#1D1D1B' }}>
              Henüz işlem kaydı yok
            </p>
            <p className="text-xs mt-1" style={{ color: '#8A8F87' }}>
              Admin işlemleri gerçekleştirildikçe burada görünecek.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E7E2' }}>
                  {[
                    'İşlem Yapan',
                    'Eylem',
                    'Varlık Türü',
                    'Varlık ID',
                    'Metadata',
                    'Tarih',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: '#8A8F87' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const actorName = log.actor_profile_id
                    ? (actorNames[log.actor_profile_id] ?? 'Bilinmiyor')
                    : 'Sistem'
                  const isLast = idx === logs.length - 1

                  return (
                    <tr
                      key={log.id}
                      style={
                        isLast
                          ? undefined
                          : { borderBottom: '1px solid #E7E7E2' }
                      }
                    >
                      {/* Actor */}
                      <td className="px-6 py-4">
                        <span
                          className="font-medium"
                          style={{ color: '#1D1D1B' }}
                        >
                          {actorName}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <ActionBadge action={log.action} />
                      </td>

                      {/* Entity type */}
                      <td
                        className="px-6 py-4"
                        style={{ color: '#8A8F87' }}
                      >
                        {log.entity_type}
                      </td>

                      {/* Entity ID */}
                      <td className="px-6 py-4">
                        {log.entity_id ? (
                          <code
                            className="text-xs"
                            style={{
                              color: '#8A8F87',
                              fontFamily: 'ui-monospace, monospace',
                            }}
                            title={log.entity_id}
                          >
                            {log.entity_id.slice(0, 8)}…
                          </code>
                        ) : (
                          <span
                            className="text-xs italic"
                            style={{ color: '#B8BCB4' }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* Metadata */}
                      <td className="px-6 py-4 max-w-[240px]">
                        <MetadataPreview metadata={log.metadata} />
                      </td>

                      {/* Created at */}
                      <td
                        className="px-6 py-4 tabular-nums whitespace-nowrap"
                        style={{ color: '#8A8F87' }}
                      >
                        {formatDateTime(log.created_at)}
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
