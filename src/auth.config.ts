import type { NextAuthConfig } from 'next-auth'

// Local type to avoid importing from @/generated/prisma in edge runtime
type Role = 'JAIRO' | 'ARELIS' | 'GERENCIA'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role as Role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  session: { strategy: 'jwt' as const, maxAge: 60 * 60 },
  providers: [], // Providers added in auth.ts (not needed for edge/proxy)
} satisfies NextAuthConfig
