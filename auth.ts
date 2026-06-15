import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./app/lib/prisma"
import { authConfig } from "./auth.config"

const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const MAX_ATTEMPTS = 5

async function checkRateLimit(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS)
  const count = await prisma.loginAttempt.count({
    where: { ip, createdAt: { gte: since } },
  })
  return count < MAX_ATTEMPTS
}

async function recordAttempt(ip: string) {
  await prisma.loginAttempt.create({ data: { ip } })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const ip =
          (request as Request).headers?.get("x-forwarded-for")?.split(",")[0].trim() ??
          "unknown"

        const allowed = await checkRateLimit(ip)
        if (!allowed) return null

        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: "1", name: "Admin" }
        }

        await recordAttempt(ip)
        return null
      },
    }),
  ],
})
