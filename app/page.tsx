export const dynamic = "force-dynamic"

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "./components/Nav"
import Footer from "./components/Footer"
import SearchBar from "./components/SearchBar"

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
}

async function getSearchData() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const specialtyRows = await prisma.$queryRaw<{ specialty: string }[]>`
    SELECT DISTINCT UNNEST(specialties) AS specialty
    FROM "Listing"
    WHERE array_length(specialties, 1) > 0
    ORDER BY specialty
  `

  await prisma.$disconnect()

  const states = Object.values(STATE_NAMES).sort()

  const practices = specialtyRows
    .map((row: { specialty: string }) => row.specialty)
    .filter(Boolean)

  return { states, practices }
}

export default async function HomePage() {
  const { states, practices } = await getSearchData()

  return (
    <div className="public">
      <Nav specialties={practices} />

      {/* Hero */}
      <section style={{ background: "var(--nord0)", borderBottom: "1px solid var(--border-on-dark)" }}>
        <div className="hero">
          <div>
            <h1>
              Carefully selected.<br />
              <em>Proven in court.</em>
            </h1>
            <p className="hero-sub">
              These attorneys and firms make it their business to take police and government entities to court. And win.
            </p>
          </div>
          <SearchBar states={states} practices={practices} />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">150<span>+</span></div>
            <div className="stat-label">Attorneys<br />&amp; Firms</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">50</div>
            <div className="stat-label">States<br />Covered</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">5<span>k+</span></div>
            <div className="stat-label">Cases<br />Won</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">$3<span>B+</span></div>
            <div className="stat-label">Recovered for<br />Clients</div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-section">
        <div className="about-inner">
          <h2>
            The playing field is not level.{" "}
            <em>This is.</em>
          </h2>
          <p>
            When you take on a police department, a sheriff&apos;s office, or a federal agency, you are not just facing
            one officer. You are facing an entire legal machine — staffed by experienced attorneys, funded by taxpayer
            dollars, and <strong>built to protect itself.</strong>
          </p>
          <p>
            Most victims and families have never been through anything like this. The process is complex, the timeline
            is long, and the opposition is formidable. <strong>Intimidation is part of the strategy.</strong>
          </p>
          <p>
            Our mission is to change that equation. Every attorney and firm listed here has a documented record of
            success against law enforcement and government entities. There are <strong>no pay-to-play listings</strong> and <strong>no unvetted
            submissions</strong> — <strong>only</strong> lawyers who have taken law enforcement to court and <strong>won.</strong>
          </p>
          <p>
            Attorneys in this field almost universally work on contingency, meaning you pay nothing unless you win.
            There is no reason to settle for anything less than the best. <strong>If they take your case, they believe they can win it.</strong>
          </p>
          <p>
            We also believe that an informed client is a stronger client. This site gives you the legal knowledge you
            need — including state-specific filing deadlines for both state and federal court, which can be as short as
            90 days in some jurisdictions. Miss that window and <strong>no</strong> attorney, however skilled, can help you. Know your
            rights, know your deadlines, and move forward with confidence.
          </p>
        </div>
      </section>

      {/* Know Your Rights */}
      <section className="rights-section">
        <div className="rights-inner">
          <div className="section-header">
            <h2 className="section-title">Know Your Rights</h2>
            <a href="#" className="section-link">View all guides</a>
          </div>

          <div className="rights-grid">
            <a href="#" className="rights-card">
              <h3>Before You File</h3>
              <p>
                Municipal liability, qualified immunity, filing deadlines, and the stages of litigation. Missing a
                state-specific deadline can end your case before it begins.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Do You Have a Case?</h3>
              <p>
                Not every incident becomes a viable lawsuit. Understand the key factors attorneys look for before
                deciding to take on a case against law enforcement.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Free Speech &amp; Assembly</h3>
              <p>
                What the government can and cannot restrict when you speak, protest, or peacefully assemble in public.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Search &amp; Seizure</h3>
              <p>
                When police can stop, search, or arrest you — and when they legally cannot enter your home or vehicle.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Right to Remain Silent</h3>
              <p>
                How to invoke your right not to self-incriminate, and why it matters before and during police
                questioning.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Equal Protection</h3>
              <p>
                Laws protecting against discrimination based on race, gender, national origin, and other protected
                classes.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
            <a href="#" className="rights-card">
              <h3>Due Process</h3>
              <p>
                Your right not to be deprived of life, liberty, or property without fair procedures — and how that
                applies when police or government actors cause harm.
              </p>
              <div className="rights-count">Learn more</div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
