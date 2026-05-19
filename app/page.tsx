export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "./components/Nav"
import Footer from "./components/Footer"
import SearchBar from "./components/SearchBar"
import Link from "next/link"
import Image from "next/image"
import { deriveExcerpt, PINNED_GUIDES } from "./guides/_lib"

export const metadata: Metadata = {
  title: "Civil Rights Attorney Directory",
  description: "Find verified civil rights attorneys with a proven record against law enforcement. Search by state or practice area.",
}

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

  const [specialtyRows, guideRows] = await Promise.all([
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty
      FROM "Listing"
      WHERE array_length(specialties, 1) > 0
      ORDER BY specialty
    `,
    prisma.guide.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, slug: true, excerpt: true, body: true, categories: true, coverImageUrl: true, authorName: true, authorSlug: true, createdAt: true, featured: true },
    }),
  ])

  await prisma.$disconnect()

  const states = Object.values(STATE_NAMES).sort()

  const practices = specialtyRows
    .map((row: { specialty: string }) => row.specialty)
    .filter(Boolean)

  return { states, practices, guides: guideRows }
}

export default async function HomePage() {
  const { states, practices, guides } = await getSearchData()
  const featured = guides.filter((g) => g.featured)
  const rest = guides.filter((g) => !g.featured)

  return (
    <div className="public">
      <Nav specialties={practices} guides={guides.slice(0, 8).map((g) => ({ title: g.title, slug: g.slug }))} />

      <div className="home-page">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero">
            <div>
              <h1>
                Carefully selected.<br />
                <em>Proven in court.</em>
              </h1>
              <p className="hero-sub">
                These attorneys and firms make it their business to take law enforcement and their governing bodies to court. And win.
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
              submissions</strong> — <strong>only</strong> attorneys who have taken law enforcement to court and <strong>won.</strong>
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
              <Link href="/guides" className="section-link">View all guides</Link>
            </div>

            {featured.length > 0 && (
              <div className="guides-featured">
                {featured.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card guide-card--featured">
                    {g.coverImageUrl && (
                      <Image src={g.coverImageUrl} alt={g.title} width={600} height={180} className="guide-card-cover" />
                    )}
                    <h2 className="guide-card-title">{g.title}</h2>
                    <div className="guide-card-meta">
                      {g.authorName && g.authorSlug && (
                        <>
                          <span className="guide-card-author">{g.authorName}</span>
                          <span className="guide-card-meta-sep">·</span>
                        </>
                      )}
                      <span className="guide-card-date">{g.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    {(g.excerpt || deriveExcerpt(g.body)) && <p className="guide-card-excerpt">{g.excerpt || deriveExcerpt(g.body)}</p>}
                    <span className="guide-card-read">Read guide →</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="guides-pinned">
              {PINNED_GUIDES.map((p) => (
                <Link key={p.slug} href={p.href} className="guide-pinned-card">
                  <h2 className="guide-card-title">{p.title}</h2>
                  <div className="guide-card-meta">
                    <span className="guide-card-author">{p.authorName}</span>
                    <span className="guide-card-meta-sep">·</span>
                    <span className="guide-card-date">{p.date}</span>
                  </div>
                  <p className="guide-card-excerpt">{p.excerpt}</p>
                  <span className="guide-card-read">{p.readLabel}</span>
                </Link>
              ))}
            </div>

            {rest.length > 0 && (
              <div className="guides-grid">
                {rest.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
                    {g.coverImageUrl && (
                      <Image src={g.coverImageUrl} alt={g.title} width={600} height={180} className="guide-card-cover" />
                    )}
                    <h2 className="guide-card-title">{g.title}</h2>
                    <div className="guide-card-meta">
                      {g.authorName && g.authorSlug && (
                        <>
                          <span className="guide-card-author">{g.authorName}</span>
                          <span className="guide-card-meta-sep">·</span>
                        </>
                      )}
                      <span className="guide-card-date">{g.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    {(g.excerpt || deriveExcerpt(g.body)) && <p className="guide-card-excerpt">{g.excerpt || deriveExcerpt(g.body)}</p>}
                    <span className="guide-card-read">Read guide →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
