'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer'

const variants: Record<Variant, string> = {
  primary:   'text-white shadow-sm focus-visible:ring-[#5F705D]',
  secondary: 'bg-white border focus-visible:ring-[#5F705D]',
  ghost:     'bg-transparent focus-visible:ring-gray-300',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
}

const spinnerSize: Record<Size, number> = { sm: 14, md: 16, lg: 16 }

const baseStyles: Record<Variant, React.CSSProperties> = {
  primary:   { backgroundColor: '#5F705D', color: '#FFFFFF' },
  secondary: { borderColor: '#E7E7E2', color: '#1D1D1B' },
  ghost:     { color: '#8A8F87' },
}

const hoverStyles: Record<Variant, React.CSSProperties> = {
  primary:   { backgroundColor: '#4E5D4C' },
  secondary: { backgroundColor: '#F9FAFB' },
  ghost:     { backgroundColor: '#F9FAFB', color: '#1D1D1B' },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      className = '',
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        style={{ ...baseStyles[variant], ...style }}
        disabled={loading || props.disabled}
        onMouseEnter={(e) => {
          if (!props.disabled && !loading) {
            Object.assign(e.currentTarget.style, hoverStyles[variant])
          }
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, baseStyles[variant])
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = ''
          if (variant === 'ghost') e.currentTarget.style.backgroundColor = ''
          onMouseLeave?.(e)
        }}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin shrink-0"
              width={spinnerSize[size]}
              height={spinnerSize[size]}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
