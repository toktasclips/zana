'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const disabled = loading || googleLoading

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '48px 40px 40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #E7E7E2',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: '#5F705D',
            marginBottom: '16px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.58 3 4 6.58 4 11c0 2.67 1.3 5.03 3.3 6.52V20a1 1 0 001 1h7a1 1 0 001-1v-2.48C18.7 16.03 20 13.67 20 11c0-4.42-3.58-8-8-8z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M9 21h6M10 17.93V16h4v1.93"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1D1D1B',
            margin: '0 0 6px',
            letterSpacing: '-0.3px',
          }}
        >
          Teneffüs
        </h1>
        <p style={{ fontSize: '13.5px', color: '#8A8F87', margin: 0 }}>
          Güvenli Öğrenme Platformu
        </p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#1D1D1B',
              marginBottom: '6px',
            }}
          >
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            required
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #E7E7E2',
              backgroundColor: disabled ? '#F6F5F2' : '#FAFAF8',
              color: '#1D1D1B',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#5F705D'
              e.target.style.boxShadow = '0 0 0 3px rgba(95,112,93,0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E7E7E2'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#1D1D1B',
              marginBottom: '6px',
            }}
          >
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #E7E7E2',
              backgroundColor: disabled ? '#F6F5F2' : '#FAFAF8',
              color: '#1D1D1B',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#5F705D'
              e.target.style.boxShadow = '0 0 0 3px rgba(95,112,93,0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E7E7E2'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {error && (
          <p
            style={{
              fontSize: '13px',
              color: '#C0392B',
              backgroundColor: '#FDF2F2',
              border: '1px solid #F5C6C6',
              borderRadius: '8px',
              padding: '10px 12px',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '11px 16px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: disabled ? '#8FA58D' : '#5F705D',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s, transform 0.1s',
            letterSpacing: '0.1px',
          }}
          onMouseEnter={(e) => {
            if (!disabled) (e.currentTarget.style.backgroundColor = '#4E5D4C')
          }}
          onMouseLeave={(e) => {
            if (!disabled) (e.currentTarget.style.backgroundColor = '#5F705D')
          }}
        >
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '20px 0',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E7E7E2' }} />
        <span style={{ fontSize: '12px', color: '#B8BCB4', whiteSpace: 'nowrap' }}>veya</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E7E7E2' }} />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #E7E7E2',
          backgroundColor: disabled ? '#F6F5F2' : '#FFFFFF',
          color: disabled ? '#B8BCB4' : '#1D1D1B',
          fontSize: '14px',
          fontWeight: '500',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#F6F5F2'
            e.currentTarget.style.borderColor = '#C8C9C4'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#FFFFFF'
            e.currentTarget.style.borderColor = '#E7E7E2'
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {googleLoading ? 'Yönlendiriliyor…' : 'Google ile Giriş Yap'}
      </button>

      <p
        style={{
          marginTop: '28px',
          marginBottom: 0,
          textAlign: 'center',
          fontSize: '12px',
          color: '#B8BCB4',
          lineHeight: '1.5',
        }}
      >
        Platform dışı iletişim paylaşımı yasaktır.
      </p>
    </div>
  )
}
