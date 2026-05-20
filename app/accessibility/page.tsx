import type { Metadata } from "next"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"

export const metadata: Metadata = {
  title: "Accessibility",
  description: "fightfor.you's commitment to web accessibility for all visitors.",
}

export default function AccessibilityPage() {
  return (
    <div className="public">
      <NavServer />

      <main className="guide-page" id="main-content">
        <div className="guide-page-inner">
          <article className="guide-article">
            <h1 className="guide-title">Accessibility Statement</h1>
            <p className="guide-lead">Last reviewed: May 2026</p>

            <div className="guide-body">
              <p>
                fightfor.you is committed to making this site accessible to everyone, including people
                who rely on assistive technology such as screen readers, keyboard-only navigation,
                or high-contrast display settings. People with disabilities have the same right to find
                a civil rights attorney as anyone else.
              </p>

              <h2 className="guide-body-h2">Our Standard</h2>
              <p>
                We aim to meet the{" "}
                <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>. These
                guidelines are published by the World Wide Web Consortium (W3C) and are widely
                recognized as the benchmark for accessible web content.
              </p>

              <h2 className="guide-body-h2">What We Do</h2>
              <ul className="guide-body-list">
                <li>
                  <strong>Keyboard navigation</strong> — All navigation menus, links, buttons, and
                  interactive elements can be reached and activated using a keyboard alone (Tab,
                  Enter, arrow keys, Escape).
                </li>
                <li>
                  <strong>Color contrast</strong> — Text and interactive elements are designed to
                  meet or exceed WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
                  The site supports both light and dark display modes.
                </li>
                <li>
                  <strong>Alt text</strong> — Attorney and firm photos include descriptive alt
                  text. Decorative images that add no information are marked so screen readers
                  skip them.
                </li>
                <li>
                  <strong>Semantic structure</strong> — Pages use proper HTML heading hierarchy
                  (H1, H2, H3) so screen reader users can navigate by section. Landmark regions
                  (nav, main, footer) are used throughout.
                </li>
                <li>
                  <strong>Skip navigation</strong> — A skip-to-main-content link is available
                  for keyboard users who want to bypass the navigation bar.
                </li>
                <li>
                  <strong>Readable typography</strong> — Body text is set at a legible size with
                  generous line height. Users can increase text size using browser zoom without
                  loss of functionality.
                </li>
                <li>
                  <strong>No motion required</strong> — No content requires interaction with
                  motion-based controls. Animations are limited and do not convey essential information.
                </li>
              </ul>

              <h2 className="guide-body-h2">Known Limitations</h2>
              <p>
                We are continuously working to improve accessibility. Current known limitations include:
              </p>
              <ul className="guide-body-list">
                <li>
                  The administrative panel used to manage attorney listings is not public-facing
                  and has not been optimized for screen readers. It is only used by site administrators.
                </li>
                <li>
                  Some attorney profiles link to external websites that we do not control. Those
                  sites may not meet the same accessibility standards.
                </li>
                <li>
                  The interactive map on some attorney profiles (showing office location) may not
                  be fully accessible to keyboard or screen reader users. The address is always
                  available as text above the map.
                </li>
              </ul>

              <h2 className="guide-body-h2">Report an Accessibility Issue</h2>
              <p>
                If you encounter a barrier on this site — a page that is hard to read, a feature
                you cannot operate with a keyboard, or content that does not work with your assistive
                technology — please let us know. We take these reports seriously and aim to respond
                within 3 business days.
              </p>
              <p>
                Email us at{" "}
                <a href="mailto:contact@fightfor.you">contact@fightfor.you</a> with:
              </p>
              <ul className="guide-body-list">
                <li>The page URL where you encountered the issue</li>
                <li>A description of the barrier</li>
                <li>The assistive technology or browser you were using (if known)</li>
              </ul>

              <h2 className="guide-body-h2">Technical Details</h2>
              <p>
                This site is built with Next.js and uses semantic HTML5. It has been tested in
                current versions of Chrome, Firefox, and Safari, and with VoiceOver on macOS.
                We welcome reports from users of other screen readers and assistive technologies.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}