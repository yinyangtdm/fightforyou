import { auth } from "./auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = req.nextUrl.pathname === "/admin/login"

  if (isAdminPage && !isLoginPage && !isLoggedIn) {
    return Response.redirect(new URL("/admin/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*"]
}