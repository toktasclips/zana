import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Teneffüs — Özel Ders Yönetim Platformu',
  description: 'Öğrenci ve öğretmenler için güvenli özel ders yönetim platformu.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body
        className={`${plusJakartaSans.variable} font-sans h-full`}
        style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
      >
        {children}
      </body>
    </html>
  )
}
