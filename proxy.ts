import { auth } from "./auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminPage = req.nextUrl.pathname.startsWith("/justice")
  const isLoginPage = req.nextUrl.pathname === "/justice/login"

  if (isAdminPage && !isLoginPage && !isLoggedIn) {
    return Response.redirect(new URL("/justice/login", req.url))
  }
})

export const config = {
  matcher: ["/justice/:path*"]
}