import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Use the edge-safe config (no Prisma / no Node.js built-ins)
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth callbacks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}