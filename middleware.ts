/**
 * NOTE: In Next.js 16, the `middleware` file convention is deprecated.
 * The correct file is `proxy.ts` with a `proxy` named export.
 * This file is kept for compatibility but `proxy.ts` is the authoritative
 * route-protection implementation for this project.
 *
 * See: /proxy.ts
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Allow public routes
  if (path === '/login' || path === '/unauthorized') {
    if (user && path === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Require auth for everything else
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based protection for /dashboard, /student, /teacher, /admin
  if (
    path === '/dashboard' ||
    path.startsWith('/student') ||
    path.startsWith('/teacher') ||
    path.startsWith('/admin')
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (!role) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path === '/dashboard') {
      if (role === 'student')
        return NextResponse.redirect(new URL('/student', request.url))
      if (role === 'teacher')
        return NextResponse.redirect(new URL('/teacher', request.url))
      if (role === 'admin')
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (path.startsWith('/student') && role !== 'student')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    if (path.startsWith('/teacher') && role !== 'teacher')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    if (path.startsWith('/admin') && role !== 'admin')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
