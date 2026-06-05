import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth configuration.
 * This file must NOT import Prisma or any Node.js-only modules.
 * It is used by the middleware (Edge Runtime) and by auth.ts (Node.js).
 *
 * The `authorize` function is left empty here — the real implementation
 * that queries the database is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  basePath: "/api/auth",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize is handled in auth.ts where Prisma is available.
      // This stub is needed so the provider is recognized by the middleware.
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.teamId = user.teamId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string | undefined
        session.user.teamId = token.teamId as string | undefined
      }
      return session
    },
    // Called by the middleware to decide if a request is authorized
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user
      const { pathname } = nextUrl

      const publicPaths = [
        '/login',
        '/register',
        '/api/auth/',
        '/api/register',
      ]
      const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

      // Redirect unauthenticated users to login
      if (!isAuthenticated && !isPublicPath) {
        return false // NextAuth will redirect to pages.signIn
      }

      // Redirect authenticated users away from login/register
      if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/auth/error",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
}
