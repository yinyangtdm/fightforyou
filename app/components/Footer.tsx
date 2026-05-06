import Link from "next/link"

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
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
            <h5>Know Your Rights</h5>
            <ul>
              <li><a href="#">Know Your Rights</a></li>
              <li><a href="#">Do You Have a Case?</a></li>
              <li><a href="#">Filing Deadlines by State</a></li>
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
