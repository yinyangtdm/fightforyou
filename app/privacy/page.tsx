import type { Metadata } from "next"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How fightfor.you handles your information.",
}

export default function PrivacyPage() {
  return (
    <div className="public">
      <Nav specialties={[]} guides={[]} />

      <main className="guide-page" id="main-content">
        <div className="guide-page-inner">
          <article className="guide-article">
            <h1 className="guide-title">Privacy Policy</h1>
            <p className="guide-lead">Last updated: May 2026</p>

            <div className="guide-body">
              <p>
                fightfor.you is a public directory of civil rights attorneys. We take your privacy seriously.
                This policy explains what information is collected when you use this site and how it is handled.
              </p>

              <h2 className="guide-body-h2">Information We Collect</h2>
              <p>
                <strong>From public visitors:</strong> None. You can browse every listing, guide, and page on
                this site without providing any personal information. We do not require an account, and we
                do not use tracking pixels, behavioral analytics, or advertising networks.
              </p>
              <p>
                <strong>From the admin panel:</strong> The site has a single administrative login used to
                manage attorney listings. When an administrator logs in, a session cookie is set. This cookie
                is httpOnly (inaccessible to JavaScript), scoped to this domain, and is cleared when the
                session ends. No passwords are stored — only a cryptographic session token.
              </p>

              <h2 className="guide-body-h2">Third-Party Services</h2>
              <p>
                We use a small number of third-party services to operate the site. Each of these receives
                your IP address as part of a normal network request, the same as any website you visit.
              </p>
              <ul className="guide-body-list">
                <li>
                  <strong>Google Fonts</strong> — Typography on this site is loaded from Google&apos;s font
                  delivery network. When you load a page, your browser makes a request to Google&apos;s
                  servers. Google&apos;s privacy policy governs that request.
                </li>
                <li>
                  <strong>Cloudinary</strong> — Attorney and firm photos are hosted on Cloudinary&apos;s
                  content delivery network. When you view a profile with a photo, your browser loads the
                  image from Cloudinary&apos;s servers. Cloudinary&apos;s privacy policy governs that request.
                </li>
              </ul>
              <p>
                We do not use any advertising networks, social media tracking pixels, or analytics services
                that collect personal data.
              </p>

              <h2 className="guide-body-h2">Cookies</h2>
              <p>
                This site sets no cookies for public visitors. The session cookie described above is only
                set when an administrator logs into the admin panel and is not visible to or affecting
                general visitors.
              </p>

              <h2 className="guide-body-h2">Attorney Listing Data</h2>
              <p>
                Attorney and firm profiles contain publicly available professional information — names,
                bar numbers, office addresses, phone numbers, websites, and professional history.
                This information is sourced from public records, court filings, bar association databases,
                and attorneys&apos; own public websites.
              </p>
              <p>
                If you are an attorney listed here and would like to update or remove your listing,
                contact us at <a href="mailto:contact@fightfor.you">contact@fightfor.you</a>.
              </p>

              <h2 className="guide-body-h2">Children</h2>
              <p>
                This site is not directed at children under 13 and does not knowingly collect information
                from anyone under 13.
              </p>

              <h2 className="guide-body-h2">Changes to This Policy</h2>
              <p>
                If this policy changes materially, we will update the date at the top of this page.
                Continued use of the site after a change constitutes acceptance of the updated policy.
              </p>

              <h2 className="guide-body-h2">Contact</h2>
              <p>
                Questions about this policy? Email us at{" "}
                <a href="mailto:contact@fightfor.you">contact@fightfor.you</a>.
              </p>
            </div>

            <div className="guide-disclaimer">
              This privacy policy describes our practices as of the date shown above. It does not constitute
              legal advice.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}