import { HTMLAttributes } from 'react'

type Variant = 'success' | 'warning' | 'error' | 'neutral' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  className?: string
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  success: { backgroundColor: '#DCFCE7', color: '#166534' },
  warning: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  error:   { backgroundColor: '#FEE2E2', color: '#991B1B' },
  neutral: { backgroundColor: '#F3F4F6', color: '#374151' },
  info:    { backgroundColor: '#DBEAFE', color: '#1E40AF' },
}

export default function Badge({
  variant = 'neutral',
  className = '',
  children,
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  )
}
