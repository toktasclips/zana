import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (profile?.role as UserRole) ?? null
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserRole> {
  const role = await getUserRole()

  if (!role || !allowedRoles.includes(role)) {
    // This will be caught by error boundary or handled by caller
    throw new Error('UNAUTHORIZED')
  }

  return role
}
