import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Image src="/logo.svg" alt="fightforyou" width={120} height={40} className="footer-brand-logo footer-brand-logo--dark" />
            <Image src="/logo-light.svg" alt="fightforyou" width={120} height={40} className="footer-brand-logo footer-brand-logo--light" />
            <Link href="/" className="footer-logo">
              fightfor<span>you</span>
            </Link>
            <p>A legal directory built for the people.</p>
          </div>

          <div className="footer-col">
            <p className="footer-col-heading">Legal Guides</p>
            <ul>
              <li><Link href="/guides">Know Your Rights</Link></li>
              <li><Link href="/guides/do-i-have-a-case">&ldquo;Do I Have a Case?&rdquo;</Link></li>
              <li><Link href="/guides/filing-deadlines-by-state">State Filing Deadlines</Link></li>
              <li><Link href="/guides/qualified-immunity">Qualified Immunity Laws</Link></li>
              <li><Link href="/guides/glossary">Legal Glossary</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-heading">Organization</p>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} fightforyou. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
