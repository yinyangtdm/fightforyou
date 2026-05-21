import NavServer from "../../components/NavServer"
import Footer from "../../components/Footer"
import Link from "next/link"
import type { Metadata } from "next"
import CaseEvaluator from "./CaseEvaluator"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Do I Have a Civil Rights Case?",
  description: "A structured self-evaluation covering liability, damages, and procedure — the three factors civil rights attorneys weigh when assessing a case against law enforcement.",
}

export default function DoIHaveACasePage() {
  return (
    <div className="public">
      <NavServer />

      <main className="guide-page" id="main-content">
        <div className="guide-back-container">
          <Link href="/guides" className="guide-back">← All Guides</Link>
        </div>
        <div className="guide-page-inner">
          <div className="guide-article">
            <h1 className="guide-title">Do I Have a Case?</h1>
            <div className="guide-meta">
              <Link href="/guides/author/fight-for-you" className="guide-author-link">By fightfor.you</Link>
              <span className="guide-meta-sep">·</span>
              <span>May 20, 2026</span>
              <span className="guide-meta-categories">
                <Link href="/guides/category/legal-reference" className="guide-category-link">Legal Reference</Link>
              </span>
            </div>
            <p className="guide-lead">
              Not every incident of police misconduct translates into a viable civil rights lawsuit. This evaluator walks through the key factors attorneys weigh when assessing a case — liability, damages, and procedure. Check every box that applies to your situation and the verdict updates in real time.
            </p>
            <CaseEvaluator />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
