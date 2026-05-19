"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "64px 24px",
      textAlign: "center",
      gap: "16px",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--sans)",
    }}>
      <p style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1, color: "var(--nord3)", margin: 0 }}>500</p>
      <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: 0 }}>
        An unexpected error occurred. You can try again or go back to the home page.
      </p>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-primary">Go home</Link>
        <button onClick={reset} className="btn-primary" style={{ background: "transparent", border: "1.5px solid var(--nord4)", color: "var(--nord4)" }}>Try again</button>
      </div>
    </div>
  )
}
