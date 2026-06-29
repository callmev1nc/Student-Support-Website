import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

// In production we require a real AUTH_SECRET. The static fallback is dev-only
// so a misconfigured deploy fails loudly instead of signing sessions with a
// publicly-known key (which would allow session forgery).
const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : "campuswell-dev-secret-key")

if (!authSecret) {
  throw new Error(
    "AUTH_SECRET environment variable is required in production. Generate one with `openssl rand -base64 32`."
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Throttle credential brute-force. Keyed by lowercased email; in-memory
        // and per-instance (see src/lib/rate-limit.ts). Over-budget returns null
        // (indistinguishable from invalid credentials -> no user-existence leak).
        const loginLimit = rateLimit({
          key: `login:${String(credentials.email).toLowerCase()}`,
          limit: 10,
          windowMs: 10 * 60_000,
        })
        if (!loginLimit.ok) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: authSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.avatarUrl = (user as any).avatarUrl
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).avatarUrl = token.avatarUrl
      }
      return session
    },
  },
})
