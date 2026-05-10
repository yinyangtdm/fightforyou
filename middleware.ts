import { NextRequest, NextResponse } from "next/server"

const COMING_SOON_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coming Soon — fightfor.you</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1f3c;
      color: #e8edf5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
    }
    h1 { font-size: 48px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
    h1 span { color: #c9a84c; }
    p { font-size: 18px; opacity: 0.65; max-width: 420px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>fight<span>for</span>.you</h1>
  <p>Check back soon.</p>
</body>
</html>`

export function middleware(request: NextRequest) {
  if (process.env.COMING_SOON !== "true") return NextResponse.next()

  const { pathname, searchParams } = request.nextUrl
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const secret = process.env.PREVIEW_SECRET
  if (secret) {
    // Grant access via ?preview=<secret>, set a cookie, then redirect clean
    if (searchParams.get("preview") === secret) {
      const url = request.nextUrl.clone()
      url.searchParams.delete("preview")
      const res = NextResponse.redirect(url)
      res.cookies.set("preview_access", secret, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 })
      return res
    }
    // Allow if cookie already set
    if (request.cookies.get("preview_access")?.value === secret) {
      return NextResponse.next()
    }
  }

  return new NextResponse(COMING_SOON_HTML, {
    status: 503,
    headers: {
      "Content-Type": "text/html",
      "Retry-After": "86400",
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
