import type { Metadata } from "next"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions governing use of the fightfor.you attorney directory.",
}

export default function TermsPage() {
  return (
    <div className="public">
      <Nav specialties={[]} guides={[]} />

      <main className="guide-page" id="main-content">
        <div className="guide-page-inner">
          <article className="guide-article">
            <h1 className="guide-title">Terms of Use</h1>
            <p className="guide-lead">Last updated: May 2026</p>

            <div className="guide-body">
              <p>
                By using fightfor.you, you agree to the following terms. If you do not agree, please
                do not use the site.
              </p>

              <h2 className="guide-body-h2">Not Legal Advice</h2>
              <p>
                <strong>
                  Nothing on this site constitutes legal advice, and using this site does not create
                  an attorney-client relationship.
                </strong>{" "}
                This is a directory of attorneys who have a documented record in civil rights and police
                misconduct cases. Information about individual attorneys — including case results, areas
                of practice, and contact details — is provided for informational purposes only.
              </p>
              <p>
                Laws vary by state. Deadlines, procedures, and legal standards change. Always consult a
                qualified attorney for advice specific to your situation before taking any legal action.
              </p>

              <h2 className="guide-body-h2">No Paid Placement</h2>
              <p>
                Attorneys and firms listed here do not pay to appear in this directory. Listings are
                based on verified public records, bar association data, court filings, and documented
                case history. This is not an advertising platform. No listing implies endorsement beyond
                the factual record we have verified.
              </p>

              <h2 className="guide-body-h2">Past Results Are Not Guarantees</h2>
              <p>
                Settlement amounts, verdicts, and other case outcomes listed on attorney profiles reflect
                historical results. Past results do not guarantee similar outcomes in future cases. Every
                case is different.
              </p>

              <h2 className="guide-body-h2">Accuracy and Errors</h2>
              <p>
                We make reasonable efforts to ensure that listing information is accurate and current.
                However, we cannot guarantee that all information — including contact details, bar
                admissions, and case history — is up to date. Information sourced from public records
                may lag behind real-world changes.
              </p>
              <p>
                If you find inaccurate information, please contact us at{" "}
                <a href="mailto:contact@fightfor.you">contact@fightfor.you</a> and we will review and
                correct it promptly.
              </p>

              <h2 className="guide-body-h2">External Links</h2>
              <p>
                Attorney profiles may link to external websites — attorney websites, LinkedIn, and
                Facebook pages. We do not control those sites and are not responsible for their content
                or privacy practices.
              </p>

              <h2 className="guide-body-h2">Intellectual Property</h2>
              <p>
                The text, design, and original content of fightfor.you is copyright &copy;{" "}
                {new Date().getFullYear()} fightfor.you. Attorney-provided information (bios, case results,
                credentials) belongs to the respective individuals and firms and is reproduced here under
                fair use for directory purposes.
              </p>
              <p>
                You may not reproduce or redistribute site content for commercial purposes without
                written permission.
              </p>

              <h2 className="guide-body-h2">Disclaimer of Warranties</h2>
              <p>
                This site is provided &ldquo;as is&rdquo; without warranties of any kind, express or
                implied. We do not warrant that the site will be uninterrupted, error-free, or free of
                harmful components.
              </p>

              <h2 className="guide-body-h2">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, fightfor.you shall not be liable for any
                indirect, incidental, or consequential damages arising from your use of this site or
                reliance on its content.
              </p>

              <h2 className="guide-body-h2">Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. The date at the top of this page reflects
                the most recent revision. Continued use of the site constitutes acceptance of any changes.
              </p>

              <h2 className="guide-body-h2">Contact</h2>
              <p>
                Questions? Email us at{" "}
                <a href="mailto:contact@fightfor.you">contact@fightfor.you</a>.
              </p>
            </div>

            <div className="guide-disclaimer">
              These terms are written in plain language for clarity. They do not constitute a comprehensive
              legal agreement and do not substitute for legal counsel.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}