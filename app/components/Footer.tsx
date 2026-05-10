import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Image src="/logo.svg" alt="fightforyou" width={120} height={40} className="footer-brand-logo" />
            <Link href="/" className="footer-logo">
              fightfor<span>you</span>
            </Link>
            <p>A legal directory built for the people. Find the right attorney for your case, in your state.</p>
          </div>

          <div className="footer-col">
            <h5>Directory</h5>
            <ul>
              <li><a href="#">Attorneys by State</a></li>
              <li><a href="#">Attorneys by Specialty</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Legal Guides</h5>
            <ul>
              <li><a href="/guides">Know Your Rights</a></li>
              <li><a href="/guides/do-i-have-a-case">Do You Have a Case?</a></li>
              <li><a href="/guides/filing-deadlines-by-state">Filing Deadlines by State</a></li>
              <li><a href="/guides/qualified-immunity">Qualified Immunity by State</a></li>
              <li><a href="#">Legal Glossary</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Organization</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">For Attorneys</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} fightforyou. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
