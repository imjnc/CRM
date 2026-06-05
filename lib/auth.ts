import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"

// Password hashing parameters
const PBKDF2_ITERATIONS = 1000
const PBKDF2_KEY_LENGTH = 64
const PBKDF2_DIGEST = 'sha512'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, hash] = storedPassword.split(':')
  if (!salt || !hash) return false
  const computedHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('hex')
  return hash === computedHash
}

/**
 * Full auth setup — Node.js runtime only.
 * Extends the edge-safe config with the real Credentials authorize()
 * that queries Prisma.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = verifyPassword(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
          teamId: user.teamId
        }
      }
    })
  ],
})