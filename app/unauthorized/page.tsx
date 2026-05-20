import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F6F5F2' }}
    >
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E7E7E2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '24px',
            fontSize: '32px',
          }}
        >
          🔒
        </div>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1D1D1B',
            margin: '0 0 10px',
            letterSpacing: '-0.3px',
          }}
        >
          Yetkisiz Erişim
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#8A8F87',
            margin: '0 0 32px',
            lineHeight: '1.6',
          }}
        >
          Bu sayfaya erişim yetkiniz bulunmuyor.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: '#5F705D',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
          }}
        >
          Panele Dön
        </Link>
      </div>
    </div>
  )
}
