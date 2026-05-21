import type { Metadata } from "next"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "Attorney accounts and login are coming soon to fightfor.you.",
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  return (
    <div className="public">
      <NavServer />
      <main id="main-content" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px" }}>Coming Soon</h1>
          <p style={{ color: "var(--color-muted, #888)", lineHeight: 1.7 }}>
            Attorney accounts and login are on the way. Check back soon.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
