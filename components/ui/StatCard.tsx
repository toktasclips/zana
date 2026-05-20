interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  className?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E7E7E2',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-xs font-medium uppercase tracking-wider leading-none"
          style={{ color: '#8A8F87', letterSpacing: '0.06em' }}
        >
          {title}
        </p>
        {icon && (
          <span className="text-xl leading-none shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <p
        className="mt-3 text-3xl font-bold leading-none tracking-tight"
        style={{ color: '#1D1D1B' }}
      >
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: '#8A8F87' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
