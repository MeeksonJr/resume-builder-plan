import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/protected')

  // ── Unauthenticated → redirect to login ──────────────────────────────────
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // ── Authenticated but unverified trial check ──────────────────────────────
  if (isDashboardRoute && user) {
    const isEmailVerified = !!user.email_confirmed_at || !!(user as any).confirmed_at

    if (!isEmailVerified) {
      // Fetch demo trial timestamp from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('demo_trial_started_at')
        .eq('id', user.id)
        .single()

      const demoStartedAt = profile?.demo_trial_started_at
      const trialStillActive =
        demoStartedAt &&
        new Date(demoStartedAt).getTime() + 24 * 60 * 60 * 1000 > Date.now()

      // If trial expired or never started → redirect to confirm email
      if (!trialStillActive) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('mode', 'confirm')
        url.searchParams.set('email', user.email ?? '')
        url.searchParams.set('reason', 'trial_expired')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
