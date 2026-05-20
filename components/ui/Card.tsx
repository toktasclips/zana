import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export default function Card({ className = '', children, style, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E7E7E2',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
