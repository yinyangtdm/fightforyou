import Link from "next/link"
import Nav from "./components/Nav"
import Footer from "./components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Browse attorneys by state or practice area.",
}

export default function NotFound() {
  return (
    <div className="public">
      <Nav specialties={[]} guides={[]} />

      <main id="main-content" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "64px 24px",
        textAlign: "center",
        gap: "16px",
      }}>
        <p style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1, color: "var(--nord3)", margin: 0 }}>404</p>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Page not found</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: 0 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/guides" className="btn-outline-404">Browse Guides</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
