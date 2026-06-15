import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/justice/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAdminPage = request.nextUrl.pathname.startsWith("/justice")
      const isLoginPage = request.nextUrl.pathname === "/justice/login"

      if (isAdminPage && !isLoginPage && !isLoggedIn) {
        return false
      }

      return true
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/justice`
    },
  },
} satisfies NextAuthConfig
