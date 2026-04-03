import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

// Use authConfig (no db/prisma imports) so proxy can run in Edge Runtime
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isAuthPage = nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/activate') ||
    nextUrl.pathname.startsWith('/recover') ||
    nextUrl.pathname.startsWith('/create-password')

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    const role = session.user.role
    if (role === 'ARELIS') return NextResponse.redirect(new URL('/arelis', nextUrl))
    if (role === 'GERENCIA') return NextResponse.redirect(new URL('/gerencia', nextUrl))
    return NextResponse.redirect(new URL('/jairo', nextUrl))
  }

  if (isLoggedIn) {
    const role = session.user.role
    const path = nextUrl.pathname
    if (role === 'JAIRO' && (path.startsWith('/arelis') || path.startsWith('/gerencia'))) {
      return NextResponse.redirect(new URL('/jairo', nextUrl))
    }
    if (role === 'GERENCIA' && path.startsWith('/arelis')) {
      return NextResponse.redirect(new URL('/gerencia', nextUrl))
    }
    if (role === 'ARELIS' && path.startsWith('/gerencia')) {
      return NextResponse.redirect(new URL('/arelis', nextUrl))
    }
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
