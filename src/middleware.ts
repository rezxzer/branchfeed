import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate URL format (must be valid HTTP/HTTPS URL)
  const isValidUrl =
    supabaseUrl &&
    supabaseAnonKey &&
    (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

  if (!isValidUrl) {
    // If env variables are not set or invalid, skip Supabase auth refresh
    // This allows the app to run without Supabase configured (for initial setup)
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: userResult } = await supabase.auth.getUser()

  // Check banned/suspended for protected routes
  const pathname = request.nextUrl.pathname
  const method = request.method.toUpperCase()

  const isProtectedPage = pathname.startsWith('/create')
  const isApiRoute = pathname.startsWith('/api')
  const isWriteApi = isApiRoute && method !== 'GET'

  if (userResult?.user && (isProtectedPage || isWriteApi)) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('banned_at, suspended_until')
      .eq('id', userResult.user.id)
      .maybeSingle()

    if (!profileError && profile) {
      const bannedAt = profile.banned_at as string | null
      const suspendedUntil = profile.suspended_until as string | null
      const now = Date.now()
      const isBanned = Boolean(bannedAt)
      const isSuspended = suspendedUntil ? new Date(suspendedUntil).getTime() > now : false

      if (isBanned || isSuspended) {
        if (isApiRoute) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: account restricted' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('restricted', isBanned ? 'banned' : 'suspended')
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

