import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = ['/apply', '/dashboard', '/application']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  // Redirect unauthenticated users trying to access protected or admin routes
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin role check — role est stocké dans Supabase app_metadata (synchronisé via /api/auth/me)
  // En cas d'échec (role non encore synchronisé), on redirige vers / et non /login
  // pour éviter la boucle : /admin → /login → /dashboard → 404
  if (isAdminRoute && user) {
    const role =
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined)

    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
