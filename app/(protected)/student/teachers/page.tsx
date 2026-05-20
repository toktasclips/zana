import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import SelectTeacherButton from './SelectTeacherButton'

// Mock teachers shown when the DB returns no data (demo / empty-state fallback)
const MOCK_TEACHERS = [
  {
    id: 'mock-1',
    branch: 'Matematik',
    bio: 'Lise ve üniversite hazırlık süreçlerinde 8 yıllık deneyime sahip matematik öğretmeni. Soyut kavramları somut örneklerle öğretmeyi seviyor.',
    experience_years: 8,
    rating: 4.9,
    status: 'active',
    profiles: { full_name: 'Ayşe Kaya' },
  },
  {
    id: 'mock-2',
    branch: 'Fizik',
    bio: 'YGS/LYS ve TYT/AYT odaklı fizik dersleri. Formül ezberlemek yerine mantığı kavratmayı hedefliyor.',
    experience_years: 5,
    rating: 4.7,
    status: 'active',
    profiles: { full_name: 'Murat Demir' },
  },
  {
    id: 'mock-3',
    branch: 'Türkçe',
    bio: 'Paragraf, dil bilgisi ve yazılı anlatım konularında uzmanlaşmış. Her seviyeye uygun ders planı hazırlıyor.',
    experience_years: 10,
    rating: 4.8,
    status: 'active',
    profiles: { full_name: 'Zeynep Arslan' },
  },
  {
    id: 'mock-4',
    branch: 'İngilizce',
    bio: 'Konuşma becerisi, sınav hazırlığı (YDS, IELTS) ve temel İngilizce dersleri veriyor. Eğlenceli ve interaktif anlatım tarzı.',
    experience_years: 6,
    rating: 4.6,
    status: 'active',
    profiles: { full_name: 'Can Yıldız' },
  },
]

type TeacherRow = {
  id: string
  branch: string | null
  bio: string | null
  experience_years: number | null
  rating: number | null
  status: string
  profiles: { full_name: string }
}

function truncateBio(bio: string | null, maxLen = 120): string {
  if (!bio) return 'Henüz biyografi eklenmemiş.'
  return bio.length > maxLen ? bio.slice(0, maxLen).trimEnd() + '…' : bio
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} yıldız`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full
        const half = !filled && i === full && hasHalf
        return (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={filled ? '#F59E0B' : half ? 'url(#half)' : 'none'}
            stroke="#F59E0B"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      })}
      <span className="ml-1 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

// Unique branches for filter display
function BranchFilter({ branches, active }: { branches: string[]; active: string }) {
  // Static display — filter interaction would require client-side state
  return (
    <div className="flex flex-wrap gap-2">
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border cursor-default"
        style={
          active === 'all'
            ? {
                backgroundColor: 'var(--color-accent-primary)',
                color: '#fff',
                borderColor: 'var(--color-accent-primary)',
              }
            : {
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                borderColor: 'var(--color-border-primary)',
              }
        }
      >
        Tümü
      </span>
      {branches.map((b) => (
        <span
          key={b}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border cursor-default"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          {b}
        </span>
      ))}
    </div>
  )
}

export default async function TeachersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawTeachers } = await supabase
    .from('teachers')
    .select(`
      id,
      branch,
      bio,
      experience_years,
      rating,
      status,
      profiles!inner(full_name)
    `)
    .eq('status', 'active')
    .order('rating', { ascending: false })

  const teachers: TeacherRow[] =
    rawTeachers && rawTeachers.length > 0
      ? (rawTeachers as unknown as TeacherRow[])
      : (MOCK_TEACHERS as TeacherRow[])

  const branches = Array.from(
    new Set(teachers.map((t) => t.branch).filter(Boolean) as string[])
  ).sort()

  const isMock = !rawTeachers || rawTeachers.length === 0

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Öğretmenler
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Size uygun öğretmeni seçin
        </p>
      </div>

      {/* Branch filter */}
      {branches.length > 0 && (
        <div className="mb-6">
          <BranchFilter branches={branches} active="all" />
        </div>
      )}

      {/* Demo banner */}
      {isMock && (
        <div
          className="rounded-xl p-3 flex gap-2 mb-6 text-sm"
          style={{
            backgroundColor: '#DBEAFE',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
          }}
        >
          <span aria-hidden="true">ℹ️</span>
          <span>Örnek öğretmen kartları gösteriliyor. Gerçek veriler yüklenince otomatik güncellenir.</span>
        </div>
      )}

      {/* Teacher grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {teachers.map((teacher) => (
          <article
            key={teacher.id}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  aria-hidden="true"
                >
                  {teacher.profiles.full_name.charAt(0)}
                </div>
                <div>
                  <h2
                    className="text-sm font-semibold leading-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {teacher.profiles.full_name}
                  </h2>
                  {teacher.branch && (
                    <Badge variant="info" className="mt-1">
                      {teacher.branch}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="success">Aktif</Badge>
            </div>

            {/* Bio */}
            <p
              className="text-xs leading-relaxed flex-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {truncateBio(teacher.bio)}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-4">
                {teacher.experience_years != null && (
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <span
                      className="font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {teacher.experience_years}
                    </span>{' '}
                    yıl
                  </span>
                )}
                {teacher.rating != null && <StarRating rating={teacher.rating} />}
              </div>

              <SelectTeacherButton
                teacherId={teacher.id}
                teacherName={teacher.profiles.full_name}
              />
            </div>
          </article>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl mb-3 block" aria-hidden="true">👩‍🏫</span>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Şu an aktif öğretmen bulunmuyor.
          </p>
        </div>
      )}
    </div>
  )
}
