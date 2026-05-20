import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavWrapper from '@/components/layout/NavWrapper'
import type { UserRole } from '@/types/database'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/unauthorized')

  return <NavWrapper role={profile.role as UserRole}>{children}</NavWrapper>
}
