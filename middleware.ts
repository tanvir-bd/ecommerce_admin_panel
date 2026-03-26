import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('admin_session')
    const { pathname } = request.nextUrl

    // If user is on login page and has session, redirect to dashboard
    if (pathname === '/' && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/admins', '/customers', '/orders', '/products', '/categories', '/subcategories']

    // Check if current path starts with any protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
